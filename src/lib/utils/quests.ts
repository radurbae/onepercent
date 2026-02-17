import { createClient } from '@/lib/supabase/client';
import type { DailyQuest, QuestCategory, QuestPoolItem } from '@/lib/types';
import { formatDate } from './dates';

const QUESTS_PER_DAY = 5;
const QUEST_LOOKBACK_DAYS = 14;
const CATEGORY_BUCKETS_FOR_STATS: QuestCategory[][] = [
    ['productivity'],
    ['learning'],
    ['social'],
    ['creativity'],
    ['wellness', 'fitness'],
];

type CategoryProgress = Record<QuestCategory, { total: number; completed: number }>;

const PUNISHMENT_MESSAGES = [
    "Yesterday's unfinished quests cost you. Remember: small daily wins compound into massive results.",
    "You left quests incomplete yesterday. The pain of discipline is lighter than the pain of regret.",
    "Missed quests = missed growth. Every uncompleted task is a vote against who you want to become.",
    "Yesterday you chose comfort over growth. Today, choose differently.",
    "Incomplete quests yesterday? Your future self was counting on you. Make it up today.",
];

function createEmptyCategoryProgress(): CategoryProgress {
    return {
        wellness: { total: 0, completed: 0 },
        productivity: { total: 0, completed: 0 },
        social: { total: 0, completed: 0 },
        learning: { total: 0, completed: 0 },
        fitness: { total: 0, completed: 0 },
        creativity: { total: 0, completed: 0 },
    };
}

function shuffleArray<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
}

function getQuestCategory(questRelation: unknown): QuestCategory | null {
    if (!questRelation) return null;
    if (Array.isArray(questRelation)) {
        const first = questRelation[0] as { category?: QuestCategory } | undefined;
        return first?.category ?? null;
    }
    const single = questRelation as { category?: QuestCategory };
    return single.category ?? null;
}

function getCategoryCompletionRate(progress: CategoryProgress, category: QuestCategory): number {
    const { total, completed } = progress[category];
    if (total === 0) return 0;
    return completed / total;
}

function pickPriorityCategory(
    categories: QuestCategory[],
    progress: CategoryProgress
): QuestCategory | null {
    if (categories.length === 0) return null;

    const ranked = shuffleArray(categories).sort((a, b) => {
        const aTotal = progress[a].total;
        const bTotal = progress[b].total;
        if (aTotal !== bTotal) return aTotal - bTotal;

        const aRate = getCategoryCompletionRate(progress, a);
        const bRate = getCategoryCompletionRate(progress, b);
        return aRate - bRate;
    });

    return ranked[0] ?? null;
}

function hasStatCoverageForToday(quests: Array<{ quest?: unknown }>): boolean {
    const foundCategories = new Set<QuestCategory>();

    for (const quest of quests) {
        const category = getQuestCategory(quest.quest);
        if (category) {
            foundCategories.add(category);
        }
    }

    return CATEGORY_BUCKETS_FOR_STATS.every((bucket) =>
        bucket.some((category) => foundCategories.has(category))
    );
}

export interface YesterdayEvaluation {
    missedQuests: number;
    completedQuests: number;
    totalQuests: number;
    xpPenalty: number;
    goldPenalty: number;
    message: string | null;
}

export async function evaluateYesterday(): Promise<YesterdayEvaluation> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { missedQuests: 0, completedQuests: 0, totalQuests: 0, xpPenalty: 0, goldPenalty: 0, message: null };
    }

    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const { data: yesterdayQuests } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(*)`)
        .eq('user_id', user.id)
        .eq('date', yesterday);

    if (!yesterdayQuests || yesterdayQuests.length === 0) {
        return { missedQuests: 0, completedQuests: 0, totalQuests: 0, xpPenalty: 0, goldPenalty: 0, message: null };
    }

    const completedQuests = yesterdayQuests.filter(q => q.completed).length;
    const missedQuests = yesterdayQuests.length - completedQuests;

    if (missedQuests === 0) {
        return { missedQuests: 0, completedQuests, totalQuests: yesterdayQuests.length, xpPenalty: 0, goldPenalty: 0, message: null };
    }

    const xpPenalty = missedQuests * 5;
    const goldPenalty = missedQuests * 3;

    const { data: profile } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (profile) {
        const newXp = Math.max(0, profile.xp - xpPenalty);
        const newGold = Math.max(0, profile.gold - goldPenalty);

        await supabase
            .from('player_profile')
            .update({ xp: newXp, gold: newGold })
            .eq('user_id', user.id);

        await supabase.from('reward_ledger').insert({
            user_id: user.id,
            habit_id: null,
            date: formatDate(new Date()),
            xp_delta: -xpPenalty,
            gold_delta: -goldPenalty,
            reason: 'missed_quests_penalty',
        });
    }

    const message = PUNISHMENT_MESSAGES[Math.floor(Math.random() * PUNISHMENT_MESSAGES.length)];

    return {
        missedQuests,
        completedQuests,
        totalQuests: yesterdayQuests.length,
        xpPenalty,
        goldPenalty,
        message,
    };
}

export async function getDailyQuests(): Promise<{ quests: DailyQuest[]; evaluation: YesterdayEvaluation | null }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { quests: [], evaluation: null };

    const today = formatDate(new Date());

    const { data: existingQuests } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(*)`)
        .eq('user_id', user.id)
        .eq('date', today);

    if (existingQuests && existingQuests.length > 0) {
        const hasCoverage = hasStatCoverageForToday(existingQuests);
        if (hasCoverage) {
            return { quests: existingQuests, evaluation: null };
        }

        const hasCompletedQuest = existingQuests.some((quest) => quest.completed);
        if (hasCompletedQuest) {
            return { quests: existingQuests, evaluation: null };
        }

        await supabase
            .from('daily_quests')
            .delete()
            .eq('user_id', user.id)
            .eq('date', today);

        const rebalancedQuests = await generateDailyQuests(user.id, today);
        return { quests: rebalancedQuests, evaluation: null };
    }

    const evaluation = await evaluateYesterday();

    const quests = await generateDailyQuests(user.id, today);

    return { quests, evaluation };
}

async function generateDailyQuests(userId: string, date: string): Promise<DailyQuest[]> {
    const supabase = createClient();

    const { data: questPoolData } = await supabase
        .from('quest_pool')
        .select('*')
        .eq('is_active', true);

    const questPool = (questPoolData ?? []) as QuestPoolItem[];

    if (!questPool || questPool.length === 0) return [];

    const lookbackStart = formatDate(new Date(Date.now() - QUEST_LOOKBACK_DAYS * 24 * 60 * 60 * 1000));
    const { data: recentDailyQuests } = await supabase
        .from('daily_quests')
        .select('completed, quest:quest_pool(category)')
        .eq('user_id', userId)
        .gte('date', lookbackStart);

    const categoryProgress = createEmptyCategoryProgress();
    for (const quest of recentDailyQuests ?? []) {
        const category = getQuestCategory(quest.quest);
        if (!category) continue;
        categoryProgress[category].total += 1;
        if (quest.completed) {
            categoryProgress[category].completed += 1;
        }
    }

    const questsByCategory: Record<QuestCategory, QuestPoolItem[]> = {
        wellness: [],
        productivity: [],
        social: [],
        learning: [],
        fitness: [],
        creativity: [],
    };

    for (const quest of shuffleArray(questPool)) {
        questsByCategory[quest.category].push(quest);
    }

    const selectedQuests: QuestPoolItem[] = [];
    const selectedQuestIds = new Set<string>();
    const selectedCategories = new Set<QuestCategory>();

    const addQuestFromCategories = (categories: QuestCategory[]) => {
        if (selectedQuests.length >= QUESTS_PER_DAY) return;

        const availableCategories = categories.filter((cat) =>
            questsByCategory[cat].some((quest) => !selectedQuestIds.has(quest.id))
        );
        const chosenCategory = pickPriorityCategory(availableCategories, categoryProgress);
        if (!chosenCategory) return;

        const candidates = questsByCategory[chosenCategory].filter(
            (quest) => !selectedQuestIds.has(quest.id)
        );
        if (candidates.length === 0) return;

        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        selectedQuests.push(picked);
        selectedQuestIds.add(picked.id);
        selectedCategories.add(chosenCategory);
    };

    // Isi slot utama supaya tiap dimensi stat tetap punya quest harian.
    for (const bucket of CATEGORY_BUCKETS_FOR_STATS) {
        addQuestFromCategories(bucket);
    }

    if (selectedQuests.length < QUESTS_PER_DAY) {
        const remainingQuests = shuffleArray(questPool)
            .filter((quest) => !selectedQuestIds.has(quest.id))
            .sort((a, b) => {
                const aAlreadyPicked = selectedCategories.has(a.category) ? 1 : 0;
                const bAlreadyPicked = selectedCategories.has(b.category) ? 1 : 0;
                if (aAlreadyPicked !== bAlreadyPicked) return aAlreadyPicked - bAlreadyPicked;

                const aTotal = categoryProgress[a.category].total;
                const bTotal = categoryProgress[b.category].total;
                if (aTotal !== bTotal) return aTotal - bTotal;

                const aRate = getCategoryCompletionRate(categoryProgress, a.category);
                const bRate = getCategoryCompletionRate(categoryProgress, b.category);
                return aRate - bRate;
            });

        for (const quest of remainingQuests) {
            if (selectedQuests.length >= QUESTS_PER_DAY) break;
            selectedQuests.push(quest);
            selectedQuestIds.add(quest.id);
            selectedCategories.add(quest.category);
        }
    }

    const questsToInsert = selectedQuests.map(quest => ({
        user_id: userId,
        quest_id: quest.id,
        date,
    }));

    const { data: insertedQuests, error } = await supabase
        .from('daily_quests')
        .insert(questsToInsert)
        .select(`*, quest:quest_pool(*)`);

    if (error) {
        console.error('Error generating daily quests:', error);
        return [];
    }

    return insertedQuests || [];
}

export async function completeDailyQuest(questId: string): Promise<{ xp: number; gold: number } | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: dailyQuest } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(*)`)
        .eq('id', questId)
        .eq('user_id', user.id)
        .single();

    if (!dailyQuest || dailyQuest.completed) return null;

    const quest = dailyQuest.quest;
    if (!quest) return null;

    await supabase
        .from('daily_quests')
        .update({
            completed: true,
            completed_at: new Date().toISOString()
        })
        .eq('id', questId);

    const { data: profile } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (profile) {
        const newXp = profile.xp + quest.xp_reward;
        const newGold = profile.gold + quest.gold_reward;

        let level = profile.level;
        let xpForNext = 50 + level * 25;
        while (newXp >= xpForNext) {
            level++;
            xpForNext = 50 + level * 25;
        }

        await supabase
            .from('player_profile')
            .update({ xp: newXp, gold: newGold, level })
            .eq('user_id', user.id);

        await supabase.from('reward_ledger').insert({
            user_id: user.id,
            habit_id: questId,
            date: formatDate(new Date()),
            xp_delta: quest.xp_reward,
            gold_delta: quest.gold_reward,
            reason: 'random_quest',
        });
    }

    return { xp: quest.xp_reward, gold: quest.gold_reward };
}

export async function canRefreshToday(): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const today = formatDate(new Date());

    const { data: tracker } = await supabase
        .from('quest_refresh_tracker')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

    return !tracker?.refreshed;
}

export async function refreshDailyQuests(): Promise<{ quests: DailyQuest[]; alreadyRefreshed: boolean }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { quests: [], alreadyRefreshed: false };

    const today = formatDate(new Date());

    const { data: tracker } = await supabase
        .from('quest_refresh_tracker')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

    if (tracker?.refreshed) {
        const { data: existingQuests } = await supabase
            .from('daily_quests')
            .select(`*, quest:quest_pool(*)`)
            .eq('user_id', user.id)
            .eq('date', today);

        return { quests: existingQuests || [], alreadyRefreshed: true };
    }

    await supabase
        .from('daily_quests')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today);

    await supabase
        .from('quest_refresh_tracker')
        .upsert({
            user_id: user.id,
            date: today,
            refreshed: true,
            refreshed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });

    const quests = await generateDailyQuests(user.id, today);

    return { quests, alreadyRefreshed: false };
}
