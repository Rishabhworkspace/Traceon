// src/components/profile/ProfileLandingHero.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Terminal, ArrowRight, Github, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TRENDING_PROFILES = ['gaearon', 'torvalds', 'sindresorhus', 'yyx990803', 'shuding', 't3dotgg'];

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
            {/* Animated Data Streams Background */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
                <style>
                    {`
                    @keyframes floatUp {
                        0% { transform: translateY(100vh); opacity: 0; }
                        20% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { transform: translateY(-100vh); opacity: 0; }
                    }
                    .data-stream-1 { animation: floatUp 15s linear infinite; }
                    .data-stream-2 { animation: floatUp 25s linear infinite 5s; }
                    .data-stream-3 { animation: floatUp 20s linear infinite 2s; }
                    .data-stream-4 { animation: floatUp 22s linear infinite 8s; }
                    .data-stream-5 { animation: floatUp 18s linear infinite 12s; }
                    `}
                </style>
                <div className="absolute left-[15%] w-[1px] h-[200px] bg-gradient-to-t from-transparent via-amber to-transparent data-stream-1" />
                <div className="absolute left-[35%] w-[1px] h-[300px] bg-gradient-to-t from-transparent via-emerald to-transparent data-stream-2" />
                <div className="absolute left-[50%] w-[2px] h-[150px] bg-gradient-to-t from-transparent via-amber-dim to-transparent data-stream-3" />
                <div className="absolute left-[75%] w-[1px] h-[250px] bg-gradient-to-t from-transparent via-emerald to-transparent data-stream-4" />
                <div className="absolute left-[85%] w-[1px] h-[400px] bg-gradient-to-t from-transparent via-amber to-transparent data-stream-5" />
            </div>

            {/* Ambient Lighting */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-amber/5 to-transparent pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMjAgMEwwIDBaTTAgMjBMMjAgMjBaIiBzdHJva2U9IiMzZjNmNDYiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] pointer-events-none opacity-50 z-0" />

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 rounded-2xl bg-surface-0 border border-stroke flex items-center justify-center mb-10 relative shadow-[inset_0_2px_20px_rgba(245,158,11,0.15)]"
                >
                    <div className="absolute inset-0 border border-amber/20 rounded-2xl animate-pulse-glow opacity-50" />
                    <Fingerprint className="w-10 h-10 text-amber relative z-10" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-text-0 mb-6 tracking-tighter leading-[1.05]"
                >
                    Decode their <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-dim to-amber pb-2 inline-block">Engineering DNA</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-text-2 max-w-2xl mx-auto mb-12 leading-relaxed font-mono"
                >
                    Go beyond star counts. Our LLM-powered engine parses code volumes, architectural choices, and commit hygiene to reveal true capabilities.
                </motion.p>

                {/* Command Center Search Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    onSubmit={handleSubmit}
                    className="w-full max-w-2xl relative group mt-4 z-20"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber/20 via-emerald/10 to-amber-dim/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
                    <div className="relative flex items-center bg-surface-0/90 backdrop-blur-xl border border-stroke rounded-2xl overflow-hidden shadow-2xl focus-within:border-amber/50 transition-all p-2">
                        <div className="pl-4 pr-3 flex items-center justify-center text-amber">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:flex items-center text-text-3 font-mono text-lg mr-2 select-none">
                            ~ / profile / 
                        </div>
                        <div className="sm:hidden flex items-center text-text-3 font-mono text-lg select-none mr-2">
                            ~/
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className="w-full py-3 sm:py-4 pr-4 bg-transparent text-text-0 placeholder-text-4 font-mono text-lg focus:outline-none"
                            spellCheck={false}
                        />
                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="bg-text-0 text-surface-0 px-6 py-3 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-text-1 disabled:opacity-50 disabled:hover:bg-text-0 transition-all active:scale-95 ml-2"
                        >
                            <span className="hidden sm:inline">Execute</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.form>

                {/* Trending Scans Marquee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-16 w-full max-w-4xl overflow-hidden relative z-10 opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                    <div className="flex items-center gap-2 mb-6 justify-center text-xs font-mono text-text-3 uppercase tracking-widest">
                        <Activity className="w-3.5 h-3.5 text-emerald" />
                        Trending Profiles
                    </div>
                    {/* Mask for fading edges */}
                    <div className="relative w-full flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                        <div className="flex animate-marquee hover:[animation-play-state:paused] w-[200%]">
                            {[1, 2].map((group) => (
                                <div key={group} className="flex w-1/2 shrink-0 gap-4 justify-around pr-4">
                                    {TRENDING_PROFILES.map((profile, i) => (
                                        <button
                                            key={`${profile}-${i}`}
                                            type="button"
                                            onClick={() => {
                                                setUsername(profile);
                                                router.push(`/profile/${profile}`);
                                            }}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-stroke bg-surface-1/80 backdrop-blur-md hover:bg-surface-2 hover:border-amber/40 transition-all whitespace-nowrap group shrink-0 shadow-sm"
                                        >
                                            <Github className="w-4 h-4 text-text-3 group-hover:text-amber transition-colors" />
                                            <span className="font-mono text-sm text-text-2 group-hover:text-text-0 transition-colors">@{profile}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
