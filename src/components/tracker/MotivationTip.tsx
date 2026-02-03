'use client';

import { Lightbulb, Flame, Target, TrendingUp } from 'lucide-react';

interface MotivationTipProps {
    currentStreak: number;
    bestStreak: number;
    completionPercent: number;
    lastThreeDaysEmpty: boolean;
}

export default function MotivationTip({
    currentStreak,
    bestStreak,
    completionPercent,
    lastThreeDaysEmpty,
}: MotivationTipProps) {
    // Determine which tip to show
    let tip: { icon: typeof Lightbulb; text: string; color: string } | null = null;

    if (currentStreak > 0 && currentStreak === bestStreak - 1) {
        tip = {
            icon: Flame,
            text: "You're 1 day away from a new personal record! 🔥",
            color: '#fb923c',
        };
    } else if (currentStreak > 0 && currentStreak >= bestStreak) {
        tip = {
            icon: TrendingUp,
            text: "You're on a record streak! Keep the momentum! 🚀",
            color: '#22c55e',
        };
    } else if (lastThreeDaysEmpty) {
        tip = {
            icon: Target,
            text: "Start small: just complete 2 minutes today to restart. 💪",
            color: '#3b82f6',
        };
    } else if (completionPercent >= 70) {
        tip = {
            icon: Lightbulb,
            text: "Maintain momentum—consistency beats intensity. ✨",
            color: '#a855f7',
        };
    } else if (completionPercent >= 40) {
        tip = {
            icon: Lightbulb,
            text: "You're building a foundation. Every day counts! 🌱",
            color: '#22c55e',
        };
    }

    if (!tip) return null;

    const Icon = tip.icon;

    return (
        <div
            className="card p-4 flex items-start gap-3 mt-4"
            style={{
                background: `linear-gradient(135deg, ${tip.color}10, transparent)`,
                borderColor: `${tip.color}30`,
            }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${tip.color}20` }}
            >
                <Icon className="w-5 h-5" style={{ color: tip.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: tip.color }}>
                    Tip
                </p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {tip.text}
                </p>
            </div>
        </div>
    );
}
