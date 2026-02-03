'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface DungeonTimerProps {
    durationMinutes: number;
    onComplete: () => void;
    onCancel: () => void;
    questName: string;
}

export default function DungeonTimer({
    durationMinutes,
    onComplete,
    onCancel,
    questName
}: DungeonTimerProps) {
    const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const totalSeconds = durationMinutes * 60;
    const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
    const isWarning = secondsLeft <= 60 && secondsLeft > 0;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft(s => {
                    if (s <= 1) {
                        setIsRunning(false);
                        setIsCompleted(true);
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, secondsLeft]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setSecondsLeft(durationMinutes * 60);
        setIsCompleted(false);
    };

    const handleComplete = () => {
        onComplete();
    };

    if (isCompleted) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-500 mb-2">
                    Dungeon Cleared!
                </h2>
                <p className="text-zinc-400 mb-6">
                    Quest complete: {questName}
                </p>
                <button onClick={handleComplete} className="btn-primary px-8">
                    Claim Rewards
                </button>
            </div>
        );
    }

    return (
        <div className="text-center py-8">
            {/* Quest Name */}
            <h3 className="text-lg font-medium text-zinc-400 mb-2">
                Current Quest
            </h3>
            <h2 className="text-xl font-bold text-white mb-8">
                {questName}
            </h2>

            {/* Timer Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                    />
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="none"
                        stroke={isWarning ? '#ef4444' : '#818cf8'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                        className="transition-all duration-1000"
                    />
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`dungeon-timer ${isWarning ? 'warning' : ''}`}>
                        {formatTime(secondsLeft)}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={handleReset}
                    className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <button
                    onClick={isRunning ? handlePause : handleStart}
                    className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors glow-primary"
                >
                    {isRunning ? (
                        <Pause className="w-7 h-7" />
                    ) : (
                        <Play className="w-7 h-7 ml-1" />
                    )}
                </button>

                <button
                    onClick={onCancel}
                    className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-red-900/50 hover:text-red-500 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Hint */}
            <p className="text-zinc-500 text-sm mt-6">
                Focus on your quest. Double XP on completion!
            </p>
        </div>
    );
}
