'use client';

import { useState, useMemo } from 'react';
import { Package, X, ArrowRight, AlertTriangle, CheckCircle2, Boxes, Link2 } from 'lucide-react';

interface WorkspacePackage {
    name: string;
    path: string;
    version?: string;
    dependencies: string[];
}

interface WorkspaceInfo {
    type: string;
    packages: WorkspacePackage[];
    rootName?: string;
}

interface CrossPackageDep {
    source: string;
    target: string;
    edgeCount: number;
}

interface BoundaryViolation {
    from: string;
    to: string;
    rule: string;
    files: string[];
}

interface WorkspacePanelProps {
    workspaceInfo: WorkspaceInfo | null;
    nodes: Array<{ id: string; path: string; packageName?: string }>;
    edges: Array<{ source: string; target: string }>;
    isOpen: boolean;
    onToggle: () => void;
    onFilterPackage?: (packageName: string | null) => void;
}

const WORKSPACE_COLORS: Record<string, string> = {
    turborepo: '#ef4444',
    nx: '#143055',
    lerna: '#9333ea',
    pnpm: '#f69220',
    npm: '#cb3837',
    yarn: '#2c8ebb',
};

const PACKAGE_PALETTE = [
    '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function WorkspacePanel({
    workspaceInfo,
    nodes,
    edges,
    isOpen,
    onToggle,
    onFilterPackage,
}: WorkspacePanelProps) {
    const [activeTab, setActiveTab] = useState<'packages' | 'deps' | 'violations'>('packages');
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    // Calculate cross-package dependencies
    const crossDeps = useMemo(() => {
        if (!workspaceInfo || workspaceInfo.packages.length === 0) return [];

        const nodePackageMap = new Map<string, string>();
        for (const node of nodes) {
            if (node.packageName) nodePackageMap.set(node.id, node.packageName);
        }

        const depMatrix = new Map<string, number>();
        for (const edge of edges) {
            const srcPkg = nodePackageMap.get(edge.source);
            const tgtPkg = nodePackageMap.get(edge.target);
            if (srcPkg && tgtPkg && srcPkg !== tgtPkg) {
                const key = `${srcPkg}→${tgtPkg}`;
                depMatrix.set(key, (depMatrix.get(key) || 0) + 1);
            }
        }

        const result: CrossPackageDep[] = [];
        for (const [key, count] of depMatrix) {
            const [source, target] = key.split('→');
            result.push({ source, target, edgeCount: count });
        }
        return result.sort((a, b) => b.edgeCount - a.edgeCount);
    }, [workspaceInfo, nodes, edges]);

    // Detect boundary violations
    const violations = useMemo(() => {
        if (!workspaceInfo || workspaceInfo.packages.length === 0) return [];

        const results: BoundaryViolation[] = [];
        const nodePackageMap = new Map<string, string>();
        for (const node of nodes) {
            if (node.packageName) nodePackageMap.set(node.id, node.packageName);
        }

        // Rule: packages named "backend"/"server"/"api" should not be imported by "frontend"/"client"/"web"/"ui"
        const backendPkgs = new Set(workspaceInfo.packages
            .filter(p => /\b(backend|server|api)\b/i.test(p.name))
            .map(p => p.name));

        const frontendPkgs = new Set(workspaceInfo.packages
            .filter(p => /\b(frontend|client|web|ui|app)\b/i.test(p.name))
            .map(p => p.name));

        if (backendPkgs.size > 0 && frontendPkgs.size > 0) {
            for (const edge of edges) {
                const srcPkg = nodePackageMap.get(edge.source);
                const tgtPkg = nodePackageMap.get(edge.target);
                // Backend importing from frontend = violation
                if (srcPkg && tgtPkg && backendPkgs.has(srcPkg) && frontendPkgs.has(tgtPkg)) {
                    const existing = results.find(r => r.from === srcPkg && r.to === tgtPkg);
                    if (existing) {
                        existing.files.push(edge.source);
                    } else {
                        results.push({
                            from: srcPkg,
                            to: tgtPkg,
                            rule: 'Backend should not import from frontend packages',
                            files: [edge.source],
                        });
                    }
                }
            }
        }

        return results;
    }, [workspaceInfo, nodes, edges]);

    // Package stats
    const packageStats = useMemo(() => {
        if (!workspaceInfo) return [];
        return workspaceInfo.packages.map((pkg, idx) => {
            const pkgNodes = nodes.filter(n => n.packageName === pkg.name);
            return {
                ...pkg,
                fileCount: pkgNodes.length,
                color: PACKAGE_PALETTE[idx % PACKAGE_PALETTE.length],
            };
        });
    }, [workspaceInfo, nodes]);

    if (!isOpen || !workspaceInfo || workspaceInfo.type === 'none') return null;

    const wsColor = WORKSPACE_COLORS[workspaceInfo.type] || '#64748b';

    return (
        <div className="absolute top-16 left-5 z-40 w-[420px] max-h-[calc(100vh-8rem)] flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${wsColor}, ${wsColor}cc)` }}
                    >
                        <Boxes size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">Workspace</span>
                        <span className="text-[9px] font-mono mt-0.5" style={{ color: wsColor }}>
                            {workspaceInfo.type} · {workspaceInfo.packages.length} packages
                        </span>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 px-3 border-b border-white/5">
                {(['packages', 'deps', 'violations'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === tab
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab === 'packages' && `Packages (${packageStats.length})`}
                        {tab === 'deps' && `Cross-Deps (${crossDeps.length})`}
                        {tab === 'violations' && (
                            <span className="flex items-center justify-center gap-1">
                                Rules
                                {violations.length > 0 && (
                                    <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[9px] flex items-center justify-center">
                                        {violations.length}
                                    </span>
                                )}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">

                {/* Packages Tab */}
                {activeTab === 'packages' && packageStats.map((pkg, i) => (
                    <button
                        key={pkg.name}
                        onClick={() => {
                            const next = selectedPackage === pkg.name ? null : pkg.name;
                            setSelectedPackage(next);
                            onFilterPackage?.(next);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${selectedPackage === pkg.name
                                ? 'border-white/20 bg-white/[0.04]'
                                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ background: pkg.color }}
                                />
                                <span className="text-xs font-semibold text-white truncate max-w-[220px]">
                                    {pkg.name}
                                </span>
                            </div>
                            {pkg.version && (
                                <span className="text-[9px] text-gray-600 font-mono">{pkg.version}</span>
                            )}
                        </div>
                        <code className="text-[9px] text-gray-500 font-mono block truncate">{pkg.path}</code>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                            <span>{pkg.fileCount} files</span>
                            <span>{pkg.dependencies.length} internal deps</span>
                        </div>
                        {pkg.dependencies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {pkg.dependencies.map(dep => (
                                    <span
                                        key={dep}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono"
                                    >
                                        → {dep}
                                    </span>
                                ))}
                            </div>
                        )}
                    </button>
                ))}

                {/* Cross-Deps Tab */}
                {activeTab === 'deps' && (
                    <>
                        {crossDeps.length === 0 ? (
                            <div className="text-center py-8 text-xs text-gray-500">
                                <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-500" />
                                No cross-package imports detected.<br />
                                Packages are well isolated.
                            </div>
                        ) : (
                            crossDeps.map((dep, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                                        <code className="px-1.5 py-0.5 bg-white/5 rounded text-gray-300 font-mono truncate max-w-[140px]" title={dep.source}>
                                            {dep.source.split('/').pop() || dep.source}
                                        </code>
                                        <ArrowRight size={10} className="text-gray-600 shrink-0" />
                                        <code className="px-1.5 py-0.5 bg-white/5 rounded text-gray-300 font-mono truncate max-w-[140px]" title={dep.target}>
                                            {dep.target.split('/').pop() || dep.target}
                                        </code>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Link2 size={10} />
                                        {dep.edgeCount} import{dep.edgeCount !== 1 ? 's' : ''} crossing the boundary
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {/* Violations Tab */}
                {activeTab === 'violations' && (
                    <>
                        {violations.length === 0 ? (
                            <div className="text-center py-8 text-xs text-gray-500">
                                <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-500" />
                                No boundary violations detected.<br />
                                Architecture rules are being followed.
                            </div>
                        ) : (
                            violations.map((v, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-lg bg-red-500/[0.04] border border-red-500/20 hover:border-red-500/30 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <AlertTriangle size={12} className="text-red-400 shrink-0" />
                                        <span className="text-[11px] font-medium text-red-300">Boundary Violation</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-[11px]">
                                        <code className="px-1.5 py-0.5 bg-white/5 rounded text-gray-300 font-mono">
                                            {v.from}
                                        </code>
                                        <ArrowRight size={10} className="text-red-500 shrink-0" />
                                        <code className="px-1.5 py-0.5 bg-white/5 rounded text-gray-300 font-mono">
                                            {v.to}
                                        </code>
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">{v.rule}</p>
                                    <p className="text-[9px] text-gray-600 mt-1 font-mono">
                                        {v.files.length} file{v.files.length !== 1 ? 's' : ''} affected
                                    </p>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
