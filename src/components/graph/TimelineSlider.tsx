'use client';

import { useMemo } from 'react';
import { Clock, GitCommit, Plus, Minus, ArrowLeftRight } from 'lucide-react';

interface CommitInfo {
    sha: string;
    message: string;
    date: string;
    author?: string;
}

interface DiffStats {
    nodesAdded: number;
    nodesRemoved: number;
    edgesAdded: number;
    edgesRemoved: number;
}

interface TimelineSliderProps {
    commits: CommitInfo[];
    selectedIndex: number;
    onChange: (index: number) => void;
    diffStats?: DiffStats | null;
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TimelineSlider({ commits, selectedIndex, onChange, diffStats }: TimelineSliderProps) {
    if (!commits || commits.length <= 1) return null;

    // Reverse for UI so oldest is on the left, newest on the right
    const uiCommits = useMemo(() => [...commits].reverse(), [commits]);
    const uiSelectedIndex = (commits.length - 1) - selectedIndex;

    const handleUiChange = (uiIdx: number) => {
        const realIdx = (commits.length - 1) - uiIdx;
        onChange(realIdx);
    };

    const isViewingHistory = selectedIndex > 0;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] px-6 py-4 min-w-[500px] max-w-[640px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Clock size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Time Travel</span>
                    {isViewingHistory && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                            Viewing History
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <GitCommit size={10} className="text-gray-500" />
                    <span className="text-[10px] text-gray-400 font-mono">
                        {commits[selectedIndex].sha.substring(0, 7)}
                    </span>
                </div>
            </div>

            {/* Timeline Track */}
            <div className="relative pt-2 pb-20">
                {/* Background track */}
                <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-white/[0.04] rounded-full" />
                {/* Progress fill */}
                <div
                    className="absolute top-3.5 left-0 h-[2px] bg-gradient-to-r from-emerald-500/40 to-emerald-500/70 rounded-full transition-all duration-500 pointer-events-none"
                    style={{ width: `${(uiSelectedIndex / Math.max(1, uiCommits.length - 1)) * 100}%` }}
                />

                <div className="relative flex justify-between">
                    {uiCommits.map((c, idx) => {
                        const isSelected = idx === uiSelectedIndex;
                        const isPast = idx <= uiSelectedIndex;
                        const isHead = idx === uiCommits.length - 1;

                        return (
                            <div
                                key={idx}
                                className="relative flex flex-col items-center group cursor-pointer"
                                onClick={() => handleUiChange(idx)}
                            >
                                {/* Dot */}
                                <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 z-10 ${isSelected
                                    ? 'bg-emerald-500 border-[#0d0d0d] scale-[1.35] shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                                    : isPast
                                        ? 'bg-emerald-500/50 border-transparent hover:bg-emerald-400/60'
                                        : 'bg-gray-700 border-transparent hover:bg-gray-500'
                                    }`} />

                                {/* Tooltip */}
                                <div className={`absolute top-7 whitespace-nowrap text-center transition-all duration-300 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
                                    }`}>
                                    <div className="text-[10px] font-bold text-white mb-0.5">
                                        {isHead ? 'Current' : formatRelativeDate(c.date)}
                                    </div>
                                    <div className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]" title={c.message}>
                                        {c.message}
                                    </div>
                                    {c.author && (
                                        <div className="text-[8px] text-gray-600 mt-0.5 truncate max-w-[120px]">
                                            by {c.author}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Diff Stats + Legend */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                {/* Diff stats (only when viewing history) */}
                {isViewingHistory && diffStats ? (
                    <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1 text-emerald-400">
                            <Plus size={9} /> {diffStats.nodesAdded} file{diffStats.nodesAdded !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                            <Minus size={9} /> {diffStats.nodesRemoved} file{diffStats.nodesRemoved !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-blue-400">
                            <ArrowLeftRight size={9} /> {diffStats.edgesAdded + diffStats.edgesRemoved} edge{diffStats.edgesAdded + diffStats.edgesRemoved !== 1 ? 's' : ''}
                        </span>
                    </div>
                ) : (
                    <div />
                )}
                {/* Legend */}
                <div className="flex items-center gap-4 text-[9px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-[2px] bg-emerald-500/80 rounded" /> Added
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-[2px] bg-red-500/80 rounded" /> Removed
                    </div>
                </div>
            </div>
        </div>
    );
}
