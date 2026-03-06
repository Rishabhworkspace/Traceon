'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Flame, LayoutGrid, ArrowDown, ArrowRight, Circle, Waypoints } from 'lucide-react';

type LayoutMode = 'hierarchical' | 'horizontal' | 'radial' | 'force';

interface GraphToolbarProps {
    totalFiles: number;
    totalDeps: number;
    density: number;
    circularCount: number;
    onSearch: (query: string) => void;
    onFilterType: (type: string | null) => void;
    activeFilter: string | null;
    isHeatmap: boolean;
    onToggleHeatmap: (val: boolean) => void;
    layoutMode: LayoutMode;
    onLayoutChange: (mode: LayoutMode) => void;
}

const LAYOUT_OPTIONS: { id: LayoutMode; label: string; description: string; icon: typeof ArrowDown }[] = [
    { id: 'hierarchical', label: 'Hierarchical', description: 'Top-to-bottom tree', icon: ArrowDown },
    { id: 'horizontal', label: 'Horizontal Flow', description: 'Left-to-right flow', icon: ArrowRight },
    { id: 'radial', label: 'Radial', description: 'Concentric rings', icon: Circle },
    { id: 'force', label: 'Force-Directed', description: 'Organic clusters', icon: Waypoints },
];

const NODE_TYPES = ['entry', 'component', 'utility', 'module', 'config', 'other'];

const TYPE_COLORS: Record<string, string> = {
    entry: '#f59e0b',
    component: '#8b5cf6',
    utility: '#06b6d4',
    module: '#10b981',
    config: '#f97316',
    other: '#64748b',
};

export default function GraphToolbar({
    totalFiles,
    totalDeps,
    density,
    circularCount,
    onSearch,
    onFilterType,
    activeFilter,
    isHeatmap,
    onToggleHeatmap,
    layoutMode,
    onLayoutChange,
}: GraphToolbarProps) {
    const [searchText, setSearchText] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [layoutOpen, setLayoutOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => onSearch(searchText), 200);
        return () => clearTimeout(timer);
    }, [searchText, onSearch]);

    return (
        <div
            className="absolute top-5 left-1/2 -translate-x-1/2 z-30 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 max-w-[calc(100vw-8rem)]"
            style={{
                background: 'rgba(13,13,13,0.92)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
        >
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Metrics — hidden on very small screens */}
                <div className="hidden sm:flex items-center gap-3 sm:gap-4 pr-3 border-r border-white/5">
                    <div className="text-center">
                        <div className="text-sm font-bold text-white">{totalFiles}</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-500">Files</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-white">{totalDeps}</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-500">Deps</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-white">{density.toFixed(1)}</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-500">Density</div>
                    </div>
                    {circularCount > 0 && (
                        <div className="text-center">
                            <div className="text-sm font-bold text-red-400">{circularCount}</div>
                            <div className="text-[9px] uppercase tracking-wider text-red-500/60">Cycles</div>
                        </div>
                    )}
                </div>

                {/* Mobile compact metrics */}
                <div className="flex sm:hidden items-center gap-2 pr-2 border-r border-white/5">
                    <span className="text-[10px] font-mono text-gray-400">{totalFiles}F</span>
                    <span className="text-[10px] font-mono text-gray-400">{totalDeps}D</span>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                    <Search size={13} className="text-gray-500 flex-shrink-0" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search files..."
                        className="bg-transparent text-xs text-gray-300 outline-none w-[100px] sm:w-[140px] placeholder:text-gray-600"
                    />
                    {searchText && (
                        <button onClick={() => setSearchText('')} className="flex-shrink-0" aria-label="Clear search">
                            <X size={12} className="text-gray-500 hover:text-gray-300 transition-colors" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => onToggleHeatmap(!isHeatmap)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${isHeatmap
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]'
                        }`}
                    title="Toggle Complexity Heatmap"
                >
                    <Flame size={13} className={isHeatmap ? 'animate-pulse' : ''} />
                    <span className="hidden sm:inline">Heatmap</span>
                </button>

                {/* Graph View Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setLayoutOpen(!layoutOpen); setFilterOpen(false); }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${layoutOpen
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]'
                            }`}
                        title="Change Graph Layout"
                    >
                        <LayoutGrid size={13} />
                        <span className="hidden sm:inline">Graph View</span>
                        <ChevronDown size={10} className={`transition-transform duration-200 ${layoutOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {layoutOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setLayoutOpen(false)} />
                            <div
                                className="absolute top-full right-0 mt-1.5 rounded-xl py-1.5 min-w-[200px] z-50"
                                style={{
                                    background: 'rgba(13,13,13,0.97)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                                }}
                            >
                                <div className="px-3 py-1.5 mb-1 border-b border-white/5">
                                    <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Layout Mode</span>
                                </div>
                                {LAYOUT_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isActive = layoutMode === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => { onLayoutChange(opt.id); setLayoutOpen(false); }}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-white/5 ${isActive ? 'bg-emerald-500/10' : ''
                                                }`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${isActive
                                                    ? 'bg-emerald-500/20 border-emerald-500/30'
                                                    : 'bg-white/[0.03] border-white/[0.06]'
                                                }`}>
                                                <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                                            </div>
                                            <div>
                                                <div className={`text-[11px] font-medium ${isActive ? 'text-emerald-400' : 'text-gray-300'}`}>
                                                    {opt.label}
                                                </div>
                                                <div className="text-[9px] text-gray-500">{opt.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Filter — desktop inline */}
                <div className="hidden md:flex items-center gap-1 pl-2 border-l border-white/5">
                    <Filter size={12} className="text-gray-500 mr-1" />
                    {NODE_TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => onFilterType(activeFilter === t ? null : t)}
                            className="px-2 py-0.5 rounded text-[10px] font-medium transition-all hover:brightness-110"
                            aria-label={`Filter by ${t} type`}
                            aria-pressed={activeFilter === t}
                            style={{
                                background: activeFilter === t ? `${TYPE_COLORS[t]}20` : 'transparent',
                                color: activeFilter === t ? TYPE_COLORS[t] : '#6b7280',
                                border: `1px solid ${activeFilter === t ? `${TYPE_COLORS[t]}40` : 'transparent'}`,
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Filter — mobile dropdown */}
                <div className="relative md:hidden">
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
                        aria-label="Open filter menu"
                        aria-expanded={filterOpen}
                        style={{
                            background: activeFilter ? `${TYPE_COLORS[activeFilter]}15` : 'rgba(255,255,255,0.03)',
                            color: activeFilter ? TYPE_COLORS[activeFilter] : '#6b7280',
                            border: `1px solid ${activeFilter ? `${TYPE_COLORS[activeFilter]}30` : 'rgba(255,255,255,0.06)'}`,
                        }}
                    >
                        <Filter size={10} />
                        {activeFilter || 'Filter'}
                        <ChevronDown size={10} />
                    </button>
                    {filterOpen && (
                        <div
                            className="absolute top-full right-0 mt-1 rounded-lg py-1 min-w-[120px] animate-scale-in"
                            style={{
                                background: 'rgba(13,13,13,0.95)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            }}
                        >
                            <button
                                onClick={() => { onFilterType(null); setFilterOpen(false); }}
                                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                All types
                            </button>
                            {NODE_TYPES.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { onFilterType(t); setFilterOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors flex items-center gap-2"
                                    style={{ color: TYPE_COLORS[t] }}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[t] }} />
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
