import ThemeToggle from '@/components/ThemeToggle';
import SoundLink from '@/components/landing/SoundLink';

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-semibold">Privacy Policy</h1>
                    <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                        We respect your privacy. This page is a placeholder until the full policy is published.
                    </p>
                    <div className="mt-6 space-y-4 text-sm text-[var(--foreground-muted)]">
                        <p>1% Better stores your account and habit data securely in Supabase.</p>
                        <p>You control what you create, and you can request deletion at any time.</p>
                        <p>We do not sell personal data. We use it only to power the product.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
