'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    FileCode2, GitBranch, Layers, AlertTriangle, RefreshCw,
    TrendingUp, PieChart, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface OverviewData {
    totalRepos: number;
    completedRepos: number;
    totalFiles: number;
    totalDependencies: number;
    totalLOC: number;
    totalCriticalModules: number;
    totalCircularDeps: number;
    avgDensity: number;
}

interface RepoItem {
    id: string;
    name: string;
    status: string;
    fileCount: number;
    createdAt: string;
    hasAnalysis: boolean;
    metrics: {
        totalFiles: number;
        totalDependencies: number;
        dependencyDensity: number;
        criticalCount: number;
        circularCount: number;
    } | null;
}

interface DashboardData {
    overview: OverviewData;
    fileTypeDistribution: Record<string, number>;
    criticalModules: string[];
    recentRepos: RepoItem[];
}

const STAT_CARDS = [
    { key: 'totalRepos', label: 'Repositories', icon: GitBranch, color: '#8b5cf6' },
    { key: 'totalFiles', label: 'Files Analyzed', icon: FileCode2, color: '#10b981' },
    { key: 'totalDependencies', label: 'Dependencies', icon: Layers, color: '#06b6d4' },
    { key: 'totalLOC', label: 'Lines of Code', icon: TrendingUp, color: '#f59e0b' },
    { key: 'totalCriticalModules', label: 'Critical Modules', icon: AlertTriangle, color: '#ef4444' },
    { key: 'totalCircularDeps', label: 'Circular Deps', icon: RefreshCw, color: '#f97316' },
];

const FILE_TYPE_COLORS: Record<string, string> = {
    ts: '#3178c6', tsx: '#3178c6', js: '#f7df1e', jsx: '#f7df1e',
    json: '#6b7280', md: '#083fa1', css: '#264de4', html: '#e34f26',
    none: '#94a3b8',
};

function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

export default function DashboardMetrics() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                setError(json.message || 'Failed to load dashboard');
            }
        } catch {
            setError('Failed to connect');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-emerald animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-400 mb-2">{error || 'No data'}</p>
                <button onClick={fetchData} className="text-xs text-text-3 hover:text-text-0 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    const { overview, fileTypeDistribution, criticalModules, recentRepos } = data;

    // File type chart data
    const fileTypeEntries = Object.entries(fileTypeDistribution).sort((a, b) => b[1] - a[1]);
    const totalFileTypes = fileTypeEntries.reduce((sum, [, v]) => sum + v, 0);

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
                    <div
                        key={key}
                        className="rounded-xl p-4 transition-all hover:scale-[1.02]"
                        style={{
                            background: `${color}06`,
                            border: `1px solid ${color}15`,
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                            >
                                <Icon size={13} style={{ color }} />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-text-0">
                            {formatNumber((overview as unknown as Record<string, number>)[key] || 0)}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-text-3 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {/* File Type Distribution */}
                <div className="card p-5 border-stroke">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart size={14} className="text-cyan-500" />
                        <h3 className="text-sm font-semibold text-text-0">File Types</h3>
                    </div>
                    {fileTypeEntries.length > 0 ? (
                        <div className="space-y-2.5">
                            {fileTypeEntries.slice(0, 8).map(([ext, count]) => {
                                const pct = totalFileTypes > 0 ? (count / totalFileTypes) * 100 : 0;
                                const barColor = FILE_TYPE_COLORS[ext] || '#64748b';
                                return (
                                    <div key={ext}>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="font-mono text-text-1">.{ext}</span>
                                            <span className="text-text-3">{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, background: barColor }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-text-3">No file data yet</p>
                    )}
                </div>

                {/* Critical Modules */}
                <div className="card p-5 border-stroke">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} className="text-red-500" />
                        <h3 className="text-sm font-semibold text-text-0">Critical Modules</h3>
                    </div>
                    {criticalModules.length > 0 ? (
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                            {criticalModules.map((mod, i) => (
                                <div
                                    key={i}
                                    className="text-[11px] font-mono text-red-400/80 px-2.5 py-1.5 rounded bg-red-500/[0.04] border border-red-500/10 truncate"
                                    title={mod}
                                >
                                    {mod}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-text-3">No critical modules detected</p>
                    )}
                </div>

                {/* Density Gauge */}
                <div className="card p-5 border-stroke">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-amber-500" />
                        <h3 className="text-sm font-semibold text-text-0">Avg Density</h3>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <div className="relative w-28 h-28">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke={overview.avgDensity > 3 ? '#ef4444' : overview.avgDensity > 1.5 ? '#f59e0b' : '#10b981'}
                                    strokeWidth="8"
                                    strokeDasharray={`${Math.min(overview.avgDensity * 25, 251)} 251`}
                                    strokeLinecap="round"
                                    className="transition-all duration-700"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-text-0">{overview.avgDensity.toFixed(1)}</span>
                                <span className="text-[9px] uppercase text-text-3">deps/file</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-text-3 text-center mt-1">
                        {overview.avgDensity > 3 ? 'High coupling detected' : overview.avgDensity > 1.5 ? 'Moderate coupling' : 'Low coupling — Good!'}
                    </p>
                </div>
            </div>

            {/* Recent Repos */}
            <div className="card p-5 border-stroke">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-text-0">Recent Analyses</h3>
                    <Link href="/" className="text-[10px] uppercase tracking-wider text-emerald hover:text-emerald/80 transition-colors flex items-center gap-1">
                        New Analysis <ArrowRight size={10} />
                    </Link>
                </div>
                {recentRepos.length > 0 ? (
                    <div className="space-y-2">
                        {recentRepos.map((repo) => (
                            <div
                                key={repo.id}
                                className="flex items-center justify-between px-4 py-3 rounded-xl border border-stroke bg-surface-1 hover:bg-surface-2 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-medium text-text-0 font-mono truncate">{repo.name}</h4>
                                    <div className="flex items-center gap-3 text-[10px] font-mono text-text-3 mt-1">
                                        <span>
                                            Status:&nbsp;
                                            <span className={
                                                repo.status === 'complete' ? 'text-emerald' :
                                                    repo.status === 'failed' ? 'text-red-400' : 'text-amber'
                                            }>
                                                {repo.status}
                                            </span>
                                        </span>
                                        <span>•</span>
                                        <span>{repo.fileCount} files</span>
                                        {repo.metrics && (
                                            <>
                                                <span>•</span>
                                                <span>{repo.metrics.totalDependencies} deps</span>
                                                {repo.metrics.criticalCount > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-red-400">{repo.metrics.criticalCount} critical</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                {repo.status === 'complete' && repo.hasAnalysis ? (
                                    <Link
                                        href={`/graph/${repo.id}`}
                                        className="px-3 py-1.5 rounded-md border border-emerald/20 bg-emerald/5 hover:bg-emerald/10 transition-colors text-xs font-mono text-emerald flex-shrink-0"
                                    >
                                        View Graph
                                    </Link>
                                ) : (
                                    <span className="text-[10px] font-mono text-text-3 flex-shrink-0">
                                        {repo.status === 'failed' ? 'Failed' : 'Pending'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-xs text-text-3">No analyses yet. Start your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
