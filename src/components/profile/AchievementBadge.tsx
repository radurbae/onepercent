'use client';

import { Lock } from 'lucide-react';
import type { Achievement } from '@/lib/utils/profileStats';

interface AchievementBadgeProps {
    achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
    return (
        <div
            className={`p-3 rounded-lg text-center transition-all ${achievement.earned
                    ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30'
                    : 'opacity-50'
                }`}
            style={{
                background: achievement.earned ? undefined : 'var(--background-secondary)',
            }}
        >
            <div className="text-2xl mb-1 relative">
                {achievement.earned ? (
                    achievement.icon
                ) : (
                    <div className="relative">
                        <span className="opacity-30">{achievement.icon}</span>
                        <Lock className="w-4 h-4 absolute -bottom-1 -right-1 text-zinc-500" />
                    </div>
                )}
            </div>
            <p
                className="text-xs font-medium truncate"
                style={{ color: achievement.earned ? 'var(--foreground)' : 'var(--foreground-muted)' }}
            >
                {achievement.title}
            </p>
        </div>
    );
}

interface AchievementsRowProps {
    achievements: Achievement[];
}

export function AchievementsRow({ achievements }: AchievementsRowProps) {
    return (
        <div className="card p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <span>🏅</span> Achievements
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
            </div>
        </div>
    );
}
