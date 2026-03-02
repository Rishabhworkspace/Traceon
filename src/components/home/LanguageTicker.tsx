'use client';

import { useEffect, useRef } from 'react';

const languages = [
    { name: 'TypeScript', ext: '.ts', color: '#3178c6' },
    { name: 'JavaScript', ext: '.js', color: '#f7df1e' },
    { name: 'React', ext: '.tsx', color: '#61dafb' },
    { name: 'Vue', ext: '.vue', color: '#42b883' },
    { name: 'Svelte', ext: '.svelte', color: '#ff3e00' },
    { name: 'Python', ext: '.py', color: '#3776ab' },
    { name: 'Go', ext: '.go', color: '#00add8' },
    { name: 'Rust', ext: '.rs', color: '#ce422b' },
    { name: 'Java', ext: '.java', color: '#ed8b00' },
    { name: 'C#', ext: '.cs', color: '#239120' },
    { name: 'Ruby', ext: '.rb', color: '#cc342d' },
    { name: 'PHP', ext: '.php', color: '#777bb4' },
];

export function LanguageTicker() {
    const tickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker) return;

        let animationId: number;
        let position = 0;

        const animate = () => {
            position -= 0.5;
            const halfWidth = ticker.scrollWidth / 2;
            if (Math.abs(position) >= halfWidth) {
                position = 0;
            }
            ticker.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, []);

    // Double the items for seamless loop
    const items = [...languages, ...languages];

    return (
        <section className="py-10 border-y border-stroke-subtle overflow-hidden">
            <div className="mx-auto max-w-6xl px-5 mb-5">
                <span className="mono-label">{'// supported languages'}</span>
            </div>
            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface-0 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-0 to-transparent z-10 pointer-events-none" />

                <div ref={tickerRef} className="flex items-center gap-4 whitespace-nowrap will-change-transform">
                    {items.map((lang, i) => (
                        <div
                            key={`${lang.name}-${i}`}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-surface-1 border border-stroke hover:border-text-3 transition-colors shrink-0 group"
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: lang.color }}
                            />
                            <span className="text-sm text-text-1 font-medium">
                                {lang.name}
                            </span>
                            <span className="text-xs text-text-3 font-mono">
                                {lang.ext}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
