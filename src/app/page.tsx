"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint } from "lucide-react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%-=_+[]{}<>";
const TARGET = "TRACEON";

export default function TraceonIntroPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let currentProgress = 0;
    
    // Total duration of progress ~ 1.5s - 2s
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 8 + 2; // steady increments
      if (currentProgress > 100) currentProgress = 100;
      setProgress(currentProgress);
      
      if (currentProgress === 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          // Instead of hiding, we redirect to the actual home page
          router.push("/home");
        }, 800); // Hold at 100% for 0.8s before redirecting
      }
    }, 50);

    // Scramble text effect synced with progress
    const scrambleInterval = setInterval(() => {
      setDisplayText(
        TARGET.split("")
          .map((letter, index) => {
            // Reveal letters linearly based on progress percentage
            if (index < (TARGET.length * currentProgress) / 100) {
              return TARGET[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      
      if (currentProgress >= 100) {
        clearInterval(scrambleInterval);
        setDisplayText(TARGET);
      }
    }, 40);

    return () => {
      clearInterval(progressInterval);
      clearInterval(scrambleInterval);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Ambient Noise & High-tech Backdrop */}
      <div className="absolute inset-0 noise dot-matrix opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Central UI Container (Like Editron's Box) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center p-10 sm:p-14 rounded-2xl bg-surface-1/60 border border-stroke backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Subtle inner grid lines matching Tracey aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
            
            {/* Logo Icon with Fill effect */}
            <div className="w-20 h-20 rounded-xl bg-surface-0 border border-emerald/30 flex items-center justify-center mb-8 relative shadow-[inset_0_2px_15px_rgba(16,185,129,0.1)] overflow-hidden">
                <div className="absolute inset-0 bg-emerald/20 animate-pulse-glow opacity-50 block" />
                <Fingerprint className="w-10 h-10 text-emerald relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                
                {/* Loader overlay inside logo (fills up) */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 bg-emerald/20 z-0"
                  initial={{ height: "0%" }}
                  animate={{ height: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
            </div>

            {/* Traceon Scrambled Text */}
            <div className="flex items-center justify-center font-display font-bold tracking-[0.25em] mb-10 text-4xl sm:text-5xl text-text-0 h-12 text-center drop-shadow-md">
              {displayText || "       "}
            </div>

            {/* Progress Track */}
            <div className="w-full flex gap-3 flex-col">
               <div className="w-full h-[2px] bg-stroke rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 bg-emerald shadow-[0_0_10px_rgba(16,185,129,1)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
               </div>
               
               <div className="flex justify-between w-full text-[10px] font-mono text-emerald uppercase tracking-widest mt-1 opacity-80">
                  <span>Initializing Engine...</span>
                  <span className="tabular-nums font-bold">{Math.floor(progress)}%</span>
               </div>
            </div>

        </div>
      </motion.div>
    </div>
  );
}
