'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Network,
    Shield,
    Zap,
    BarChart3,
    Code2,
    FileSearch,
} from 'lucide-react';

const features = [
    {
        icon: Code2,
        title: 'AST Parsing',
        description:
            'Tree-sitter powered analysis extracts every import, export, and structural relationship from your source.',
        accent: 'text-emerald',
        accentBg: 'bg-emerald/10',
        span: 'col-span-1',
    },
    {
        icon: Network,
        title: 'Dependency Graph',
        description:
            'Interactive force-directed visualization. Zoom, pan, click any node to inspect its connections.',
        accent: 'text-indigo',
        accentBg: 'bg-indigo/10',
        span: 'col-span-1 md:col-span-2',
    },
    {
        icon: Shield,
        title: 'Impact Analysis',
        description:
            'Select any file — instantly see every module affected by a change, before writing a single line.',
        accent: 'text-rose',
        accentBg: 'bg-rose/10',
        span: 'col-span-1',
    },
    {
        icon: Zap,
        title: 'Zero Friction',
        description:
            'No signup. No config. Paste a URL, hit enter, get architecture insights in under 30 seconds.',
        accent: 'text-amber',
        accentBg: 'bg-amber/10',
        span: 'col-span-1',
    },
    {
        icon: BarChart3,
        title: 'Risk Metrics',
        description:
            'Dependency density, module coupling scores, and critical path detection — calculated automatically.',
        accent: 'text-emerald',
        accentBg: 'bg-emerald/10',
        span: 'col-span-1',
    },
    {
        icon: FileSearch,
        title: 'File Inspector',
        description:
            'Click any node to drill into imports, exports, LOC, and the complete list of dependents.',
        accent: 'text-indigo',
        accentBg: 'bg-indigo/10',
        span: 'col-span-1 md:col-span-2',
    },
];

export function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section id="features" className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-5" ref={ref}>
                {/* Section header */}
                <div className="mb-14">
                    <span className="mono-label block mb-3">{'// capabilities'}</span>
                    <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-[-0.03em] mb-3">
                        Everything you need to
                        <br />
                        <span className="text-text-2">navigate unfamiliar code.</span>
                    </h2>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                className={`card card-glow p-6 ${feature.span} group`}
                            >
                                <div
                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${feature.accentBg} mb-4`}
                                >
                                    <Icon className={`w-4.5 h-4.5 ${feature.accent}`} />
                                </div>
                                <h3 className="text-[15px] font-semibold mb-1.5 text-text-0">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-text-2 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
