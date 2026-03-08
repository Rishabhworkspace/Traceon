// src/app/profile/[username]/loading.tsx
import { Loader2 } from 'lucide-react';

export default function LoadingProfile() {
    return (
        <main className="min-h-screen noise dot-matrix bg-background flex flex-col items-center justify-center p-5">
            <div className="w-full max-w-2xl bg-surface-1 rounded-xl shadow-2xl border border-stroke overflow-hidden animate-fade-up">

                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke bg-surface-2/50">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose/80" />
                        <div className="w-3 h-3 rounded-full bg-amber/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald/80" />
                    </div>
                    <span className="text-xs text-text-3 font-mono ml-3 font-medium">traceon — ai-profiler</span>
                </div>

                {/* Terminal Body */}
                <div className="p-6 font-mono text-sm leading-relaxed min-h-[300px] flex flex-col">
                    <div className="flex flex-col gap-2">
                        <div className="text-text-0">$ traceon profile fetch --all</div>
                        <div className="text-text-2 flex items-center gap-2">
                            <span className="text-emerald">→</span> Connecting to GitHub API...
                        </div>
                        <div className="text-text-2 flex items-center gap-2 animate-pulse">
                            <span className="text-emerald">→</span> Aggregating top 50 repositories...
                        </div>
                        <div className="text-text-2 flex items-center gap-2 animate-pulse delay-150">
                            <span className="text-emerald">→</span> Analyzing commit language byte signatures...
                        </div>

                        <div className="mt-4 text-emerald font-medium">
                            <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
                            Evaluating Engineering DNA against 500+ heuristics...
                        </div>
                    </div>

                    <div className="mt-auto pt-6 text-xs text-text-3 border-t border-stroke/50">
                        This involves deep LLM analysis and may take 15-30 seconds if uncached.
                    </div>
                </div>

            </div>
        </main>
    );
}
