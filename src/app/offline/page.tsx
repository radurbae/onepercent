'use client';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-6">📡</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    You&apos;re Offline
                </h1>
                <p className="text-gray-600 mb-6">
                    It looks like you&apos;ve lost your internet connection.
                    Don&apos;t worry – your streaks are safe! Reconnect to continue tracking your habits.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
                <p className="mt-6 text-sm text-gray-500 italic">
                    &ldquo;Small habits don&apos;t add up. They compound.&rdquo;
                </p>
            </div>
        </div>
    );
}
