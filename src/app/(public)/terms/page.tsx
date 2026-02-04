import ThemeToggle from '@/components/ThemeToggle';
import SoundLink from '@/components/landing/SoundLink';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="mx-auto max-w-md px-4 pb-[calc(var(--safe-area-bottom)+2rem)] pt-safe md:max-w-3xl">
                <div className="flex items-center justify-between">
                    <SoundLink href="/landing" className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                        ← Back to landing
                    </SoundLink>
                    <ThemeToggle />
                </div>
                <div className="card mt-6 p-6">
                    <h1 className="text-3xl font-semibold">Terms of Service</h1>
                    <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                        This is a placeholder. Full terms will be added before launch.
                    </p>
                    <div className="mt-6 space-y-4 text-sm text-[var(--foreground-muted)]">
                        <p>Use the app responsibly and keep your account secure.</p>
                        <p>You own your content. We provide the tools to track habits and quests.</p>
                        <p>By using the app, you agree to follow community and fair-use guidelines.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
