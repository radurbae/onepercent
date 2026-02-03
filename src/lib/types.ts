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

// Task type for To Do page
export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  date: string;
  created_at: string;
}

// Random Quest System
export type QuestCategory = 'wellness' | 'productivity' | 'social' | 'learning' | 'fitness' | 'creativity';
export type QuestDifficulty = 'easy' | 'normal' | 'hard';

export interface QuestPoolItem {
  id: string;
  title: string;
  description: string | null;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xp_reward: number;
  gold_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface DailyQuest {
  id: string;
  user_id: string;
  quest_id: string;
  date: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  // Joined from quest_pool
  quest?: QuestPoolItem;
}

export const QUEST_CATEGORY_ICONS: Record<QuestCategory, string> = {
  wellness: '💚',
  productivity: '⚡',
  social: '👥',
  learning: '📚',
  fitness: '💪',
  creativity: '🎨',
};

export const QUEST_CATEGORY_COLORS: Record<QuestCategory, string> = {
  wellness: '#22c55e',
  productivity: '#f59e0b',
  social: '#ec4899',
  learning: '#3b82f6',
  fitness: '#ef4444',
  creativity: '#a855f7',
};

// =====================================================
// ITEM & ACHIEVEMENT TYPES
// =====================================================

export type ItemType = 'title' | 'badge' | 'theme' | 'artifact';
export type EffectType = 'xp_boost' | 'gold_boost' | 'streak_buffer' | 'category_xp_boost' | 'skip_penalty_reduce';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: LootRarity;
  description: string | null;
  effect_type: EffectType | null;
  effect_value: number | null;
  effect_category: string | null;
  icon_key: string;
  unlock_condition: string | null;
  unlock_key: string | null;
  created_at: string;
}

export interface UserItem {
  id: string;
  user_id: string;
  item_id: string;
  equipped: boolean;
  unlocked_at: string;
  item?: Item; // Joined
}

export interface Achievement {
  id: string;
  user_id: string;
  key: string;
  unlocked_at: string;
}

export interface ItemEffect {
  type: EffectType;
  value: number;
  category?: string;
  source: string; // item name
}

export interface EquippedEffects {
  xpBoostPercent: number;      // Total XP boost percentage (capped at 20%)
  goldBoostPercent: number;    // Total gold boost percentage
  categoryBoosts: Record<string, number>; // Category-specific XP boosts
  skipPenaltyReduce: number;   // Skip penalty reduction percentage
  streakBuffer: number;        // Extra streak buffer days
}

// Achievement definitions with unlock conditions
export const ACHIEVEMENT_DEFINITIONS: Record<string, {
  name: string;
  check: (stats: AchievementStats) => boolean;
}> = {
  first_quest: { name: 'First Quest', check: (s) => s.totalQuests >= 1 },
  streak_7: { name: '7-Day Streak', check: (s) => s.currentStreak >= 7 },
  streak_14: { name: '14-Day Streak', check: (s) => s.currentStreak >= 14 },
  streak_30: { name: '30-Day Streak', check: (s) => s.currentStreak >= 30 },
  quests_30: { name: '30 Quests', check: (s) => s.totalQuests >= 30 },
  quests_50: { name: '50 Quests', check: (s) => s.totalQuests >= 50 },
  quests_100: { name: '100 Quests', check: (s) => s.totalQuests >= 100 },
  focus_15: { name: 'Focus 15', check: (s) => s.focusQuests >= 15 },
  focus_20: { name: 'Focus 20', check: (s) => s.focusQuests >= 20 },
  focus_30: { name: 'Focus 30', check: (s) => s.focusQuests >= 30 },
  learning_20: { name: 'Learning 20', check: (s) => s.learningQuests >= 20 },
  learning_30: { name: 'Learning 30', check: (s) => s.learningQuests >= 30 },
  learning_50: { name: 'Learning 50', check: (s) => s.learningQuests >= 50 },
  wellness_20: { name: 'Wellness 20', check: (s) => s.wellnessQuests >= 20 },
  comeback: { name: 'Comeback', check: (s) => s.comebackCount >= 1 },
  level_5: { name: 'Level 5', check: (s) => s.level >= 5 },
  rank_a: { name: 'Rank A', check: (s) => s.rank === 'A' || s.rank === 'S' || s.rank === 'SS' },
  morning_10: { name: 'Morning 10', check: (s) => s.morningCount >= 10 },
  night_10: { name: 'Night 10', check: (s) => s.nightCount >= 10 },
  perfect_week: { name: 'Perfect Week', check: (s) => s.perfectWeeks >= 1 },
  no_skip_30: { name: 'No Skip 30', check: (s) => s.daysWithoutSkip >= 30 },
};

export interface AchievementStats {
  totalQuests: number;
  currentStreak: number;
  focusQuests: number;
  learningQuests: number;
  wellnessQuests: number;
  comebackCount: number;
  level: number;
  rank: Rank;
  morningCount: number;
  nightCount: number;
  perfectWeeks: number;
  daysWithoutSkip: number;
}

