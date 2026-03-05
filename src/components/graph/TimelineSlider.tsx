import { Clock } from 'lucide-react';

interface TimelineSliderProps {
    commits: { sha: string; message: string; date: string }[]; // Newest first
    selectedIndex: number; // 0 is HEAD, 1 is older, etc
    onChange: (index: number) => void;
}

export default function TimelineSlider({ commits, selectedIndex, onChange }: TimelineSliderProps) {
    if (!commits || commits.length <= 1) return null;

    // Reverse for UI so oldest is on the left, newest on the right
    const uiCommits = [...commits].reverse();
    // Index map: user selects UI index 0 (oldest), which maps to real Index length-1.
    // realIndex = (length - 1) - uiIndex
    const uiSelectedIndex = (commits.length - 1) - selectedIndex;

    const handleUiChange = (uiIdx: number) => {
        const realIdx = (commits.length - 1) - uiIdx;
        onChange(realIdx);
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl px-6 py-4 w-[480px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Time Travel</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                    {commits[selectedIndex].sha.substring(0, 7)}
                </div>
            </div>

            <div className="relative pt-2 pb-6">
                <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-white/5 rounded-full" />
                <div className="relative flex justify-between">
                    {uiCommits.map((c, idx) => {
                        const isSelected = idx === uiSelectedIndex;
                        const isPast = idx <= uiSelectedIndex;

                        return (
                            <div key={idx} className="relative flex flex-col items-center group cursor-pointer" onClick={() => handleUiChange(idx)}>
                                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 z-10 ${isSelected ? 'bg-emerald-500 border-[#0d0d0d] scale-125 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : isPast ? 'bg-emerald-500/50 border-transparent' : 'bg-gray-700 border-transparent hover:bg-gray-500'}`} />

                                <div className={`absolute top-6 whitespace-nowrap text-center transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className="text-[10px] font-bold text-white mb-0.5">{idx === uiCommits.length - 1 ? 'Current' : 'Older'}</div>
                                    <div className="text-[9px] text-gray-400 font-mono truncate w-24">
                                        {c.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Progress fill */}
                <div
                    className="absolute top-3.5 left-0 h-0.5 bg-emerald-500/50 rounded-full transition-all duration-300 pointer-events-none"
                    style={{ width: `${(uiSelectedIndex / (uiCommits.length - 1)) * 100}%` }}
                />
            </div>

            <div className="mt-2 text-center flex items-center justify-center gap-4 text-[9px] text-gray-500">
                <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-emerald-500/80 rounded" /> Added</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-red-500/80 rounded" /> Removed</div>
            </div>
        </div>
    );
}
