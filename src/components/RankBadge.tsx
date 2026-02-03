'use client';

import type { Rank } from '@/lib/types';
import { getRankInfo } from '@/lib/utils/rewards';

interface RankBadgeProps {
    rank: Rank;
    size?: 'sm' | 'md' | 'lg';
}

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
    const info = getRankInfo(rank);

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <span
            className={`rank-badge rank-${rank.toLowerCase()} ${sizes[size]}`}
            style={{ color: info.color, boxShadow: info.glow }}
        >
            {rank}-Rank
        </span>
    );
}
