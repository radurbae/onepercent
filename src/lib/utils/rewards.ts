import type { Rank, LootRarity } from '../types';

// =====================================================
// XP & GOLD CONSTANTS
// =====================================================

export const REWARDS = {
    BASE_XP: 10,
    BASE_GOLD: 5,
    FAST_COMPLETION_XP: 5,
    DAILY_CLEAR_XP: 5,
    DAILY_CLEAR_GOLD: 20,
    STREAK_XP_CAP: 10,
    DUNGEON_XP_MULTIPLIER: 2,
    LOOT_DROP_CHANCE: 0.10, // 10%
};

// =====================================================
// LEVEL CALCULATIONS
// =====================================================

/**
 * Calculate XP required to reach a given level
 * Formula: 50 + level * 25
 */
export function xpRequiredForLevel(level: number): number {
    return 50 + level * 25;
}

/**
 * Calculate total XP needed from level 1 to target level
 */
export function totalXpForLevel(level: number): number {
    let total = 0;
    for (let l = 1; l < level; l++) {
        total += xpRequiredForLevel(l);
    }
    return total;
}

/**
 * Calculate level from total XP
 */
export function levelFromXp(totalXp: number): number {
    let level = 1;
    let xpRemaining = totalXp;

    while (xpRemaining >= xpRequiredForLevel(level)) {
        xpRemaining -= xpRequiredForLevel(level);
        level++;
    }

    return level;
}

/**
 * Calculate XP progress within current level (0-100%)
 */
export function xpProgressPercent(totalXp: number, currentLevel: number): number {
    const xpForCurrentLevel = totalXpForLevel(currentLevel);
    const xpIntoLevel = totalXp - xpForCurrentLevel;
    const xpNeeded = xpRequiredForLevel(currentLevel);
    return Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));
}

// =====================================================
// REWARD CALCULATIONS
// =====================================================

export interface RewardCalculation {
    xp: number;
    gold: number;
    breakdown: {
        base: number;
        streak: number;
        fastCompletion: number;
        dailyClear: number;
        dungeon: number;
    };
}

/**
 * Calculate rewards for completing a habit
 */
export function calculateRewards(options: {
    streak: number;
    isFastCompletion?: boolean;
    isDailyCleared?: boolean;
    isDungeonRun?: boolean;
}): RewardCalculation {
    const { streak, isFastCompletion = false, isDailyCleared = false, isDungeonRun = false } = options;

    let xp = REWARDS.BASE_XP;
    let gold = REWARDS.BASE_GOLD;

    const streakBonus = Math.min(streak, REWARDS.STREAK_XP_CAP);
    xp += streakBonus;

    const fastBonus = isFastCompletion ? REWARDS.FAST_COMPLETION_XP : 0;
    xp += fastBonus;

    const dailyClearXp = isDailyCleared ? REWARDS.DAILY_CLEAR_XP : 0;
    const dailyClearGold = isDailyCleared ? REWARDS.DAILY_CLEAR_GOLD : 0;
    xp += dailyClearXp;
    gold += dailyClearGold;

    // Dungeon multiplier applies to base + streak only
    const dungeonBonus = isDungeonRun ? (REWARDS.BASE_XP + streakBonus) : 0;
    xp += dungeonBonus;

    return {
        xp,
        gold,
        breakdown: {
            base: REWARDS.BASE_XP,
            streak: streakBonus,
            fastCompletion: fastBonus,
            dailyClear: dailyClearXp,
            dungeon: dungeonBonus,
        },
    };
}

// =====================================================
// RANK CALCULATIONS
// =====================================================

const RANK_THRESHOLDS: { rank: Rank; minLevel: number; minRate: number }[] = [
    { rank: 'SS', minLevel: 50, minRate: 90 },
    { rank: 'S', minLevel: 35, minRate: 85 },
    { rank: 'A', minLevel: 20, minRate: 80 },
    { rank: 'B', minLevel: 10, minRate: 70 },
    { rank: 'C', minLevel: 5, minRate: 60 },
    { rank: 'D', minLevel: 3, minRate: 50 },
    { rank: 'E', minLevel: 1, minRate: 0 },
];

/**
 * Calculate rank based on level and 7-day completion rate
 */
export function calculateRank(level: number, weeklyCompletionRate: number): Rank {
    for (const threshold of RANK_THRESHOLDS) {
        if (level >= threshold.minLevel && weeklyCompletionRate >= threshold.minRate) {
            return threshold.rank;
        }
    }
    return 'E';
}

/**
 * Get rank display info
 */
export function getRankInfo(rank: Rank): { color: string; glow: string; label: string } {
    const rankInfo: Record<Rank, { color: string; glow: string; label: string }> = {
        'E': { color: '#6b7280', glow: 'none', label: 'E-Rank' },
        'D': { color: '#10b981', glow: '0 0 10px #10b981', label: 'D-Rank' },
        'C': { color: '#3b82f6', glow: '0 0 10px #3b82f6', label: 'C-Rank' },
        'B': { color: '#8b5cf6', glow: '0 0 15px #8b5cf6', label: 'B-Rank' },
        'A': { color: '#f59e0b', glow: '0 0 15px #f59e0b', label: 'A-Rank' },
        'S': { color: '#ef4444', glow: '0 0 20px #ef4444', label: 'S-Rank' },
        'SS': { color: '#ec4899', glow: '0 0 25px #ec4899', label: 'SS-Rank' },
    };
    return rankInfo[rank];
}

// =====================================================
// LOOT SYSTEM
// =====================================================

const TITLES = [
    { name: 'The Persistent', rarity: 'common' as LootRarity },
    { name: 'Never Miss Twice', rarity: 'rare' as LootRarity },
    { name: '2-Min Starter', rarity: 'common' as LootRarity },
    { name: 'Streak Keeper', rarity: 'rare' as LootRarity },
    { name: 'Daily Warrior', rarity: 'common' as LootRarity },
    { name: 'Quest Master', rarity: 'epic' as LootRarity },
    { name: 'Dungeon Conqueror', rarity: 'epic' as LootRarity },
    { name: 'The Awakened', rarity: 'legendary' as LootRarity },
];

const BADGES = [
    { name: 'Bronze Shield', rarity: 'common' as LootRarity },
    { name: 'Silver Sword', rarity: 'rare' as LootRarity },
    { name: 'Gold Crown', rarity: 'epic' as LootRarity },
    { name: 'Diamond Star', rarity: 'legendary' as LootRarity },
];

/**
 * Roll for loot drop
 */
export function rollForLoot(existingLoot: string[]): { type: 'title' | 'badge'; name: string; rarity: LootRarity } | null {
    if (Math.random() > REWARDS.LOOT_DROP_CHANCE) {
        return null;
    }

    // Combine available loot
    const allLoot = [
        ...TITLES.map(t => ({ ...t, type: 'title' as const })),
        ...BADGES.map(b => ({ ...b, type: 'badge' as const })),
    ];

    // Filter out already owned
    const available = allLoot.filter(l => !existingLoot.includes(`${l.type}:${l.name}`));

    if (available.length === 0) {
        return null;
    }

    // Weight by rarity (common more likely)
    const weighted: typeof available = [];
    for (const item of available) {
        const weight = item.rarity === 'common' ? 4 : item.rarity === 'rare' ? 2 : item.rarity === 'epic' ? 1 : 0.5;
        for (let i = 0; i < weight * 2; i++) {
            weighted.push(item);
        }
    }

    const selected = weighted[Math.floor(Math.random() * weighted.length)];
    return selected;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: LootRarity): string {
    const colors: Record<LootRarity, string> = {
        common: '#9ca3af',
        rare: '#3b82f6',
        epic: '#8b5cf6',
        legendary: '#f59e0b',
    };
    return colors[rarity];
}

// =====================================================
// PLAYER STATS (Derived)
// =====================================================

export interface DerivedStats {
    strength: number;
    agility: number;
    endurance: number;
    intelligence: number;
}

/**
 * Calculate derived player stats from habit data
 */
export function calculatePlayerStats(data: {
    completedLast30Days: number;
    scheduledLast30Days: number;
    fastCompletions: number;
    totalCompletions: number;
    avgStreak: number;
    maxStreak: number;
    thisWeekRate: number;
    lastWeekRate: number;
}): DerivedStats {
    // Strength = consistency (completion rate over 30 days)
    const strength = data.scheduledLast30Days > 0
        ? Math.round((data.completedLast30Days / data.scheduledLast30Days) * 100)
        : 0;

    // Agility = fast completions ratio
    const agility = data.totalCompletions > 0
        ? Math.round((data.fastCompletions / data.totalCompletions) * 100)
        : 0;

    // Endurance = streak stability (avg/max, capped at 100)
    const endurance = data.maxStreak > 0
        ? Math.min(100, Math.round((data.avgStreak / data.maxStreak) * 100))
        : 0;

    // Intelligence = improvement rate (centered at 50)
    const intelligence = Math.min(100, Math.max(0,
        Math.round(data.thisWeekRate - data.lastWeekRate + 50)
    ));

    return { strength, agility, endurance, intelligence };
}

/**
 * Get stat icon name (lucide-react)
 */
export function getStatIcon(stat: keyof DerivedStats): string {
    const icons: Record<keyof DerivedStats, string> = {
        strength: 'Dumbbell',
        agility: 'Zap',
        endurance: 'Shield',
        intelligence: 'Brain',
    };
    return icons[stat];
}
