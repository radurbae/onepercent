'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sword, Star, Flame, Clock, Coins, Sparkles } from 'lucide-react';
import type { Habit, Checkin } from '@/lib/types';
import { REWARDS } from '@/lib/utils/rewards';

interface QuestCardProps {
    habit: Habit;
    checkin: Checkin | null;
    streak: number;
    onComplete: () => void;
    onSkip: () => void;
    isLoading?: boolean;
}

export default function QuestCard({
    habit,
    checkin,
    streak,
    onComplete,
    onSkip,
    isLoading
}: QuestCardProps) {
    const isCompleted = checkin?.status === 'done';
    const isSkipped = checkin?.status === 'skipped';
    const isMainQuest = habit.quest_type === 'main';

    // Estimate difficulty by easy_step length
    const difficulty = habit.difficulty || (
        habit.easy_step.length < 30 ? 'easy' :
            habit.easy_step.length < 60 ? 'normal' : 'hard'
    );

    const difficultyConfig = {
        easy: { label: 'Easy', color: '#22c55e' },
        normal: { label: 'Normal', color: '#3b82f6' },
        hard: { label: 'Hard', color: '#ef4444' },
    };

    const rewardXP = REWARDS.BASE_XP + Math.min(streak, REWARDS.STREAK_XP_CAP);
    const rewardGold = REWARDS.BASE_GOLD;

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`quest-card ${isMainQuest ? 'main-quest' : ''} ${isCompleted ? 'opacity-60' : ''} p-4 transition-all duration-300`}
        >
            {/* Quest Type Badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isMainQuest ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3" />
                            MAIN
                        </span>
                    ) : (
                        <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{ color: 'var(--foreground-muted)', background: 'var(--background-secondary)' }}
                        >
                            SIDE
                        </span>
                    )}
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                            color: difficultyConfig[difficulty].color,
                            backgroundColor: `${difficultyConfig[difficulty].color}15`,
                        }}
                    >
                        {difficultyConfig[difficulty].label}
                    </span>
                </div>

                {/* Streak */}
                {streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                        <Flame className="w-4 h-4" />
                        <span>{streak}</span>
                    </div>
                )}
            </div>

            {/* Quest Title */}
            <div className="flex justify-between items-start mb-1">
                <Link href={`/habits/${habit.id}`} className="flex-1">
                    <h3
                        className={`font-semibold text-lg ${isCompleted ? 'line-through' : ''} hover:text-indigo-400 transition-colors`}
                        style={{ color: isCompleted ? 'var(--foreground-muted)' : 'var(--foreground)' }}
                    >
                        {habit.title}
                    </h3>
                </Link>
                {isMainQuest && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded-full text-xs hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        {isExpanded ? 'Hide Info' : 'Show Info'}
                    </button>
                )}
            </div>

            {/* Identity Badge */}
            {isMainQuest && (
                <p className="text-xs font-medium text-indigo-400 mb-2">
                    Identity: &quot;{habit.identity}&quot;
                </p>
            )}

            {/* Easy Step */}
            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {habit.easy_step}
            </p>

            {/* Expanded Details */}
            {isExpanded && isMainQuest && (
                <div
                    className="mb-4 rounded-lg p-3 space-y-2 text-sm border"
                    style={{
                        backgroundColor: 'var(--background-secondary)',
                        borderColor: 'var(--border)'
                    }}
                >
                    {habit.obvious_cue && (
                        <div>
                            <span className="text-xs uppercase tracking-wider block mb-0.5" style={{ color: 'var(--foreground-muted)' }}>When (Cue)</span>
                            <span style={{ color: 'var(--foreground)' }}>{habit.obvious_cue}</span>
                        </div>
                    )}
                    {habit.attractive_bundle && (
                        <div>
                            <span className="text-xs uppercase tracking-wider block mb-0.5" style={{ color: 'var(--foreground-muted)' }}>Pair With (Bundle)</span>
                            <span style={{ color: 'var(--foreground)' }}>{habit.attractive_bundle}</span>
                        </div>
                    )}
                    {habit.satisfying_reward && (
                        <div>
                            <span className="text-xs uppercase tracking-wider block mb-0.5" style={{ color: 'var(--foreground-muted)' }}>Real Life Reward</span>
                            <span style={{ color: 'var(--foreground)' }}>{habit.satisfying_reward}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Rewards Preview */}
            <div
                className="flex items-center gap-4 text-sm mb-4 p-2 rounded-lg"
                style={{ backgroundColor: 'var(--background-secondary)' }}
            >
                <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <Sparkles className="w-4 h-4" />
                    +{rewardXP} XP
                </span>
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                    <Coins className="w-4 h-4" />
                    +{rewardGold} G
                </span>
            </div>

            {/* Actions */}
            {!isCompleted && !isSkipped ? (
                <div className="flex items-center gap-2">
                    <button
                        onClick={onComplete}
                        disabled={isLoading}
                        className="flex-1 btn-success flex items-center justify-center gap-2"
                    >
                        <Sword className="w-5 h-5" />
                        Complete
                    </button>
                    <button
                        onClick={onSkip}
                        disabled={isLoading}
                        className="btn-skip"
                    >
                        Skip
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center py-3 text-sm">
                    {isCompleted ? (
                        <span className="text-green-500 font-medium flex items-center gap-1">
                            ✓ Quest Completed
                        </span>
                    ) : (
                        <span style={{ color: 'var(--foreground-muted)' }}>Skipped</span>
                    )}
                </div>
            )}
        </div>
    );
}
