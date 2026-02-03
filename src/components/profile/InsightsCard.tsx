'use client';

import { Flame, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';
import type { StreakInfo } from '@/lib/utils/profileStats';
import { QUEST_CATEGORY_ICONS } from '@/lib/types';

interface InsightsCardProps {
    streakInfo: StreakInfo;
    onRerollSuggestion?: () => void;
}

export default function InsightsCard({ streakInfo, onRerollSuggestion }: InsightsCardProps) {
    const weakestIcon = streakInfo.weakestCategory
        ? QUEST_CATEGORY_ICONS[streakInfo.weakestCategory]
        : '📋';

    return (
        <div className="card p-5 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <span>💡</span> Insights
            </h3>

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                            {streakInfo.currentQuestStreak}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Day streak</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                            {streakInfo.bestQuestStreak}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Best streak</p>
                    </div>
                </div>
            </div>

            {/* Weakest Category */}
            {streakInfo.weakestCategory && (
                <div
                    className="p-3 rounded-lg mb-3"
                    style={{ background: 'var(--background-secondary)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Needs attention
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        Your <span className="capitalize font-medium" style={{ color: 'var(--foreground)' }}>
                            {weakestIcon} {streakInfo.weakestCategory}
                        </span> quests could use more focus this week.
                    </p>
                </div>
            )}

            {/* Reroll CTA */}
            {streakInfo.weakestCategory && onRerollSuggestion && (
                <button
                    onClick={onRerollSuggestion}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                    }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Reroll for {streakInfo.weakestCategory} quest
                </button>
            )}
        </div>
    );
}
