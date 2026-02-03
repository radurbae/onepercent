'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StatWithTrend } from '@/lib/utils/profileStats';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    stat: StatWithTrend;
    icon: LucideIcon;
    color: string;
    onClick?: () => void;
}

export default function StatCard({ label, stat, icon: Icon, color, onClick }: StatCardProps) {
    const TrendIcon = stat.trend > 0 ? TrendingUp : stat.trend < 0 ? TrendingDown : Minus;
    const trendColor = stat.trend > 0 ? '#22c55e' : stat.trend < 0 ? '#ef4444' : 'var(--foreground-muted)';

    return (
        <button
            onClick={onClick}
            className="card p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
            style={{ borderColor: `${color}30` }}
        >
            {/* Icon & Value */}
            <div className="flex items-start justify-between mb-2">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {stat.value}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>/100</span>
                </div>
            </div>

            {/* Label */}
            <p className="font-medium text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                {label}
            </p>

            {/* Trend */}
            <div className="flex items-center gap-1">
                <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
                <span className="text-xs" style={{ color: trendColor }}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </span>
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    vs last week
                </span>
            </div>

            {/* Hint */}
            <p className="text-xs mt-2 truncate" style={{ color: 'var(--foreground-muted)' }}>
                {stat.hint}
            </p>
        </button>
    );
}
