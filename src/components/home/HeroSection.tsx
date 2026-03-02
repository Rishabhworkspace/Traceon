'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';

const TYPING_LINES = [
    '$ traceon analyze https://github.com/vercel/next.js',
    '→ Cloning repository...',
    '→ Scanning 2,847 files',
    '→ Building dependency graph',
    '✓ Analysis complete — 342 modules, 1,208 edges',
];

export function HeroSection() {
    const [repoUrl, setRepoUrl] = useState('');
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const router = useRouter();
    const terminalRef = useRef<HTMLDivElement>(null);

    // Terminal typing effect
    useEffect(() => {
        if (currentLine >= TYPING_LINES.length) return;

        const line = TYPING_LINES[currentLine];
        if (currentChar < line.length) {
            const speed = currentLine === 0 ? 40 : 20;
            const timer = setTimeout(() => {
                setCurrentChar((c) => c + 1);
            }, speed);
            return () => clearTimeout(timer);
        } else {
            const delay = currentLine === 0 ? 800 : 400;
            const timer = setTimeout(() => {
                setTerminalLines((prev) => [...prev, line]);
                setCurrentLine((l) => l + 1);
                setCurrentChar(0);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [currentLine, currentChar]);

    // Cursor blink
    useEffect(() => {
        const interval = setInterval(() => setShowCursor((v) => !v), 530);
        return () => clearInterval(interval);
    }, []);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (repoUrl.trim()) {
            router.push(`/analyze?url=${encodeURIComponent(repoUrl.trim())}`);
        }
    };

    const currentTypingText =
        currentLine < TYPING_LINES.length
            ? TYPING_LINES[currentLine].slice(0, currentChar)
            : '';

    return (
        <section className="relative overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald/[0.04] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-28 sm:pb-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — Copy */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stroke bg-surface-1 mb-6 animate-fade-up">
                            <span className="status-dot" />
                            <span className="mono-label">Open Source</span>
                            <ChevronRight className="w-3 h-3 text-text-3" />
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-extrabold tracking-[-0.04em] leading-[1.05] mb-5 animate-fade-up animate-delay-1">
                            Understand any
                            <br />
                            codebase in
                            <br />
                            <span className="text-gradient">seconds.</span>
                        </h1>

                        <p className="text-base sm:text-lg text-text-2 max-w-md leading-relaxed mb-8 animate-fade-up animate-delay-2">
                            Paste a GitHub URL. Get an interactive dependency graph,
                            architecture map, and impact analysis — no signup required.
                        </p>

                        {/* CTA Input */}
                        <form
                            onSubmit={handleAnalyze}
                            className="animate-fade-up animate-delay-3"
                        >
                            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-1 border border-stroke max-w-lg">
                                <span className="pl-3 text-emerald font-mono text-sm select-none">
                                    $
                                </span>
                                <input
                                    type="url"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    placeholder="github.com/user/repo"
                                    className="flex-1 bg-transparent text-text-0 placeholder-text-3 text-sm outline-none py-2.5 font-mono"
                                    id="repo-url-input"
                                />
                                <button type="submit" className="btn-cta !rounded-lg !text-sm">
                                    Analyze
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>

                        <p className="mt-4 text-xs text-text-3 font-mono animate-fade-up animate-delay-4">
                            JS / TS repos · Free tier · No account needed
                        </p>
                    </div>

                    {/* Right — Terminal mockup */}
                    <div className="animate-fade-up animate-delay-3">
                        <div className="card overflow-hidden">
                            {/* Terminal title bar */}
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stroke bg-surface-1">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald/60" />
                                </div>
                                <span className="text-[11px] text-text-3 font-mono ml-2">
                                    traceon — terminal
                                </span>
                            </div>

                            {/* Terminal body */}
                            <div
                                ref={terminalRef}
                                className="p-4 font-mono text-[13px] leading-relaxed h-[220px] overflow-hidden"
                            >
                                {terminalLines.map((line, i) => (
                                    <div
                                        key={i}
                                        className={`${line.startsWith('$')
                                                ? 'text-text-0'
                                                : line.startsWith('✓')
                                                    ? 'text-emerald'
                                                    : 'text-text-2'
                                            }`}
                                    >
                                        {line}
                                    </div>
                                ))}
                                {currentLine < TYPING_LINES.length && (
                                    <div
                                        className={`${TYPING_LINES[currentLine].startsWith('$')
                                                ? 'text-text-0'
                                                : TYPING_LINES[currentLine].startsWith('✓')
                                                    ? 'text-emerald'
                                                    : 'text-text-2'
                                            }`}
                                    >
                                        {currentTypingText}
                                        <span
                                            className={`inline-block w-[7px] h-[15px] bg-emerald ml-px align-middle ${showCursor ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="divider" />
        </section>
    );
}
