'use client';

import { useState, useEffect } from 'react';
import { Wrench, X, Loader2, AlertTriangle, AlertCircle, ArrowRight, TrendingUp, Link2 } from 'lucide-react';

interface GodObject {
    nodeId: string;
    label: string;
    path: string;
    nodeType: string;
    inDegree: number;
    outDegree: number;
    totalDegree: number;
    loc: number;
    severity: 'warning' | 'critical';
    reason: string;
    suggestion: string;
    dependents: string[];
    dependencies: string[];
}

interface CouplingPair {
    source: string;
    target: string;
    sharedDeps: number;
}

interface RefactorData {
    godObjects: GodObject[];
    highCouplingPairs: CouplingPair[];
    totalIssues: number;
    healthScore: number;
}

interface RefactoringPanelProps {
    repoId: string;
    isOpen: boolean;
    onToggle: () => void;
    onHighlightNode?: (nodeId: string) => void;
}

export default function RefactoringPanel({ repoId, isOpen, onToggle, onHighlightNode }: RefactoringPanelProps) {
    const [data, setData] = useState<RefactorData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'gods' | 'coupling'>('gods');

    useEffect(() => {
        if (!isOpen || data) return;
        setLoading(true);
        setError(null);

        fetch(`/api/refactor/${repoId}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.message || 'Failed to analyze');
                }
            })
            .catch(() => setError('Network error'))
            .finally(() => setLoading(false));
    }, [isOpen, repoId, data]);

    if (!isOpen) return null;

    const healthColor = !data ? 'text-gray-500' :
        data.healthScore >= 80 ? 'text-emerald-400' :
            data.healthScore >= 50 ? 'text-amber-400' :
                'text-red-400';

    const healthBg = !data ? 'rgba(100,116,139,0.1)' :
        data.healthScore >= 80 ? 'rgba(16,185,129,0.08)' :
            data.healthScore >= 50 ? 'rgba(245,158,11,0.08)' :
                'rgba(239,68,68,0.08)';

    return (
        <div className="absolute top-16 left-5 z-40 w-[420px] max-h-[calc(100vh-8rem)] flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.3)]">
                        <Wrench size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">Refactoring Suggestions</span>
                        <span className="text-[9px] text-orange-400/80 font-mono mt-0.5">Code health analysis</span>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={24} className="text-orange-400 animate-spin" />
                        <p className="text-xs text-gray-500 font-mono">Detecting code smells...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            {error}
                        </div>
                    </div>
                )}

                {data && (
                    <div className="p-4 space-y-4">
                        {/* Health Score Card */}
                        <div
                            className="p-4 rounded-xl border border-white/5"
                            style={{ background: healthBg }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Codebase Health</span>
                                <span className={`text-2xl font-black ${healthColor}`}>
                                    {data.healthScore}
                                    <span className="text-xs font-normal text-gray-500">/100</span>
                                </span>
                            </div>
                            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${data.healthScore}%`,
                                        background: data.healthScore >= 80
                                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                                            : data.healthScore >= 50
                                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                : 'linear-gradient(90deg, #ef4444, #f87171)'
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                    <AlertCircle size={10} className="text-red-400" />
                                    {data.godObjects.filter(g => g.severity === 'critical').length} critical
                                </span>
                                <span className="flex items-center gap-1">
                                    <AlertTriangle size={10} className="text-amber-400" />
                                    {data.godObjects.filter(g => g.severity === 'warning').length} warnings
                                </span>
                                <span className="flex items-center gap-1">
                                    <Link2 size={10} className="text-blue-400" />
                                    {data.highCouplingPairs.length} coupling issues
                                </span>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                            <button
                                onClick={() => setActiveTab('gods')}
                                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'gods'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                God Objects ({data.godObjects.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('coupling')}
                                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'coupling'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                High Coupling ({data.highCouplingPairs.length})
                            </button>
                        </div>

                        {/* God Objects */}
                        {activeTab === 'gods' && (
                            <div className="space-y-2">
                                {data.godObjects.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-gray-500">
                                        ✅ No God Objects detected. Great modularization!
                                    </div>
                                ) : (
                                    data.godObjects.map((god) => (
                                        <GodObjectCard
                                            key={god.nodeId}
                                            god={god}
                                            isExpanded={expandedId === god.nodeId}
                                            onToggle={() => setExpandedId(expandedId === god.nodeId ? null : god.nodeId)}
                                            onLocate={() => onHighlightNode?.(god.nodeId)}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* High Coupling Pairs */}
                        {activeTab === 'coupling' && (
                            <div className="space-y-2">
                                {data.highCouplingPairs.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-gray-500">
                                        ✅ No significant coupling detected.
                                    </div>
                                ) : (
                                    data.highCouplingPairs.map((pair, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Link2 size={12} className="text-blue-400 shrink-0" />
                                                <span className="text-[10px] text-blue-300 font-mono">{pair.sharedDeps} shared dependencies</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <code className="px-1.5 py-0.5 bg-white/5 rounded text-gray-300 font-mono truncate max-w-[150px]" title={pair.source}>
                                                    {pair.source.split('/').pop()}
                                                </code>
                                                <ArrowRight size={10} className="text-gray-600 shrink-0" />
                                                <code className="px-1.5 py-0.5 bg-white/5 rounded text-gray-300 font-mono truncate max-w-[150px]" title={pair.target}>
                                                    {pair.target.split('/').pop()}
                                                </code>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                                                Consider extracting shared logic into a dedicated module to reduce duplication.
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function GodObjectCard({
    god,
    isExpanded,
    onToggle,
    onLocate,
}: {
    god: GodObject;
    isExpanded: boolean;
    onToggle: () => void;
    onLocate: () => void;
}) {
    const severityConfig = {
        critical: {
            border: 'border-red-500/20 hover:border-red-500/40',
            badge: 'bg-red-500/15 text-red-400 border-red-500/30',
            icon: <AlertCircle size={12} className="text-red-400" />,
        },
        warning: {
            border: 'border-amber-500/20 hover:border-amber-500/40',
            badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            icon: <AlertTriangle size={12} className="text-amber-400" />,
        },
    };

    const config = severityConfig[god.severity];

    return (
        <div className={`rounded-xl bg-white/[0.02] border ${config.border} transition-all overflow-hidden`}>
            <button
                onClick={onToggle}
                className="w-full text-left p-3"
            >
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        {config.icon}
                        <span className="text-xs font-semibold text-white truncate max-w-[200px]">{god.label}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono ${config.badge}`}>
                        {god.severity}
                    </span>
                </div>
                <code className="text-[9px] text-gray-500 font-mono block truncate">{god.path}</code>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                    <span>{god.inDegree} in</span>
                    <span>{god.outDegree} out</span>
                    <span className="flex items-center gap-1">
                        <TrendingUp size={10} />
                        {god.totalDegree} total
                    </span>
                    <span>{god.loc} LOC</span>
                </div>
            </button>

            {isExpanded && (
                <div className="px-3 pb-3 space-y-2.5 border-t border-white/5 pt-2.5">
                    <div>
                        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Why it matters</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed mt-1">{god.reason}</p>
                    </div>
                    <div>
                        <span className="text-[9px] text-emerald-500 font-mono uppercase tracking-wider">Suggestion</span>
                        <p className="text-[11px] text-emerald-300/80 leading-relaxed mt-1">{god.suggestion}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onLocate(); }}
                        className="w-full mt-1 py-1.5 text-[10px] font-medium text-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors"
                    >
                        Locate in Graph →
                    </button>
                </div>
            )}
        </div>
    );
}
