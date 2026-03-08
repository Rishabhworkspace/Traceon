// src/components/profile/CodeQualityReport.tsx
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface CodeQualityReportProps {
    traits: {
        strengths: string[];
        weaknesses: string[];
    };
}

export function CodeQualityReport({ traits }: CodeQualityReportProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up animate-delay-4">

            {/* Strengths Card */}
            <div className="card p-6 border-l-4 border-l-emerald bg-emerald/5 border-emerald/20 group hover:border-emerald/40 transition-colors !rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 mb-4 border-b border-emerald/20 pb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald" />
                    <h3 className="font-bold text-text-0">Key Strengths</h3>
                </div>
                <ul className="flex flex-col gap-3">
                    {traits.strengths.map((strength, i) => (
                        <li key={i} className="flex gap-2 text-sm text-text-2 font-mono">
                            <span className="text-emerald mt-0.5">•</span>
                            <span>{strength}</span>
                        </li>
                    ))}
                    {traits.strengths.length === 0 && (
                        <li className="text-sm text-text-3 font-mono italic">No distinct strengths identified.</li>
                    )}
                </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="card p-6 border-l-4 border-l-rose bg-rose/5 border-rose/20 group hover:border-rose/40 transition-colors !rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 mb-4 border-b border-rose/20 pb-3">
                    <AlertTriangle className="w-5 h-5 text-rose" />
                    <h3 className="font-bold text-text-0">Areas to Improve</h3>
                </div>
                <ul className="flex flex-col gap-3">
                    {traits.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex gap-2 text-sm text-text-2 font-mono">
                            <span className="text-rose mt-0.5">•</span>
                            <span>{weakness}</span>
                        </li>
                    ))}
                    {traits.weaknesses.length === 0 && (
                        <li className="text-sm text-text-3 font-mono italic">No critical weaknesses identified.</li>
                    )}
                </ul>
            </div>

        </div>
    );
}
