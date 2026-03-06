'use client';

import { useState } from 'react';
import { Box, Layout, Wrench, FileCode2, Settings, File, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const LEGEND_ITEMS = [
    { type: 'entry', label: 'Entry Point', color: '#f59e0b', Icon: Box },
    { type: 'component', label: 'Component', color: '#8b5cf6', Icon: Layout },
    { type: 'utility', label: 'Utility', color: '#06b6d4', Icon: Wrench },
    { type: 'module', label: 'Module', color: '#10b981', Icon: FileCode2 },
    { type: 'config', label: 'Config', color: '#f97316', Icon: Settings },
    { type: 'other', label: 'Other', color: '#64748b', Icon: File },
];

export default function GraphLegend() {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <div
            className="absolute bottom-5 left-16 z-30 rounded-xl p-3 space-y-1.5 transition-all w-fit"
            style={{
                background: 'rgba(13,13,13,0.9)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                minWidth: isMinimized ? 'auto' : '150px'
            }}
        >
            <div className={`flex items-center justify-between px-1 ${!isMinimized && 'mb-2'}`}>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Legend</div>
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-0.5 hover:bg-white/10 rounded-md transition-colors"
                >
                    {isMinimized ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
                </button>
            </div>
            {!isMinimized && (
                <>
                    {LEGEND_ITEMS.map(({ type, label, color, Icon }) => (
                        <div key={type} className="flex items-center gap-2 px-1">
                            <div
                                style={{
                                    background: `${color}15`,
                                    border: `1px solid ${color}35`,
                                    borderRadius: '4px',
                                    padding: '2px',
                                    display: 'flex',
                                }}
                            >
                                <Icon size={10} style={{ color }} />
                            </div>
                            <span className="text-[11px] text-gray-400">{label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 px-1 pt-1 border-t border-white/5 mt-1">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                            <div className="w-[8px] h-[8px] rounded-full bg-red-500" />
                        </div>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <AlertTriangle size={10} className="text-red-400" /> Critical Module
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
