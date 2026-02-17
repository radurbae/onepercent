import { createClient } from '@/lib/supabase/client';
import type { EquippedEffects, Item, UserItem } from '@/lib/types';


const MAX_XP_BOOST = 20; // Batas total boost XP

export async function getEquippedItems(userId: string): Promise<(UserItem & { item: Item })[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_items')
        .select(`
      id,
      user_id,
      item_id,
      equipped,
      unlocked_at,
      item:items(*)
    `)
        .eq('user_id', userId)
        .eq('equipped', true);

    type UserItemWithJoin = UserItem & { item: Item | Item[] | null };

    const rows = (data ?? []) as UserItemWithJoin[];

    return rows
        .map((row) => {
            const normalizedItem = Array.isArray(row.item) ? row.item[0] : row.item;
            if (!normalizedItem) {
                return null;
            }
            return {
                ...row,
                item: normalizedItem,
            };
        })
        .filter((row): row is UserItem & { item: Item } => row !== null);
}

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

    xpBoostPercent = Math.min(xpBoostPercent, MAX_XP_BOOST);

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

export function applyXpEffects(
    baseXp: number,
    effects: EquippedEffects,
    category?: string
): number {
    let totalBoost = effects.xpBoostPercent;

    if (category && effects.categoryBoosts[category]) {
        totalBoost += effects.categoryBoosts[category];
    }

    totalBoost = Math.min(totalBoost, MAX_XP_BOOST);

    return Math.round(baseXp * (1 + totalBoost / 100));
}

export function applySkipPenalty(
    basePenalty: number,
    effects: EquippedEffects
): number {
    const reduction = effects.skipPenaltyReduce / 100;
    return Math.round(basePenalty * (1 - reduction));
}

export async function equipItem(userId: string, itemId: string): Promise<boolean> {
    const supabase = createClient();

    const { data: item } = await supabase
        .from('items')
        .select('type')
        .eq('id', itemId)
        .single();

    if (!item) return false;

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

    const { error } = await supabase
        .from('user_items')
        .update({ equipped: true })
        .eq('user_id', userId)
        .eq('item_id', itemId);

    return !error;
}

export async function unequipItem(userId: string, itemId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_items')
        .update({ equipped: false })
        .eq('user_id', userId)
        .eq('item_id', itemId);

    return !error;
}

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
