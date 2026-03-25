'use client';

import { motion } from 'framer-motion';

const ecosystem = [
    { name: 'TypeScript', color: 'group-hover:text-[#3178C6] group-hover:drop-shadow-[0_0_8px_rgba(49,120,198,0.8)]' },
    { name: 'React', color: 'group-hover:text-[#61DAFB] group-hover:drop-shadow-[0_0_8px_rgba(97,218,251,0.8)]' },
    { name: 'Next.js', color: 'group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' },
    { name: 'Node.js', color: 'group-hover:text-[#339933] group-hover:drop-shadow-[0_0_8px_rgba(51,153,51,0.8)]' },
    { name: 'Python', color: 'group-hover:text-[#3776AB] group-hover:drop-shadow-[0_0_8px_rgba(55,118,171,0.8)]' },
    { name: 'Go', color: 'group-hover:text-[#00ADD8] group-hover:drop-shadow-[0_0_8px_rgba(0,173,216,0.8)]' },
    { name: 'Rust', color: 'group-hover:text-[#dea584] group-hover:drop-shadow-[0_0_8px_rgba(222,165,132,0.8)]' },
    { name: 'GitHub', color: 'group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' },
    { name: 'GitLab', color: 'group-hover:text-[#FCA121] group-hover:drop-shadow-[0_0_8px_rgba(252,161,33,0.8)]' },
    { name: 'Bitbucket', color: 'group-hover:text-[#0052CC] group-hover:drop-shadow-[0_0_8px_rgba(0,82,204,0.8)]' },
];

export function EcosystemMarquee() {
    // Duplicate the array to create a seamless infinite loop
    const tickerItems = [...ecosystem, ...ecosystem];

    return (
        <section className="py-12 border-y border-stroke/50 bg-surface-1/30 relative overflow-hidden flex flex-col items-center">
            
            <p className="text-xs font-mono text-text-3 uppercase tracking-widest mb-8">
                Seamlessly integrates with your ecosystem
            </p>

            {/* Left and Right Fade Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-0 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-0 to-transparent z-10 pointer-events-none" />

            <div className="flex w-full overflow-hidden group/marquee">
                <motion.div
                    className="flex shrink-0 w-max"
                    animate={{
                        x: ['0%', '-50%']
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    {/* Pause on hover capability */}
                    <div className="flex shrink-0 items-center justify-around min-w-[100vw] group-hover/marquee:[animation-play-state:paused] transition-all duration-300">
                        {tickerItems.map((item, index) => (
                            <div 
                                key={`${item.name}-${index}`}
                                className="px-8 group cursor-default transition-all duration-300"
                            >
                                <span className={`text-xl md:text-2xl font-display font-medium text-text-3 transition-all duration-300 ${item.color}`}>
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
