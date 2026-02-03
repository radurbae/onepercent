'use client';

import { ChevronDown, Flame, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Habit } from '@/lib/types';

interface HabitSelectProps {
    habits: Habit[];
    selectedId: string | null;
    completionPercents: Record<string, number>;
    onChange: (id: string) => void;
}

export default function HabitSelect({
    habits,
    selectedId,
    completionPercents,
    onChange
}: HabitSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedHabit = habits.find(h => h.id === selectedId);
    const selectedPercent = selectedId ? (completionPercents[selectedId] || 0) : 0;
    const isHot = selectedPercent >= 70;
    const needsAttention = selectedPercent < 40 && selectedPercent > 0;

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div ref={containerRef} className="relative mb-4">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full card p-4 flex items-center justify-between gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                    borderColor: isHot ? 'rgba(251, 146, 60, 0.3)' : undefined,
                }}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: isHot
                                ? 'rgba(251, 146, 60, 0.15)'
                                : 'var(--background-secondary)',
                        }}
                    >
                        <span className="text-lg">📋</span>
                    </div>

                    {/* Habit Name */}
                    <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                            {selectedHabit?.title || 'Select habit'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {isHot && (
                                <span className="flex items-center gap-1 text-xs text-orange-400">
                                    <Flame className="w-3 h-3" /> Hot
                                </span>
                            )}
                            {needsAttention && (
                                <span className="flex items-center gap-1 text-xs text-red-400">
                                    <AlertTriangle className="w-3 h-3" /> Needs attention
                                </span>
                            )}
                            {!isHot && !needsAttention && selectedPercent > 0 && (
                                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                    {selectedPercent}% this month
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Completion Badge + Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                    <div
                        className="px-2 py-1 rounded-lg text-sm font-semibold"
                        style={{
                            background: isHot
                                ? 'rgba(251, 146, 60, 0.15)'
                                : needsAttention
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : 'var(--background-secondary)',
                            color: isHot
                                ? '#fb923c'
                                : needsAttention
                                    ? '#ef4444'
                                    : 'var(--foreground)',
                        }}
                    >
                        {selectedPercent}%
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--foreground-muted)' }}
                    />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute z-50 left-0 right-0 mt-2 card p-2 max-h-60 overflow-y-auto"
                    style={{
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {habits.map((habit) => {
                        const percent = completionPercents[habit.id] || 0;
                        const hot = percent >= 70;
                        const warn = percent < 40 && percent > 0;
                        const isSelected = habit.id === selectedId;

                        return (
                            <button
                                key={habit.id}
                                onClick={() => {
                                    onChange(habit.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-lg">📋</span>
                                    <span
                                        className="font-medium truncate"
                                        style={{ color: isSelected ? 'var(--primary)' : 'var(--foreground)' }}
                                    >
                                        {habit.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {hot && <Flame className="w-4 h-4 text-orange-400" />}
                                    {warn && <AlertTriangle className="w-4 h-4 text-red-400" />}
                                    <span
                                        className="text-sm font-medium"
                                        style={{
                                            color: hot ? '#fb923c' : warn ? '#ef4444' : 'var(--foreground-muted)'
                                        }}
                                    >
                                        {percent}%
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
