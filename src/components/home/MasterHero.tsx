// src/components/home/MasterHero.tsx
'use client';

import { motion } from 'framer-motion';
import { Network, UserCircle, ArrowRight, Zap, Shield, GitBranch } from 'lucide-react';
import Link from 'next/link';

export function MasterHero() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-24 px-5 overflow-hidden">
            {/* Background Glows (Obsidian Matrix Style) */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMjAgMEwwIDBaTTAgMjBMMjAgMjBaIiBzdHJva2U9IiMzZjNmNDYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] pointer-events-none opacity-50" />

            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
                {/* Hero Text */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                    className="text-center mb-16"
                >
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-stroke bg-surface-1/80 backdrop-blur-md mb-8 relative group cursor-default"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald/0 via-emerald/5 to-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <span className="w-1.5 h-1.5 bg-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-xs font-mono font-medium tracking-widest text-text-1 uppercase">Traceon 3.0 <span className="text-text-3 mx-2">/</span> Intelligence Platform</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-text-0 mb-6 tracking-tighter leading-[1.05]">
                        <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">Demystify Code.</motion.span>
                        <br />
                        <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-transparent bg-clip-text bg-gradient-to-r from-text-0 via-text-1 to-text-3 pb-2 inline-block">Decode Developers.</motion.span>
                    </h1>
                    
                    <motion.p 
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-text-2 max-w-2xl mx-auto"
                    >
                        Traceon is the ultimate toolkit for technical discovery. Whether you need to map out a massive legacy codebase or mathematically analyze a developer's engineering DNA, we've got the AI agents for the job.
                    </motion.p>
                </motion.div>

                {/* The Two Massive Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Repo Analysis Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        <Link href="/repo" className="block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg group">
                            <div className="h-full relative overflow-hidden rounded-lg border border-stroke bg-surface-1/60 hover:bg-surface-2 backdrop-blur-md transition-all duration-300 hover:border-emerald/40 p-8 md:p-12 flex flex-col group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
                                {/* Top accent border */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald/0 via-emerald to-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute inset-0 bg-gradient-to-b from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300 mix-blend-screen">
                                    <Network className="w-48 h-48 text-emerald transform group-hover:-translate-y-4 group-hover:translate-x-4 transition-transform duration-500" />
                                </div>

                                <div className="w-14 h-14 rounded-md bg-surface-3 border border-stroke flex items-center justify-center mb-8 relative z-10 group-hover:border-emerald/30 group-hover:bg-emerald/5 transition-colors duration-300">
                                    <GitBranch className="w-6 h-6 text-emerald" />
                                </div>

                                <h2 className="text-2xl font-display font-bold text-text-0 mb-4 relative z-10 tracking-tight">Repository Analyzer</h2>
                                <p className="text-text-2 mb-8 leading-relaxed max-w-sm relative z-10 font-mono text-sm">
                                    Generate visual dependency graphs, highlight critical architectural nodes, and trace file-level impact across entire codebases.
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-emerald text-sm font-mono font-bold relative z-10 transition-transform duration-200 group-hover:translate-x-1 uppercase tracking-wider">
                                    Launch Analyzer <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Profile Analysis Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    >
                        <Link href="/profile-analytics" className="block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg group">
                            <div className="h-full relative overflow-hidden rounded-lg border border-stroke bg-surface-1/60 hover:bg-surface-2 backdrop-blur-md transition-all duration-300 hover:border-amber/40 p-8 md:p-12 flex flex-col group-hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)]">
                                {/* Top accent border */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber/0 via-amber to-amber/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute inset-0 bg-gradient-to-b from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300 mix-blend-screen">
                                    <UserCircle className="w-48 h-48 text-amber transform group-hover:translate-y-4 group-hover:-translate-x-4 transition-transform duration-500" />
                                </div>

                                <div className="w-14 h-14 rounded-md bg-surface-3 border border-stroke flex items-center justify-center mb-8 relative z-10 group-hover:border-amber/30 group-hover:bg-amber/5 transition-colors duration-300">
                                    <Shield className="w-6 h-6 text-amber" />
                                </div>

                                <h2 className="text-2xl font-display font-bold text-text-0 mb-4 relative z-10 tracking-tight">Profile DNA</h2>
                                <p className="text-text-2 mb-8 leading-relaxed max-w-sm relative z-10 font-mono text-sm">
                                    Assess candidate engineering capabilities instantly. Our AI dissects languages, repos, and commit quality to generate a comprehensive developer profile.
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-amber text-sm font-mono font-bold relative z-10 transition-transform duration-200 group-hover:translate-x-1 uppercase tracking-wider">
                                    Analyze Profiles <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Small Trust/Feature Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                    className="flex flex-wrap justify-center gap-4 mt-20 pt-10 border-t border-stroke/50 max-w-4xl"
                >
                    <div className="flex items-center gap-2.5 text-xs font-mono text-text-2 bg-surface-1/50 border border-stroke px-4 py-1.5 rounded-full"><Zap className="w-3.5 h-3.5 text-amber" /> Groq Llama 3.3 Engine</div>
                    <div className="flex items-center gap-2.5 text-xs font-mono text-text-2 bg-surface-1/50 border border-stroke px-4 py-1.5 rounded-full"><Shield className="w-3.5 h-3.5 text-emerald" /> Secure Context parsing</div>
                    <div className="flex items-center gap-2.5 text-xs font-mono text-text-2 bg-surface-1/50 border border-stroke px-4 py-1.5 rounded-full"><Network className="w-3.5 h-3.5 text-text-1" /> Real-time Knowledge Graphs</div>
                </motion.div>
            </div>
        </section>
    );
}
