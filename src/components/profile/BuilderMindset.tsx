// src/components/profile/BuilderMindset.tsx
import { Activity, GitMerge, GitPullRequest, Layers, Globe, Lightbulb, FileText } from 'lucide-react';
import { ACIDBreakdown, CommitFrequency, PullRequestActivity } from '@/lib/profile/types';


interface BuilderMindsetProps {
    username: string;
    recentCommitsCount: number;
    commitFrequency?: CommitFrequency;
    pullRequestActivity?: PullRequestActivity;
    acidBreakdown?: ACIDBreakdown;
}

const ACID_ITEMS = [
    { key: 'architecture', label: 'Architecture', letter: 'A', icon: Layers, color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/20' },
    { key: 'crossDomain', label: 'Cross-Domain', letter: 'C', icon: Globe, color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20' },
    { key: 'innovation', label: 'Innovation', letter: 'I', icon: Lightbulb, color: 'text-amber', bgColor: 'bg-amber/10 border-amber/20' },
    { key: 'documentation', label: 'Documentation', letter: 'D', icon: FileText, color: 'text-emerald', bgColor: 'bg-emerald/10 border-emerald/20' },
] as const;

export function BuilderMindset({ username, recentCommitsCount, commitFrequency, pullRequestActivity, acidBreakdown }: BuilderMindsetProps) {
    let mindsetText = "Consistent contributor with steady output.";
    
    if (commitFrequency) {
        if (commitFrequency.last30Days > 50) {
            mindsetText = "Highly active builder with a rapid commitment to pushing code and iterating.";
        } else if (commitFrequency.last365Days < 10) {
            mindsetText = "Low recent activity detected on public, non-forked repositories.";
        } else if (commitFrequency.activeDaysLastYear > 100) {
            mindsetText = `Steady builder with ${commitFrequency.activeDaysLastYear} active days in the past year, showing sustained engagement.`;
        } else if (commitFrequency.last30Days > 10) {
            mindsetText = "Active contributor with recent engagement across projects.";
        }
    } else {
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

            {/* Activity Metrics */}
            {commitFrequency && pullRequestActivity && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pt-4 border-t border-stroke/30">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest">30d Commits</span>
                        <span className="text-lg font-bold text-emerald font-mono">{commitFrequency.last30Days}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest">Active Days</span>
                        <span className="text-lg font-bold text-emerald font-mono">{commitFrequency.activeDaysLastYear}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest flex items-center gap-1"><GitPullRequest className="w-3 h-3" /> PRs Merged</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">{pullRequestActivity.totalPRsMerged}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-3 font-mono uppercase tracking-widest flex items-center gap-1"><GitMerge className="w-3 h-3" /> Reviews</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">{pullRequestActivity.prReviewsDone}</span>
                    </div>
                </div>
            )}

            {/* ACID Breakdown — Uniqueness Sub-dimensions */}
            {acidBreakdown && (
                <div className="pt-4 border-t border-stroke/30">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase tracking-widest text-text-3 font-mono font-bold">
                            ACID Breakdown — Uniqueness Score
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ACID_ITEMS.map(({ key, label, letter, icon: Icon, color, bgColor }) => {
                            const score = acidBreakdown[key as keyof ACIDBreakdown] ?? 0;
                            return (
                                <div key={key} className={`flex flex-col items-center p-3 rounded-sm border ${bgColor} relative overflow-hidden group`}>
                                    {/* Background letter */}
                                    <span className={`absolute top-0 right-1 text-4xl font-display font-bold ${color} opacity-5 select-none`}>
                                        {letter}
                                    </span>
                                    <Icon className={`w-5 h-5 ${color} mb-1.5`} />
                                    <span className={`text-lg font-bold font-mono ${color}`}>
                                        {score.toFixed(1)}
                                    </span>
                                    <span className="text-[9px] uppercase tracking-widest text-text-3 font-mono mt-0.5">
                                        {label}
                                    </span>
                                    {/* Score bar */}
                                    <div className="w-full h-1 bg-surface-0 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                score >= 7 ? 'bg-emerald' : score >= 4 ? 'bg-amber' : 'bg-rose'
                                            }`}
                                            style={{ width: `${Math.min(100, score * 10)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <a
                href={`https://github.com/${username}?tab=overview&from=${currentYear}-01-01&to=${currentYear}-12-31`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald hover:text-emerald-400 flex items-center gap-1 transition-colors w-fit mt-4"
            >
                View full GitHub contribution graph ↗
            </a>
        </div>
    );
}
