'use client';

import SoundLink from '@/components/landing/SoundLink';
import { ArrowRight, Sparkles, ShieldCheck, Smartphone, Swords } from 'lucide-react';
import useClickSound from '@/components/landing/useClickSound';

export default function Hero() {
    const playClick = useClickSound();

    return (
        <section className="relative overflow-hidden">
            <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[rgba(129,140,248,0.25)] blur-3xl" />
            <div className="mx-auto grid max-w-md grid-cols-1 items-center gap-8 px-4 pb-12 pt-8 md:max-w-6xl md:grid-cols-[1.1fr_0.9fr] md:py-20">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                        <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
                        RPG Habit System
                    </div>
                    <h1 className="text-4xl font-bold leading-tight text-[var(--foreground)] md:text-5xl">
                        Build habits like an RPG. Level up daily.
                    </h1>
                    <p className="text-lg text-[var(--foreground-muted)]">
                        Atomic Habits system + quests + streaks + loot. Turn tiny actions into XP, ranks, and momentum.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <SoundLink
                            href="/login"
                            className="btn-primary btn-press inline-flex min-h-[48px] items-center justify-center text-sm motion-safe:hover:-translate-y-0.5"
                        >
                            Start Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </SoundLink>
                        <a
                            href="#how-it-works"
                            onClick={playClick}
                            className="btn-secondary btn-press inline-flex min-h-[48px] items-center justify-center text-sm"
                        >
                            See how it works
                        </a>
                        <SoundLink
                            href="/demo"
                            className="btn-secondary btn-press inline-flex min-h-[48px] items-center justify-center border-[var(--accent-cyan)]/40 text-sm text-[var(--accent-cyan)] hover:bg-[rgba(34,211,238,0.08)]"
                        >
                            Try Demo
                        </SoundLink>
                    </div>
                    <ul className="grid gap-2 text-sm text-[var(--foreground-muted)]">
                        <li className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
                            Installable PWA with offline mode
                        </li>
                        <li className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-[var(--accent-cyan)]" />
                            Mobile-first UI built for iPhone + desktop
                        </li>
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute -right-6 top-6 hidden h-40 w-40 rounded-full bg-[rgba(168,85,247,0.2)] blur-3xl md:block" />
                    <div className="card relative p-6 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)]">Today&apos;s Quest</p>
                                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">Study 20 minutes</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-[var(--accent-gold)]">
                                <Swords className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                                <span>XP Progress</span>
                                <span>180 / 250</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10">
                                <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent-purple)]" />
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 text-xs text-[var(--foreground-muted)]">
                            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                <span>Streak</span>
                                <span className="text-[var(--accent-gold)]">4 days</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                <span>Loot Ready</span>
                                <span className="text-[var(--accent-cyan)]">1 chest</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
