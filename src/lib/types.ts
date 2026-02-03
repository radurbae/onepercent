export interface Habit {
  id: string;
  user_id: string;
  title: string;
  identity: string;
  obvious_cue: string | null;
  attractive_bundle: string | null;
  easy_step: string;
  satisfying_reward: string | null;
  schedule: 'daily' | 'weekdays';
  created_at: string;
  // Quest extensions
  quest_type?: 'main' | 'side';
  difficulty?: 'easy' | 'normal' | 'hard';
}

export interface Checkin {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  status: 'done' | 'skipped';
  created_at: string;
}

export interface HabitWithCheckin extends Habit {
  todayCheckin: Checkin | null;
  yesterdayCheckin: Checkin | null;
  streak: number;
}

export interface HabitFormData {
  title: string;
  identity: string;
  obvious_cue: string;
  attractive_bundle: string;
  easy_step: string;
  satisfying_reward: string;
  schedule: 'daily' | 'weekdays';
}

export type CheckinStatus = 'done' | 'skipped' | null;

export interface TrackerDay {
  date: Date;
  status: CheckinStatus;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface HabitTemplate {
  title: string;
  identity: string;
  obvious_cue: string;
  attractive_bundle: string;
  easy_step: string;
  satisfying_reward: string;
  schedule: 'daily' | 'weekdays';
}

// =====================================================
// GAMIFICATION TYPES
// =====================================================

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
export type LootType = 'title' | 'badge' | 'theme' | 'frame';
export type LootRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PlayerProfile {
  user_id: string;
  level: number;
  xp: number;
  gold: number;
  rank: Rank;
  equipped_title: string | null;
  equipped_badge: string | null;
  equipped_theme: string | null;
  created_at: string;
}

export interface Loot {
  id: string;
  user_id: string;
  type: LootType;
  name: string;
  rarity: LootRarity;
  unlocked_at: string;
}

export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  completed_count: number;
  scheduled_count: number;
  cleared: boolean;
}

export interface RewardLedger {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  xp_delta: number;
  gold_delta: number;
  reason: string;
  created_at: string;
}

export interface PlayerStats {
  strength: number;    // Consistency (completion rate)
  agility: number;     // Fast completions (2-min starts)
  endurance: number;   // Streak stability
  intelligence: number; // Improvement rate
}

export interface RewardResult {
  xp: number;
  gold: number;
  levelUp: boolean;
  newLevel: number;
  lootDrop: Loot | null;
  dailyCleared: boolean;
}

// Rank thresholds
export const RANK_THRESHOLDS: Record<Rank, { minLevel: number; minRate: number }> = {
  'E': { minLevel: 1, minRate: 0 },
  'D': { minLevel: 3, minRate: 50 },
  'C': { minLevel: 5, minRate: 60 },
  'B': { minLevel: 10, minRate: 70 },
  'A': { minLevel: 20, minRate: 80 },
  'S': { minLevel: 35, minRate: 85 },
  'SS': { minLevel: 50, minRate: 90 },
};

export const RANKS_ORDERED: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];

// Loot definitions
export const AVAILABLE_TITLES = [
  { name: 'The Persistent', rarity: 'common' as LootRarity },
  { name: 'Never Miss Twice', rarity: 'rare' as LootRarity },
  { name: '2-Min Starter', rarity: 'common' as LootRarity },
  { name: 'Streak Keeper', rarity: 'rare' as LootRarity },
  { name: 'Daily Warrior', rarity: 'common' as LootRarity },
  { name: 'Quest Master', rarity: 'epic' as LootRarity },
  { name: 'Dungeon Conqueror', rarity: 'epic' as LootRarity },
  { name: 'The Awakened', rarity: 'legendary' as LootRarity },
];

export const AVAILABLE_BADGES = [
  { name: 'Bronze Shield', rarity: 'common' as LootRarity },
  { name: 'Silver Sword', rarity: 'rare' as LootRarity },
  { name: 'Golden Crown', rarity: 'epic' as LootRarity },
  { name: 'Diamond Star', rarity: 'legendary' as LootRarity },
];

export const AVAILABLE_THEMES = [
  { name: 'default', rarity: 'common' as LootRarity },
  { name: 'midnight', rarity: 'rare' as LootRarity },
  { name: 'crimson', rarity: 'epic' as LootRarity },
  { name: 'aurora', rarity: 'legendary' as LootRarity },
];

