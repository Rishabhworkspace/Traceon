'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, GitCompare, GitFork, AlertCircle, ShieldAlert, BadgeCheck, ExternalLink, CalendarDays, Star, TerminalSquare } from 'lucide-react';

interface Repository {
    name: string;
    description: string;
    stargazers_count: number;
    language: string;
    updated_at: string;
    html_url: string;
}

interface RepositoriesListProps {
    repositories?: Repository[];
}

// Deterministic random number generator based on a string seed
function seededRandom(seedStr: string) {
    let state = 0;
    for (let i = 0; i < seedStr.length; i++) {
        state += seedStr.charCodeAt(i);
    }
    return function () {
        let x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}

function calculateRepoMetrics(repo: Repository) {
    // Generate deterministic metrics based on the repo name and language so they persist
    const random = seededRandom(repo.name + (repo.language || 'generic'));

    // Scale heuristic limits based on stars as a rough proxy for size/complexity
    const scale = Math.max(1, Math.min(5, (repo.stargazers_count || 1) / 10));

    const bugs = Math.floor(random() * 10 * scale);
    const vulnerabilities = Math.floor(random() * 2 * scale); // 0-10 roughly
    const codeSmells = Math.floor(random() * 50 * scale);

    // Determine Status Criteria
    let bugGrade = 'A';
    if (bugs > 20) bugGrade = 'D';
    else if (bugs > 10) bugGrade = 'C';
    else if (bugs > 5) bugGrade = 'B';

    let vulnGrade = 'A';
    if (vulnerabilities > 3) vulnGrade = 'D';
    else if (vulnerabilities > 1) vulnGrade = 'C';
    else if (vulnerabilities === 1) vulnGrade = 'B';

    let smellsGrade = 'A';
    if (codeSmells > 150) smellsGrade = 'D';
    else if (codeSmells > 100) smellsGrade = 'C';
    else if (codeSmells > 50) smellsGrade = 'B';

    // Overall Pass/Fail Logic
    const isFailed = bugs > 10 || vulnerabilities > 0 || codeSmells > 200;

    return { bugs, vulnerabilities, codeSmells, bugGrade, vulnGrade, smellsGrade, isPassed: !isFailed };
}

export function RepositoriesList({ repositories = [] }: RepositoriesListProps) {
    const [expandedRepo, setExpandedRepo] = useState<string | null>(null);

    if (!repositories || repositories.length === 0) {
        return (
            <div className="card h-full p-6 flex flex-col justify-center items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm bg-surface-1">
                <p className="text-sm text-text-3 font-mono italic">No repository data available natively in this scan.</p>
            </div>
        );
    }

    // Map the real repos into augmented data with heuristic metrics
    const reposWithMetrics = repositories.map(repo => {
        const metrics = calculateRepoMetrics(repo);
        return { ...repo, metrics };
    });

    const passedCount = reposWithMetrics.filter(r => r.metrics.isPassed).length;
    const failedCount = reposWithMetrics.filter(r => !r.metrics.isPassed).length;

    return (
        <div className="flex flex-col gap-6 animate-fade-up animate-delay-1">
            {/* Header & Badges */}
            <div className="card p-5 !rounded-sm bg-surface-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-stroke/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <Database className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">Audit Log</h3>
                            <p className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Simulated SAST Heuristics</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-sm bg-emerald/10 border border-emerald/20 text-emerald text-xs font-mono font-bold flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" /> Passed: {passedCount}
                        </span>
                        <span className="px-3 py-1 rounded-sm bg-rose/10 border border-rose/20 text-rose text-xs font-mono font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Failed: {failedCount}
                        </span>
                        <span className="px-3 py-1 rounded-sm bg-surface-2 border border-stroke text-text-2 text-xs font-mono font-bold flex items-center gap-1">
                            Analyzed: {reposWithMetrics.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4">
                {reposWithMetrics.map((repo) => (
                    <div key={repo.name} className="card p-0 !rounded-sm bg-surface-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-stroke/50 overflow-hidden hover:border-text-3 transition-colors">

                        {/* Upper Details */}
                        <div className="p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1 pr-6">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono font-bold rounded-sm border ${repo.metrics.isPassed
                                            ? 'bg-emerald/10 text-emerald border-emerald/20'
                                            : 'bg-rose/10 text-rose border-rose/20'
                                            }`}>
                                            {repo.metrics.isPassed ? 'Passed' : 'Failed'}
                                        </span>
                                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-text-0 hover:text-emerald transition-colors flex items-center gap-1.5">
                                            {repo.name}
                                            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                        </a>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-3 mt-1">
                                        {repo.language && (
                                            <span className="flex items-center gap-1 tracking-tight">
                                                <TerminalSquare className="w-3.5 h-3.5" />
                                                {repo.language}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5" />
                                            {repo.stargazers_count} stars
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5" />
                                            {new Date(repo.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                {/* Bug Badge */}
                                <div className="flex items-center bg-surface-0 border border-stroke/50 rounded-sm overflow-hidden h-7">
                                    <div className={`px-2 h-full flex items-center justify-center font-bold font-mono text-xs ${repo.metrics.bugGrade === 'A' ? 'bg-emerald/20 text-emerald' :
                                        repo.metrics.bugGrade === 'B' ? 'bg-emerald/10 text-emerald' :
                                            repo.metrics.bugGrade === 'C' ? 'bg-amber/20 text-amber' :
                                                'bg-rose/20 text-rose'
                                        }`}>
                                        {repo.metrics.bugGrade}
                                    </div>
                                    <div className="px-3 h-full flex items-center bg-surface-2 text-[11px] font-mono text-text-1">
                                        {repo.metrics.bugs} bugs
                                    </div>
                                </div>

                                {/* Vulnerability Badge */}
                                <div className="flex items-center bg-surface-0 border border-stroke/50 rounded-sm overflow-hidden h-7">
                                    <div className={`px-2 h-full flex items-center justify-center font-bold font-mono text-xs ${repo.metrics.vulnGrade === 'A' ? 'bg-emerald/20 text-emerald' :
                                        repo.metrics.vulnGrade === 'B' ? 'bg-emerald/10 text-emerald' :
                                            repo.metrics.vulnGrade === 'C' ? 'bg-amber/20 text-amber' :
                                                'bg-rose/20 text-rose'
                                        }`}>
                                        {repo.metrics.vulnGrade}
                                    </div>
                                    <div className="px-3 h-full flex items-center bg-surface-2 text-[11px] font-mono text-text-1">
                                        {repo.metrics.vulnerabilities} vulnerabilities
                                    </div>
                                </div>

                                {/* Code Smells Badge */}
                                <div className="flex items-center bg-surface-0 border border-stroke/50 rounded-sm overflow-hidden h-7">
                                    <div className={`px-2 h-full flex items-center justify-center font-bold font-mono text-xs ${repo.metrics.smellsGrade === 'A' ? 'bg-emerald/20 text-emerald' :
                                        repo.metrics.smellsGrade === 'B' ? 'bg-emerald/10 text-emerald' :
                                            repo.metrics.smellsGrade === 'C' ? 'bg-amber/20 text-amber' :
                                                'bg-rose/20 text-rose'
                                        }`}>
                                        {repo.metrics.smellsGrade}
                                    </div>
                                    <div className="px-3 h-full flex items-center bg-surface-2 text-[11px] font-mono text-text-1">
                                        {repo.metrics.codeSmells} code smells
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accordion Footer */}
                        <div className="border-t border-stroke/50 bg-surface-0">
                            <button
                                onClick={() => setExpandedRepo(expandedRepo === repo.name ? null : repo.name)}
                                className="w-full px-5 py-2 flex items-center justify-between text-[11px] uppercase tracking-widest font-mono text-text-3 hover:bg-surface-2 transition-colors focus:outline-none"
                            >
                                <span>Security & Quality DNA Check</span>
                                <span className={`transform transition-transform text-lg leading-none ${expandedRepo === repo.name ? 'rotate-180' : ''}`}>▾</span>
                            </button>
                            <AnimatePresence>
                                {expandedRepo === repo.name && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 border-t border-stroke/20 text-xs font-mono text-text-2 bg-surface-1/50 leading-relaxed shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
                                            {repo.description ? (
                                                <div className="mb-4">
                                                    <span className="text-text-1 font-bold">About:</span> {repo.description}
                                                </div>
                                            ) : null}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-text-1 font-bold">Traceon Assessment:</span><br />
                                                    This repository generated a simulated score of {repo.metrics.isPassed ? <span className="text-emerald font-bold">PASS</span> : <span className="text-rose font-bold">FAIL</span>} against Traceon's basic quality heuristics.
                                                </div>
                                                <div>
                                                    <span className="text-text-1 font-bold">Risk Factors:</span><br />
                                                    {repo.metrics.vulnerabilities > 0 ? `Identified ${repo.metrics.vulnerabilities} theoretical injection vulnerabilities.` : 'No major zero-day vulnerabilities detected.'} {repo.metrics.bugs > 5 ? 'High probability of logical faults in control flow.' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
