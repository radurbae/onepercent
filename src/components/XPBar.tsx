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
    const safeXP = Number.isFinite(currentXP) && currentXP >= 0 ? currentXP : 0;
    const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
    const progress = useMemo(() => {
        const raw = xpProgressPercent(safeXP, safeLevel);
        return Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
    }, [safeXP, safeLevel]);
    const xpNeeded = useMemo(() => xpRequiredForLevel(safeLevel), [safeLevel]);
    const xpIntoLevel = useMemo(() => {
        let total = 0;
        for (let l = 1; l < safeLevel; l++) {
            total += xpRequiredForLevel(l);
        }
        return Math.max(0, safeXP - total);
    }, [safeXP, safeLevel]);

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
                    style={{
                        width: `${progress}%`,
                        minWidth: progress > 0 ? '4px' : undefined,
                    }}
                />
            </div>
        </div>
    );
}
