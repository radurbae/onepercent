import { createClient } from '@/lib/supabase/client';
import { formatDate } from './dates';
import type { QuestCategory } from '@/lib/types';

// Stat with trend information
export interface StatWithTrend {
    value: number;
    trend: number; // positive = improving, negative = declining
    hint: string;
}

// All profile stats
export interface ProfileStats {
    consistency: StatWithTrend;
    focus: StatWithTrend;
    learning: StatWithTrend;
    health: StatWithTrend;
    environment: StatWithTrend;
    social: StatWithTrend;
}

// Achievement definition
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
}

// Today's summary
export interface TodaySummary {
    questsCompleted: number;
    questsTotal: number;
    habitsCompleted: number;
    habitsTotal: number;
}

// Streak info
export interface StreakInfo {
    currentQuestStreak: number;
    currentHabitStreak: number;
    bestQuestStreak: number;
    weakestCategory: QuestCategory | null;
}

const CATEGORY_HINTS: Record<QuestCategory, string> = {
    wellness: 'Take care of yourself',
    productivity: 'Get things done',
    social: 'Connect with others',
    learning: 'Grow your mind',
    fitness: 'Build your body',
    creativity: 'Express yourself',
};

/**
 * Calculate category-based stats from daily_quests data
 */
export async function calculateProfileStats(): Promise<ProfileStats> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return getEmptyStats();
    }

    const today = new Date();
    const sevenDaysAgo = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    const fourteenDaysAgo = formatDate(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000));

    // Get quests for last 14 days
    const { data: quests } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(category)`)
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo);

    // Get habits/checkins for consistency
    const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo);

    // Split into this week and last week
    const thisWeekQuests = quests?.filter(q => q.date >= sevenDaysAgo) || [];
    const lastWeekQuests = quests?.filter(q => q.date < sevenDaysAgo) || [];
    const thisWeekCheckins = checkins?.filter(c => c.date >= sevenDaysAgo) || [];
    const lastWeekCheckins = checkins?.filter(c => c.date < sevenDaysAgo) || [];

    // Calculate consistency (overall completion rate)
    const thisWeekTotal = thisWeekQuests.length + thisWeekCheckins.length;
    const thisWeekCompleted = thisWeekQuests.filter(q => q.completed).length +
        thisWeekCheckins.filter(c => c.status === 'done').length;
    const lastWeekTotal = lastWeekQuests.length + lastWeekCheckins.length;
    const lastWeekCompleted = lastWeekQuests.filter(q => q.completed).length +
        lastWeekCheckins.filter(c => c.status === 'done').length;

    const consistencyValue = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;
    const lastWeekConsistency = lastWeekTotal > 0 ? Math.round((lastWeekCompleted / lastWeekTotal) * 100) : 0;

    // Calculate category stats
    const categoryStats = calculateCategoryStats(thisWeekQuests, lastWeekQuests);

    return {
        consistency: {
            value: consistencyValue,
            trend: consistencyValue - lastWeekConsistency,
            hint: consistencyValue >= 80 ? 'You\'re on fire!' : 'Keep pushing!',
        },
        focus: categoryStats.productivity,
        learning: categoryStats.learning,
        health: {
            value: Math.round((categoryStats.wellness.value + categoryStats.fitness.value) / 2),
            trend: Math.round((categoryStats.wellness.trend + categoryStats.fitness.trend) / 2),
            hint: CATEGORY_HINTS.wellness,
        },
        environment: categoryStats.creativity,
        social: categoryStats.social,
    };
}

function calculateCategoryStats(
    thisWeek: Array<{ completed: boolean; quest: { category: string } | null }>,
    lastWeek: Array<{ completed: boolean; quest: { category: string } | null }>
): Record<QuestCategory, StatWithTrend> {
    const categories: QuestCategory[] = ['wellness', 'productivity', 'social', 'learning', 'fitness', 'creativity'];
    const result: Record<string, StatWithTrend> = {};

    for (const cat of categories) {
        const thisWeekCat = thisWeek.filter(q => q.quest?.category === cat);
        const lastWeekCat = lastWeek.filter(q => q.quest?.category === cat);

        const thisWeekRate = thisWeekCat.length > 0
            ? Math.round((thisWeekCat.filter(q => q.completed).length / thisWeekCat.length) * 100)
            : 0;
        const lastWeekRate = lastWeekCat.length > 0
            ? Math.round((lastWeekCat.filter(q => q.completed).length / lastWeekCat.length) * 100)
            : 0;

        result[cat] = {
            value: thisWeekRate,
            trend: thisWeekRate - lastWeekRate,
            hint: CATEGORY_HINTS[cat],
        };
    }

    return result as Record<QuestCategory, StatWithTrend>;
}

/**
 * Get today's completion summary
 */
export async function getTodaySummary(): Promise<TodaySummary> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { questsCompleted: 0, questsTotal: 0, habitsCompleted: 0, habitsTotal: 0 };
    }

    const today = formatDate(new Date());

    const [{ data: quests }, { data: checkins }] = await Promise.all([
        supabase.from('daily_quests').select('completed').eq('user_id', user.id).eq('date', today),
        supabase.from('checkins').select('status').eq('user_id', user.id).eq('date', today),
    ]);

    return {
        questsCompleted: quests?.filter(q => q.completed).length || 0,
        questsTotal: quests?.length || 0,
        habitsCompleted: checkins?.filter(c => c.status === 'done').length || 0,
        habitsTotal: checkins?.length || 0,
    };
}

/**
 * Calculate streak information
 */
export async function getStreakInfo(): Promise<StreakInfo> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { currentQuestStreak: 0, currentHabitStreak: 0, bestQuestStreak: 0, weakestCategory: null };
    }

    const thirtyDaysAgo = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    // Get daily summaries to calculate streaks
    const { data: summaries } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: false });

    // Calculate current streak (consecutive days with cleared = true)
    let currentQuestStreak = 0;
    let bestQuestStreak = 0;
    let tempStreak = 0;

    for (const summary of summaries || []) {
        if (summary.cleared) {
            tempStreak++;
            if (tempStreak > bestQuestStreak) bestQuestStreak = tempStreak;
        } else {
            if (currentQuestStreak === 0) currentQuestStreak = tempStreak;
            tempStreak = 0;
        }
    }
    if (currentQuestStreak === 0) currentQuestStreak = tempStreak;

    // Find weakest category from recent quests
    const { data: quests } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(category)`)
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo);

    const categoryRates: Record<string, { completed: number; total: number }> = {};
    for (const q of quests || []) {
        const cat = q.quest?.category;
        if (!cat) continue;
        if (!categoryRates[cat]) categoryRates[cat] = { completed: 0, total: 0 };
        categoryRates[cat].total++;
        if (q.completed) categoryRates[cat].completed++;
    }

    let weakestCategory: QuestCategory | null = null;
    let lowestRate = 101;
    for (const [cat, data] of Object.entries(categoryRates)) {
        const rate = data.total > 0 ? (data.completed / data.total) * 100 : 100;
        if (rate < lowestRate) {
            lowestRate = rate;
            weakestCategory = cat as QuestCategory;
        }
    }

    return {
        currentQuestStreak,
        currentHabitStreak: currentQuestStreak, // Simplified: use same streak
        bestQuestStreak,
        weakestCategory,
    };
}

/**
 * Compute achievements from existing data
 */
export async function getAchievements(): Promise<Achievement[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return getDefaultAchievements(false, false, false);
    }

    // Check for first quest completed
    const { count: questCount } = await supabase
        .from('daily_quests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

    // Check for 7-day streak
    const { data: summaries } = await supabase
        .from('daily_summary')
        .select('cleared')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

    const has7DayStreak = summaries?.length === 7 && summaries.every(s => s.cleared);

    // Check for daily clear (any day)
    const { count: clearCount } = await supabase
        .from('daily_summary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('cleared', true);

    return getDefaultAchievements(
        (questCount || 0) > 0,
        has7DayStreak,
        (clearCount || 0) > 0
    );
}

function getDefaultAchievements(firstQuest: boolean, sevenDayStreak: boolean, dailyClear: boolean): Achievement[] {
    return [
        {
            id: 'first_quest',
            title: 'First Quest',
            description: 'Complete your first random quest',
            icon: '⚔️',
            earned: firstQuest,
        },
        {
            id: 'seven_day_streak',
            title: '7-Day Streak',
            description: 'Clear all quests for 7 days straight',
            icon: '🔥',
            earned: sevenDayStreak,
        },
        {
            id: 'daily_clear',
            title: 'Daily Clear',
            description: 'Complete all quests in a single day',
            icon: '🏆',
            earned: dailyClear,
        },
    ];
}

function getEmptyStats(): ProfileStats {
    const empty: StatWithTrend = { value: 0, trend: 0, hint: 'Start completing quests!' };
    return {
        consistency: empty,
        focus: { ...empty, hint: CATEGORY_HINTS.productivity },
        learning: { ...empty, hint: CATEGORY_HINTS.learning },
        health: { ...empty, hint: CATEGORY_HINTS.wellness },
        environment: { ...empty, hint: CATEGORY_HINTS.creativity },
        social: { ...empty, hint: CATEGORY_HINTS.social },
    };
}
