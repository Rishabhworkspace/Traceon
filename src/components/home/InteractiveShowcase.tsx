'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, UserCircle, Network, Code2, Shield, Activity } from 'lucide-react';

type Mode = 'repo' | 'profile';

export function InteractiveShowcase() {
    const [mode, setMode] = useState<Mode>('repo');

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-700 data-[mode=profile]:bg-amber/5" data-mode={mode} />

            <div className="mx-auto max-w-6xl px-5 relative z-10 flex flex-col items-center">
                
                <div className="text-center mb-12">
                    <span className="mono-label block mb-3">{'// core engines'}</span>
                    <h2 className="text-3xl sm:text-5xl font-display font-bold mb-4 tracking-tight">
                        Two powerful lenses.<br />
                        <span className="text-text-2">One unified platform.</span>
                    </h2>
                    <p className="text-text-2 max-w-xl mx-auto">
                        Switch seamlessly between analyzing codebase architectures and evaluating developer engineering DNA.
                    </p>
                </div>

                {/* The Toggle */}
                <div className="flex items-center p-1.5 bg-surface-1 border border-stroke rounded-xl mb-16 relative">
                    <div className="absolute inset-0 bg-surface-2 opacity-50 rounded-xl" />
                    
                    <button
                        onClick={() => setMode('repo')}
                        className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'repo' ? 'text-surface-0' : 'text-text-2 hover:text-text-1'}`}
                    >
                        {mode === 'repo' && (
                            <motion.div layoutId="showcase-toggle" className="absolute inset-0 bg-emerald rounded-lg -z-10 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                        )}
                        <GitBranch className="w-4 h-4" />
                        Repository Analyzer
                    </button>
                    
                    <button
                        onClick={() => setMode('profile')}
                        className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'profile' ? 'text-surface-0' : 'text-text-2 hover:text-text-1'}`}
                    >
                        {mode === 'profile' && (
                            <motion.div layoutId="showcase-toggle" className="absolute inset-0 bg-amber rounded-lg -z-10 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                        )}
                        <UserCircle className="w-4 h-4" />
                        Profile DNA
                    </button>
                </div>

                {/* Content Panel */}
                <div className="w-full max-w-5xl h-[500px] rounded-2xl border border-stroke bg-surface-1/60 backdrop-blur-xl overflow-hidden relative shadow-2xl">
                    
                    {/* Top window bar */}
                    <div className="h-10 border-b border-stroke/60 bg-surface-2/40 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-stroke" />
                            <div className="w-3 h-3 rounded-full bg-stroke" />
                            <div className="w-3 h-3 rounded-full bg-stroke" />
                        </div>
                        <div className="mx-auto px-4 py-1 rounded bg-surface-0 border border-stroke text-[11px] font-mono text-text-3">
                            {mode === 'repo' ? 'traceon/analyzer/graph-view' : 'traceon/profile/dna-matrix'}
                        </div>
                    </div>

                    <div className="relative w-full h-[calc(100%-40px)]">
                        <AnimatePresence mode="wait">
                            {mode === 'repo' ? (
                                <motion.div 
                                    key="repo-view"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 flex items-center justify-center p-8"
                                >
                                    {/* Mock Graph Visualization */}
                                    <div className="w-full h-full relative border border-emerald/10 rounded-xl bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0,transparent_100%)] overflow-hidden">
                                        {/* Decorative grid */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                                        
                                        {/* Mock Nodes */}
                                        <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-surface-2 border border-emerald/50 rounded-lg flex items-center justify-center z-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <Code2 className="w-5 h-5 text-emerald" />
                                        </div>
                                        <div className="absolute bottom-1/3 left-1/2 w-16 h-16 bg-surface-2 border border-emerald rounded-lg flex items-center justify-center z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse-glow">
                                            <Network className="w-7 h-7 text-emerald" />
                                        </div>
                                        <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-surface-2 border border-emerald/30 rounded-lg flex items-center justify-center z-10 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                            <Activity className="w-4 h-4 text-emerald" />
                                        </div>

                                        {/* Mock Edges (SVG) */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                            <defs>
                                                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="rgba(16,185,129,0)" />
                                                    <stop offset="50%" stopColor="rgba(16,185,129,1)" />
                                                    <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                                                </linearGradient>
                                                <style>
                                                    {`
                                                    @keyframes flow {
                                                        from { stroke-dashoffset: 24; }
                                                        to { stroke-dashoffset: 0; }
                                                    }
                                                    .flowing-path {
                                                        stroke-dasharray: 4 20;
                                                        animation: flow 1s linear infinite reverse;
                                                    }
                                                    `}
                                                </style>
                                            </defs>
                                            <path d="M 25% 25% Q 35% 35% 50% 66%" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald/10" />
                                            <path d="M 75% 33% Q 65% 50% 50% 66%" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald/10" />
                                            
                                            <path d="M 25% 25% Q 35% 35% 50% 66%" fill="none" stroke="url(#flow-gradient)" strokeWidth="2" className="flowing-path" />
                                            <path d="M 75% 33% Q 65% 50% 50% 66%" fill="none" stroke="url(#flow-gradient)" strokeWidth="2" className="flowing-path" />
                                        </svg>

                                        {/* Overlay Stats */}
                                        <div className="absolute bottom-6 left-6 flex gap-4">
                                            <div className="px-4 py-2 rounded-lg bg-surface-1/80 border border-stroke backdrop-blur-md">
                                                <div className="text-[10px] uppercase font-mono text-text-3 mb-1">Nodes Analyzed</div>
                                                <div className="text-emerald font-mono font-bold">1,402</div>
                                            </div>
                                            <div className="px-4 py-2 rounded-lg bg-surface-1/80 border border-stroke backdrop-blur-md">
                                                <div className="text-[10px] uppercase font-mono text-text-3 mb-1">Critical Paths</div>
                                                <div className="text-emerald font-mono font-bold">12</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="profile-view"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 flex items-center justify-center p-8"
                                >
                                     {/* Mock DNA Dashboard */}
                                     <div className="w-full h-full relative border border-amber/10 rounded-xl bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0,transparent_100%)] overflow-hidden flex items-center justify-center gap-12">
                                        {/* Left: Mock Radar/Scores */}
                                        <div className="flex flex-col gap-6 w-[200px]">
                                            <div className="w-full p-4 rounded-xl bg-surface-2 border border-amber/20 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber/0 via-amber/5 to-amber/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                <div className="text-[10px] font-mono text-text-3 mb-2 uppercase">Architecture</div>
                                                <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber w-[92%]" />
                                                </div>
                                            </div>
                                            <div className="w-full p-4 rounded-xl bg-surface-2 border border-amber/20 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber/0 via-amber/5 to-amber/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                <div className="text-[10px] font-mono text-text-3 mb-2 uppercase">Testing</div>
                                                <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber/70 w-[64%]" />
                                                </div>
                                            </div>
                                            <div className="w-full p-4 rounded-xl bg-surface-2 border border-amber/20 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber/0 via-amber/5 to-amber/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                <div className="text-[10px] font-mono text-text-3 mb-2 uppercase">Impact</div>
                                                <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber/90 w-[88%]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Mock Profile Card */}
                                        <div className="w-[300px] bg-surface-1 border border-stroke rounded-2xl p-6 shadow-2xl relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <Shield className="w-32 h-32 text-amber" />
                                            </div>
                                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                                <div className="w-16 h-16 rounded-full border-2 border-amber/50 bg-surface-3 flex items-center justify-center overflow-hidden p-1">
                                                    <div className="w-full h-full rounded-full bg-surface-4 flex items-center justify-center text-text-2">
                                                        <UserCircle className="w-8 h-8" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-mono text-text-3">@developer</div>
                                                    <div className="text-xl font-bold text-text-0">Senior Architect</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-2 mb-6 leading-relaxed relative z-10">
                                                Demonstrates exceptional architectural maturity, favoring modular monoliths over premature microservices.
                                            </p>
                                            <div className="flex gap-2 relative z-10">
                                                <span className="px-2 py-1 bg-surface-2 border border-stroke rounded text-[10px] font-mono text-amber">TypeScript</span>
                                                <span className="px-2 py-1 bg-surface-2 border border-stroke rounded text-[10px] font-mono text-amber">Go</span>
                                            </div>
                                        </div>
                                     </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
