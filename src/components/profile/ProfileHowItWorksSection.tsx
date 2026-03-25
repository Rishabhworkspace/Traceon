// src/components/profile/ProfileHowItWorksSection.tsx
'use client';

import { motion } from 'framer-motion';
import { GitPullRequest, SearchCheck, Zap } from 'lucide-react';

const steps = [
    {
        id: '01',
        title: 'Data Extraction',
        description: 'Provide an alias. We instantly hook into the GitHub API to aggressively fetch repositories, commit history, and language distributions.',
        icon: <GitPullRequest className="w-8 h-8 text-emerald" />
    },
    {
        id: '02',
        title: 'LLM Execution',
        description: 'Raw telemetry is parsed and fed into isolated Groq Llama 3.3 models. The AI evaluates architecture and hygiene against rigorous rubrics.',
        icon: <Zap className="w-8 h-8 text-amber" />
    },
    {
        id: '03',
        title: 'DNA Dashboard',
        description: 'Receive an interactive, highly tactical presentation of their engineering archetype, precise domain radar, and categorized strengths.',
        icon: <SearchCheck className="w-8 h-8 text-emerald" />
    }
];

export function ProfileHowItWorksSection() {
    return (
        <section className="py-32 px-5 relative bg-surface-0">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-0 mb-6 tracking-tighter">
                        The <span className="text-gradient">Engine.</span>
                    </h2>
                    <p className="text-text-2 max-w-xl mx-auto text-lg md:text-xl font-mono leading-relaxed">
                        Processing millions of lines of context in seconds to establish an accurate, undeniable technical footprint.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
                    
                    <style>
                        {`
                        @keyframes packet-travel {
                            0% { left: -10%; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { left: 110%; opacity: 0; }
                        }
                        .packet-1 { animation: packet-travel 3s ease-in-out infinite; }
                        .packet-2 { animation: packet-travel 3s ease-in-out infinite 1.5s; }
                        `}
                    </style>

                    {/* Animated Data Pipeline (Desktop) */}
                    <div className="hidden md:block absolute top-[56px] left-[16.6%] right-[16.6%] h-[2px] bg-stroke/50 max-w-none overflow-hidden rounded-full">
                        {/* Glowing packets traveling the pipeline */}
                        <div className="absolute top-0 w-[100px] h-full bg-gradient-to-r from-transparent via-emerald to-transparent packet-1 blur-[1px]" />
                        <div className="absolute top-0 w-[100px] h-full bg-gradient-to-r from-transparent via-amber to-transparent packet-2 blur-[1px]" />
                    </div>

                    {/* Animated Data Pipeline (Mobile Vertical) */}
                    <div className="md:hidden absolute top-[10%] bottom-[10%] left-[56px] w-[2px] bg-stroke/50 overflow-hidden rounded-full z-0">
                        <style>
                            {`
                            @keyframes packet-travel-y {
                                0% { top: -10%; opacity: 0; }
                                10% { opacity: 1; }
                                90% { opacity: 1; }
                                100% { top: 110%; opacity: 0; }
                            }
                            .packet-y-1 { animation: packet-travel-y 3s ease-in-out infinite; }
                            .packet-y-2 { animation: packet-travel-y 3s ease-in-out infinite 1.5s; }
                            `}
                        </style>
                        <div className="absolute left-0 w-full h-[100px] bg-gradient-to-b from-transparent via-emerald to-transparent packet-y-1 blur-[1px]" />
                        <div className="absolute left-0 w-full h-[100px] bg-gradient-to-b from-transparent via-amber to-transparent packet-y-2 blur-[1px]" />
                    </div>

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="relative flex md:flex-col items-center md:text-center gap-6 md:gap-0 z-10 group"
                        >
                            {/* Node icon */}
                            <div className="shrink-0 w-28 h-28 rounded-2xl bg-surface-1/90 backdrop-blur-sm border border-stroke flex items-center justify-center md:mb-8 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:border-amber/40 transition-all duration-500">
                                {/* Inner glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                                
                                <div className="relative z-10 group-hover:scale-110 transition-transform duration-500">
                                    {step.icon}
                                </div>
                                
                                {/* Node Label Badge */}
                                <div className="absolute -top-3 -right-3 md:-right-4 px-3 py-1 bg-surface-3 border border-stroke rounded-sm font-mono text-xs font-bold text-text-0 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-1 group-hover:bg-amber group-hover:text-black group-hover:border-amber transition-colors duration-500">
                                    <span className="opacity-70 group-hover:opacity-100">NODE</span> {step.id}
                                </div>
                            </div>

                            {/* Node Content */}
                            <div>
                                <h3 className="text-2xl font-bold font-display text-text-0 mb-3 md:mb-4">{step.title}</h3>
                                <p className="text-text-2 font-mono text-sm leading-relaxed md:max-w-xs mx-auto">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
