'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GraphError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6" style={{ background: '#080808' }}>
            <div className="w-14 h-14 rounded-2xl bg-rose/5 border border-rose/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose" />
            </div>
            <div className="text-center max-w-sm">
                <h2 className="text-lg font-bold text-text-0 mb-1">Failed to load graph</h2>
                <p className="text-sm text-text-2 leading-relaxed">
                    {error.message || 'Something went wrong while loading the dependency graph.'}
                </p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg border border-stroke bg-surface-1 hover:bg-surface-2 text-text-1 transition-colors"
                    aria-label="Retry loading graph"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg bg-emerald text-surface-0 hover:bg-emerald/90 font-semibold transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Dashboard
                </Link>
            </div>
        </div>
    );
}
