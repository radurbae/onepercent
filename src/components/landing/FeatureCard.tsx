'use client';

import type { ReactNode } from 'react';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    example?: string;
    badge?: string;
}

export default function FeatureCard({ icon, title, description, example, badge }: FeatureCardProps) {
    return (
        <div className="card group relative h-full p-5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 motion-safe:hover:-translate-y-1">
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[var(--primary)] ring-1 ring-white/10">
                    {icon}
                </div>
                {badge && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                        {badge}
                    </span>
                )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
                {description}
            </p>
            {example && (
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--accent-cyan)]">
                    Example: {example}
                </p>
            )}
        </div>
    );
}
