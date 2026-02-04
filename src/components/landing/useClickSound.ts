'use client';

import { useCallback, useRef } from 'react';

export default function useClickSound() {
    const audioRef = useRef<AudioContext | null>(null);
    const lastPlayRef = useRef(0);

    return useCallback(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const now = performance.now();
        if (now - lastPlayRef.current < 80) return;
        lastPlayRef.current = now;

        const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioRef.current) {
            audioRef.current = new AudioCtx();
        }

        const ctx = audioRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
    }, []);
}
