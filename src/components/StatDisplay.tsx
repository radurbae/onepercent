'use client';

import { Dumbbell, Zap, Shield, Brain } from 'lucide-react';
import type { PlayerStats } from '@/lib/types';

interface StatDisplayProps {
    stat: keyof PlayerStats;
    value: number;
    showBar?: boolean;
}

const STAT_CONFIG = {
    strength: { icon: Dumbbell, label: 'STR', color: '#ef4444' },
    agility: { icon: Zap, label: 'AGI', color: '#22d3ee' },
    endurance: { icon: Shield, label: 'END', color: '#22c55e' },
    intelligence: { icon: Brain, label: 'INT', color: '#a855f7' },
};

export default function StatDisplay({ stat, value, showBar = true }: StatDisplayProps) {
    const config = STAT_CONFIG[stat];
    const Icon = config.icon;

    return (
        <div className="stat-item">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
            >
                <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="stat-label">{config.label}</span>
                    <span className="stat-value" style={{ color: config.color }}>
                        {value}
                    </span>
                </div>
                {showBar && (
                    <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${value}%`,
                                backgroundColor: config.color,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatsGridProps {
    stats: PlayerStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <StatDisplay stat="strength" value={stats.strength} />
            <StatDisplay stat="agility" value={stats.agility} />
            <StatDisplay stat="endurance" value={stats.endurance} />
            <StatDisplay stat="intelligence" value={stats.intelligence} />
        </div>
    );
}
