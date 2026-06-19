"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface ReanalyzeFlowButtonProps {
    username: string;
}

export function ReanalyzeFlowButton({ username }: ReanalyzeFlowButtonProps) {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRefresh = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const res = await fetch(`/api/profile/${username}?forceRefresh=true`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("Only the profile owner can re-analyze this profile. Please ask them to log in and refresh it.");
                }
                throw new Error(data.error || 'Failed to re-analyze profile');
            }

            // Successfully refreshed, reload page content
            router.refresh();
            window.location.reload();
        } catch (err: any) {
            console.error('Error in re-analyze flow:', err);
            setError(err.message || 'An error occurred during re-analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <button
                onClick={handleRefresh}
                disabled={isAnalyzing}
                className="btn-cta !px-8 !py-3 !text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald" />
                        Re-analyzing Profile...
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" />
                        Re-analyze Profile
                    </>
                )}
            </button>
            {error && (
                <div className="flex items-center gap-2 text-rose text-xs font-mono bg-rose/5 p-3 rounded-sm border border-rose/10 max-w-md text-center mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
