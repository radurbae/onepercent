import { CalendarDays, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import SoundLink from '@/components/landing/SoundLink';

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="mx-auto max-w-md px-4 pb-[calc(var(--safe-area-bottom)+2rem)] pt-safe md:max-w-5xl">
                <div className="flex items-center justify-between">
                    <SoundLink href="/landing" className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                        ← Back to landing
                    </SoundLink>
                    <ThemeToggle />
                </div>
                <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Demo mode</p>
                        <h1 className="mt-3 text-3xl font-semibold">Explore sample data</h1>
                        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                            Read-only preview of quests, streaks, and rewards.
                        </p>
                    </div>
                    <SoundLink href="/login" className="btn-primary btn-press inline-flex min-h-[48px] items-center justify-center text-sm motion-safe:hover:-translate-y-0.5">
                        Start Free
                    </SoundLink>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Today</p>
                                <p className="mt-2 text-lg font-semibold">Quest Board</p>
                            </div>
                            <Swords className="h-6 w-6 text-[var(--accent-gold)]" />
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                            {[
                                'Read 10 pages',
                                'Drink 1L of water',
                                'Stretch 2 minutes',
                            ].map((item) => (
                                <div key={item} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <span>{item}</span>
                                    <span className="text-[var(--accent-cyan)]">+5 XP</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Progress</p>
                                <p className="mt-2 text-lg font-semibold">February Tracker</p>
                            </div>
                            <CalendarDays className="h-6 w-6 text-[var(--accent-cyan)]" />
                        </div>
                        <div className="mt-4 grid grid-cols-7 gap-2">
                            {Array.from({ length: 21 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-7 rounded-lg ${i % 4 === 0 ? 'bg-[rgba(34,197,94,0.35)]' : 'bg-white/5'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Level</p>
                                <p className="mt-2 text-lg font-semibold">Rank B</p>
                            </div>
                            <Trophy className="h-6 w-6 text-[var(--accent-purple)]" />
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                            {[
                                { label: 'XP', value: '820 / 1,000' },
                                { label: 'Streak', value: '6 days' },
                                { label: 'Loot', value: '3 badges' },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <span>{stat.label}</span>
                                    <span className="text-[var(--accent-gold)]">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Install</p>
                                <p className="mt-2 text-lg font-semibold">PWA Ready</p>
                            </div>
                            <ShieldCheck className="h-6 w-6 text-[var(--success)]" />
                        </div>
                        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                            Add 1% Better to your home screen for offline-first tracking and quick access.
                        </p>
                    </div>
                </div>

                <div className="card mt-10 p-6 text-center">
                    <Sparkles className="mx-auto h-6 w-6 text-[var(--accent-gold)]" />
                    <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                        Demo data resets daily. Start your real journey in minutes.
                    </p>
                    <SoundLink
                        href="/login"
                        className="btn-secondary btn-press mt-4 inline-flex min-h-[48px] items-center justify-center text-sm"
                    >
                        Create your account
                    </SoundLink>
                </div>
            </div>
        </main>
    );
}
