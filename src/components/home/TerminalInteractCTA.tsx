'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function TerminalInteractCTA() {
    const [inputValue, setInputValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = inputValue.trim();
        if (!value) return;

        setIsSubmitting(true);
        setError('');

        try {
            // Determine if it's a URL (Repo) or Handle (Profile)
            if (value.startsWith('http') || value.includes('github.com')) {
                // Repo flow
                let localSessionId = localStorage.getItem('traceon_guest_session');
                if (!localSessionId) {
                    localSessionId = crypto.randomUUID();
                    localStorage.setItem('traceon_guest_session', localSessionId);
                }

                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ repoUrl: value, sessionId: localSessionId }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Error initializing analysis');
                
                router.push(`/analyze?id=${data.repositoryId}`);
            } else {
                // Profile flow
                const handle = value.replace(/^@/, '');
                router.push(`/profile/${handle}`);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-32 relative">
            <div className="absolute inset-0 bg-surface-1/30" />
            
            <div className="mx-auto max-w-4xl px-5 relative z-10">
                <div className="text-center mb-12">
                     <h2 className="text-3xl sm:text-5xl font-display font-bold mb-4">
                        Ready to extract intelligence?
                    </h2>
                    <p className="text-text-2">
                        Execute the analyzer on any public GitHub repository or developer profile.
                    </p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl overflow-hidden border border-stroke/80 bg-surface-0 shadow-2xl cursor-text group"
                    onClick={() => inputRef.current?.focus()}
                >
                    {/* Ambient Terminal Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 via-transparent to-amber/5 pointer-events-none opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke/60 bg-surface-1/50">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose border border-rose/20" />
                            <div className="w-3 h-3 rounded-full bg-amber border border-amber/20" />
                            <div className="w-3 h-3 rounded-full bg-emerald border border-emerald/20" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-text-3">
                                <Terminal className="w-3 h-3" />
                                <span>traceon-cli — bash</span>
                            </div>
                        </div>
                    </div>

                    {/* Terminal Body */}
                    <div className="p-6 sm:p-8 font-mono text-sm relative">
                        <div className="text-text-2 mb-4">
                            Type a GitHub URL to map a codebase <span className="text-emerald">(e.g., https://github.com/facebook/react)</span><br/>
                            Or type a username to decode a developer <span className="text-amber">(e.g., @torvalds)</span>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <span className="text-emerald mr-3 select-none flex-shrink-0 font-bold">traceon $</span>
                            <input 
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-transparent border-none outline-none text-text-0 placeholder-text-3 font-mono flex-1 caret-emerald"
                                placeholder="..."
                                spellCheck={false}
                                autoCorrect="off"
                            />
                            
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isSubmitting}
                                className="absolute right-0 flex items-center gap-2 px-4 py-1.5 bg-surface-2 hover:bg-surface-3 transition-colors border border-stroke rounded-md text-xs font-bold uppercase tracking-wider disabled:opacity-0 disabled:pointer-events-none"
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Execute <ArrowRight className="w-3.5 h-3.5" /></>}
                            </button>
                        </form>
                        
                        {error && (
                            <div className="mt-4 text-rose text-xs">
                                [ERROR] {error}
                            </div>
                        )}
                    </div>
                </motion.div>
                
                <div className="text-center mt-8">
                     <div className="inline-flex items-center gap-3 text-xs font-mono text-text-3">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" /> Free for public repos</span>
                        <span>·</span>
                        <span>No auth required</span>
                     </div>
                </div>
            </div>
        </section>
    );
}
