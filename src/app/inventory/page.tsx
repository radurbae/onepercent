'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sword, ChevronRight, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import BottomSheet from '@/components/BottomSheet';
import type { Item, UserItem, EquippedEffects } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getRarityColor } from '@/lib/utils/rewards';
import { equipItem, unequipItem, getEquippedEffects, getEffectSummary } from '@/lib/utils/itemEffects';

// Rarity glow colors
const RARITY_GLOW: Record<string, string> = {
    common: 'rgba(156, 163, 175, 0.2)',
    rare: 'rgba(59, 130, 246, 0.25)',
    epic: 'rgba(168, 85, 247, 0.3)',
    legendary: 'rgba(245, 158, 11, 0.35)',
};

export default function InventoryPage() {
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [userItems, setUserItems] = useState<(UserItem & { item: Item })[]>([]);
    const [effects, setEffects] = useState<EquippedEffects | null>(null);
    const [filter, setFilter] = useState<'all' | 'title' | 'badge' | 'theme' | 'artifact'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<(UserItem & { item: Item }) | null>(null);
    const [questsCompleted, setQuestsCompleted] = useState(0);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [
            { data: itemsData },
            { data: userItemsData },
            { count: questCount },
        ] = await Promise.all([
            supabase.from('items').select('*').order('type').order('rarity'),
            supabase.from('user_items').select('*, item:items(*)').eq('user_id', user.id),
            supabase.from('daily_quests').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
        ]);

        setAllItems(itemsData || []);
        setUserItems((userItemsData || []) as (UserItem & { item: Item })[]);
        setQuestsCompleted(questCount || 0);

        // Get equipped effects
        const equippedEffects = await getEquippedEffects(user.id);
        setEffects(equippedEffects);

        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEquip = async (userItem: UserItem & { item: Item }) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await equipItem(user.id, userItem.item_id);
        await fetchData();
        setSelectedItem(null);
    };

    const handleUnequip = async (userItem: UserItem & { item: Item }) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await unequipItem(user.id, userItem.item_id);
        await fetchData();
        setSelectedItem(null);
    };

    // Get owned item IDs
    const ownedItemIds = new Set(userItems.map(ui => ui.item_id));

    // Filter items
    const filteredUserItems = filter === 'all'
        ? userItems
        : userItems.filter(ui => ui.item.type === filter);

    // Get locked items (not owned)
    const lockedItems = allItems.filter(item =>
        !ownedItemIds.has(item.id) &&
        (filter === 'all' || item.type === filter)
    );

    // Get equipped items
    const equippedItems = userItems.filter(ui => ui.equipped);

    const filterButtons: { value: typeof filter; label: string; icon: string }[] = [
        { value: 'all', label: 'All', icon: '📦' },
        { value: 'title', label: 'Titles', icon: '📜' },
        { value: 'badge', label: 'Badges', icon: '🛡️' },
        { value: 'theme', label: 'Themes', icon: '🎨' },
        { value: 'artifact', label: 'Artifacts', icon: '💎' },
    ];

    // Loot progress
    const questsForNextLoot = 10;
    const questsTowardNext = questsCompleted % questsForNextLoot;
    const lootProgress = Math.round((questsTowardNext / questsForNextLoot) * 100);

    if (isLoading) {
        return (
            <AppShell>
                <div className="max-w-md md:max-w-4xl mx-auto">
                    <div className="skeleton h-8 w-32 mb-6" />
                    <div className="skeleton h-32 w-full mb-6" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-40" />)}
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-md md:max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                    Inventory
                </h1>

                {/* Loot Progress Card */}
                <div
                    className="card p-5 mb-6 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, var(--background-secondary), var(--card-bg))',
                    }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                                boxShadow: '0 0 15px rgba(129, 140, 248, 0.3)',
                            }}
                        >
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                                Next Loot Drop
                            </h3>
                            <div
                                className="h-3 rounded-full overflow-hidden mb-2"
                                style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${lootProgress}%`,
                                        background: 'linear-gradient(90deg, var(--primary), #a855f7)',
                                    }}
                                />
                            </div>
                            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                {questsForNextLoot - questsTowardNext} quests until next drop
                            </p>
                        </div>
                    </div>
                </div>

                {/* Equipped Section */}
                {equippedItems.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                            ⚔️ Equipped
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {equippedItems.map((ui) => (
                                <div
                                    key={ui.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                    style={{
                                        background: `${getRarityColor(ui.item.rarity)}15`,
                                        border: `1px solid ${getRarityColor(ui.item.rarity)}30`,
                                    }}
                                >
                                    <span className="text-lg">{ui.item.icon_key}</span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                                            {ui.item.type}
                                        </p>
                                        <p className="text-sm font-medium" style={{ color: getRarityColor(ui.item.rarity) }}>
                                            {ui.item.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Effect Summary */}
                        {effects && getEffectSummary(effects).length > 0 && (
                            <div
                                className="flex flex-wrap gap-2"
                            >
                                {getEffectSummary(effects).map((effect, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 rounded-lg text-xs font-medium"
                                        style={{
                                            background: 'rgba(34, 197, 94, 0.15)',
                                            color: '#22c55e',
                                        }}
                                    >
                                        {effect}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.value}
                            onClick={() => setFilter(btn.value)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${filter === btn.value ? 'scale-105' : ''
                                }`}
                            style={{
                                background: filter === btn.value
                                    ? 'var(--primary)'
                                    : 'var(--background-secondary)',
                                color: filter === btn.value
                                    ? 'white'
                                    : 'var(--foreground-muted)',
                                boxShadow: filter === btn.value
                                    ? '0 0 15px rgba(129, 140, 248, 0.3)'
                                    : undefined,
                            }}
                        >
                            <span>{btn.icon}</span>
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Owned Items Grid */}
                {filteredUserItems.length === 0 && lockedItems.length === 0 ? (
                    <div
                        className="card p-8 text-center"
                        style={{
                            background: 'linear-gradient(135deg, var(--background-secondary), var(--card-bg))',
                        }}
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                            style={{ background: 'var(--primary)', opacity: 0.2 }}
                        >
                            <Sword className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                            No items yet
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
                            Complete quests to unlock achievements and earn items!
                        </p>
                        <Link
                            href="/quests"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                            style={{ background: 'var(--primary)', color: 'white' }}
                        >
                            Start Quest <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Owned Items */}
                        {filteredUserItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                                    🎒 Owned
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {filteredUserItems.map(userItem => {
                                        const item = userItem.item;
                                        const isEquipped = userItem.equipped;

                                        return (
                                            <button
                                                key={userItem.id}
                                                onClick={() => setSelectedItem(userItem)}
                                                className="card p-4 text-left transition-all hover:scale-[1.02] relative overflow-hidden"
                                                style={{
                                                    borderColor: isEquipped ? 'var(--primary)' : `${getRarityColor(item.rarity)}30`,
                                                    boxShadow: `0 0 15px ${RARITY_GLOW[item.rarity]}`,
                                                }}
                                            >
                                                {isEquipped && (
                                                    <div
                                                        className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold"
                                                        style={{ background: 'var(--primary)', color: 'white' }}
                                                    >
                                                        EQUIPPED
                                                    </div>
                                                )}
                                                <span
                                                    className="text-3xl block mb-3"
                                                    style={{ filter: `drop-shadow(0 0 8px ${getRarityColor(item.rarity)}60)` }}
                                                >
                                                    {item.icon_key}
                                                </span>
                                                <h4 className="font-bold text-sm mb-1" style={{ color: getRarityColor(item.rarity) }}>
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs capitalize" style={{ color: 'var(--foreground-muted)' }}>
                                                    {item.rarity} {item.type}
                                                </p>
                                                {item.effect_type && (
                                                    <p className="text-xs mt-2" style={{ color: '#22c55e' }}>
                                                        {item.effect_type === 'xp_boost' && `+${item.effect_value}% XP`}
                                                        {item.effect_type === 'category_xp_boost' && `+${item.effect_value}% ${item.effect_category} XP`}
                                                        {item.effect_type === 'skip_penalty_reduce' && `-${item.effect_value}% skip penalty`}
                                                        {item.effect_type === 'streak_buffer' && `+${item.effect_value} streak buffer`}
                                                    </p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Locked Items */}
                        {lockedItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                                    🔒 Locked
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {lockedItems.slice(0, 8).map(item => (
                                        <div
                                            key={item.id}
                                            className="card p-4 opacity-40 relative"
                                            style={{ borderColor: `${getRarityColor(item.rarity)}20` }}
                                        >
                                            <span className="text-3xl block mb-3 opacity-50">
                                                {item.icon_key}
                                            </span>
                                            <h4 className="font-bold text-sm mb-1" style={{ color: getRarityColor(item.rarity) }}>
                                                {item.name}
                                            </h4>
                                            <p className="text-xs capitalize mb-2" style={{ color: 'var(--foreground-muted)' }}>
                                                {item.rarity} {item.type}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                                {item.unlock_condition || 'Complete achievements'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Item Detail Bottom Sheet */}
                <BottomSheet
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    title={selectedItem?.item.name || ''}
                >
                    {selectedItem && (
                        <div className="space-y-4">
                            {/* Item icon */}
                            <div className="text-center">
                                <span
                                    className="text-6xl inline-block mb-2"
                                    style={{ filter: `drop-shadow(0 0 20px ${getRarityColor(selectedItem.item.rarity)}60)` }}
                                >
                                    {selectedItem.item.icon_key}
                                </span>
                                <p
                                    className="text-sm font-medium capitalize"
                                    style={{ color: getRarityColor(selectedItem.item.rarity) }}
                                >
                                    {selectedItem.item.rarity} {selectedItem.item.type}
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-center" style={{ color: 'var(--foreground-muted)' }}>
                                {selectedItem.item.description || 'A rare item earned through your dedication.'}
                            </p>

                            {/* Effect */}
                            {selectedItem.item.effect_type && (
                                <div
                                    className="p-3 rounded-xl text-center"
                                    style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                                >
                                    <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                                        {selectedItem.item.effect_type === 'xp_boost' && `+${selectedItem.item.effect_value}% XP Boost`}
                                        {selectedItem.item.effect_type === 'category_xp_boost' && `+${selectedItem.item.effect_value}% ${selectedItem.item.effect_category} XP`}
                                        {selectedItem.item.effect_type === 'skip_penalty_reduce' && `-${selectedItem.item.effect_value}% Skip Penalty`}
                                        {selectedItem.item.effect_type === 'streak_buffer' && `+${selectedItem.item.effect_value} Streak Buffer`}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedItem.equipped ? (
                                <button
                                    onClick={() => handleUnequip(selectedItem)}
                                    className="w-full py-4 rounded-xl font-semibold transition-all"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                    }}
                                >
                                    Unequip
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleEquip(selectedItem)}
                                    className="w-full py-4 rounded-xl font-semibold transition-all"
                                    style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                    }}
                                >
                                    Equip
                                </button>
                            )}
                        </div>
                    )}
                </BottomSheet>
            </div>
        </AppShell>
    );
}
