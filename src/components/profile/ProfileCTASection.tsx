// src/components/profile/ProfileCTASection.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function ProfileCTASection() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="py-24 px-5 relative border-t border-stroke/50">
            {/* Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="w-[800px] h-[400px] bg-amber/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-display font-bold text-text-0 mb-6 tracking-tighter"
                >
                    Ready to decode their DNA?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-text-2 mb-10 max-w-xl mx-auto font-mono"
                >
                    Stop guessing developers' skills. Start leveraging AI to get absolute clarity on their engineering talents.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    onClick={scrollToTop}
                    className="btn-cta !px-8 !py-4 text-base inline-flex items-center gap-2 group !bg-amber hover:!bg-amber-dim !text-black font-mono font-bold tracking-widest uppercase !rounded-[2px]"
                >
                    Execute Scan
                    <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>
        </section>
    );
}
