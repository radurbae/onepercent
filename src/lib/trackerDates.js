import { format, startOfMonth } from 'date-fns';

export const getHabitStartDateString = (habit, currentMonth) => {
  const monthStartStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  if (!habit || !habit.created_at) return monthStartStr;
  const createdAtStr = habit.created_at.slice(0, 10);
  return createdAtStr < monthStartStr ? monthStartStr : createdAtStr;
};

export const isEligibleDay = (date, habitStartDateStr) =>
  format(date, 'yyyy-MM-dd') >= habitStartDateStr;

export const getEligibleDays = (days, habitStartDateStr) =>
  days.filter((date) => isEligibleDay(date, habitStartDateStr));
