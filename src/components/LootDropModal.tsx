'use client';

import { Sparkles } from 'lucide-react';
import type { Loot } from '@/lib/types';
import { getRarityColor } from '@/lib/utils/rewards';

interface LootDropModalProps {
    isOpen: boolean;
    onClose: () => void;
    loot: Loot | null;
}

export default function LootDropModal({ isOpen, onClose, loot }: LootDropModalProps) {
    if (!isOpen || !loot) return null;

    const rarityColor = getRarityColor(loot.rarity);
    const rarityLabel = loot.rarity.charAt(0).toUpperCase() + loot.rarity.slice(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 text-center p-8">
                <div className="mb-4">
                    <Sparkles className="w-12 h-12 mx-auto text-amber-500" />
                </div>

                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
                    Loot Drop!
                </h2>

                {/* Loot Card */}
                <div
                    className={`loot-card ${loot.rarity} w-48 mx-auto p-6 rounded-xl bg-zinc-900 border-2`}
                    style={{ borderColor: rarityColor }}
                >
                    <div
                        className="text-4xl mb-3"
                    >
                        {loot.type === 'title' && '📜'}
                        {loot.type === 'badge' && '🛡️'}
                        {loot.type === 'theme' && '🎨'}
                        {loot.type === 'frame' && '🖼️'}
                    </div>

                    <h3
                        className="font-bold text-lg mb-2"
                        style={{ color: rarityColor }}
                    >
                        {loot.name}
                    </h3>

                    <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: rarityColor }}
                    >
                        {rarityLabel} {loot.type}
                    </span>
                </div>

                <p className="text-zinc-400 mt-6 mb-6 text-sm">
                    Added to your inventory!
                </p>

                <button
                    onClick={onClose}
                    className="btn-primary px-8"
                >
                    Collect
                </button>
            </div>
        </div>
    );
}
