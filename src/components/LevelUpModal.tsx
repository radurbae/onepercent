'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
}

export default function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
    const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; delay: number }[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Generate confetti
            const pieces = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                color: ['#fbbf24', '#818cf8', '#22c55e', '#ef4444', '#ec4899'][Math.floor(Math.random() * 5)],
                delay: Math.random() * 0.5,
            }));
            setConfetti(pieces);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Confetti */}
            {confetti.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: `${piece.left}%`,
                        backgroundColor: piece.color,
                        animationDelay: `${piece.delay}s`,
                    }}
                />
            ))}

            {/* Modal */}
            <div className="level-up-modal relative z-10 text-center p-8">
                <div className="mb-4">
                    <Sparkles className="w-16 h-16 mx-auto text-amber-500 animate-float" />
                </div>

                <h2 className="text-2xl font-bold text-amber-500 mb-2 uppercase tracking-wider">
                    Level Up!
                </h2>

                <div className="level-up-number">
                    {newLevel}
                </div>

                <p className="text-zinc-400 mt-4 mb-6">
                    Your power grows stronger!
                </p>

                <button
                    onClick={onClose}
                    className="btn-primary px-8"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
