'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { Check } from 'lucide-react';
import type { Loot, LootType, PlayerProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getRarityColor } from '@/lib/utils/rewards';

export default function InventoryPage() {
    const [loot, setLoot] = useState<Loot[]>([]);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [filter, setFilter] = useState<LootType | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const [{ data: lootData }, { data: profileData }] = await Promise.all([
            supabase.from('loot').select('*').eq('user_id', user.id).order('unlocked_at', { ascending: false }),
            supabase.from('player_profile').select('*').eq('user_id', user.id).single(),
        ]);

        setLoot(lootData || []);
        setProfile(profileData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEquip = async (item: Loot) => {
        if (!profile) return;

        const supabase = createClient();
        const field = item.type === 'title' ? 'equipped_title' :
            item.type === 'badge' ? 'equipped_badge' : 'equipped_theme';

        const { error } = await supabase
            .from('player_profile')
            .update({ [field]: item.name })
            .eq('user_id', profile.user_id);

        if (!error) {
            setProfile({ ...profile, [field]: item.name });
        }
    };

    const filteredLoot = filter === 'all'
        ? loot
        : loot.filter(l => l.type === filter);

    const filterButtons: { value: LootType | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'title', label: 'Titles' },
        { value: 'badge', label: 'Badges' },
        { value: 'theme', label: 'Themes' },
    ];

    if (isLoading) {
        return (
            <AppShell>
                <div className="skeleton h-8 w-32 mb-6" />
                <div className="skeleton h-10 w-full mb-4" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32" />)}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Header */}
            <h1 className="text-2xl font-bold text-white mb-6">Inventory</h1>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filterButtons.map(btn => (
                    <button
                        key={btn.value}
                        onClick={() => setFilter(btn.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === btn.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Loot Grid */}
            {filteredLoot.length === 0 ? (
                <div className="card p-8 text-center">
                    <span className="text-4xl mb-4 block">📦</span>
                    <h3 className="text-lg font-semibold text-white mb-2">No items yet</h3>
                    <p className="text-zinc-400 text-sm">
                        Complete quests to earn loot drops!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {filteredLoot.map(item => {
                        const isEquipped =
                            (item.type === 'title' && profile?.equipped_title === item.name) ||
                            (item.type === 'badge' && profile?.equipped_badge === item.name) ||
                            (item.type === 'theme' && profile?.equipped_theme === item.name);

                        return (
                            <div
                                key={item.id}
                                className={`card p-4 relative ${isEquipped ? 'border-indigo-500' : ''}`}
                                style={{ borderColor: isEquipped ? undefined : `${getRarityColor(item.rarity)}30` }}
                            >
                                {isEquipped && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                <span className="text-2xl mb-2 block">
                                    {item.type === 'title' && '📜'}
                                    {item.type === 'badge' && '🛡️'}
                                    {item.type === 'theme' && '🎨'}
                                    {item.type === 'frame' && '🖼️'}
                                </span>

                                <h4
                                    className="font-semibold text-sm mb-1"
                                    style={{ color: getRarityColor(item.rarity) }}
                                >
                                    {item.name}
                                </h4>

                                <p className="text-xs text-zinc-500 capitalize mb-3">
                                    {item.rarity} {item.type}
                                </p>

                                {!isEquipped && (
                                    <button
                                        onClick={() => handleEquip(item)}
                                        className="w-full py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                                    >
                                        Equip
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </AppShell>
    );
}
