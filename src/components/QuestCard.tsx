'use client';

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

    return (
        <div
            className={`quest-card ${isMainQuest ? 'main-quest' : ''} ${isCompleted ? 'opacity-60' : ''} p-4`}
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
            <Link href={`/habits/${habit.id}`}>
                <h3
                    className={`font-semibold text-lg mb-1 ${isCompleted ? 'line-through' : ''}`}
                    style={{ color: isCompleted ? 'var(--foreground-muted)' : 'var(--foreground)' }}
                >
                    {habit.title}
                </h3>
            </Link>

            {/* Easy Step */}
            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {habit.easy_step}
            </p>

            {/* Rewards Preview */}
            <div className="flex items-center gap-4 text-sm mb-4">
                <span className="flex items-center gap-1 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    +{rewardXP} XP
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-4 h-4" />
                    +{rewardGold}
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
