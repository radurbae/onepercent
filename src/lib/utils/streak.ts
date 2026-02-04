import { subDays, isWeekend } from 'date-fns';
import type { Checkin, Habit } from '../types';
import { formatDate } from './dates';

/**
 * Calculate streak for a habit
 * A streak is consecutive days with status='done' ending at today
 * For weekday habits, weekends are skipped in the streak calculation
 */
export function calculateStreak(
    habit: Habit,
    checkins: Checkin[],
    today: Date = new Date()
): number {
    // Create a map of date -> status for quick lookup
    const checkinMap = new Map<string, 'done' | 'skipped'>();
    checkins.forEach(c => {
        checkinMap.set(c.date, c.status);
    });

    let streak = 0;
    let currentDate = today;
    const createdAtStr = habit.created_at
        ? formatDate(new Date(habit.created_at))
        : null;

    // Go backwards from today
    for (let i = 0; i < 365; i++) {
        const dateStr = formatDate(currentDate);
        if (createdAtStr && dateStr < createdAtStr) {
            break;
        }
        const status = checkinMap.get(dateStr);

        // For weekday habits, skip weekends in streak calculation
        if (habit.schedule === 'weekdays' && isWeekend(currentDate)) {
            currentDate = subDays(currentDate, 1);
            continue;
        }

        if (status === 'done') {
            streak++;
            currentDate = subDays(currentDate, 1);
        } else {
            // Streak broken (either skipped, missing, or no checkin)
            break;
        }
    }

    return streak;
}

/**
 * Get the last N days of checkins for streak calculation
 * This is more efficient than fetching all checkins
 */
export function getStreakDateRange(days: number = 60): { start: string; end: string } {
    const today = new Date();
    const startDate = subDays(today, days);

    return {
        start: formatDate(startDate),
        end: formatDate(today),
    };
}

/**
 * Check if user should see "never miss twice" warning
 * Returns true if yesterday was skipped/missing AND today is not done yet
 */
export function shouldShowNeverMissTwiceWarning(
    habit: Habit,
    todayCheckin: Checkin | null,
    yesterdayCheckin: Checkin | null,
    today: Date = new Date()
): boolean {
    // If today is already done, no warning needed
    if (todayCheckin?.status === 'done') {
        return false;
    }

    // For weekday habits, check if yesterday was a weekday
    const yesterday = subDays(today, 1);
    const createdAtStr = habit.created_at
        ? formatDate(new Date(habit.created_at))
        : null;
    if (createdAtStr && formatDate(yesterday) < createdAtStr) {
        return false;
    }
    if (habit.schedule === 'weekdays' && isWeekend(yesterday)) {
        // If yesterday was a weekend, check Friday instead
        // For simplicity, we'll skip this case and not show warning
        return false;
    }

    // Warning if yesterday was skipped or missing (no checkin)
    return !yesterdayCheckin || yesterdayCheckin.status === 'skipped';
}
