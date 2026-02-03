'use client';

import { Coins, Sparkles } from 'lucide-react';
import type { PlayerProfile, PlayerStats } from '@/lib/types';
import XPBar from './XPBar';
import RankBadge from './RankBadge';
import { StatsGrid } from './StatDisplay';

interface PlayerCardProps {
    profile: PlayerProfile;
    stats: PlayerStats;
}

export default function PlayerCard({ profile, stats }: PlayerCardProps) {
    return (
        <div className="status-window p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Lv. {profile.level}
                        </span>
                        <RankBadge rank={profile.rank} />
                    </div>
                    {profile.equipped_title && (
                        <p className="text-indigo-400 text-sm font-medium">
                            「{profile.equipped_title}」
                        </p>
                    )}
                </div>

                {/* Gold */}
                <div className="gold-amount text-lg">
                    <Coins className="w-5 h-5" />
                    <span>{profile.gold.toLocaleString()}</span>
                </div>
            </div>

            {/* XP Bar */}
            <div className="mb-5">
                <XPBar currentXP={profile.xp} level={profile.level} size="lg" />
            </div>

            {/* Stats */}
            <StatsGrid stats={stats} />

            {/* Equipped badge hint */}
            {profile.equipped_badge && (
                <div
                    className="mt-4 pt-4 border-t flex items-center gap-2 text-sm"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}
                >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Equipped: {profile.equipped_badge}</span>
                </div>
            )}
        </div>
    );
}
