"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Loader2 } from 'lucide-react';

interface ReanalyzeButtonProps {
    username: string;
    initialRemainingLimit: number;
}

export function ReanalyzeButton({ username, initialRemainingLimit }: ReanalyzeButtonProps) {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [remainingLimit, setRemainingLimit] = useState(initialRemainingLimit);
    const [error, setError] = useState<string | null>(null);

    const handleReanalyze = async () => {
        if (remainingLimit <= 0 || isAnalyzing) return;
        setIsAnalyzing(true);
        setError(null);

        try {
            const res = await fetch(`/api/profile/${username}`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to re-analyze profile');
            }

            if (typeof data.forceRefreshRemaining === 'number') {
                setRemainingLimit(data.forceRefreshRemaining);
            } else {
                setRemainingLimit(prev => Math.max(0, prev - 1));
            }

            // Trigger Next.js Server Component re-fetch/refresh
            router.refresh();
        } catch (err: any) {
            console.error('Error re-analyzing:', err);
            setError(err.message || 'An error occurred during re-analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const isLimitReached = remainingLimit <= 0;

    return (
        <div className="flex flex-col items-center sm:items-start gap-1">
            <div 
                title={isLimitReached ? "Re-analyze limit reached. Try again tomorrow." : "Re-analyze profile from GitHub"}
                className="inline-block"
            >
                <button
                    onClick={handleReanalyze}
                    disabled={isLimitReached || isAnalyzing}
                    className="px-3 py-2 rounded-sm border border-stroke bg-surface-3 hover:bg-emerald/10 hover:text-emerald text-text-2 hover:border-emerald/30 inline-flex items-center gap-1.5 transition-all text-xs font-mono uppercase tracking-wider font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald" />
                            Re-analyzing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Re-analyze
                        </>
                    )}
                </button>
            </div>
            {error && (
                <span className="text-[10px] text-rose font-mono mt-1">
                    {error}
                </span>
            )}
        </div>
    );
}
