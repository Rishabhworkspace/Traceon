// src/components/profile/ProfileFeaturesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Brain, Award, ShieldCheck, LineChart, Code2 } from 'lucide-react';

const features = [
    {
        title: 'Beyond Star Counts',
        description: 'We don\'t just look at how many followers or stars a developer has. We analyze the actual code volume they\'ve contributed across multiple ecosystems.',
        icon: <Sparkles className="w-5 h-5 text-emerald" />
    },
    {
        title: 'Architectural Maturity',
        description: 'Our LLM evaluates project structure, design patterns, and how code is separated. We detect if a developer builds scalable systems or just scripts.',
        icon: <Brain className="w-5 h-5 text-amber" />
    },
    {
        title: 'Commit Hygiene',
        description: 'Meaningful commit messages matter. We analyze their history to judge communication skills and adherence to semantic versioning patterns.',
        icon: <ShieldCheck className="w-5 h-5 text-emerald" />
    },
    {
        title: 'Tech Stack Proficiency',
        description: 'By analyzing language byte distributions in top repositories, we mathematically calculate true proficiency in React, Go, Python, and more.',
        icon: <Code2 className="w-5 h-5 text-amber" />
    },
    {
        title: 'Engineering Archetypes',
        description: 'Are they a "Fullstack Visionary", an "Infrastructure Wizard", or a "Frontend Specialist"? Our AI assigns distinct personas based on real data.',
        icon: <Award className="w-5 h-5 text-rose" />
    },
    {
        title: 'Radar Chart DNA',
        description: 'Visualize their exact capabilities across Frontend, Backend, DevOps, Data Science, and Security through a meticulously generated radar chart.',
        icon: <LineChart className="w-5 h-5 text-emerald" />
    }
];

export function ProfileFeaturesSection() {
    return (
        <section className="py-24 px-5 relative border-t border-stroke/50 bg-surface-1/20">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-text-0 mb-4 tracking-tight">
                        Deep <span className="text-gradient">Context.</span> Not just stats.
                    </h2>
                    <p className="text-text-2 max-w-2xl mx-auto text-lg font-mono">
                        Traditional developer portfolios rely on self-reported skills. We rely on the absolute truth of public commits.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="card p-6 !rounded-sm bg-surface-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all hover:!border-amber/40 hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)] group"
                        >
                            <div className="w-10 h-10 rounded-sm bg-surface-3 border border-stroke flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber/5 transition-all">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-text-0 mb-2">{feature.title}</h3>
                            <p className="text-sm text-text-2 leading-relaxed font-mono">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
