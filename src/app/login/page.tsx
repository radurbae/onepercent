'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Chrome } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOauthLoading, setIsOauthLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const authError = searchParams.get('error');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const supabase = createClient();

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage('Check your email for a confirmation link!');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push('/');
                router.refresh();
            }
        }

        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsOauthLoading(true);
        setError(null);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsOauthLoading(false);
        }
    };

    const inputStyle = {
        background: 'var(--background-secondary)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
    };

    return (
        <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>

            {(error || authError) && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                    {error || 'Authentication error. Please try again.'}
                </div>
            )}

            {message && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
                    {message}
                </div>
            )}

            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isOauthLoading}
                className="w-full py-3.5 rounded-xl font-semibold border border-white/10 bg-white/5 text-[var(--foreground)] hover:bg-white/10 transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isOauthLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Connecting...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Chrome className="w-4 h-4 text-[var(--accent-cyan)]" />
                        Continue with Google
                    </span>
                )}
            </button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                <span className="h-px flex-1 bg-white/10" />
                <span>or</span>
                <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--foreground)' }}
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        style={inputStyle}
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--foreground)' }}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        style={inputStyle}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            {isSignUp ? 'Creating account...' : 'Signing in...'}
                        </span>
                    ) : isSignUp ? (
                        'Create account'
                    ) : (
                        'Sign in'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setMessage(null);
                    }}
                    className="text-sm text-indigo-500 hover:text-indigo-400 font-medium"
                >
                    {isSignUp
                        ? 'Already have an account? Sign in'
                        : "Don't have an account? Sign up"}
                </button>
            </div>
        </div>
    );
}

function LoginFormFallback() {
    return (
        <div className="card p-6">
            <div className="animate-pulse">
                <div className="h-6 rounded w-1/2 mb-6 skeleton" />
                <div className="space-y-4">
                    <div className="h-12 rounded-xl skeleton" />
                    <div className="h-12 rounded-xl skeleton" />
                    <div className="h-12 rounded-xl skeleton" />
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'var(--background)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                        1% Better
                    </h1>
                    <p style={{ color: 'var(--foreground-muted)' }}>
                        Build atomic habits that stick
                    </p>
                </div>

                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>

                <p className="mt-6 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
                    &ldquo;Every action is a vote for the type<br />of person you wish to become.&rdquo;
                </p>
            </div>
        </div>
    );
}
