'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import DungeonTimer from '@/components/DungeonTimer';
import { useToast } from '@/components/Toast';
import { Sword, Clock, ChevronRight } from 'lucide-react';
import type { Habit, PlayerProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/dates';
import { calculateRewards, levelFromXp } from '@/lib/utils/rewards';

type DungeonState = 'select' | 'running' | 'complete';

const DURATION_OPTIONS = [
    { minutes: 10, label: '10 min', xpBonus: 'x1.5' },
    { minutes: 15, label: '15 min', xpBonus: 'x2' },
    { minutes: 25, label: '25 min', xpBonus: 'x2.5' },
];

export default function BattlePage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [state, setState] = useState<DungeonState>('select');
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(15);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const [{ data: habitsData }, { data: profileData }] = await Promise.all([
            supabase.from('habits').select('*').eq('user_id', user.id).order('created_at'),
            supabase.from('player_profile').select('*').eq('user_id', user.id).single(),
        ]);

        setHabits(habitsData || []);
        setProfile(profileData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const startDungeon = (habit: Habit, minutes: number) => {
        setSelectedHabit(habit);
        setSelectedDuration(minutes);
        setState('running');
    };

    const handleComplete = async () => {
        if (!selectedHabit || !profile) {
            setState('select');
            return;
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = formatDate(new Date());

        // Calculate dungeon rewards (bonus XP)
        const rewards = calculateRewards({
            streak: 0,
            isDungeonRun: true,
        });

        // Apply duration multiplier
        const multiplier = selectedDuration >= 25 ? 2.5 : selectedDuration >= 15 ? 2 : 1.5;
        const finalXp = Math.round(rewards.xp * multiplier);
        const finalGold = rewards.gold;

        const newXp = profile.xp + finalXp;
        const newGold = profile.gold + finalGold;
        const calculatedLevel = levelFromXp(newXp);

        // Update profile
        await supabase.from('player_profile').update({
            xp: newXp,
            gold: newGold,
            level: calculatedLevel,
        }).eq('user_id', user.id);

        // Record in ledger
        await supabase.from('reward_ledger').insert({
            user_id: user.id,
            habit_id: selectedHabit.id,
            date: today,
            xp_delta: finalXp,
            gold_delta: finalGold,
            reason: 'dungeon_clear',
        });

        // Mark as completed
        await supabase.from('checkins').upsert({
            user_id: user.id,
            habit_id: selectedHabit.id,
            date: today,
            status: 'done',
        }, { onConflict: 'user_id,habit_id,date' });

        showToast(`Dungeon cleared! +${finalXp} XP, +${finalGold} Gold`, 'success');
        setState('select');
        fetchData();
    };

    const handleCancel = () => {
        setState('select');
        setSelectedHabit(null);
    };

    if (isLoading) {
        return (
            <AppShell>
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="skeleton h-64" />
            </AppShell>
        );
    }

    if (state === 'running' && selectedHabit) {
        return (
            <AppShell showNav={false}>
                <div className="min-h-[80vh] flex items-center justify-center">
                    <DungeonTimer
                        durationMinutes={selectedDuration}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        questName={selectedHabit.title}
                    />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-600/20 flex items-center justify-center">
                    <Sword className="w-8 h-8 text-indigo-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Dungeon Run</h1>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Focus mode with bonus XP rewards
                </p>
            </div>

            {/* Quest Selection */}
            <div className="mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                    Select Quest
                </h2>
                <div className="space-y-2">
                    {habits.map(habit => (
                        <button
                            key={habit.id}
                            onClick={() => setSelectedHabit(habit)}
                            className={`w-full p-4 rounded-xl text-left transition-all border ${selectedHabit?.id === habit.id
                                ? 'bg-indigo-600/20 border-indigo-500'
                                : 'hover:border-indigo-500/50'
                                }`}
                            style={selectedHabit?.id !== habit.id ? {
                                background: 'var(--background-secondary)',
                                borderColor: 'var(--border)'
                            } : undefined}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>{habit.title}</h3>
                                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{habit.easy_step}</p>
                                </div>
                                <ChevronRight className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Duration Selection */}
            {selectedHabit && (
                <div className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                        Select Duration
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {DURATION_OPTIONS.map(opt => (
                            <button
                                key={opt.minutes}
                                onClick={() => setSelectedDuration(opt.minutes)}
                                className={`p-4 rounded-xl text-center transition-all border ${selectedDuration === opt.minutes
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : ''
                                    }`}
                                style={selectedDuration !== opt.minutes ? {
                                    background: 'var(--background-secondary)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--foreground-muted)'
                                } : undefined}
                            >
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-semibold">{opt.label}</span>
                                </div>
                                <span className="text-xs opacity-75">{opt.xpBonus} XP</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Start Button */}
            {selectedHabit && (
                <button
                    onClick={() => startDungeon(selectedHabit, selectedDuration)}
                    className="w-full btn-primary py-4 text-lg"
                >
                    Enter Dungeon
                </button>
            )}

            {/* Empty State */}
            {habits.length === 0 && (
                <div className="card p-8 text-center">
                    <span className="text-4xl mb-4 block">🗡️</span>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No quests available</h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        Create habits first to run dungeons!
                    </p>
                </div>
            )}
        </AppShell>
    );
}
