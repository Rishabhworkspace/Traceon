// src/components/profile/ProfileCTASection.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Github, ShieldCheck, Zap } from 'lucide-react';

export function ProfileCTASection() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="py-32 px-5 relative border-t border-stroke/50 bg-surface-0 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[400px] bg-amber/10 rounded-full blur-[120px]" />
                <div className="absolute w-[600px] h-[300px] bg-emerald/5 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber/30 bg-amber/10 text-amber font-mono text-sm font-bold mb-8 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                    <Zap className="w-4 h-4" />
                    System Ready
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-display font-bold text-text-0 mb-6 tracking-tighter leading-[1.1]"
                >
                    Ready to decode <br className="hidden md:block"/>
                    their <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-dim to-amber">DNA?</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-text-2 mb-12 max-w-2xl mx-auto font-mono leading-relaxed"
                >
                    Stop guessing developers' skills based on stars. Start leveraging AI to get absolute algorithmic clarity on engineering talents.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    onClick={scrollToTop}
                    className="relative group bg-amber text-black px-10 py-5 rounded-2xl font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-amber-dim transition-all active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)]"
                >
                    <div className="absolute inset-0 border-2 border-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10">Execute Scan</span>
                    <ArrowUpRight className="w-6 h-6 relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 flex flex-wrap justify-center items-center gap-8 text-text-3 font-mono text-sm"
                >
                    <div className="flex items-center gap-2">
                        <Github className="w-5 h-5 text-text-2" />
                        Live GitHub Integration
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald" />
                        Enterprise-Grade Analysis
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
