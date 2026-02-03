'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import PlayerCard from '@/components/PlayerCard';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import type { PlayerProfile, PlayerStats } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { calculatePlayerStats } from '@/lib/utils/rewards';
import { formatDate } from '@/lib/utils/dates';

export default function ProfilePage() {
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [stats, setStats] = useState<PlayerStats>({ strength: 0, agility: 0, endurance: 0, intelligence: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get or create profile
        let { data: profileData } = await supabase
            .from('player_profile')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!profileData) {
            // Create profile if doesn't exist
            const { data: newProfile } = await supabase
                .from('player_profile')
                .insert({ user_id: user.id })
                .select()
                .single();
            profileData = newProfile;
        }

        if (profileData) {
            setProfile(profileData);
        }

        // Calculate derived stats from habit data
        const thirtyDaysAgo = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const fourteenDaysAgo = formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));

        // Get completion data for last 30 days
        const { data: summaries } = await supabase
            .from('daily_summary')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', thirtyDaysAgo);

        const completedLast30Days = summaries?.reduce((sum, s) => sum + s.completed_count, 0) || 0;
        const scheduledLast30Days = summaries?.reduce((sum, s) => sum + s.scheduled_count, 0) || 1;

        // This week vs last week
        const thisWeekSummaries = summaries?.filter(s => s.date >= sevenDaysAgo) || [];
        const lastWeekSummaries = summaries?.filter(s => s.date >= fourteenDaysAgo && s.date < sevenDaysAgo) || [];

        const thisWeekCompleted = thisWeekSummaries.reduce((sum, s) => sum + s.completed_count, 0);
        const thisWeekScheduled = thisWeekSummaries.reduce((sum, s) => sum + s.scheduled_count, 0) || 1;
        const lastWeekCompleted = lastWeekSummaries.reduce((sum, s) => sum + s.completed_count, 0);
        const lastWeekScheduled = lastWeekSummaries.reduce((sum, s) => sum + s.scheduled_count, 0) || 1;

        const thisWeekRate = (thisWeekCompleted / thisWeekScheduled) * 100;
        const lastWeekRate = (lastWeekCompleted / lastWeekScheduled) * 100;

        const derivedStats = calculatePlayerStats({
            completedLast30Days,
            scheduledLast30Days,
            fastCompletions: 0, // TODO: Track fast completions
            totalCompletions: completedLast30Days,
            avgStreak: 3, // TODO: Calculate from actual data
            maxStreak: 7, // TODO: Calculate from actual data
            thisWeekRate,
            lastWeekRate,
        });

        setStats(derivedStats);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <AppShell>
                <div className="space-y-4">
                    <div className="skeleton h-8 w-32" />
                    <div className="status-window p-5 space-y-4">
                        <div className="skeleton h-10 w-48" />
                        <div className="skeleton h-3 w-full" />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="skeleton h-16" />
                            <div className="skeleton h-16" />
                            <div className="skeleton h-16" />
                            <div className="skeleton h-16" />
                        </div>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!profile) {
        return (
            <AppShell>
                <div className="card p-8 text-center">
                    <p className="text-zinc-400">Failed to load profile</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Status</h1>
                <Link
                    href="/account"
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </Link>
            </div>

            {/* Player Card */}
            <PlayerCard profile={profile} stats={stats} />

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                <Link href="/inventory" className="card p-4 text-center hover:border-indigo-500/30 transition-colors">
                    <span className="text-2xl mb-2 block">🎒</span>
                    <span className="text-sm text-zinc-400">Inventory</span>
                </Link>
                <Link href="/battle" className="card p-4 text-center hover:border-indigo-500/30 transition-colors">
                    <span className="text-2xl mb-2 block">⚔️</span>
                    <span className="text-sm text-zinc-400">Dungeon</span>
                </Link>
            </div>

            {/* Motivational Quote */}
            <p className="mt-8 text-center text-sm text-zinc-500 italic">
                &ldquo;Every action is a vote for the type of player you wish to become.&rdquo;
            </p>
        </AppShell>
    );
}
