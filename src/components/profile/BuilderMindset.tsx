// src/components/profile/BuilderMindset.tsx
import { Activity, GitMerge, GitPullRequest } from 'lucide-react';
import { ProfileData } from '@/app/profile/[username]/page';

interface BuilderMindsetProps {
    username: string;
    recentCommitsCount: number; // legacy prop
    commitFrequency?: ProfileData['commitFrequency'];
    pullRequestActivity?: ProfileData['pullRequestActivity'];
}

export function BuilderMindset({ username, recentCommitsCount, commitFrequency, pullRequestActivity }: BuilderMindsetProps) {
    let mindsetText = "Consistent contributor with steady output.";
    
    // Leverage new enriched data if available
    if (commitFrequency) {
        if (commitFrequency.last30Days > 50) {
            mindsetText = "Highly active builder with a rapid commitment to pushing code and iterating.";
        } else if (commitFrequency.last365Days < 10) {
            mindsetText = "Low recent activity detected on public, non-forked repositories.";
        } else if (commitFrequency.longestStreak > 5) {
            mindsetText = `Steady builder, capable of sustaining multi-day focus streaks (max ${commitFrequency.longestStreak} days).`;
        }
    } else {
        // Fallback for legacy cached data
        if (recentCommitsCount > 10) {
            mindsetText = "Highly active builder with a rapid commitment to pushing code and iterating.";
        } else if (recentCommitsCount === 0) {
            mindsetText = "Low recent activity detected on public, non-forked repositories.";
        }
    }

    const currentYear = new Date().getFullYear();

    return (
        <div className="card p-6 mt-6 bg-surface-1 animate-fade-up animate-delay-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm">
            <div className="flex items-center gap-3 mb-4 border-b border-stroke/50 pb-3">
                <div className="w-8 h-8 rounded-sm bg-amber/5 border border-amber/20 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-amber" />
                </div>
                <h3 className="text-base font-bold text-text-0 font-display tracking-tight">Builder Mindset</h3>
            </div>

            <p className="text-sm text-text-2 font-mono leading-relaxed mb-4">
                {mindsetText}
            </p>

            {/* Render new activity metrics if we have them */}
            {commitFrequency && pullRequestActivity && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pt-4 border-t border-stroke/30">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest">30d Commits</span>
                        <span className="text-lg font-bold text-emerald font-mono">{commitFrequency.last30Days}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest">1y Commits</span>
                        <span className="text-lg font-bold text-emerald font-mono">{commitFrequency.last365Days}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest flex items-center gap-1"><GitPullRequest className="w-3 h-3" /> PRs Opened</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">{pullRequestActivity.totalPRsOpened}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest flex items-center gap-1"><GitMerge className="w-3 h-3" /> PRs Merged</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">{pullRequestActivity.totalPRsMerged}</span>
                    </div>
                </div>
            )}

            <a
                href={`https://github.com/${username}?tab=overview&from=${currentYear}-01-01&to=${currentYear}-12-31`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald hover:text-emerald-400 flex items-center gap-1 transition-colors w-fit"
            >
                View full GitHub contribution graph ↗
            </a>
        </div>
    );
}
