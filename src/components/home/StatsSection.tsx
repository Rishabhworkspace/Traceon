'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, GitFork, Boxes, Timer } from 'lucide-react';

const INITIAL_STATS = [
    {
        icon: Activity,
        value: '12,400+',
        label: 'Repos Analyzed',
        description: 'Public repositories scanned',
    },
    {
        icon: Boxes,
        value: '2.1M+',
        label: 'Files Parsed',
        description: 'Source files processed via AST',
    },
    {
        icon: GitFork,
        value: '8.4M+',
        label: 'Edges Mapped',
        description: 'Dependencies traced and graphed',
    },
    {
        icon: Timer,
        value: '<30s',
        label: 'Avg Analysis',
        description: 'Time to full dependency graph',
    },
];

export function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const [stats, setStats] = useState(INITIAL_STATS);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (!res.ok) return;
                const data = await res.json();

                const formatNum = (num: number) => {
                    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
                    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
                    return num.toString();
                };

                setStats((prev) => [
                    { ...prev[0], value: formatNum(data.reposAnalyzed) },
                    { ...prev[1], value: formatNum(data.filesParsed) },
                    { ...prev[2], value: formatNum(data.edgesMapped) },
                    { ...prev[3], value: data.avgAnalysis || '<30s' },
                ]);
            } catch (error) {
                console.error('Failed to fetch live stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <section className="py-16" ref={ref}>
            <div className="mx-auto max-w-6xl px-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="card p-5 text-center group"
                            >
                                <Icon className="w-4 h-4 text-emerald mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="text-2xl sm:text-3xl font-display font-bold text-text-0 mb-1 tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-text-1 mb-0.5">
                                    {stat.label}
                                </div>
                                <div className="text-xs text-text-3 font-mono">
                                    {stat.description}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
