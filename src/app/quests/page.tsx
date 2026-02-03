'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import QuestCard from '@/components/QuestCard';
import LevelUpModal from '@/components/LevelUpModal';
import LootDropModal from '@/components/LootDropModal';
import { useToast } from '@/components/Toast';
import { Sword, Star } from 'lucide-react';
import type { Habit, Checkin, Loot, PlayerProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getYesterdayDate } from '@/lib/utils/dates';
import { shouldShowHabitOnDate } from '@/lib/utils/schedule';
import { calculateStreak } from '@/lib/utils/streak';
import { calculateRewards, levelFromXp, rollForLoot } from '@/lib/utils/rewards';

interface QuestHabit extends Habit {
    checkin: Checkin | null;
    streak: number;
}

export default function QuestsPage() {
    const [quests, setQuests] = useState<QuestHabit[]>([]);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const [lootDrop, setLootDrop] = useState<Loot | null>(null);
    const { showToast } = useToast();

    const today = formatDate(new Date());
    const yesterday = getYesterdayDate();

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch all data
        const [
            { data: habits },
            { data: checkins },
            { data: allCheckins },
            { data: profileData },
        ] = await Promise.all([
            supabase.from('habits').select('*').eq('user_id', user.id).order('created_at'),
            supabase.from('checkins').select('*').eq('user_id', user.id).in('date', [today, yesterday]),
            supabase.from('checkins').select('*').eq('user_id', user.id).gte('date', formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))),
            supabase.from('player_profile').select('*').eq('user_id', user.id).single(),
        ]);

        if (!habits) {
            setIsLoading(false);
            return;
        }

        // Filter today's habits and enrich with checkin data
        const todayHabits = habits.filter(h => shouldShowHabitOnDate(h, today));
        const enrichedQuests: QuestHabit[] = todayHabits.map(habit => {
            const todayCheckin = checkins?.find(c => c.habit_id === habit.id && c.date === today) || null;
            const habitCheckins = allCheckins?.filter(c => c.habit_id === habit.id) || [];
            const streak = calculateStreak(habit, habitCheckins);
            return { ...habit, checkin: todayCheckin, streak };
        });

        setQuests(enrichedQuests);
        setProfile(profileData || null);
        setIsLoading(false);
    }, [today, yesterday]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleComplete = async (quest: QuestHabit) => {
        if (!profile) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upsert checkin
        await supabase.from('checkins').upsert({
            user_id: user.id,
            habit_id: quest.id,
            date: today,
            status: 'done',
        }, { onConflict: 'user_id,habit_id,date' });

        // Calculate rewards
        const completedCount = quests.filter(q => q.checkin?.status === 'done').length + 1;
        const scheduledCount = quests.length;
        const isDailyCleared = completedCount === scheduledCount;

        const rewards = calculateRewards({
            streak: quest.streak,
            isDailyCleared,
        });

        // Update profile
        const newXp = profile.xp + rewards.xp;
        const newGold = profile.gold + rewards.gold;
        const oldLevel = profile.level;
        const calculatedLevel = levelFromXp(newXp);

        await supabase.from('player_profile').update({
            xp: newXp,
            gold: newGold,
            level: calculatedLevel,
        }).eq('user_id', user.id);

        // Record in ledger
        await supabase.from('reward_ledger').upsert({
            user_id: user.id,
            habit_id: quest.id,
            date: today,
            xp_delta: rewards.xp,
            gold_delta: rewards.gold,
            reason: 'quest_complete',
        }, { onConflict: 'user_id,habit_id,date,reason' });

        // Update daily summary
        await supabase.from('daily_summary').upsert({
            user_id: user.id,
            date: today,
            completed_count: completedCount,
            scheduled_count: scheduledCount,
            cleared: isDailyCleared,
        }, { onConflict: 'user_id,date' });

        // Check for level up
        if (calculatedLevel > oldLevel) {
            setNewLevel(calculatedLevel);
            setShowLevelUp(true);
        }

        // Roll for loot
        const { data: existingLoot } = await supabase.from('loot').select('type, name').eq('user_id', user.id);
        const lootKeys = existingLoot?.map(l => `${l.type}:${l.name}`) || [];
        const drop = rollForLoot(lootKeys);

        if (drop) {
            const { data: newLoot } = await supabase.from('loot').insert({
                user_id: user.id,
                type: drop.type,
                name: drop.name,
                rarity: drop.rarity,
            }).select().single();

            if (newLoot) {
                setLootDrop(newLoot);
            }
        }

        // Show toast
        showToast(`+${rewards.xp} XP, +${rewards.gold} Gold`, 'success');

        // Refresh data
        fetchData();
    };

    const handleSkip = async (quest: QuestHabit) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('checkins').upsert({
            user_id: user.id,
            habit_id: quest.id,
            date: today,
            status: 'skipped',
        }, { onConflict: 'user_id,habit_id,date' });

        showToast('Quest skipped', 'info');
        fetchData();
    };

    const mainQuests = quests.filter(q => q.quest_type === 'main' || quests.indexOf(q) < 3);
    const sideQuests = quests.filter(q => !mainQuests.includes(q));
    const completedCount = quests.filter(q => q.checkin?.status === 'done').length;

    if (isLoading) {
        return (
            <AppShell>
                <div className="skeleton h-8 w-32 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-48" />)}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Daily Quests</h1>
                    <p className="text-zinc-400 text-sm">
                        {completedCount}/{quests.length} completed
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-500">Today</p>
                    <p className="text-sm text-zinc-300">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Daily Clear Banner */}
            {completedCount === quests.length && quests.length > 0 && (
                <div className="card p-4 mb-6 text-center border-green-500/30 bg-green-500/10">
                    <span className="text-2xl mb-2 block">🏆</span>
                    <p className="font-semibold text-green-500">Daily Clear!</p>
                    <p className="text-xs text-zinc-400">All quests completed</p>
                </div>
            )}

            {/* Main Quests */}
            {mainQuests.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
                            Main Quests
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {mainQuests.map(quest => (
                            <QuestCard
                                key={quest.id}
                                habit={{ ...quest, quest_type: 'main' }}
                                checkin={quest.checkin}
                                streak={quest.streak}
                                onComplete={() => handleComplete(quest)}
                                onSkip={() => handleSkip(quest)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Side Quests */}
            {sideQuests.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Sword className="w-4 h-4 text-zinc-500" />
                        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                            Side Quests
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {sideQuests.map(quest => (
                            <QuestCard
                                key={quest.id}
                                habit={{ ...quest, quest_type: 'side' }}
                                checkin={quest.checkin}
                                streak={quest.streak}
                                onComplete={() => handleComplete(quest)}
                                onSkip={() => handleSkip(quest)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {quests.length === 0 && (
                <div className="card p-8 text-center">
                    <span className="text-4xl mb-4 block">⚔️</span>
                    <h3 className="text-lg font-semibold text-white mb-2">No quests today</h3>
                    <p className="text-zinc-400 text-sm">
                        Create habits to start your adventure!
                    </p>
                </div>
            )}

            {/* Level Up Modal */}
            <LevelUpModal
                isOpen={showLevelUp}
                onClose={() => setShowLevelUp(false)}
                newLevel={newLevel}
            />

            {/* Loot Drop Modal */}
            <LootDropModal
                isOpen={!!lootDrop}
                onClose={() => setLootDrop(null)}
                loot={lootDrop}
            />
        </AppShell>
    );
}
