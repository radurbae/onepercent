'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { StatWithTrend } from '@/lib/utils/profileStats';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    fullName: string;
    stat: StatWithTrend;
    icon: LucideIcon;
    color: string;
    description: string;
    onClick?: () => void;
}

export default function StatCard({
    label,
    fullName,
    stat,
    icon: Icon,
    color,
    description,
    onClick
}: StatCardProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const TrendIcon = stat.trend > 0 ? TrendingUp : stat.trend < 0 ? TrendingDown : Minus;
    const trendColor = stat.trend > 0 ? '#22c55e' : stat.trend < 0 ? '#ef4444' : 'var(--foreground-muted)';

    // Determine stat tier for visual feedback
    const tier = stat.value >= 80 ? 'S' : stat.value >= 60 ? 'A' : stat.value >= 40 ? 'B' : stat.value >= 20 ? 'C' : 'D';
    const tierColors: Record<string, string> = {
        'S': '#fbbf24',
        'A': '#22c55e',
        'B': '#3b82f6',
        'C': '#a855f7',
        'D': '#6b7280',
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative group w-full text-left"
        >
            {/* Card with glow effect */}
            <div
                className="card p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                style={{
                    borderColor: `${color}40`,
                    boxShadow: `0 0 20px ${color}15, inset 0 1px 0 ${color}20`,
                }}
            >
                {/* Glow overlay on hover */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 60%)`,
                    }}
                />

                {/* Header: Icon + Tier Badge */}
                <div className="flex items-center justify-between mb-3 relative">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                            style={{
                                background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                                boxShadow: `0 0 12px ${color}30`,
                            }}
                        >
                            <Icon className="w-5 h-5" style={{ color }} />
                            {/* Pulse animation for high stats */}
                            {stat.value >= 80 && (
                                <div
                                    className="absolute inset-0 rounded-xl animate-ping opacity-20"
                                    style={{ backgroundColor: color }}
                                />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color }}>
                                {label}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                                {fullName}
                            </p>
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{
                            background: `${tierColors[tier]}20`,
                            color: tierColors[tier],
                            boxShadow: tier === 'S' ? `0 0 8px ${tierColors[tier]}50` : 'none',
                        }}
                    >
                        {tier}
                    </div>
                </div>

                {/* Value Display */}
                <div className="flex items-end gap-2 mb-3">
                    <span
                        className="text-4xl font-bold tabular-nums"
                        style={{
                            color: 'var(--foreground)',
                            textShadow: stat.value >= 80 ? `0 0 20px ${color}50` : 'none',
                        }}
                    >
                        {stat.value}
                    </span>
                    <span className="text-sm pb-1" style={{ color: 'var(--foreground-muted)' }}>
                        / 100
                    </span>
                </div>

                {/* Progress Bar with animation */}
                <div className="relative h-2 bg-zinc-800/50 rounded-full overflow-hidden mb-3">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out motion-safe:animate-pulse"
                        style={{
                            width: `${stat.value}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                            boxShadow: `0 0 8px ${color}60`,
                        }}
                    />
                    {/* Shimmer effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent motion-safe:animate-shimmer"
                        style={{ backgroundSize: '200% 100%' }}
                    />
                </div>

                {/* Trend & Hint */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
                        <span className="text-xs font-medium" style={{ color: trendColor }}>
                            {stat.trend > 0 ? '+' : ''}{stat.trend}%
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                            this week
                        </span>
                    </div>
                    <Info className="w-3.5 h-3.5" style={{ color: 'var(--foreground-muted)' }} />
                </div>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute z-50 left-0 right-0 -bottom-2 translate-y-full p-3 rounded-lg text-xs"
                    style={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <p style={{ color: 'var(--foreground)' }}>{description}</p>
                    <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
                        {stat.hint}
                    </p>
                </div>
            )}
        </button>
    );
}

// CSS keyframes for shimmer (add to globals.css)
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
