'use client';

import { useMemo } from 'react';
import { xpProgressPercent, xpRequiredForLevel } from '@/lib/utils/rewards';

interface XPBarProps {
    currentXP: number;
    level: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function XPBar({ currentXP, level, showLabel = true, size = 'md' }: XPBarProps) {
    const progress = useMemo(() => xpProgressPercent(currentXP, level), [currentXP, level]);
    const xpNeeded = useMemo(() => xpRequiredForLevel(level), [level]);
    const xpIntoLevel = useMemo(() => {
        let total = 0;
        for (let l = 1; l < level; l++) {
            total += xpRequiredForLevel(l);
        }
        return currentXP - total;
    }, [currentXP, level]);

    const heights = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-indigo-400">EXP</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--foreground-muted)' }}>
                        {xpIntoLevel} / {xpNeeded}
                    </span>
                </div>
            )}
            <div className={`xp-bar-container ${heights[size]}`}>
                <div
                    className="xp-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
