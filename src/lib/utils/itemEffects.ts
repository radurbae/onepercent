import { createClient } from '@/lib/supabase/client';
import type { EquippedEffects, Item, UserItem } from '@/lib/types';

/**
 * Item Effects Engine
 * 
 * Calculates XP/gold modifiers from equipped items.
 * Max total XP boost is capped at 20%.
 */

const MAX_XP_BOOST = 20; // Maximum total XP boost percentage

/**
 * Get all equipped items for a user
 */
export async function getEquippedItems(userId: string): Promise<(UserItem & { item: Item })[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_items')
        .select(`
      *,
      item:items(*)
    `)
        .eq('user_id', userId)
        .eq('equipped', true);

    return (data || []) as (UserItem & { item: Item })[];
}

/**
 * Calculate total effects from equipped items
 */
export async function getEquippedEffects(userId: string): Promise<EquippedEffects> {
    const equippedItems = await getEquippedItems(userId);

    let xpBoostPercent = 0;
    let goldBoostPercent = 0;
    let skipPenaltyReduce = 0;
    let streakBuffer = 0;
    const categoryBoosts: Record<string, number> = {};

    for (const userItem of equippedItems) {
        const item = userItem.item;
        if (!item || !item.effect_type || !item.effect_value) continue;

        switch (item.effect_type) {
            case 'xp_boost':
                xpBoostPercent += item.effect_value;
                break;
            case 'gold_boost':
                goldBoostPercent += item.effect_value;
                break;
            case 'category_xp_boost':
                if (item.effect_category) {
                    categoryBoosts[item.effect_category] =
                        (categoryBoosts[item.effect_category] || 0) + item.effect_value;
                }
                break;
            case 'skip_penalty_reduce':
                skipPenaltyReduce += item.effect_value;
                break;
            case 'streak_buffer':
                streakBuffer += item.effect_value;
                break;
        }
    }

    // Cap total XP boost at MAX_XP_BOOST
    xpBoostPercent = Math.min(xpBoostPercent, MAX_XP_BOOST);

    // Cap category boosts at 15% each
    for (const key of Object.keys(categoryBoosts)) {
        categoryBoosts[key] = Math.min(categoryBoosts[key], 15);
    }

    return {
        xpBoostPercent,
        goldBoostPercent,
        categoryBoosts,
        skipPenaltyReduce,
        streakBuffer,
    };
}

/**
 * Apply effects to base XP reward
 */
export function applyXpEffects(
    baseXp: number,
    effects: EquippedEffects,
    category?: string
): number {
    let totalBoost = effects.xpBoostPercent;

    // Add category-specific boost if applicable
    if (category && effects.categoryBoosts[category]) {
        totalBoost += effects.categoryBoosts[category];
    }

    // Cap at MAX_XP_BOOST
    totalBoost = Math.min(totalBoost, MAX_XP_BOOST);

    return Math.round(baseXp * (1 + totalBoost / 100));
}

/**
 * Apply effects to skip penalty
 */
export function applySkipPenalty(
    basePenalty: number,
    effects: EquippedEffects
): number {
    const reduction = effects.skipPenaltyReduce / 100;
    return Math.round(basePenalty * (1 - reduction));
}

/**
 * Equip an item (unequip others of same type)
 */
export async function equipItem(userId: string, itemId: string): Promise<boolean> {
    const supabase = createClient();

    // Get the item to check its type
    const { data: item } = await supabase
        .from('items')
        .select('type')
        .eq('id', itemId)
        .single();

    if (!item) return false;

    // Unequip all items of the same type
    const { data: userItems } = await supabase
        .from('user_items')
        .select('id, item:items(type)')
        .eq('user_id', userId)
        .eq('equipped', true);

    for (const ui of userItems || []) {
        const itemData = ui.item as unknown as { type: string } | null;
        if (itemData?.type === item.type) {
            await supabase
                .from('user_items')
                .update({ equipped: false })
                .eq('id', ui.id);
        }
    }

    // Equip the new item
    const { error } = await supabase
        .from('user_items')
        .update({ equipped: true })
        .eq('user_id', userId)
        .eq('item_id', itemId);

    return !error;
}

/**
 * Unequip an item
 */
export async function unequipItem(userId: string, itemId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_items')
        .update({ equipped: false })
        .eq('user_id', userId)
        .eq('item_id', itemId);

    return !error;
}

/**
 * Get effect summary text for display
 */
export function getEffectSummary(effects: EquippedEffects): string[] {
    const lines: string[] = [];

    if (effects.xpBoostPercent > 0) {
        lines.push(`+${effects.xpBoostPercent}% XP`);
    }

    if (effects.goldBoostPercent > 0) {
        lines.push(`+${effects.goldBoostPercent}% Gold`);
    }

    for (const [category, boost] of Object.entries(effects.categoryBoosts)) {
        lines.push(`+${boost}% ${category} XP`);
    }

    if (effects.skipPenaltyReduce > 0) {
        lines.push(`-${effects.skipPenaltyReduce}% skip penalty`);
    }

    if (effects.streakBuffer > 0) {
        lines.push(`+${effects.streakBuffer} streak buffer`);
    }

    return lines;
}
