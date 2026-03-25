'use client';

import { useRef, MouseEvent } from 'react';
import { motion, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Network, Shield, Zap, FileSearch, Code2, LineChart } from 'lucide-react';

const bentoFeatures = [
    {
        title: "Interactive Architecture Graph",
        description: "Force-directed visualization of your entire codebase. Zoom, pan, and inspect cross-package dependencies with Lerna/Nx boundary support.",
        icon: Network,
        accent: "text-emerald",
        accentBg: "bg-emerald/10",
        span: "col-span-1 md:col-span-2",
        tool: "Analyzer",
        type: "repo",
        glowColor: "rgba(16, 185, 129, 0.15)" // Emerald glow
    },
    {
        title: "AST Parsing engine",
        description: "Deep compiler extraction of imports, exports, and structures.",
        icon: Code2,
        accent: "text-emerald-dim",
        accentBg: "bg-emerald/5",
        span: "col-span-1",
        tool: "Analyzer",
        type: "repo",
        glowColor: "rgba(16, 185, 129, 0.15)"
    },
    {
        title: "Visual Blast Radius",
        description: "Select any file to instantly trace its impact score and visual risk level.",
        icon: Zap,
        accent: "text-emerald",
        accentBg: "bg-emerald/10",
        span: "col-span-1",
        tool: "Analyzer",
        type: "repo",
        glowColor: "rgba(16, 185, 129, 0.15)"
    },
    {
        title: "Engineering DNA Maps",
        description: "Machine-learning driven evaluation of a developer's architectural maturity, testing habits, and commit complexity across all their repositories.",
        icon: LineChart,
        accent: "text-amber",
        accentBg: "bg-amber/10",
        span: "col-span-1 md:col-span-2",
        tool: "Profiles",
        type: "profile",
        glowColor: "rgba(245, 158, 11, 0.15)" // Amber glow
    },
    {
        title: "Commit Quality",
        description: "Analyze the semantic structure and impact of historical commits.",
        icon: FileSearch,
        accent: "text-amber-dim",
        accentBg: "bg-amber/5",
        span: "col-span-1",
        tool: "Profiles",
        type: "profile",
        glowColor: "rgba(245, 158, 11, 0.15)"
    },
    {
        title: "Language Mastery",
        description: "Quantify real-world experience beyond simple line counts.",
        icon: Shield,
        accent: "text-amber",
        accentBg: "bg-amber/10",
        span: "col-span-1",
        tool: "Profiles",
        type: "profile",
        glowColor: "rgba(245, 158, 11, 0.15)"
    }
];

function BentoCard({ feature, index, isInView }: { feature: any, index: number, isInView: boolean }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const isProfile = feature.type === 'profile';
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            className={`relative p-8 rounded-2xl border border-stroke bg-surface-1/60 backdrop-blur-md overflow-hidden group transition-all duration-300 ${feature.span} ${isProfile ? 'hover:border-amber/40 hover:bg-surface-2' : 'hover:border-emerald/40 hover:bg-surface-2'}`}
        >
            {/* Mouse Tracking Glow */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            ${feature.glowColor},
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.accentBg}`}>
                    <Icon className={`w-6 h-6 ${feature.accent}`} />
                </div>
                <div className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-widest border bg-surface-0 ${isProfile ? 'border-amber/20 text-amber' : 'border-emerald/20 text-emerald'}`}>
                    {feature.tool}
                </div>
            </div>
            
            <h3 className="text-xl font-display font-bold mb-3 text-text-0 relative z-10 tracking-tight">
                {feature.title}
            </h3>
            
            <p className="text-sm text-text-2 leading-relaxed relative z-10">
                {feature.description}
            </p>

            {/* Accent corner */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none ${isProfile ? 'bg-amber' : 'bg-emerald'}`} />
        </motion.div>
    );
}

export function UnifiedBento() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section id="features" className="py-24 relative">
            <div className="mx-auto max-w-6xl px-5" ref={ref}>
                
                <div className="mb-16">
                    <span className="mono-label block mb-3">{'// unified capabilities'}</span>
                    <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3 tracking-tight">
                        Every angle of your engineering org.
                        <br />
                        <span className="text-text-2">Mapped. Measured. Mastered.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bentoFeatures.map((feature, index) => (
                        <BentoCard key={feature.title} feature={feature} index={index} isInView={isInView} />
                    ))}
                </div>
            </div>
        </section>
    );
}
