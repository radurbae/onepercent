'use client';

import type { PlayerProfile } from '@/lib/types';
import type { TodaySummary } from '@/lib/utils/profileStats';
import { getRankInfo } from '@/lib/utils/rewards';

interface ProfileHeaderProps {
    profile: PlayerProfile;
    email?: string;
    todaySummary: TodaySummary;
}

export default function ProfileHeader({ profile, email, todaySummary }: ProfileHeaderProps) {
    const rankInfo = getRankInfo(profile.rank || 'E');

    // Calculate XP progress
    const xpForCurrentLevel = 50 + (profile.level - 1) * 25;
    const xpForNextLevel = 50 + profile.level * 25;
    const xpIntoLevel = profile.xp - (profile.level > 1 ? xpForCurrentLevel : 0);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpPercent = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

    // Get initials from email
    const initials = email
        ? email.split('@')[0].slice(0, 2).toUpperCase()
        : 'P1';

    return (
        <div className="card p-5 mb-6">
            {/* Top Row: Avatar, Level, Rank */}
            <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
                        color: 'white',
                    }}
                >
                    {initials}
                </div>

                {/* Level & Rank */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Lv.{profile.level}
                        </span>
                        <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                                backgroundColor: `${rankInfo.color}20`,
                                color: rankInfo.color,
                                boxShadow: `0 0 8px ${rankInfo.color}40`,
                            }}
                        >
                            Rank {profile.rank || 'E'}
                        </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                        {email || 'Adventurer'}
                    </p>
                </div>

                {/* Gold */}
                <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-semibold text-yellow-500">
                        <span>🪙</span>
                        <span>{profile.gold}</span>
                    </div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: 'var(--foreground-muted)' }}>XP Progress</span>
                    <span style={{ color: 'var(--foreground)' }}>{xpPercent}% to Lv.{profile.level + 1}</span>
                </div>
                <div className="xp-bar-container">
                    <div
                        className="xp-bar-fill motion-safe:animate-pulse"
                        style={{ width: `${xpPercent}%` }}
                    />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    {profile.xp} / {xpForNextLevel} XP
                </p>
            </div>

            {/* Today Summary */}
            <div
                className="flex items-center justify-center gap-3 py-2 px-4 rounded-lg text-sm"
                style={{ background: 'var(--background-secondary)' }}
            >
                <div className="flex items-center gap-1">
                    <span>⚔️</span>
                    <span style={{ color: 'var(--foreground)' }}>
                        Quests: {todaySummary.questsCompleted}/{todaySummary.questsTotal}
                    </span>
                </div>
                <span style={{ color: 'var(--foreground-muted)' }}>•</span>
                <div className="flex items-center gap-1">
                    <span>📋</span>
                    <span style={{ color: 'var(--foreground)' }}>
                        Habits: {todaySummary.habitsCompleted}/{todaySummary.habitsTotal}
                    </span>
                </div>
            </div>
        </div>
    );
}
