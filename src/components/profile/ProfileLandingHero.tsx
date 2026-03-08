// src/components/profile/ProfileLandingHero.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, Cpu, Database, Fingerprint } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProfileLandingHero() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = username.trim();
        if (trimmed) {
            router.push(`/profile/${trimmed}`);
        }
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-24 px-5 overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-amber/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMjAgMEwwIDBaTTAgMjBMMjAgMjBaIiBzdHJva2U9IiMzZjNmNDYiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] pointer-events-none opacity-50" />

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 rounded-sm bg-surface-0 border border-stroke flex items-center justify-center mb-10 relative shadow-[inset_0_2px_10px_rgba(245,158,11,0.1)]"
                >
                    <div className="absolute inset-0 border border-amber/20 rounded-sm animate-pulse-glow opacity-50" />
                    <Fingerprint className="w-10 h-10 text-amber relative z-10" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-text-0 mb-6 tracking-tighter leading-[1.05]"
                >
                    Analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-dim to-amber pb-2 inline-block">Engineering DNA</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-text-2 max-w-2xl mx-auto mb-12 leading-relaxed font-mono"
                >
                    Go beyond star counts. Our LLM-powered engine parses code volumes, architectural choices, and commit hygiene to reveal the true capabilities behind a GitHub profile.
                </motion.p>

                {/* Input Search Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    onSubmit={handleSubmit}
                    className="w-full max-w-lg relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber/20 to-amber-dim/20 rounded-sm blur-md opacity-25 group-hover:opacity-50 transition duration-500" />
                    <div className="relative flex items-center bg-surface-0 border border-stroke rounded-sm overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus-within:border-amber/50 transition-all">
                        <div className="pl-5 pr-2 flex items-center justify-center">
                            <span className="text-amber font-mono text-lg select-none font-bold">@</span>
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className="w-full py-4 pr-4 bg-transparent text-text-0 placeholder-text-3 font-mono text-lg focus:outline-none"
                            spellCheck={false}
                        />
                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="bg-amber text-black px-8 py-4 font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-amber-dim disabled:opacity-50 disabled:hover:bg-amber transition-colors"
                        >
                            Scan
                        </button>
                    </div>
                </motion.form>

                {/* Feature Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full"
                >
                    <div className="card p-8 border-stroke bg-surface-1 hover:bg-surface-2 flex flex-col items-center text-center group transition-all duration-300 hover:border-emerald/30 relative overflow-hidden rounded-sm group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald/0 via-emerald to-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="w-14 h-14 rounded-sm bg-surface-3 border border-stroke flex items-center justify-center mb-5 relative z-10 group-hover:border-emerald/30 group-hover:bg-emerald/5 transition-colors duration-300">
                            <Cpu className="w-6 h-6 text-emerald" />
                        </div>
                        <h3 className="text-lg font-bold text-text-0 mb-3 relative z-10 font-display">Tech Stack Volume</h3>
                        <p className="text-sm text-text-2 font-mono leading-relaxed relative z-10">Analyzes raw bytes across top repositories to determine true proficiency.</p>
                    </div>

                    <div className="card p-8 border-stroke bg-surface-1 hover:bg-surface-2 flex flex-col items-center text-center group transition-all duration-300 hover:border-amber/30 relative overflow-hidden rounded-sm group-hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)]">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber/0 via-amber to-amber/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-b from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="w-14 h-14 rounded-sm bg-surface-3 border border-stroke flex items-center justify-center mb-5 relative z-10 group-hover:border-amber/30 group-hover:bg-amber/5 transition-colors duration-300">
                            <ShieldAlert className="w-6 h-6 text-amber" />
                        </div>
                        <h3 className="text-lg font-bold text-text-0 mb-3 relative z-10 font-display">Quality Audit</h3>
                        <p className="text-sm text-text-2 font-mono leading-relaxed relative z-10">Evaluates commit message hygiene and architectural pattern maturity.</p>
                    </div>

                    <div className="card p-8 border-stroke bg-surface-1 hover:bg-surface-2 flex flex-col items-center text-center group transition-all duration-300 hover:border-emerald/30 relative overflow-hidden rounded-sm group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald/0 via-emerald to-emerald/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="w-14 h-14 rounded-sm bg-surface-3 border border-stroke flex items-center justify-center mb-5 relative z-10 group-hover:border-emerald/30 group-hover:bg-emerald/5 transition-colors duration-300">
                            <Database className="w-6 h-6 text-emerald" />
                        </div>
                        <h3 className="text-lg font-bold text-text-0 mb-3 relative z-10 font-display">Domain DNA</h3>
                        <p className="text-sm text-text-2 font-mono leading-relaxed relative z-10">Calculates precise scores for Frontend, Backend, DevOps, AI, and Security.</p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
