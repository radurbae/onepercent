import { createClient } from '@/lib/supabase/client';
import type { DailyQuest } from '@/lib/types';
import { formatDate } from './dates';

const QUESTS_PER_DAY = 5;

// Punishment messages for missed quests - educational and motivational
const PUNISHMENT_MESSAGES = [
    "Yesterday's unfinished quests cost you. Remember: small daily wins compound into massive results.",
    "You left quests incomplete yesterday. The pain of discipline is lighter than the pain of regret.",
    "Missed quests = missed growth. Every uncompleted task is a vote against who you want to become.",
    "Yesterday you chose comfort over growth. Today, choose differently.",
    "Incomplete quests yesterday? Your future self was counting on you. Make it up today.",
];

export interface YesterdayEvaluation {
    missedQuests: number;
    completedQuests: number;
    totalQuests: number;
    xpPenalty: number;
    goldPenalty: number;
    message: string | null;
}

/**
 * Evaluate yesterday's quests and apply penalties for incomplete ones.
 */
export async function evaluateYesterday(): Promise<YesterdayEvaluation> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { missedQuests: 0, completedQuests: 0, totalQuests: 0, xpPenalty: 0, goldPenalty: 0, message: null };
    }

    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    // Get yesterday's quests
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

    // Calculate penalty: -5 XP and -3 Gold per missed quest
    const xpPenalty = missedQuests * 5;
    const goldPenalty = missedQuests * 3;

    // Apply penalty to profile
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

        // Record penalty in ledger
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

/**
 * Get today's random quests for the current user.
 * If no quests exist for today, evaluate yesterday and generate new ones.
 */
export async function getDailyQuests(): Promise<{ quests: DailyQuest[]; evaluation: YesterdayEvaluation | null }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { quests: [], evaluation: null };

    const today = formatDate(new Date());

    // Check if user already has quests for today
    const { data: existingQuests } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(*)`)
        .eq('user_id', user.id)
        .eq('date', today);

    if (existingQuests && existingQuests.length > 0) {
        return { quests: existingQuests, evaluation: null };
    }

    // Evaluate yesterday before generating new quests
    const evaluation = await evaluateYesterday();

    // Generate new quests for today
    const quests = await generateDailyQuests(user.id, today);

    return { quests, evaluation };
}

/**
 * Generate random quests for a user for a specific date.
 */
async function generateDailyQuests(userId: string, date: string): Promise<DailyQuest[]> {
    const supabase = createClient();

    // Get all active quests from the pool
    const { data: questPool } = await supabase
        .from('quest_pool')
        .select('*')
        .eq('is_active', true);

    if (!questPool || questPool.length === 0) return [];

    // Shuffle and pick random quests (max 5)
    const shuffled = [...questPool].sort(() => Math.random() - 0.5);
    const selectedQuests = shuffled.slice(0, QUESTS_PER_DAY);

    // Insert daily quests
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

/**
 * Complete a daily quest and award rewards.
 */
export async function completeDailyQuest(questId: string): Promise<{ xp: number; gold: number } | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Get the quest details
    const { data: dailyQuest } = await supabase
        .from('daily_quests')
        .select(`*, quest:quest_pool(*)`)
        .eq('id', questId)
        .eq('user_id', user.id)
        .single();

    if (!dailyQuest || dailyQuest.completed) return null;

    const quest = dailyQuest.quest;
    if (!quest) return null;

    // Mark as completed
    await supabase
        .from('daily_quests')
        .update({
            completed: true,
            completed_at: new Date().toISOString()
        })
        .eq('id', questId);

    // Award XP and Gold
    const { data: profile } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (profile) {
        const newXp = profile.xp + quest.xp_reward;
        const newGold = profile.gold + quest.gold_reward;

        // Calculate new level
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

        // Record in ledger
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

/**
 * Refresh daily quests (admin/debug function).
 */
export async function refreshDailyQuests(): Promise<DailyQuest[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const today = formatDate(new Date());

    // Delete existing quests for today
    await supabase
        .from('daily_quests')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today);

    // Generate new ones
    return await generateDailyQuests(user.id, today);
}
