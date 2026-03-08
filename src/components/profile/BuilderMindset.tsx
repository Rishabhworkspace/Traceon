// src/components/profile/BuilderMindset.tsx
import { Activity } from 'lucide-react';

interface BuilderMindsetProps {
    username: string;
    recentCommitsCount: number; // passed down as just the count of the sample we took
}

export function BuilderMindset({ username, recentCommitsCount }: BuilderMindsetProps) {
    // We infer a simple vibe based on the commit sample we grabbed
    let mindsetText = "Consistent contributor with steady output.";
    if (recentCommitsCount > 10) {
        mindsetText = "Highly active builder with a rapid commitment to pushing code and iterating.";
    } else if (recentCommitsCount === 0) {
        mindsetText = "Low recent activity detected on public, non-forked repositories.";
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
