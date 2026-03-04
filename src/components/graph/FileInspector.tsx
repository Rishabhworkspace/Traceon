'use client';

import { X, FileCode2, ArrowDownLeft, ArrowUpRight, Layers, AlertTriangle } from 'lucide-react';

interface FileInspectorProps {
    node: {
        id: string;
        label: string;
        type: string;
        path: string;
        imports: string[];
        exports: string[];
        loc: number;
        inDegree: number;
        outDegree: number;
    } | null;
    isCritical: boolean;
    onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    entry: 'Entry Point',
    component: 'Component',
    utility: 'Utility',
    module: 'Module',
    config: 'Configuration',
    other: 'Other',
};

const TYPE_COLORS: Record<string, string> = {
    entry: '#f59e0b',
    component: '#8b5cf6',
    utility: '#06b6d4',
    module: '#10b981',
    config: '#f97316',
    other: '#64748b',
};

export default function FileInspector({ node, isCritical, onClose }: FileInspectorProps) {
    if (!node) return null;

    const color = TYPE_COLORS[node.type] || TYPE_COLORS.other;

    return (
        <div
            className="fixed right-0 top-0 h-full w-[380px] z-50 overflow-y-auto"
            style={{
                background: 'linear-gradient(180deg, #0d0d0d 0%, #111111 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                    <FileCode2 size={16} style={{ color }} />
                    <span className="text-sm font-semibold text-white truncate max-w-[260px]">{node.label}</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    title="Close Details"
                >
                    <X size={16} className="text-gray-300 hover:text-white transition-colors" />
                </button>
            </div>

            <div className="p-4 space-y-5">
                {/* Type Badge */}
                <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Type</span>
                    <div className="mt-1.5 flex items-center gap-2">
                        <span
                            className="text-xs font-medium px-2.5 py-1 rounded-md"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                        >
                            {TYPE_LABELS[node.type] || 'Module'}
                        </span>
                        {isCritical && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Critical
                            </span>
                        )}
                    </div>
                </div>

                {/* File Path */}
                <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Path</span>
                    <p className="mt-1 text-xs font-mono text-gray-300 bg-white/[0.03] px-3 py-2 rounded-md border border-white/[0.04] break-all">
                        {node.path}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 text-center">
                        <Layers size={14} className="mx-auto mb-1 text-gray-500" />
                        <div className="text-lg font-bold text-white">{node.loc}</div>
                        <div className="text-[10px] text-gray-500">Lines</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 text-center">
                        <ArrowDownLeft size={14} className="mx-auto mb-1 text-emerald-500" />
                        <div className="text-lg font-bold text-white">{node.inDegree}</div>
                        <div className="text-[10px] text-gray-500">In</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 text-center">
                        <ArrowUpRight size={14} className="mx-auto mb-1 text-amber-500" />
                        <div className="text-lg font-bold text-white">{node.outDegree}</div>
                        <div className="text-[10px] text-gray-500">Out</div>
                    </div>
                </div>

                {/* Imports */}
                {node.imports.length > 0 && (
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                            Imports ({node.imports.length})
                        </span>
                        <div className="mt-1.5 space-y-1 max-h-[160px] overflow-y-auto">
                            {node.imports.map((imp, i) => (
                                <div
                                    key={i}
                                    className="text-[11px] font-mono text-gray-400 px-2.5 py-1.5 rounded bg-white/[0.02] border border-white/[0.03] truncate"
                                    title={imp}
                                >
                                    {imp}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exports */}
                {node.exports.length > 0 && (
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                            Exports ({node.exports.length})
                        </span>
                        <div className="mt-1.5 space-y-1 max-h-[160px] overflow-y-auto">
                            {node.exports.map((exp, i) => (
                                <div
                                    key={i}
                                    className="text-[11px] font-mono text-cyan-400/80 px-2.5 py-1.5 rounded bg-white/[0.02] border border-white/[0.03] truncate"
                                    title={exp}
                                >
                                    {exp}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
