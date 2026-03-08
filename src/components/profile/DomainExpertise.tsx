// src/components/profile/DomainExpertise.tsx
'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

interface DomainExpertiseProps {
    scores: {
        reliability: number;
        security: number;
        maintainability: number;
        uniqueness: number;
        influence: number;
        contribution: number;
    };
    descriptions?: {
        reliability: string;
        security: string;
        maintainability: string;
        uniqueness: string;
        influence: string;
        contribution: string;
    };
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface-0/95 backdrop-blur-md border border-emerald/30 p-3 rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <p className="text-text-0 font-bold mb-1 font-mono uppercase tracking-widest text-xs opacity-70">
                    {payload[0].payload.subject}
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald shadow-[0_0_8px_var(--color-emerald)]" />
                    <span className="text-sm font-mono text-emerald font-bold">Score: {Number(payload[0].value).toFixed(1)}/10</span>
                </div>
            </div>
        );
    }
    return null;
};

export function DomainExpertise({ scores, descriptions }: DomainExpertiseProps) {
    // Convert Map/Object to standard JS object just in case API returns a Map representation
    const safeScores = scores instanceof Map ? Object.fromEntries(scores) : (scores || {});
    const safeDescriptions = descriptions instanceof Map ? Object.fromEntries(descriptions) : (descriptions || {});

    const sum = (safeScores.reliability || 0) + (safeScores.security || 0) + (safeScores.maintainability || 0) + (safeScores.uniqueness || 0) + (safeScores.influence || 0) + (safeScores.contribution || 0);
    const overallScore = (sum / 6) / 10;

    const data = [
        { subject: 'Reliability', A: (safeScores.reliability ?? 0) / 10, fullMark: 10 },
        { subject: 'Influence', A: (safeScores.influence ?? 0) / 10, fullMark: 10 },
        { subject: 'Contribution', A: (safeScores.contribution ?? 0) / 10, fullMark: 10 },
        { subject: 'Uniqueness', A: (safeScores.uniqueness ?? 0) / 10, fullMark: 10 },
        { subject: 'Maintainability', A: (safeScores.maintainability ?? 0) / 10, fullMark: 10 },
        { subject: 'Security', A: (safeScores.security ?? 0) / 10, fullMark: 10 },
    ];

    const descriptionData = [
        { key: 'reliability', label: 'Reliability', score: (safeScores.reliability ?? 0) / 10, desc: safeDescriptions.reliability },
        { key: 'maintainability', label: 'Maintainability', score: (safeScores.maintainability ?? 0) / 10, desc: safeDescriptions.maintainability },
        { key: 'contribution', label: 'Contribution', score: (safeScores.contribution ?? 0) / 10, desc: safeDescriptions.contribution },
        { key: 'security', label: 'Security', score: (safeScores.security ?? 0) / 10, desc: safeDescriptions.security },
        { key: 'uniqueness', label: 'Uniqueness', score: (safeScores.uniqueness ?? 0) / 10, desc: safeDescriptions.uniqueness },
        { key: 'influence', label: 'Influence', score: (safeScores.influence ?? 0) / 10, desc: safeDescriptions.influence },
    ];

    // If we have no scores at all, or if it's returning the OLD schema (frontend, etc)
    // we should render a "Re-analyzing" or "No Data" state so the chart isn't just an empty dot.
    const hasValidScores = Object.keys(safeScores).length > 0 && ('reliability' in safeScores || safeScores.reliability !== undefined);

    if (!hasValidScores) {
        return (
            <div className="card w-full h-[400px] p-6 flex flex-col justify-center items-center text-center !rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-surface-1">
                <Target className="w-8 h-8 text-amber mb-4 animate-pulse opacity-50" />
                <h3 className="text-sm font-bold text-text-0 font-mono">Neural Profiler Upgraded</h3>
                <p className="text-xs text-text-3 font-mono mt-2 max-w-[250px]">
                    This profile's cached data is using an outdated schema. Please trigger a re-scan.
                </p>
            </div>
        );
    }

    return (
        <div className="card w-full p-6 flex flex-col animate-fade-up animate-delay-1 relative overflow-hidden group shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm hover:!border-emerald/40 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6 relative z-10 border-b border-stroke/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-emerald/5 border border-emerald/20 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-emerald" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">Domain DNA</h3>
                        <p className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Neural Quality Profiling</p>
                    </div>
                </div>

                {hasValidScores && (
                    <div className="flex flex-col items-end">
                        <span className={`text-3xl font-display font-bold leading-none ${overallScore >= 8 ? 'text-emerald' : overallScore >= 5 ? 'text-amber' : 'text-rose'}`}>
                            {overallScore.toFixed(1)}<span className="text-lg opacity-50">/10</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-text-3 font-mono mt-1">Overall Rating</span>
                    </div>
                )}
            </div>

            {/* Content Flex Container */}
            <div className="flex flex-col gap-8 relative z-10">
                {/* Radar Chart */}
                <div className="w-full h-[350px] -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <defs>
                                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                                </radialGradient>
                            </defs>
                            <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 10]}
                                tick={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Radar
                                name="Skill Level"
                                dataKey="A"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#radarGradient)"
                                fillOpacity={1}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Score Explanations Grid */}
                {descriptions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-stroke/30">
                        {descriptionData.map((item) => (
                            <div key={item.key} className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-text-0">{item.label}</span>
                                    <span className={`text-xs font-mono font-bold ${typeof item.score === 'number' && item.score >= 8 ? 'text-emerald' : typeof item.score === 'number' && item.score >= 5 ? 'text-amber' : 'text-rose'}`}>
                                        {(item.score || 0).toFixed(1)}/10
                                    </span>
                                </div>
                                <p className="text-xs text-text-3 font-mono leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300 mix-blend-screen pointer-events-none">
                <Target className="w-48 h-48 text-emerald transform group-hover:rotate-45 transition-transform duration-700" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald/0 via-emerald to-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald/5 max-w-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
        </div>
    );
}
