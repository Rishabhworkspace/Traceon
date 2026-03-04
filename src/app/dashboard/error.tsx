'use client';

import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-5 px-6">
            <div className="w-14 h-14 rounded-2xl bg-rose/5 border border-rose/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose" />
            </div>
            <div className="text-center max-w-sm">
                <h2 className="text-lg font-bold text-text-0 mb-1">Dashboard failed to load</h2>
                <p className="text-sm text-text-2 leading-relaxed">
                    {error.message || 'Could not load your dashboard data. Please try again.'}
                </p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg border border-stroke bg-surface-1 hover:bg-surface-2 text-text-1 transition-colors"
                    aria-label="Retry loading dashboard"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg bg-emerald text-surface-0 hover:bg-emerald/90 font-semibold transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Home
                </Link>
            </div>
        </div>
    );
}
