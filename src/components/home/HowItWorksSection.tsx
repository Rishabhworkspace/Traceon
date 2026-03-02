'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
    {
        num: '01',
        title: 'Paste a URL',
        description:
            'Drop any public GitHub repository URL into the terminal input. No account, no config, nothing.',
        code: '$ traceon analyze <repo-url>',
    },
    {
        num: '02',
        title: 'Auto Analysis',
        description:
            'Traceon clones the repo, scans every file, parses the AST, and constructs the full dependency graph.',
        code: '→ scanning 2,847 files...',
    },
    {
        num: '03',
        title: 'Explore',
        description:
            'Navigate the interactive graph. Click nodes, run impact analysis, inspect module details.',
        code: '✓ 342 modules · 1,208 edges',
    },
];

export function HowItWorksSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section id="how-it-works" className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-5" ref={ref}>
                {/* Section header */}
                <div className="mb-14">
                    <span className="mono-label block mb-3">{'// workflow'}</span>
                    <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-[-0.03em] mb-3">
                        Three commands.
                        <br />
                        <span className="text-text-2">Full architecture.</span>
                    </h2>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, x: -16 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.4, delay: index * 0.12 }}
                            className="card p-6 sm:p-8 group hover:border-emerald-dim transition-all duration-200"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                                {/* Step number */}
                                <div className="flex items-center gap-3 sm:min-w-[140px]">
                                    <span className="font-mono text-2xl font-bold text-text-3 group-hover:text-emerald transition-colors duration-200">
                                        {step.num}
                                    </span>
                                    <div className="hidden sm:block w-8 h-px bg-stroke group-hover:bg-emerald-dim group-hover:w-12 transition-all duration-300" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1.5">{step.title}</h3>
                                    <p className="text-sm text-text-2 leading-relaxed mb-3 max-w-lg">
                                        {step.description}
                                    </p>
                                    <code className="inline-block px-3 py-1.5 rounded-md bg-surface-1 border border-stroke-subtle text-[13px] font-mono text-emerald">
                                        {step.code}
                                    </code>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="divider mt-20 sm:mt-28" />
        </section>
    );
}
