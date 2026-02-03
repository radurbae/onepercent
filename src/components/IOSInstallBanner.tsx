'use client';

import { useState, useEffect } from 'react';

export default function IOSInstallBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Check if already in standalone mode (installed)
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

        // Check if already dismissed
        const dismissed = localStorage.getItem('ios-install-banner-dismissed');

        if (isIOS && !isStandalone && !dismissed) {
            setShowBanner(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('ios-install-banner-dismissed', 'true');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div
            className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-80 rounded-xl shadow-lg border p-4 z-50 animate-slide-up"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1"
                style={{ color: 'var(--foreground-muted)' }}
                aria-label="Dismiss"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex items-start gap-3 pr-6">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                        Install 1% Better
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                        Tap <span className="inline-flex items-center"><svg className="w-4 h-4 mx-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V14a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" /><path d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg></span> Share then &ldquo;Add to Home Screen&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
