'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, CheckCircle2, XCircle, Search, Target, RefreshCw } from 'lucide-react';

interface SquadMatcherProps {
    data: any; // Entire profile data payload
}

export function SquadMatcher({ data }: SquadMatcherProps) {
    const [inputStack, setInputStack] = useState<string>('React, TypeScript, Node.js, AWS, PostgreSQL, Tailwind');
    const [isScanning, setIsScanning] = useState(false);

    // Flatten all discovered skills from the profile
    const profileSkills = useMemo(() => {
        const skills = new Set<string>();

        // 1. Languages
        if (data.techStack) {
            Object.keys(data.techStack).forEach(lang => {
                skills.add(lang.toLowerCase().trim());
            });
        }

        // 2. AI Extracted Skills
        if (data.aiAssessment?.skillsByDomain) {
            data.aiAssessment.skillsByDomain.forEach((domainData: any) => {
                domainData.skills.forEach((skill: string) => {
                    skills.add(skill.toLowerCase().trim());
                });
            });
        }

        return skills;
    }, [data]);

    // Parse user input requirement
    const requiredSkills = useMemo(() => {
        return inputStack
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }, [inputStack]);

    // Calculate match
    const { matched, missing, score } = useMemo(() => {
        const matched: string[] = [];
        const missing: string[] = [];

        requiredSkills.forEach(req => {
            const normalizedReq = req.toLowerCase();
            // Basic string inclusion heuristic (e.g., "node.js" matches "node", "reactjs" matches "react")
            let isMatched = false;
            for (const profileSkill of Array.from(profileSkills)) {
                if (profileSkill.includes(normalizedReq) || normalizedReq.includes(profileSkill)) {
                    isMatched = true;
                    break;
                }
            }

            if (isMatched) {
                matched.push(req);
            } else {
                missing.push(req);
            }
        });

        const scoreObj = requiredSkills.length > 0
            ? Math.round((matched.length / requiredSkills.length) * 100)
            : 0;

        return { matched, missing, score: scoreObj };
    }, [requiredSkills, profileSkills]);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 800);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-up animate-delay-1">
            {/* Header */}
            <div className="card p-5 !rounded-sm bg-surface-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-stroke/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-sm bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">Squad Compatibility</h3>
                        <p className="text-[10px] uppercase tracking-widest text-text-3 font-mono">Biometric Stack Matching</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Inputs Grid */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
                    <div className="card p-5 !rounded-sm bg-[#050505] border border-stroke/50 shadow-inner flex flex-col gap-4 h-full">
                        <div className="flex items-center gap-2 text-text-2 border-b border-stroke/30 pb-3">
                            <Target className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-sm font-bold uppercase tracking-wider font-mono">Target Protocol</h4>
                        </div>
                        <p className="text-xs text-text-3 font-mono opacity-80">
                            Input the required tech stack for your squad (comma separated).
                        </p>

                        <textarea
                            value={inputStack}
                            onChange={(e) => setInputStack(e.target.value)}
                            className="w-full bg-surface-1/50 border border-stroke/50 rounded-sm p-3 text-sm font-mono text-text-1 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none h-32"
                            placeholder="e.g. Next.js, TailwdinCSS, Prisma, Go"
                        />

                        <button
                            onClick={handleScan}
                            disabled={isScanning || requiredSkills.length === 0}
                            className={`mt-auto w-full py-3 rounded-sm font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${isScanning
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-surface-2 text-text-1 border border-stroke hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-surface-3 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                }`}
                        >
                            {isScanning ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Scanning DNA...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Run Match Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results UI */}
                <div className="col-span-1 lg:col-span-8">
                    <div className="card p-6 !rounded-sm bg-surface-1 border border-stroke/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] h-full relative overflow-hidden flex flex-col sm:flex-row gap-8 items-center">

                        {/* Background glowing effects */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
                        <div className={`absolute left-0 bottom-0 w-64 h-64 rounded-full blur-[80px] ${score > 75 ? 'bg-emerald/5' : score > 40 ? 'bg-amber/5' : 'bg-rose/5'}`} />

                        {/* Radial Progress/Score Circle */}
                        <div className="relative shrink-0 flex items-center justify-center flex-col gap-4">
                            <div className="relative w-40 h-40 group">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {/* Track */}
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="transparent" stroke="currentColor" strokeWidth="6"
                                        className="text-surface-3 drop-shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                                    />
                                    {/* Progress */}
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        className={`transition-colors duration-500 ${isScanning ? 'text-indigo-500' :
                                            score > 75 ? 'text-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                score > 40 ? 'text-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                    'text-rose drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                            }`}
                                        initial={{ strokeDasharray: '0 283' }}
                                        animate={{
                                            strokeDasharray: isScanning ? '20 283' : `${(score / 100) * 283} 283`,
                                            rotate: isScanning ? [0, 360] : 0
                                        }}
                                        transition={{ duration: isScanning ? 1.5 : 1, ease: 'easeOut', repeat: isScanning ? Infinity : 0 }}
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-display font-bold text-text-0 tracking-tighter">
                                        {isScanning ? '--' : score}<span className="text-xl text-text-3">%</span>
                                    </span>
                                    <span className="text-[10px] uppercase font-mono tracking-widest text-text-3 mt-1">
                                        Match
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 text-xs font-mono font-bold tracking-tight">
                                <div className="flex items-center gap-1.5 text-emerald">
                                    <CheckCircle2 className="w-4 h-4" /> {matched.length}
                                </div>
                                <div className="flex items-center gap-1.5 text-rose">
                                    <XCircle className="w-4 h-4" /> {missing.length}
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Lists */}
                        <div className="flex-1 w-full flex flex-col gap-6 relative z-10">

                            {/* Matched */}
                            <div>
                                <h5 className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-3 mb-3 border-b border-stroke/50 pb-2">
                                    Verified Capabilities
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {matched.length > 0 ? matched.map((m, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={m}
                                            className="px-2.5 py-1 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-bold font-mono rounded-sm flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-3 h-3" /> {m}
                                        </motion.div>
                                    )) : (
                                        <div className="text-xs font-mono text-text-4 italic">No verified capabilities detected.</div>
                                    )}
                                </div>
                            </div>

                            {/* Missing */}
                            <div>
                                <h5 className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-3 mb-3 border-b border-stroke/50 pb-2">
                                    Missing / Unverified
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {missing.length > 0 ? missing.map((m, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={m}
                                            className="px-2.5 py-1 bg-rose/10 border border-rose/20 text-rose text-xs font-bold font-mono rounded-sm flex items-center gap-1.5 opacity-80"
                                        >
                                            <XCircle className="w-3 h-3" /> {m}
                                        </motion.div>
                                    )) : (
                                        <div className="text-xs font-mono text-text-4 italic text-emerald">100% stack compatibility achieved.</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
