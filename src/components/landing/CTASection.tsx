'use client';

import { ArrowRight } from 'lucide-react';
import SoundLink from '@/components/landing/SoundLink';

export default function CTASection() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute -top-16 right-0 h-56 w-56 rounded-full bg-[rgba(34,211,238,0.2)] blur-3xl" />
            <div className="mx-auto max-w-md px-4 py-16 md:max-w-6xl">
                <div className="card px-6 py-10 text-center shadow-[0_30px_60px_rgba(0,0,0,0.35)] md:px-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Ready to level up?</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)] md:text-4xl">
                        Start with 2 minutes. Keep the streak.
                    </h2>
                    <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                        Build momentum with the Atomic Habits system and RPG rewards.
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <SoundLink
                            href="/login"
                            className="btn-primary btn-press inline-flex min-h-[48px] items-center justify-center text-sm motion-safe:hover:-translate-y-0.5"
                        >
                            Start Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </SoundLink>
                        <SoundLink
                            href="/demo"
                            className="btn-secondary btn-press inline-flex min-h-[48px] items-center justify-center text-sm"
                        >
                            View Demo
                        </SoundLink>
                    </div>
                </div>
            </div>
        </section>
    );
}
