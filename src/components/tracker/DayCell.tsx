'use client';

import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface DayCellProps {
    date: Date;
    status: 'done' | 'skipped' | null;
    isToday: boolean;
    isFuture: boolean;
    onClick: () => void;
}

export default function DayCell({ date, status, isToday, isFuture, onClick }: DayCellProps) {
    const day = format(date, 'd');

    return (
        <button
            onClick={onClick}
            disabled={isFuture}
            className={`
        relative aspect-square rounded-xl text-sm font-semibold
        flex items-center justify-center
        min-h-[44px] md:min-h-[52px]
        transition-all duration-200
        motion-safe:active:scale-95
        ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
      `}
            style={{
                background: status === 'done'
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.15))'
                    : status === 'skipped'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'var(--background-secondary)',
                boxShadow: status === 'done'
                    ? '0 0 12px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : status === 'skipped'
                        ? '0 0 8px rgba(239, 68, 68, 0.2)'
                        : 'none',
                color: status === 'done'
                    ? '#22c55e'
                    : status === 'skipped'
                        ? '#ef4444'
                        : isFuture
                            ? 'var(--foreground-muted)'
                            : 'var(--foreground)',
                borderColor: status === 'done'
                    ? 'rgba(34, 197, 94, 0.3)'
                    : status === 'skipped'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
            }}
            aria-label={`${format(date, 'MMMM d')}, ${status || 'not tracked'}`}
        >
            {/* Day number */}
            <span className="relative z-10">{day}</span>

            {/* Status icon overlay */}
            {status === 'done' && (
                <div className="absolute top-1 right-1">
                    <Check className="w-3 h-3 text-green-500" />
                </div>
            )}
            {status === 'skipped' && (
                <div className="absolute top-1 right-1">
                    <X className="w-3 h-3 text-red-400" />
                </div>
            )}

            {/* Today indicator dot */}
            {isToday && !status && (
                <div
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--primary)' }}
                />
            )}

            {/* Hover effect */}
            {!isFuture && !status && (
                <div
                    className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--primary)', opacity: 0.05 }}
                />
            )}
        </button>
    );
}
