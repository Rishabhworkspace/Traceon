'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

const installCommands = {
    npm: 'npx traceon analyze <repo-url>',
    curl: 'curl -sSL traceon.dev/install | sh',
    docker: 'docker run -it traceon/cli analyze <repo>',
};

type PackageManager = keyof typeof installCommands;

export function InstallSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const [activeTab, setActiveTab] = useState<PackageManager>('npm');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(installCommands[activeTab]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    };

    return (
        <section className="py-20 sm:py-28" ref={ref}>
            <div className="mx-auto max-w-6xl px-5">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <span className="mono-label block mb-3">{'// quickstart'}</span>
                        <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-[-0.03em] mb-3">
                            One command.
                            <br />
                            <span className="text-text-2">That&apos;s it.</span>
                        </h2>
                    </div>

                    {/* Install card */}
                    <div className="card overflow-hidden">
                        {/* Tab bar */}
                        <div className="flex items-center gap-0 border-b border-stroke bg-surface-1">
                            {(Object.keys(installCommands) as PackageManager[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors relative ${activeTab === tab
                                            ? 'text-text-0 bg-surface-2'
                                            : 'text-text-3 hover:text-text-2'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="install-tab"
                                            className="absolute bottom-0 left-0 right-0 h-px bg-emerald"
                                        />
                                    )}
                                </button>
                            ))}
                            <div className="flex-1" />
                            <button
                                onClick={handleCopy}
                                className="px-3 py-2 mr-1 text-text-3 hover:text-text-0 transition-colors rounded-md hover:bg-surface-3"
                                aria-label="Copy command"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                        >
                                            <Check className="w-3.5 h-3.5 text-emerald" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>

                        {/* Command */}
                        <div className="p-5 font-mono text-sm">
                            <span className="text-emerald select-none">$ </span>
                            <span className="text-text-0">{installCommands[activeTab]}</span>
                            <span className="inline-block w-[7px] h-[15px] bg-emerald ml-1 align-middle animate-blink" />
                        </div>
                    </div>

                    <p className="text-center mt-4 text-xs text-text-3 font-mono">
                        Requires Node.js 18+ · Works on macOS, Linux, and WSL
                    </p>
                </motion.div>
            </div>

            <div className="divider mt-20 sm:mt-28" />
        </section>
    );
}
