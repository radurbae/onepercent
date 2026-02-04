'use client';

import SoundLink from '@/components/landing/SoundLink';
import {
    BarChart3,
    CalendarDays,
    Eye,
    Flame,
    Heart,
    Package,
    ShieldCheck,
    Sparkles,
    Swords,
    Timer,
    Trophy,
    Zap,
} from 'lucide-react';
import Hero from '@/components/landing/Hero';
import FeatureCard from '@/components/landing/FeatureCard';
import FAQAccordion from '@/components/landing/FAQAccordion';
import CTASection from '@/components/landing/CTASection';
import ThemeToggle from '@/components/ThemeToggle';

const steps = [
    {
        title: 'Create a habit identity',
        description: 'Define who you want to become and pair it with the 4 Laws system.',
    },
    {
        title: 'Complete daily quests',
        description: 'Show up each day, clear quick quests, and protect the streak.',
    },
    {
        title: 'Earn XP, streaks, and loot',
        description: 'Level up with visible progress, ranks, and cosmetic rewards.',
    },
];

const laws = [
    {
        title: 'Make it Obvious',
        description: 'Design a visible cue so your habit is impossible to ignore.',
        example: 'Leave the book on your pillow.',
        icon: <Eye className="h-5 w-5" />,
    },
    {
        title: 'Make it Attractive',
        description: 'Pair the habit with something you already enjoy.',
        example: 'Play your favorite playlist while you start.',
        icon: <Heart className="h-5 w-5" />,
    },
    {
        title: 'Make it Easy',
        description: 'Use the 2-minute rule to lower friction and build momentum.',
        example: 'Open the book and read one page.',
        icon: <Timer className="h-5 w-5" />,
    },
    {
        title: 'Make it Satisfying',
        description: 'Reward the streak with XP, loot, and instant feedback.',
        example: 'Claim XP and watch your streak grow.',
        icon: <Trophy className="h-5 w-5" />,
    },
];

const features = [
    {
        title: 'Daily Quests',
        description: 'Varied quests keep habits fresh without losing consistency.',
        icon: <Swords className="h-5 w-5" />,
    },
    {
        title: 'Tracker Calendar',
        description: 'See your month at a glance with streak-safe tracking.',
        icon: <CalendarDays className="h-5 w-5" />,
    },
    {
        title: 'Profile Stats',
        description: 'Level, rank, and RPG stats show real growth over time.',
        icon: <BarChart3 className="h-5 w-5" />,
    },
    {
        title: 'Inventory Loot',
        description: 'Unlock titles, badges, and themes as you progress.',
        icon: <Package className="h-5 w-5" />,
    },
    {
        title: 'PWA Install',
        description: 'Install on iPhone for an app-like offline-first experience.',
        icon: <ShieldCheck className="h-5 w-5" />,
    },
];

const testimonials = [
    {
        name: 'Student',
        quote: 'Daily quests made my routines feel like I was grinding XP, not forcing habits.',
    },
    {
        name: 'Creator',
        quote: 'The streak + loot loop keeps me consistent without feeling boring.',
    },
    {
        name: 'Busy worker',
        quote: 'The 2-minute rule + reminders finally stuck for me. Easy wins every day.',
    },
];

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="pt-safe pb-[calc(var(--safe-area-bottom)+2rem)]">
                <div className="w-full border-b border-[var(--border-color)] bg-[var(--card-bg)] py-2 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground-muted)]">
                    Install on iPhone: Safari → Share → Add to Home Screen
                </div>
                <header className="sticky top-0 z-30 border-b border-[var(--border-color)] bg-[var(--card-bg)]/90 backdrop-blur-lg">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
                        <SoundLink href="/landing" className="flex items-center gap-2 text-lg font-semibold">
                            <span className="text-xl">⚔️</span>
                            1% Better
                        </SoundLink>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <SoundLink href="/demo" className="btn-secondary btn-press hidden text-sm sm:inline-flex">
                                Demo
                            </SoundLink>
                            <SoundLink href="/login" className="btn-primary btn-press text-sm">
                                Start Free
                            </SoundLink>
                        </div>
                    </div>
                </header>

                <Hero />

                <section id="how-it-works" className="mx-auto max-w-md px-4 py-10 md:max-w-6xl md:py-16">
                    <div className="mb-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                        <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
                        How it works
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <div
                                key={step.title}
                                className="card p-6 shadow-[0_18px_40px_rgba(0,0,0,0.3)] transition-all duration-300 motion-safe:hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-[var(--accent-cyan)] ring-1 ring-white/10">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                        {step.title}
                                    </h3>
                                </div>
                                <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="method" className="mx-auto max-w-md px-4 py-10 md:max-w-6xl md:py-16">
                    <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                            Atomic Habits Method
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                            The 4 Laws that power every quest
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {laws.map((law) => (
                            <FeatureCard
                                key={law.title}
                                icon={law.icon}
                                title={law.title}
                                description={law.description}
                                example={law.example}
                            />
                        ))}
                    </div>
                </section>

                <section id="features" className="mx-auto max-w-md px-4 py-10 md:max-w-6xl md:py-16">
                    <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                            RPG Progression
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                            RPG progression that keeps you in the game
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <FeatureCard
                                key={feature.title}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                badge="Feature"
                            />
                        ))}
                    </div>
                </section>

                <section id="previews" className="mx-auto max-w-md px-4 py-10 md:max-w-6xl md:py-16">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                                UI previews
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                                See the loop before you start
                            </h2>
                        </div>
                        <Flame className="hidden h-8 w-8 text-[var(--accent-gold)] md:block" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Quest Board</p>
                            <div className="mt-4 space-y-3">
                                {[
                                    { label: 'Read 10 pages', xp: '+10 XP' },
                                    { label: 'Stretch 2 min', xp: '+5 XP' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs">
                                        <span>{item.label}</span>
                                        <span className="text-[var(--accent-cyan)]">{item.xp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Tracker</p>
                            <div className="mt-4 grid grid-cols-7 gap-2">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-7 rounded-lg ${i % 3 === 0 ? 'bg-[rgba(34,197,94,0.3)]' : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">Profile Stats</p>
                            <div className="mt-4 space-y-3">
                                {[
                                    { label: 'Level 8', value: 'Rank B' },
                                    { label: 'Streak', value: '6 days' },
                                    { label: 'Loot', value: '3 badges' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs">
                                        <span>{item.label}</span>
                                        <span className="text-[var(--accent-gold)]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="testimonials" className="mx-auto max-w-md px-4 py-10 md:max-w-6xl md:py-16">
                    <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                            Social proof
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                            People stick with it because it feels like a game
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.name} className="card p-6">
                                <Zap className="h-5 w-5 text-[var(--accent-purple)]" />
                                <p className="mt-4 text-sm text-[var(--foreground-muted)]">“{testimonial.quote}”</p>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)]">
                                    {testimonial.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="faq" className="mx-auto max-w-md px-4 py-10 md:max-w-6xl md:py-16">
                    <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                            FAQ
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                            Everything you need to know
                        </h2>
                    </div>
                    <FAQAccordion />
                </section>

                <CTASection />

                <footer className="mx-auto flex max-w-md flex-col items-center justify-between gap-4 px-4 pb-10 pt-6 text-xs text-[var(--foreground-muted)] md:max-w-6xl md:flex-row">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
                        <span>1% Better</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <SoundLink href="/login" className="hover:text-[var(--foreground)]">
                            Login
                        </SoundLink>
                        <SoundLink href="/privacy" className="hover:text-[var(--foreground)]">
                            Privacy
                        </SoundLink>
                        <SoundLink href="/terms" className="hover:text-[var(--foreground)]">
                            Terms
                        </SoundLink>
                    </div>
                    <div className="text-center md:text-right">
                        © 2026 1% Better. All rights reserved.
                    </div>
                </footer>
            </div>
        </main>
    );
}
