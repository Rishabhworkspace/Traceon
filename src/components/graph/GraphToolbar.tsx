'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface GraphToolbarProps {
    totalFiles: number;
    totalDeps: number;
    density: number;
    circularCount: number;
    onSearch: (query: string) => void;
    onFilterType: (type: string | null) => void;
    activeFilter: string | null;
}

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
}: GraphToolbarProps) {
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => onSearch(searchText), 200);
        return () => clearTimeout(timer);
    }, [searchText, onSearch]);

    return (
        <div
            className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-xl px-4 py-2.5"
            style={{
                background: 'rgba(13,13,13,0.9)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Metrics */}
            <div className="flex items-center gap-4 pr-3 border-r border-white/5">
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

            {/* Search */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                <Search size={13} className="text-gray-500" />
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search files..."
                    className="bg-transparent text-xs text-gray-300 outline-none w-[120px] placeholder:text-gray-600"
                />
                {searchText && (
                    <button onClick={() => setSearchText('')}>
                        <X size={12} className="text-gray-500" />
                    </button>
                )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 pl-2 border-l border-white/5">
                <Filter size={12} className="text-gray-500 mr-1" />
                {NODE_TYPES.map((t) => (
                    <button
                        key={t}
                        onClick={() => onFilterType(activeFilter === t ? null : t)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium transition-all"
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
        </div>
    );
}
