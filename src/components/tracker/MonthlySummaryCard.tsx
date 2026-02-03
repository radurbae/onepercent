'use client';

import { TrendingUp, Check, X, Flame, Trophy } from 'lucide-react';

interface MonthlySummaryCardProps {
    monthLabel: string;
    habitName: string;
    completionPercent: number;
    doneCount: number;
    skippedCount: number;
    currentStreak: number;
    bestStreak: number;
    totalDays: number;
}

export default function MonthlySummaryCard({
    monthLabel,
    habitName,
    completionPercent,
    doneCount,
    skippedCount,
    currentStreak,
    bestStreak,
    totalDays,
}: MonthlySummaryCardProps) {
    const isHot = completionPercent >= 70;
    const needsAttention = completionPercent < 40 && totalDays > 0;

    return (
        <div
            className="card p-5 mb-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, var(--background-secondary), var(--card-bg))',
                boxShadow: isHot
                    ? '0 0 30px rgba(251, 146, 60, 0.15)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* Glow overlay for hot streaks */}
            {isHot && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at top right, rgba(251, 146, 60, 0.1) 0%, transparent 60%)',
                    }}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative">
                <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                        {monthLabel}
                    </h2>
                    <p className="text-sm truncate max-w-[200px]" style={{ color: 'var(--foreground-muted)' }}>
                        {habitName}
                    </p>
                </div>

                {/* Completion Badge */}
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                        background: isHot
                            ? 'rgba(251, 146, 60, 0.15)'
                            : needsAttention
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'var(--background-secondary)',
                        color: isHot
                            ? '#fb923c'
                            : needsAttention
                                ? '#ef4444'
                                : 'var(--foreground)',
                    }}
                >
                    {isHot && <Flame className="w-4 h-4" />}
                    <span>{completionPercent}%</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
                {/* Done */}
                <div className="text-center">
                    <div
                        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                        style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                    >
                        <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{doneCount}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Done</p>
                </div>

                {/* Skipped */}
                <div className="text-center">
                    <div
                        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                        <X className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{skippedCount}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Skip</p>
                </div>

                {/* Current Streak */}
                <div className="text-center">
                    <div
                        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                        style={{ background: 'rgba(251, 146, 60, 0.15)' }}
                    >
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{currentStreak}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Streak</p>
                </div>

                {/* Best Streak */}
                <div className="text-center">
                    <div
                        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                        style={{ background: 'rgba(251, 191, 36, 0.15)' }}
                    >
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{bestStreak}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Best</p>
                </div>
            </div>
        </div>
    );
}
