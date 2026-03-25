// src/components/profile/ProfileFeaturesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Brain, Award, ShieldCheck, LineChart, Code2, GitCommit, SearchCheck, Layers } from 'lucide-react';

export function ProfileFeaturesSection() {
    return (
        <section className="py-32 px-5 relative border-t border-stroke/50 bg-surface-1/20 overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-0 mb-6 tracking-tighter">
                        Deep <span className="text-gradient">Context.</span> Not just stats.
                    </h2>
                    <p className="text-text-2 max-w-2xl mx-auto text-lg md:text-xl font-mono leading-relaxed">
                        Traditional developer portfolios rely on self-reported skills. We rely on the absolute truth of public commits.
                    </p>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[340px]">
                    
                    {/* Bento 1: Large Wide (2 cols, 1 row) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 row-span-1 card bg-surface-1 p-8 rounded-3xl relative overflow-hidden group border-stroke/50 hover:border-amber/40 transition-colors"
                    >
                        <div className="relative z-10 max-w-[280px] lg:max-w-sm">
                            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center mb-6 group-hover:bg-amber/10 group-hover:border-amber/30 transition-colors">
                                <Brain className="w-6 h-6 text-amber" />
                            </div>
                            <h3 className="text-2xl font-bold font-display text-text-0 mb-3">Architectural Intelligence</h3>
                            <p className="text-text-2 font-mono text-sm leading-relaxed">
                                Our LLM evaluates project structure, design patterns, and how code is separated. We detect if a developer builds scalable systems or just scripts.
                            </p>
                        </div>
                        
                        {/* Mock UI: Code parsing snippet */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] opacity-20 sm:opacity-30 group-hover:opacity-100 transition-all duration-500 translate-x-16 sm:translate-x-10 group-hover:translate-x-0 hidden sm:block">
                            <div className="bg-surface-0 border border-stroke rounded-xl p-4 font-mono text-xs text-text-3 shadow-2xl">
                                <div className="flex gap-2 mb-3 border-b border-stroke pb-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose border border-rose/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber border border-amber/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald border border-emerald/50" />
                                </div>
                                <div className="text-emerald mb-1 font-bold">class RepositoryAnalyzer &#123;</div>
                                <div className="pl-4 mb-1">async analyze_architecture(repo) &#123;</div>
                                <div className="pl-8 mb-1">const <span className="text-amber">patterns</span> = await detect_patterns();</div>
                                <div className="pl-8 text-text-1 bg-amber/10 inline-block px-1 rounded-sm border border-amber/20 my-1">// Context extracted: CQRS, Event Sourcing</div>
                                <div className="pl-8 mt-1">return calculate_score(<span className="text-amber">patterns</span>);</div>
                                <div className="pl-4">&#125;</div>
                                <div>&#125;</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bento 2: Tall Vertical (1 col, 2 rows) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1 md:row-span-2 card bg-surface-1 p-8 rounded-3xl relative overflow-hidden group border-stroke/50 hover:border-emerald/40 transition-colors flex flex-col"
                    >
                        <div className="relative z-10 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-stroke flex items-center justify-center mb-6 group-hover:bg-emerald/10 group-hover:border-emerald/30 transition-colors">
                                <LineChart className="w-6 h-6 text-emerald" />
                            </div>
                            <h3 className="text-2xl font-bold font-display text-text-0 mb-3">Domain DNA Map</h3>
                            <p className="text-text-2 font-mono text-sm leading-relaxed">
                                Visualize capabilities across Frontend, Backend, DevOps, Data Science, and Security through a generated radar chart.
                            </p>
                        </div>

                        {/* Mock UI: Radar Chart / Data Visual */}
                        <div className="mt-auto relative w-full h-full min-h-[220px] flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                             {/* Fake SVG Radar Chart */}
                             <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] overflow-visible">
                                <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="#3f3f46" strokeWidth="1" />
                                <polygon points="50,30 70,45 60,70 40,70 30,45" fill="none" stroke="#27272a" strokeWidth="1" />
                                <line x1="50" y1="50" x2="50" y2="10" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
                                <line x1="50" y1="50" x2="90" y2="40" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
                                <line x1="50" y1="50" x2="75" y2="90" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
                                <line x1="50" y1="50" x2="25" y2="90" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
                                <line x1="50" y1="50" x2="10" y2="40" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
                                
                                {/* The Data Polygon */}
                                <g className="origin-center transition-transform duration-700 ease-out group-hover:scale-[1.05]">
                                    <polygon points="50,15 80,42 65,80 35,65 20,45" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }} />
                                    {/* Nodes */}
                                    <circle cx="50" cy="15" r="2.5" fill="#10b981" />
                                    <circle cx="80" cy="42" r="2.5" fill="#10b981" />
                                    <circle cx="65" cy="80" r="2.5" fill="#10b981" />
                                    <circle cx="35" cy="65" r="2.5" fill="#10b981" />
                                    <circle cx="20" cy="45" r="2.5" fill="#10b981" />
                                </g>
                             </svg>
                             {/* Labels */}
                             <div className="absolute top-[-5px] text-[11px] font-mono text-emerald font-bold tracking-widest">Frontend</div>
                             <div className="absolute right-[-15px] top-[38%] text-[10px] font-mono text-text-3 uppercase">Backend</div>
                             <div className="absolute bottom-[-10px] right-[5%] text-[10px] font-mono text-text-3 uppercase">DevOps</div>
                             <div className="absolute bottom-[-10px] left-[5%] text-[10px] font-mono text-text-3 uppercase">Data</div>
                             <div className="absolute left-[-20px] top-[38%] text-[10px] font-mono text-text-3 uppercase">Security</div>
                        </div>
                    </motion.div>

                    {/* Bento 3: Standard Square (1 col, 1 row) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 row-span-1 card bg-surface-1 p-8 rounded-3xl relative overflow-hidden group border-stroke/50 hover:border-emerald/40 transition-colors flex flex-col justify-between"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold font-display text-text-0 mb-3 flex items-center gap-3">
                                <GitCommit className="w-5 h-5 text-emerald" />
                                Commit Hygiene
                            </h3>
                            <p className="text-text-2 font-mono text-sm leading-relaxed mb-8">
                                Evaluates message clarity and semantic versioning.
                            </p>
                        </div>
                        {/* Mock UI: Commit graph dots */}
                        <div className="flex flex-wrap gap-[6px] opacity-40 group-hover:opacity-100 transition-opacity">
                            {Array.from({length: 45}).map((_, i) => {
                                const active = Math.random();
                                return (
                                <div key={i} className={`w-3.5 h-3.5 rounded-sm transition-colors duration-500 delay-${(i % 5) * 100} ${active > 0.75 ? 'bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]' : active > 0.4 ? 'bg-emerald-dim' : 'bg-surface-3'}`} />
                            )})}
                        </div>
                    </motion.div>

                    {/* Bento 4: Standard Square (1 col, 1 row) */}
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-1 row-span-1 card bg-surface-1 p-8 rounded-3xl relative overflow-hidden group border-stroke/50 hover:border-amber/40 transition-colors flex flex-col justify-between"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold font-display text-text-0 mb-3 flex items-center gap-3">
                                <Code2 className="w-5 h-5 text-amber" />
                                Tech Stack Vol.
                            </h3>
                            <p className="text-text-2 font-mono text-sm leading-relaxed mb-8">
                                Analyzes exact bytes to determine true language proficiency.
                            </p>
                        </div>
                        {/* Mock UI: Language Bars */}
                        <div className="flex flex-col gap-3.5 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="w-full">
                                <div className="flex justify-between text-xs font-mono text-text-1 mb-1.5">
                                    <span>TypeScript</span>
                                    <span>65%</span>
                                </div>
                                <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-[#3178c6] origin-left transition-transform duration-1000 scale-x-[0.2] group-hover:scale-x-100 delay-100" />
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="flex justify-between text-xs font-mono text-text-1 mb-1.5">
                                    <span>Rust</span>
                                    <span>25%</span>
                                </div>
                                <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                                    <div className="w-[25%] h-full bg-[#dea584] origin-left transition-transform duration-1000 scale-x-[0.2] group-hover:scale-x-100 delay-200" />
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="flex justify-between text-xs font-mono text-text-1 mb-1.5">
                                    <span>Go</span>
                                    <span>10%</span>
                                </div>
                                <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                                    <div className="w-[10%] h-full bg-[#00add8] origin-left transition-transform duration-1000 scale-x-[0.2] group-hover:scale-x-100 delay-300" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
