'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import BottomSheet from '@/components/BottomSheet';
import MonthlySummaryCard from '@/components/tracker/MonthlySummaryCard';
import HabitSelect from '@/components/tracker/HabitSelect';
import DayCell from '@/components/tracker/DayCell';
import MotivationTip from '@/components/tracker/MotivationTip';
import { TrackerGridSkeleton } from '@/components/Skeletons';
import { useToast } from '@/components/Toast';
import type { Habit, Checkin } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { setCheckin, clearCheckin } from '@/lib/actions/checkins';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    addMonths,
    subMonths,
    isFuture,
    isToday as isDateToday,
    subDays,
} from 'date-fns';

export default function TrackerPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [allCheckins, setAllCheckins] = useState<Record<string, Checkin[]>>({});
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [monthTransition, setMonthTransition] = useState<'left' | 'right' | null>(null);
    const { showToast } = useToast();
    const calendarRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number>(0);

    const fetchCheckins = useCallback(async (habitId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const { data } = await supabase
            .from('checkins')
            .select('*')
            .eq('user_id', user.id)
            .eq('habit_id', habitId)
            .gte('date', start)
            .lte('date', end);

        if (data) {
            setCheckins(data);
            setAllCheckins(prev => ({ ...prev, [habitId]: data }));
        }
    }, [currentMonth]);

    // Fetch all habits' completion for the month
    const fetchAllHabitCheckins = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || habits.length === 0) return;

        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const { data } = await supabase
            .from('checkins')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', start)
            .lte('date', end);

        if (data) {
            const grouped: Record<string, Checkin[]> = {};
            data.forEach(c => {
                if (!grouped[c.habit_id]) grouped[c.habit_id] = [];
                grouped[c.habit_id].push(c);
            });
            setAllCheckins(grouped);
        }
    }, [currentMonth, habits]);

    useEffect(() => {
        async function fetchHabits() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (data && data.length > 0) {
                setHabits(data);
                setSelectedHabitId(data[0].id);
            }
            setIsLoading(false);
        }
        fetchHabits();
    }, []);

    useEffect(() => {
        if (selectedHabitId) {
            fetchCheckins(selectedHabitId);
        }
    }, [selectedHabitId, fetchCheckins]);

    useEffect(() => {
        fetchAllHabitCheckins();
    }, [fetchAllHabitCheckins]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                changeMonth('prev');
            } else if (e.key === 'ArrowRight') {
                changeMonth('next');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Swipe handling
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                changeMonth('next');
            } else {
                changeMonth('prev');
            }
        }
    };

    const changeMonth = (direction: 'prev' | 'next') => {
        setMonthTransition(direction === 'prev' ? 'right' : 'left');
        setTimeout(() => {
            setCurrentMonth(m => direction === 'prev' ? subMonths(m, 1) : addMonths(m, 1));
            setMonthTransition(null);
        }, 150);
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const startDay = getDay(startOfMonth(currentMonth));
    const emptyDays = Array(startDay).fill(null);

    const getStatusForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return checkins.find(c => c.date === dateStr)?.status || null;
    };

    const handleDayClick = (date: Date) => {
        if (isFuture(date)) return;
        setSelectedDate(format(date, 'yyyy-MM-dd'));
    };

    const handleSetStatus = async (status: 'done' | 'skipped') => {
        if (!selectedHabitId || !selectedDate) return;
        setIsPending(true);
        await setCheckin(selectedHabitId, selectedDate, status);
        await fetchCheckins(selectedHabitId);
        setIsPending(false);
        setSelectedDate(null);
        showToast(status === 'done' ? 'Marked as done!' : 'Marked as skipped');
    };

    const handleClear = async () => {
        if (!selectedHabitId || !selectedDate) return;
        setIsPending(true);
        await clearCheckin(selectedHabitId, selectedDate);
        await fetchCheckins(selectedHabitId);
        setIsPending(false);
        setSelectedDate(null);
    };

    const selectedDateStatus = selectedDate
        ? checkins.find(c => c.date === selectedDate)?.status || null
        : null;

    const selectedHabit = habits.find(h => h.id === selectedHabitId);
    const doneCount = checkins.filter(c => c.status === 'done').length;
    const skippedCount = checkins.filter(c => c.status === 'skipped').length;
    const totalDaysInMonth = days.filter(d => !isFuture(d)).length;
    const completionPercent = totalDaysInMonth > 0
        ? Math.round((doneCount / totalDaysInMonth) * 100)
        : 0;

    // Calculate completion percents for all habits
    const completionPercents: Record<string, number> = {};
    habits.forEach(h => {
        const hCheckins = allCheckins[h.id] || [];
        const done = hCheckins.filter(c => c.status === 'done').length;
        completionPercents[h.id] = totalDaysInMonth > 0
            ? Math.round((done / totalDaysInMonth) * 100)
            : 0;
    });

    // Calculate streaks
    const calculateStreaks = () => {
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        const sortedDays = [...days].sort((a, b) => b.getTime() - a.getTime());

        for (const date of sortedDays) {
            if (isFuture(date)) continue;
            const status = getStatusForDate(date);
            if (status === 'done') {
                tempStreak++;
                if (tempStreak > bestStreak) bestStreak = tempStreak;
            } else {
                if (currentStreak === 0) currentStreak = tempStreak;
                tempStreak = 0;
            }
        }
        if (currentStreak === 0) currentStreak = tempStreak;

        return { currentStreak, bestStreak };
    };

    const { currentStreak, bestStreak } = calculateStreaks();

    // Check if last 3 days are empty
    const lastThreeDaysEmpty = (() => {
        const today = new Date();
        for (let i = 0; i < 3; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const status = checkins.find(c => c.date === dateStr)?.status;
            if (status === 'done') return false;
        }
        return true;
    })();

    return (
        <AppShell>
            <div className="max-w-md md:max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                    Tracker
                </h1>

                {isLoading ? (
                    <>
                        <div className="card p-4 mb-4">
                            <div className="skeleton h-28 w-full rounded-xl" />
                        </div>
                        <TrackerGridSkeleton />
                    </>
                ) : habits.length === 0 ? (
                    <div className="card p-8 text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                            No habits to track
                        </h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
                            Create your first habit to see your progress
                        </p>
                        <Link href="/new" className="btn-primary inline-block">
                            Create Habit
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Monthly Summary */}
                        <MonthlySummaryCard
                            monthLabel={format(currentMonth, 'MMMM yyyy')}
                            habitName={selectedHabit?.title || ''}
                            completionPercent={completionPercent}
                            doneCount={doneCount}
                            skippedCount={skippedCount}
                            currentStreak={currentStreak}
                            bestStreak={bestStreak}
                            totalDays={totalDaysInMonth}
                        />

                        {/* Habit Selector */}
                        <HabitSelect
                            habits={habits}
                            selectedId={selectedHabitId}
                            completionPercents={completionPercents}
                            onChange={setSelectedHabitId}
                        />

                        {/* Calendar */}
                        <div
                            ref={calendarRef}
                            className="card p-4 mb-4"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* Month navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => changeMonth('prev')}
                                    className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/10"
                                    style={{ color: 'var(--foreground-muted)' }}
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <h2
                                    className="font-semibold"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {format(currentMonth, 'MMMM yyyy')}
                                </h2>
                                <button
                                    onClick={() => changeMonth('next')}
                                    className="p-2 -mr-2 rounded-lg transition-colors hover:bg-white/10"
                                    style={{ color: 'var(--foreground-muted)' }}
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1.5 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <div
                                        key={i}
                                        className="text-center text-xs font-medium py-1"
                                        style={{ color: 'var(--foreground-muted)' }}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days grid */}
                            <div
                                className={`grid grid-cols-7 gap-1.5 transition-all duration-150 ${monthTransition === 'left' ? 'opacity-0 -translate-x-4' :
                                    monthTransition === 'right' ? 'opacity-0 translate-x-4' : ''
                                    }`}
                            >
                                {emptyDays.map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}
                                {days.map((date) => (
                                    <DayCell
                                        key={date.toISOString()}
                                        date={date}
                                        status={getStatusForDate(date)}
                                        isToday={isDateToday(date)}
                                        isFuture={isFuture(date)}
                                        onClick={() => handleDayClick(date)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mini Stats Row */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="card p-3 text-center">
                                <p className="text-2xl font-bold text-green-500">{doneCount}</p>
                                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Done</p>
                            </div>
                            <div className="card p-3 text-center">
                                <p className="text-2xl font-bold text-red-400">{skippedCount}</p>
                                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Skipped</p>
                            </div>
                            <div className="card p-3 text-center">
                                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{completionPercent}%</p>
                                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Rate</p>
                            </div>
                        </div>

                        {/* Motivation Tip */}
                        <MotivationTip
                            currentStreak={currentStreak}
                            bestStreak={bestStreak}
                            completionPercent={completionPercent}
                            lastThreeDaysEmpty={lastThreeDaysEmpty}
                        />
                    </>
                )}

                {/* Bottom sheet for day editing */}
                <BottomSheet
                    isOpen={!!selectedDate}
                    onClose={() => setSelectedDate(null)}
                    title={selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d') : ''}
                >
                    <div className="space-y-3">
                        <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
                            {selectedHabit?.title}
                        </p>
                        <button
                            onClick={() => handleSetStatus('done')}
                            disabled={isPending}
                            className={`w-full py-4 rounded-xl font-semibold transition-all ${selectedDateStatus === 'done'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                }`}
                        >
                            ✓ Mark as Done
                        </button>
                        <button
                            onClick={() => handleSetStatus('skipped')}
                            disabled={isPending}
                            className={`w-full py-4 rounded-xl font-semibold transition-all ${selectedDateStatus === 'skipped'
                                ? 'bg-red-500 text-white'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                }`}
                        >
                            ✕ Mark as Skipped
                        </button>
                        {selectedDateStatus && (
                            <button
                                onClick={handleClear}
                                disabled={isPending}
                                className="w-full py-4 font-medium"
                                style={{ color: 'var(--foreground-muted)' }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </BottomSheet>
            </div>
        </AppShell>
    );
}
