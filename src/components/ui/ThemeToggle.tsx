'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
    className?: string;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        setTheme(currentTheme);

        const handleThemeChange = () => {
            const nextTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
            setTheme(nextTheme);
        };

        window.addEventListener('traceon-theme-change', handleThemeChange);
        window.addEventListener('storage', handleThemeChange);

        return () => {
            window.removeEventListener('traceon-theme-change', handleThemeChange);
            window.removeEventListener('storage', handleThemeChange);
        };
    }, []);

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        
        // Update document styles
        document.documentElement.dataset.theme = nextTheme;
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        document.documentElement.classList.toggle('light', nextTheme === 'light');
        window.localStorage.setItem('traceon-theme', nextTheme);
        setTheme(nextTheme);
        
        // Dispatch custom sync event
        window.dispatchEvent(new Event('traceon-theme-change'));

        // Spawn interactive particles
        const numParticles = 8;
        const colors = nextTheme === 'dark' ? ['#10b981', '#059669', '#34d399'] : ['#f59e0b', '#fbbf24', '#d97706'];
        const newParticles: Particle[] = Array.from({ length: numParticles }).map((_, i) => {
            const angle = (i * 360) / numParticles;
            const rad = (angle * Math.PI) / 180;
            const distance = Math.random() * 20 + 20; // radius of burst
            return {
                id: Date.now() + i,
                x: Math.cos(rad) * distance,
                y: Math.sin(rad) * distance,
                color: colors[Math.floor(Math.random() * colors.length)],
            };
        });

        setParticles(newParticles);
        setTimeout(() => {
            setParticles([]);
        }, 600);
    };

    if (!mounted) {
        return (
            <div className="w-8 h-8 rounded-md border border-stroke bg-surface-1 animate-pulse" />
        );
    }

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-stroke text-text-2 bg-surface-1 transition-all duration-300 hover:bg-surface-2 hover:text-text-0 hover:border-text-3 cursor-pointer overflow-visible ${className}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Particles container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {particles.map((p) => (
                    <motion.span
                        key={p.id}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
                        animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -10, opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ y: 10, opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex items-center justify-center"
                >
                    {isDark ? (
                        <Sun className="h-4 w-4 text-amber drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
                    ) : (
                        <Moon className="h-4 w-4 text-indigo-500 drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]" />
                    )}
                </motion.div>
            </AnimatePresence>
        </button>
    );
}
