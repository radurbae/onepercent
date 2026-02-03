'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Target, Zap, BookOpen, Heart, Palette, Users } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatCard from '@/components/profile/StatCard';
import InsightsCard from '@/components/profile/InsightsCard';
import { AchievementsRow } from '@/components/profile/AchievementBadge';
import type { PlayerProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
    calculateProfileStats,
    getTodaySummary,
    getStreakInfo,
    getAchievements,
    type ProfileStats,
    type TodaySummary,
    type StreakInfo,
    type Achievement,
} from '@/lib/utils/profileStats';

export default function ProfilePage() {
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [email, setEmail] = useState<string>('');
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [todaySummary, setTodaySummary] = useState<TodaySummary>({ questsCompleted: 0, questsTotal: 0, habitsCompleted: 0, habitsTotal: 0 });
    const [streakInfo, setStreakInfo] = useState<StreakInfo>({ currentQuestStreak: 0, currentHabitStreak: 0, bestQuestStreak: 0, weakestCategory: null });
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        setEmail(user.email || '');

        // Fetch profile
        const { data: profileData } = await supabase
            .from('player_profile')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileData) {
            setProfile(profileData);
        }

        // Fetch all stats in parallel
        const [profileStats, summary, streak, achievementList] = await Promise.all([
            calculateProfileStats(),
            getTodaySummary(),
            getStreakInfo(),
            getAchievements(),
        ]);

        setStats(profileStats);
        setTodaySummary(summary);
        setStreakInfo(streak);
        setAchievements(achievementList);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <AppShell>
                <div className="space-y-4">
                    {/* Header skeleton */}
                    <div className="card p-5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="skeleton w-16 h-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-8 w-24" />
                                <div className="skeleton h-4 w-40" />
                            </div>
                        </div>
                        <div className="skeleton h-3 w-full mb-2" />
                        <div className="skeleton h-10 w-full" />
                    </div>

                    {/* Stats grid skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton h-32" />
                        ))}
                    </div>

                    {/* Insights skeleton */}
                    <div className="skeleton h-40" />

                    {/* Achievements skeleton */}
                    <div className="skeleton h-24" />
                </div>
            </AppShell>
        );
    }

    if (!profile) {
        return (
            <AppShell>
                <div className="card p-8 text-center">
                    <span className="text-4xl mb-4 block">⚔️</span>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                        No profile found
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        Complete a quest or habit to start your adventure!
                    </p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Status</h1>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link
                        href="/account"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'var(--background-secondary)' }}
                    >
                        <Settings className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
                    </Link>
                </div>
            </div>

            {/* Hero Header */}
            <ProfileHeader profile={profile} email={email} todaySummary={todaySummary} />

            {/* Stats Grid */}
            <div className="mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                    Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {stats && (
                        <>
                            <StatCard
                                label="CON"
                                fullName="Consistency"
                                stat={stats.consistency}
                                icon={Target}
                                color="#22c55e"
                                description="Your 7-day completion rate across all quests and habits."
                            />
                            <StatCard
                                label="FOC"
                                fullName="Focus"
                                stat={stats.focus}
                                icon={Zap}
                                color="#f59e0b"
                                description="Performance on productivity-related quests."
                            />
                            <StatCard
                                label="WIS"
                                fullName="Wisdom"
                                stat={stats.learning}
                                icon={BookOpen}
                                color="#3b82f6"
                                description="Growth through learning and knowledge quests."
                            />
                            <StatCard
                                label="VIT"
                                fullName="Vitality"
                                stat={stats.health}
                                icon={Heart}
                                color="#ef4444"
                                description="Physical wellness from fitness and health quests."
                            />
                            <StatCard
                                label="CRE"
                                fullName="Creativity"
                                stat={stats.environment}
                                icon={Palette}
                                color="#a855f7"
                                description="Artistic expression and creative output."
                            />
                            <StatCard
                                label="CHA"
                                fullName="Charisma"
                                stat={stats.social}
                                icon={Users}
                                color="#ec4899"
                                description="Social connections and relationship building."
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Insights */}
            <InsightsCard streakInfo={streakInfo} />

            {/* Achievements */}
            <AchievementsRow achievements={achievements} />
        </AppShell>
    );
}
