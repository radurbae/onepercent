'use client';

import { useState, useEffect } from 'react';
import type { PlayerProfile } from '@/lib/types';
import type { TodaySummary } from '@/lib/utils/profileStats';
import { getRankInfo, xpProgressPercent, xpRequiredForLevel, totalXpForLevel } from '@/lib/utils/rewards';

interface ProfileHeaderProps {
    profile: PlayerProfile;
    email?: string;
    todaySummary: TodaySummary;
}

export default function ProfileHeader({ profile, email, todaySummary }: ProfileHeaderProps) {
    const safeLevel = Number.isFinite(profile.level) && profile.level > 0 ? profile.level : 1;
    const safeXp = Number.isFinite(profile.xp) && profile.xp >= 0 ? profile.xp : 0;
    const safeGold = Number.isFinite(profile.gold) && profile.gold >= 0 ? profile.gold : 0;
    const rankInfo = getRankInfo(profile.rank || 'E');
    const [animatedPercent, setAnimatedPercent] = useState(0);

    const xpSpent = totalXpForLevel(safeLevel);
    const xpForThisLevel = xpRequiredForLevel(safeLevel);
    const xpIntoLevel = Math.max(0, safeXp - xpSpent);
    const rawPercent = xpProgressPercent(safeXp, safeLevel);
    const xpPercent = Number.isFinite(rawPercent) ? Math.min(100, Math.max(0, rawPercent)) : 0;
    const isReady = xpIntoLevel >= xpForThisLevel;

    useEffect(() => {
        setAnimatedPercent(0); // Reset pas data berubah
        const duration = 1500; // Total 1.5 detik
        const steps = 60; // 60 frame per detik
        const increment = xpPercent / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= xpPercent) {
                setAnimatedPercent(xpPercent);
                clearInterval(timer);
            } else {
                setAnimatedPercent(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [xpPercent]);

    const initials = email
        ? email.split('@')[0].slice(0, 2).toUpperCase()
        : 'P1';

    return (
        <div
            className="card p-5 mb-6 relative overflow-hidden"
            style={{
                boxShadow: isReady ? '0 0 30px rgba(251, 191, 36, 0.3)' : undefined,
                borderColor: isReady ? 'rgba(251, 191, 36, 0.4)' : undefined,
            }}
        >
            {/* Overlay glow kalau siap naik level */}
            {isReady && (
                <div
                    className="absolute inset-0 pointer-events-none animate-pulse"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
                    }}
                />
            )}

            {/* Baris atas: avatar, level, rank */}
            <div className="flex items-center gap-4 mb-4 relative">
                {/* Foto profil */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold relative"
                    style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
                        color: 'white',
                        boxShadow: '0 0 20px rgba(129, 140, 248, 0.3)',
                    }}
                >
                    {initials}
                    {/* Ring pulse kalau siap naik level */}
                    {isReady && (
                        <div
                            className="absolute inset-0 rounded-full animate-ping opacity-30"
                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                        />
                    )}
                </div>

                {/* Level & rank */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-3xl font-bold"
                            style={{
                                color: 'var(--foreground)',
                                textShadow: isReady ? '0 0 20px rgba(251, 191, 36, 0.5)' : undefined,
                            }}
                        >
                            Lv.{safeLevel}
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
                        {isReady && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-500 animate-pulse">
                                READY!
                            </span>
                        )}
                    </div>
                    <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                        {email || 'Adventurer'}
                    </p>
                    {/* Gelar yang kepake */}
                    {profile.equipped_title && (
                        <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>
                            📜 {profile.equipped_title}
                        </p>
                    )}
                </div>

                {/* Koin */}
                <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-semibold text-yellow-500">
                        <span>🪙</span>
                        <span>{safeGold.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Bar XP */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: 'var(--foreground-muted)' }}>Experience</span>
                    <span style={{ color: isReady ? '#fbbf24' : 'var(--foreground)' }}>
                        {isReady ? '🎉 Level Up Ready!' : `${xpPercent}% to Lv.${safeLevel + 1}`}
                    </span>
                </div>

                {/* Wadah bar XP */}
                <div
                    className="relative h-4 rounded-full overflow-hidden"
                    style={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    {/* Isi progres pake animasi */}
                    <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${animatedPercent}%`,
                            minWidth: xpPercent > 0 ? '6px' : undefined,
                            background: isReady
                                ? 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)'
                                : 'linear-gradient(90deg, var(--primary), #a855f7)',
                            backgroundSize: '200% 100%',
                            animation: isReady ? 'xp-shimmer 1.5s ease-in-out infinite' : undefined,
                            boxShadow: isReady
                                ? '0 0 15px rgba(251, 191, 36, 0.6)'
                                : '0 0 10px rgba(129, 140, 248, 0.4)',
                        }}
                    />

                    {/* Overlay shimmer */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                        style={{ backgroundSize: '200% 100%' }}
                    />

                    {/* Efek sparkle kalau siap */}
                    {isReady && (
                        <>
                            <div className="absolute top-1 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
                            <div className="absolute top-2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping delay-100" />
                            <div className="absolute top-1 left-3/4 w-1 h-1 bg-white rounded-full animate-ping delay-200" />
                        </>
                    )}
                </div>

                {/* Angka XP */}
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                        {safeXp.toLocaleString()} XP
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                        {(xpSpent + xpForThisLevel).toLocaleString()} XP
                    </p>
                </div>
            </div>

            {/* Ringkasan hari ini */}
            <div
                className="flex items-center justify-center gap-4 py-2.5 px-4 rounded-xl text-sm"
                style={{ background: 'var(--background-secondary)' }}
            >
                <div className="flex items-center gap-1.5">
                    <span>⚔️</span>
                    <span style={{ color: 'var(--foreground)' }}>
                        <strong>{todaySummary.questsCompleted}</strong>/{todaySummary.questsTotal}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Quests</span>
                </div>
                <div
                    className="w-px h-4"
                    style={{ background: 'var(--border-color)' }}
                />
                <div className="flex items-center gap-1.5">
                    <span>📋</span>
                    <span style={{ color: 'var(--foreground)' }}>
                        <strong>{todaySummary.habitsCompleted}</strong>/{todaySummary.habitsTotal}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Habits</span>
                </div>
            </div>
        </div>
    );
}
