'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Zap, ArrowRight, X } from 'lucide-react';

interface ImpactResult {
    targetNodeId: string;
    targetLabel: string;
    impactScore: number;
    riskLevel: 'low' | 'moderate' | 'critical';
    directDependents: string[];
    transitiveDependents: string[];
    totalAffected: number;
    affectedNodes: string[];
}

interface ImpactSummary {
    totalAnalyzed: number;
    critical: number;
    moderate: number;
    low: number;
}

interface ImpactPanelProps {
    repoId: string;
    selectedNodeId: string | null;
    onHighlightNodes: (nodeIds: string[]) => void;
    onClearHighlight: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

const RISK_CONFIG = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'Critical', icon: AlertTriangle },
    moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'Moderate', icon: Zap },
    low: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', label: 'Low', icon: Shield },
};

export default function ImpactPanel({
    repoId,
    selectedNodeId,
    onHighlightNodes,
    onClearHighlight,
    isOpen,
    onToggle,
}: ImpactPanelProps) {
    const [loading, setLoading] = useState(false);
    const [nodeImpact, setNodeImpact] = useState<ImpactResult | null>(null);
    const [fullReport, setFullReport] = useState<ImpactResult[]>([]);
    const [summary, setSummary] = useState<ImpactSummary | null>(null);
    const [showTransitive, setShowTransitive] = useState(false);
    const [activeTab, setActiveTab] = useState<'single' | 'report'>('single');

    // Fetch full report on mount
    const fetchFullReport = useCallback(async () => {
        try {
            const res = await fetch(`/api/impact/${repoId}`);
            const data = await res.json();
            if (data.success) {
                setFullReport(data.data.report);
                setSummary(data.data.summary);
            }
        } catch {
            console.error('Failed to fetch impact report');
        }
    }, [repoId]);

    useEffect(() => {
        if (!isOpen || fullReport.length > 0) return;
        let cancelled = false;

        (async () => {
            const result = await fetchFullReport();
            if (cancelled) return;
            // fetchFullReport already calls setState internally
            void result;
        })();

        return () => { cancelled = true; };
    }, [isOpen, fullReport.length, fetchFullReport]);

    // Fetch single node impact
    const fetchNodeImpact = useCallback(async (nodeId: string) => {
        setLoading(true);
        setActiveTab('single');
        try {
            const res = await fetch(`/api/impact/${repoId}?nodeId=${nodeId}`);
            const data = await res.json();
            if (data.success) {
                setNodeImpact(data.data);
            }
        } catch {
            console.error('Failed to fetch node impact');
        } finally {
            setLoading(false);
        }
    }, [repoId]);

    useEffect(() => {
        if (!selectedNodeId || !isOpen) {
            const id = requestAnimationFrame(() => setNodeImpact(null));
            return () => cancelAnimationFrame(id);
        }
        fetchNodeImpact(selectedNodeId);
    }, [selectedNodeId, isOpen, fetchNodeImpact]);

    if (!isOpen) {
        return null;
    }

    const riskConfig = nodeImpact ? RISK_CONFIG[nodeImpact.riskLevel] : null;

    return (
        <div
            className="absolute right-0 top-0 h-full w-[380px] z-40 overflow-y-auto"
            style={{
                background: 'linear-gradient(180deg, #0d0d0d 0%, #111111 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-500" />
                    <span className="text-sm font-semibold text-white">Impact Analysis</span>
                </div>
                <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
                    <X size={14} className="text-gray-400" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => setActiveTab('single')}
                    className="flex-1 text-xs font-medium py-2.5 transition-colors"
                    style={{
                        color: activeTab === 'single' ? '#f59e0b' : '#6b7280',
                        borderBottom: activeTab === 'single' ? '2px solid #f59e0b' : '2px solid transparent',
                    }}
                >
                    Selected File
                </button>
                <button
                    onClick={() => setActiveTab('report')}
                    className="flex-1 text-xs font-medium py-2.5 transition-colors"
                    style={{
                        color: activeTab === 'report' ? '#f59e0b' : '#6b7280',
                        borderBottom: activeTab === 'report' ? '2px solid #f59e0b' : '2px solid transparent',
                    }}
                >
                    Full Report
                </button>
            </div>

            <div className="p-4">
                {activeTab === 'single' ? (
                    <>
                        {!selectedNodeId && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Shield size={32} className="text-gray-600 mb-3" />
                                <p className="text-sm text-gray-500">Click a node on the graph to analyze its impact</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                            </div>
                        )}

                        {nodeImpact && riskConfig && !loading && (
                            <div className="space-y-4">
                                {/* Risk Badge */}
                                <div
                                    className="rounded-xl p-4"
                                    style={{ background: riskConfig.bg, border: `1px solid ${riskConfig.border}` }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <riskConfig.icon size={16} style={{ color: riskConfig.color }} />
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: riskConfig.color }}>
                                            {riskConfig.label} Risk
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {nodeImpact.impactScore.toFixed(1)}
                                        <span className="text-xs text-gray-500 font-normal ml-1">/ 100</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">
                                        Changing <span className="text-white font-medium">{nodeImpact.targetLabel}</span> would affect{' '}
                                        <span className="font-medium" style={{ color: riskConfig.color }}>
                                            {nodeImpact.totalAffected} files
                                        </span>
                                    </p>
                                </div>

                                {/* Impact Score Bar */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                                        <span>Impact Score</span>
                                        <span>{nodeImpact.impactScore.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${nodeImpact.impactScore}%`,
                                                background: `linear-gradient(90deg, ${riskConfig.color}80, ${riskConfig.color})`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-white">{nodeImpact.directDependents.length}</div>
                                        <div className="text-[10px] text-gray-500">Direct</div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-white">{nodeImpact.transitiveDependents.length}</div>
                                        <div className="text-[10px] text-gray-500">Transitive</div>
                                    </div>
                                </div>

                                {/* Highlight on graph */}
                                <button
                                    onClick={() => onHighlightNodes(nodeImpact.affectedNodes)}
                                    className="w-full text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:brightness-110"
                                    style={{
                                        background: `${riskConfig.color}15`,
                                        color: riskConfig.color,
                                        border: `1px solid ${riskConfig.color}30`,
                                    }}
                                >
                                    <Zap size={12} />
                                    Highlight Affected on Graph
                                </button>

                                <button
                                    onClick={onClearHighlight}
                                    className="w-full text-xs text-gray-500 py-1.5 hover:text-gray-300 transition-colors"
                                >
                                    Clear Highlight
                                </button>

                                {/* Direct Dependents */}
                                {nodeImpact.directDependents.length > 0 && (
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1.5">
                                            Direct Dependents ({nodeImpact.directDependents.length})
                                        </div>
                                        <div className="space-y-1 max-h-[120px] overflow-y-auto">
                                            {nodeImpact.directDependents.map((id) => (
                                                <div
                                                    key={id}
                                                    className="text-[11px] font-mono text-emerald-400/80 px-2.5 py-1.5 rounded bg-white/[0.02] border border-white/[0.03] flex items-center gap-1.5 truncate"
                                                >
                                                    <ArrowRight size={10} className="text-gray-600 flex-shrink-0" />
                                                    <span className="truncate">{id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transitive toggle */}
                                {nodeImpact.transitiveDependents.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => setShowTransitive(!showTransitive)}
                                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1.5 hover:text-gray-300 transition-colors"
                                        >
                                            {showTransitive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            Transitive ({nodeImpact.transitiveDependents.length})
                                        </button>
                                        {showTransitive && (
                                            <div className="space-y-1 max-h-[120px] overflow-y-auto">
                                                {nodeImpact.transitiveDependents.map((id) => (
                                                    <div
                                                        key={id}
                                                        className="text-[11px] font-mono text-amber-400/60 px-2.5 py-1.5 rounded bg-white/[0.02] border border-white/[0.03] truncate"
                                                    >
                                                        {id}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Full Report Tab */
                    <div className="space-y-4">
                        {/* Summary Cards */}
                        {summary && (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div className="text-lg font-bold text-red-400">{summary.critical}</div>
                                    <div className="text-[9px] uppercase text-red-500/60">Critical</div>
                                </div>
                                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                    <div className="text-lg font-bold text-amber-400">{summary.moderate}</div>
                                    <div className="text-[9px] uppercase text-amber-500/60">Moderate</div>
                                </div>
                                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                    <div className="text-lg font-bold text-emerald-400">{summary.low}</div>
                                    <div className="text-[9px] uppercase text-emerald-500/60">Low</div>
                                </div>
                            </div>
                        )}

                        {/* Report List */}
                        <div className="space-y-1.5">
                            {fullReport.map((item) => {
                                const cfg = RISK_CONFIG[item.riskLevel];
                                const RiskIcon = cfg.icon;
                                return (
                                    <button
                                        key={item.targetNodeId}
                                        onClick={() => onHighlightNodes(item.affectedNodes)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all hover:bg-white/[0.03]"
                                        style={{ border: '1px solid rgba(255,255,255,0.03)' }}
                                    >
                                        <div
                                            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
                                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                                        >
                                            <RiskIcon size={10} style={{ color: cfg.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-white font-medium truncate">{item.targetLabel}</div>
                                            <div className="text-[10px] text-gray-500">
                                                {item.totalAffected} affected · Score: {item.impactScore.toFixed(1)}
                                            </div>
                                        </div>
                                        <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                            style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                            {item.impactScore.toFixed(0)}
                                        </span>
                                    </button>
                                );
                            })}

                            {fullReport.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">Loading report...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
