'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const techStack = [
    { name: 'Next.js', version: '16', role: 'Framework' },
    { name: 'TypeScript', version: '5.x', role: 'Language' },
    { name: 'MongoDB', version: '7.x', role: 'Database' },
    { name: 'React Flow', version: '12', role: 'Graph Viz' },
    { name: 'Tree-sitter', version: 'latest', role: 'AST Parser' },
    { name: 'Framer Motion', version: '12', role: 'Animations' },
];

export function TechStackSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="py-16 border-t border-stroke-subtle" ref={ref}>
            <div className="mx-auto max-w-6xl px-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8">
                    <span className="mono-label shrink-0">{'// built with'}</span>
                    <div className="h-px flex-1 bg-stroke-subtle hidden sm:block" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {techStack.map((tech, index) => (
                        <motion.div
                            key={tech.name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: index * 0.06 }}
                            className="px-4 py-3 rounded-lg bg-surface-1 border border-stroke hover:border-text-3 transition-colors group"
                        >
                            <div className="text-sm font-medium text-text-0 group-hover:text-emerald transition-colors">
                                {tech.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-text-3 font-mono">
                                    v{tech.version}
                                </span>
                                <span className="text-text-3">·</span>
                                <span className="text-[11px] text-text-3">
                                    {tech.role}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
