'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';

export function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-5" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="relative card overflow-hidden p-10 sm:p-16 text-center"
                >
                    {/* Background dot matrix */}
                    <div className="absolute inset-0 dot-matrix opacity-40 pointer-events-none" />

                    {/* Subtle glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald/[0.04] rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10">
                        <span className="mono-label block mb-4">{'// get started'}</span>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-[-0.03em] mb-4 max-w-xl mx-auto leading-[1.1]">
                            Ready to map
                            <br />
                            your codebase?
                        </h2>

                        <p className="text-text-2 text-base max-w-md mx-auto mb-8 leading-relaxed">
                            Free for all public repositories. No signup, no credit card,
                            no strings. Just paste and analyze.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    const input = document.getElementById('repo-url-input');
                                    if (input) {
                                        input.focus();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                                className="btn-cta !text-[15px] !py-3 !px-6"
                            >
                                Start Analyzing
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost !text-[15px] !py-3 !px-6"
                            >
                                <Github className="w-4 h-4" />
                                View Source
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
