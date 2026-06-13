// src/components/profile/DomainExpertise.tsx
'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Award, TrendingUp, Shield, Zap } from 'lucide-react';
import { CURISMScores, CURISMDescriptions, MasterScoreData } from '@/lib/profile/types';

interface TooltipItem {
    payload: {
        subject: string;
    };
    value: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipItem[];
}


interface DomainExpertiseProps {
    curismScores?: CURISMScores;
    curismDescriptions?: Record<string, string>;
    masterScore?: MasterScoreData;
}

const GRADE_COLORS: Record<string, string> = {
    'S+': 'text-amber',
    'S': 'text-emerald',
    'A': 'text-sky-400',
    'B': 'text-orange-400',
    'C': 'text-text-3',
};

const GRADE_BG: Record<string, string> = {
    'S+': 'bg-amber/10 border-amber/30',
    'S': 'bg-emerald/10 border-emerald/30',
    'A': 'bg-sky-400/10 border-sky-400/30',
    'B': 'bg-orange-400/10 border-orange-400/30',
    'C': 'bg-text-3/10 border-text-3/30',
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
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

export function DomainExpertise({ curismScores, curismDescriptions, masterScore }: DomainExpertiseProps) {
    // Handle Map vs Object from MongoDB
    const safeScores: CURISMScores = curismScores instanceof Map
        ? Object.fromEntries(curismScores) as CURISMScores
        : (curismScores || { reliability: 0, security: 0, maintainability: 0, influence: 0, contribution: 0, uniqueness: 0 });

    const safeDescriptions = curismDescriptions instanceof Map
        ? Object.fromEntries(curismDescriptions)
        : (curismDescriptions || {});

    const hasValidScores = curismScores && Object.keys(safeScores).length >= 6;

    if (!hasValidScores) {
        return (
            <div className="card w-full h-[400px] p-6 flex flex-col justify-center items-center text-center !rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-surface-1">
                <Target className="w-8 h-8 text-amber mb-4 animate-pulse opacity-50" />
                <h3 className="text-sm font-bold text-text-0 font-mono">CURISM Engine Loading</h3>
                <p className="text-xs text-text-3 font-mono mt-2 max-w-[250px]">
                    This profile requires a re-scan with the new CURISM scoring algorithm.
                </p>
            </div>
        );
    }

    // 6-dimension CURISM radar data
    const data = [
        { subject: 'Reliability', A: safeScores.reliability, fullMark: 10 },
        { subject: 'Security', A: safeScores.security, fullMark: 10 },
        { subject: 'Maintainability', A: safeScores.maintainability, fullMark: 10 },
        { subject: 'Influence', A: safeScores.influence, fullMark: 10 },
        { subject: 'Contribution', A: safeScores.contribution, fullMark: 10 },
        { subject: 'Uniqueness', A: safeScores.uniqueness, fullMark: 10 },
    ];

    // CURISM dimension descriptions
    const descriptionData = [
        { key: 'reliability', label: 'Reliability', score: safeScores.reliability, category: 'Hard Skill', desc: safeDescriptions.reliability },
        { key: 'security', label: 'Security', score: safeScores.security, category: 'Hard Skill', desc: safeDescriptions.security },
        { key: 'maintainability', label: 'Maintainability', score: safeScores.maintainability, category: 'Hard Skill', desc: safeDescriptions.maintainability },
        { key: 'influence', label: 'Influence', score: safeScores.influence, category: 'Soft Skill', desc: safeDescriptions.influence },
        { key: 'contribution', label: 'Contribution', score: safeScores.contribution, category: 'Soft Skill', desc: safeDescriptions.contribution },
        { key: 'uniqueness', label: 'Uniqueness', score: safeScores.uniqueness, category: 'Builder Skill', desc: safeDescriptions.uniqueness },
    ];

    const grade = masterScore?.grade || 'C';
    const gradeColor = GRADE_COLORS[grade] || 'text-text-3';
    const gradeBg = GRADE_BG[grade] || 'bg-text-3/10 border-text-3/30';

    return (
        <div className="card w-full p-6 flex flex-col animate-fade-up animate-delay-1 relative overflow-hidden group shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm hover:!border-emerald/40 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
            {/* Card Header with Grade Badge */}
            <div className="flex items-center justify-between mb-6 relative z-10 border-b border-stroke/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-emerald/5 border border-emerald/20 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-emerald" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">CURISM Profile</h3>
                        <p className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Deterministic Quality Scoring</p>
                    </div>
                </div>

                {masterScore && (
                    <div className="flex items-center gap-4">
                        {/* Grade Badge */}
                        <div className={`flex flex-col items-center px-4 py-2 rounded-sm border ${gradeBg}`}>
                            <span className={`text-3xl font-display font-bold leading-none ${gradeColor}`}>
                                {masterScore.grade}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-text-3 font-mono mt-0.5">
                                {masterScore.gradeTitle}
                            </span>
                        </div>
                        {/* Final Score */}
                        <div className="flex flex-col items-end">
                            <span className={`text-3xl font-display font-bold leading-none ${masterScore.finalScore >= 8 ? 'text-emerald' : masterScore.finalScore >= 5 ? 'text-amber' : 'text-rose'}`}>
                                {masterScore.finalScore.toFixed(1)}<span className="text-lg opacity-50">/10</span>
                            </span>
                            {masterScore.percentile && (
                                <span className="text-[10px] uppercase tracking-widest text-text-3 font-mono mt-1">
                                    Top {100 - masterScore.percentile}%
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Breakdown Bar */}
            {masterScore && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex items-center gap-2 p-3 rounded-sm bg-surface-1/50 border border-stroke/30">
                        <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Hard Skills</span>
                            <span className="text-sm font-bold text-text-0 font-mono">{masterScore.hardSkills.toFixed(1)}/10</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-sm bg-surface-1/50 border border-stroke/30">
                        <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Soft Skills</span>
                            <span className="text-sm font-bold text-text-0 font-mono">{masterScore.softSkills.toFixed(1)}/10</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-sm bg-surface-1/50 border border-stroke/30">
                        <Zap className="w-4 h-4 text-amber shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Builder Skills</span>
                            <span className="text-sm font-bold text-text-0 font-mono">{masterScore.builderSkills.toFixed(1)}/10</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col gap-8 relative z-10">
                {/* Radar Chart — 6 dimensions */}
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
                                name="CURISM Score"
                                dataKey="A"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#radarGradient)"
                                fillOpacity={1}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Score Explanations Grid — 6 CURISM dimensions */}
                {curismDescriptions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-stroke/30">
                        {descriptionData.map((item) => (
                            <div key={item.key} className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-text-0">{item.label}</span>
                                    <span className={`text-xs font-mono font-bold ${item.score >= 8 ? 'text-emerald'
                                            : item.score >= 5 ? 'text-amber'
                                                : 'text-rose'
                                        }`}>
                                        {item.score.toFixed(1)}/10
                                    </span>
                                    <span className="text-[9px] uppercase tracking-widest text-text-3 font-mono ml-auto">
                                        {item.category}
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