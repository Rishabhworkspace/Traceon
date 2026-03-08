// src/components/profile/ProfileHowItWorksSection.tsx
'use client';

import { motion } from 'framer-motion';
import { GitPullRequest, SearchCheck, Zap } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'Data Aggregation',
        description: 'Provide a GitHub username. We instantly fetch their top repositories, highest-impact commit histories, language usages, and README context snippets directly via the GitHub API.',
        icon: <GitPullRequest className="w-6 h-6 text-emerald" />
    },
    {
        id: 2,
        title: 'LLM Analysis',
        description: 'The raw data is parsed and fed into cutting-edge Groq Llama 3.3 models. The AI evaluates architectural decisions, repo diversity, and code hygiene against a rigorous developer rubric.',
        icon: <Zap className="w-6 h-6 text-amber" />
    },
    {
        id: 3,
        title: 'DNA Generation',
        description: 'Receive a sleek, interactive dashboard detailing their engineering archetype, a precise Domain Expertise radar chart, and categorized strengths & weaknesses.',
        icon: <SearchCheck className="w-6 h-6 text-emerald" />
    }
];

export function ProfileHowItWorksSection() {
    return (
        <section className="py-24 px-5 relative">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-text-0 mb-4 tracking-tight">
                        How <span className="text-gradient">it works.</span>
                    </h2>
                    <p className="text-text-2 max-w-xl mx-auto text-lg font-mono">
                        Our engine processes millions of lines of context in seconds to generate an accurate technical footprint.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting UI line for Desktop */}
                    <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-stroke to-transparent" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-sm bg-surface-1 border border-stroke flex items-center justify-center mb-6 relative z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] group hover:border-amber/50 transition-all">
                                <div className="absolute inset-0 bg-amber/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {step.icon}
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-surface-3 border border-stroke flex items-center justify-center text-xs font-bold text-text-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                                    {step.id}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-text-0 mb-3">{step.title}</h3>
                            <p className="text-text-2 font-mono text-sm leading-relaxed max-w-xs">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
