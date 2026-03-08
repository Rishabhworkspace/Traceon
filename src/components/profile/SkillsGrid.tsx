'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Globe, Cpu, ShieldCheck, TerminalSquare, Cloud, Hexagon, Code2, ChevronRight, Binary } from 'lucide-react';

interface DomainSkill {
    domain: string;
    skills: string[];
}

interface SkillsGridProps {
    skillsByDomain?: DomainSkill[];
}

// Map domain names to icons heuristically
const getDomainIcon = (domainName: string) => {
    const lower = domainName.toLowerCase();
    if (lower.includes('front') || lower.includes('ui') || lower.includes('web')) return <Globe className="w-6 h-6" />;
    if (lower.includes('back') || lower.includes('api') || lower.includes('server')) return <Database className="w-6 h-6" />;
    if (lower.includes('devops') || lower.includes('cloud') || lower.includes('infra')) return <Cloud className="w-6 h-6" />;
    if (lower.includes('data') || lower.includes('machine') || lower.includes('ai')) return <Cpu className="w-6 h-6" />;
    if (lower.includes('secure') || lower.includes('auth')) return <ShieldCheck className="w-6 h-6" />;
    if (lower.includes('system') || lower.includes('design')) return <Layers className="w-6 h-6" />;
    if (lower.includes('script') || lower.includes('tooling') || lower.includes('test')) return <TerminalSquare className="w-6 h-6" />;
    return <Hexagon className="w-6 h-6" />;
};

function Layers(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}


export function SkillsGrid({ skillsByDomain = [] }: SkillsGridProps) {
    const [activeDomain, setActiveDomain] = useState<DomainSkill | null>(skillsByDomain[0] || null);
    const [scrambledSkills, setScrambledSkills] = useState<{ [key: string]: string }>({});

    // Decoding animation effect when switching active domains
    useEffect(() => {
        if (!activeDomain) return;

        // Initialize with random characters
        const initialScramble: Record<string, string> = {};
        activeDomain.skills.forEach(skill => {
            // Replace word characters with random ASCII symbols for the hacker look
            initialScramble[skill] = skill.replace(/[a-zA-Z]/g, () => String.fromCharCode(33 + Math.floor(Math.random() * 90)));
        });
        setScrambledSkills(initialScramble);

        let iterations = 0;
        const maxIterations = 20;

        const interval = setInterval(() => {
            setScrambledSkills(prev => {
                const updated: Record<string, string> = {};
                let allDone = true;

                activeDomain.skills.forEach(skill => {
                    if (prev[skill] === skill) {
                        updated[skill] = skill;
                    } else {
                        allDone = false;
                        const chars = skill.split('');
                        updated[skill] = chars.map((char, i) => {
                            if (i < iterations / 2) return char; // Reveal character
                            return String.fromCharCode(33 + Math.floor(Math.random() * 90)); // Keep scrambling
                        }).join('');
                    }
                });

                // Clear interval if fully decoded or max iterations reached
                if (allDone || iterations > maxIterations) {
                    clearInterval(interval);
                    // Force exact string at the end just in case
                    activeDomain.skills.forEach(s => updated[s] = s);
                }

                return updated;
            });
            iterations += 1;
        }, 40);

        return () => clearInterval(interval);
    }, [activeDomain]);

    if (!skillsByDomain || skillsByDomain.length === 0) {
        return (
            <div className="card h-full p-6 flex flex-col justify-center items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm bg-surface-1">
                <p className="text-sm text-text-3 font-mono italic">No mapped domains available for this profile.</p>
            </div>
        );
    }

    // Sort to put the biggest domains first based on skill count
    const sortedDomains = [...skillsByDomain].sort((a, b) => b.skills.length - a.skills.length);

    // If activeDomain wasn't set (e.g., initial render where prop was slightly delayed), set it
    if (!activeDomain && sortedDomains.length > 0) {
        setActiveDomain(sortedDomains[0]);
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-up animate-delay-1 h-auto min-h-[500px]">
            {/* Header info */}
            <div className="card p-5 !rounded-sm bg-surface-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-stroke/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <TerminalSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">System Registry</h3>
                        <p className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Simulated Tech Environment</p>
                    </div>
                </div>
            </div>

            {/* Terminal Interface */}
            <div className="flex-1 rounded-sm border border-stroke bg-[#0a0a0a] shadow-[0_8px_40px_-10px_rgba(16,185,129,0.15)] flex flex-col font-mono relative overflow-hidden group">

                {/* Terminal Header */}
                <div className="h-9 bg-surface-1 border-b border-stroke flex items-center px-4 gap-2 shrink-0 relative z-20 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    <div className="flex gap-1.5 h-full items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose/30 border border-rose/50 group-hover:bg-rose/80 transition-colors"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber/30 border border-amber/50 group-hover:bg-amber/80 transition-colors"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald/30 border border-emerald/50 group-hover:bg-emerald/80 transition-colors"></span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 text-[10px] text-text-3 font-bold tracking-widest uppercase items-center flex gap-2">
                        <Code2 className="w-3 h-3" />
                        root@traceon:~
                    </div>
                </div>

                {/* Terminal Body */}
                <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative z-10 min-h-[400px]">
                    {/* Sidebar / Partitions */}
                    <div className="w-full sm:w-56 bg-surface-0 border-b sm:border-b-0 sm:border-r border-stroke flex flex-col shrink-0">
                        <div className="p-3 text-[10px] uppercase text-text-3 tracking-widest font-bold border-b border-stroke/50 bg-surface-1/50 flex items-center gap-2">
                            <Database className="w-3 h-3" />
                            Partitions
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
                            {sortedDomains.map(domainObj => {
                                const isActive = activeDomain?.domain === domainObj.domain;
                                return (
                                    <button
                                        key={domainObj.domain}
                                        onClick={() => setActiveDomain(domainObj)}
                                        className={`flex items-center gap-3 px-3 py-2.5 text-left rounded-sm text-xs font-bold uppercase tracking-wide transition-all duration-200 outline-none ${isActive
                                            ? 'bg-emerald/10 text-emerald border border-emerald/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]'
                                            : 'text-text-2 hover:bg-surface-2 hover:text-text-1 border border-transparent'
                                            }`}
                                    >
                                        {isActive ? (
                                            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-emerald animate-pulse" />
                                        ) : (
                                            <Binary className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-80 transition-opacity" />
                                        )}
                                        <span className="truncate">{domainObj.domain}</span>
                                        <span className={`ml-auto text-[10px] ${isActive ? 'text-emerald/80' : 'text-text-3'}`}>
                                            [{domainObj.skills.length}]
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 sm:p-8 overflow-y-auto relative bg-[#050505]">
                        {/* Subtle CRT Scanline Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20 z-10 mix-blend-overlay" />

                        <AnimatePresence mode="wait">
                            {activeDomain && (
                                <motion.div
                                    key={activeDomain.domain}
                                    initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.2 }}
                                    className="relative z-20 flex flex-col gap-8 h-full"
                                >
                                    {/* Domain Header */}
                                    <div className="flex items-start sm:items-center flex-col sm:flex-row gap-5 pb-6 border-b border-emerald/10">
                                        <div className="p-4 bg-emerald/5 rounded-sm border border-emerald/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] text-emerald relative overflow-hidden">
                                            <div className="absolute inset-0 bg-emerald/10 animate-pulse opacity-50" />
                                            <div className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                                                {getDomainIcon(activeDomain.domain)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-2xl font-bold tracking-tight uppercase text-emerald drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                                {activeDomain.domain}_SYS
                                            </h2>
                                            <div className="flex items-center gap-3 text-[10px] text-emerald/60 uppercase tracking-widest font-bold">
                                                <span className="flex items-center gap-1.5 bg-emerald/10 px-2 py-0.5 rounded-sm border border-emerald/20">
                                                    <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse"></span>
                                                    Online
                                                </span>
                                                <span>Mounted: {activeDomain.skills.length} Modules</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decoding / Modules Grid */}
                                    <div className="flex flex-col gap-4 flex-1">
                                        <div className="text-xs text-text-3 font-mono flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald animate-pulse">❯</span>
                                                Decrypting payload matrix...
                                            </div>
                                            <span className="text-[10px] opacity-30">TRACEON_V1.0.4</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-max">
                                            {activeDomain.skills.map((skill, i) => {
                                                const displayedText = scrambledSkills[skill] || skill;
                                                const isDecoded = displayedText === skill;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center border border-stroke/50 bg-surface-1/30 rounded-sm p-3 relative overflow-hidden group hover:bg-emerald/5 hover:border-emerald/30 transition-all duration-300"
                                                    >
                                                        {/* Hover indicator strip */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald/0 via-emerald to-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        {/* Index */}
                                                        <span className="text-text-3 text-[10px] w-7 shrink-0 opacity-50 font-bold">
                                                            P{String(i).padStart(2, '0')}
                                                        </span>

                                                        {/* Text */}
                                                        <span className={`text-sm font-bold tracking-tight transition-colors truncate ${isDecoded ? 'text-text-1 group-hover:text-emerald drop-shadow-md' : 'text-text-3'}`}>
                                                            {displayedText}
                                                        </span>

                                                        {/* Decoded Checkmark */}
                                                        {isDecoded && (
                                                            <ShieldCheck className="w-3 h-3 text-emerald/40 ml-auto" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Footer of terminal prompt */}
                                    <div className="mt-auto pt-4 text-[10px] text-text-3 flex items-center gap-2 border-t border-stroke/30">
                                        <span className="text-emerald">root@traceon:~/modules$</span>
                                        <span className="w-1.5 h-3 bg-text-3 animate-pulse inline-block"></span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
