'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Github, Chrome, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-56px)] bg-surface-0 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Panel: Visuals & Brand Story */}
            <div className="relative hidden lg:flex flex-col flex-1 bg-surface-1 overflow-hidden border-r border-stroke">
                {/* Animated Gradient Background */}
                 <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber/10 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                {/* Animated Codebase Node Network */}
                <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none z-0">
                    <style>
                        {`
                        @keyframes panGraph {
                            0% { transform: translateY(0) scale(1.05); }
                            50% { transform: translateY(-30px) scale(1); }
                            100% { transform: translateY(0) scale(1.05); }
                        }
                        @keyframes pulseNode {
                            0%, 100% { fill: rgba(16,185,129,0.2); r: 3; }
                            50% { fill: rgba(16,185,129,1); r: 5; box-shadow: 0 0 10px rgba(16,185,129,0.8); }
                        }
                        @keyframes floatDash {
                            to { stroke-dashoffset: -100; }
                        }
                        .animate-graph {
                            animation: panGraph 20s ease-in-out infinite;
                        }
                        .node-1 { animation: pulseNode 3s infinite 0.1s; }
                        .node-2 { animation: pulseNode 4s infinite 1.2s; }
                        .node-3 { animation: pulseNode 3.5s infinite 2.3s; }
                        .node-4 { animation: pulseNode 5s infinite 0.7s; }
                        .node-5 { animation: pulseNode 4.2s infinite 3.1s; }
                        
                        .data-stream {
                            stroke-dasharray: 4 12;
                            animation: floatDash 2s linear infinite;
                        }
                        .data-stream-reverse {
                            stroke-dasharray: 4 12;
                            animation: floatDash 2s linear infinite reverse;
                        }
                        `}
                    </style>
                    <svg width="100%" height="100%" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" className="animate-graph">
                        <defs>
                            <pattern id="network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                                {/* Connecting Lines */}
                                <path d="M50 50 L150 50 L100 150 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <path d="M50 50 L100 0 L150 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <path d="M50 150 L100 200 L150 150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="100" y1="150" x2="100" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="50" y1="50" x2="50" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="150" y1="50" x2="150" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                
                                {/* Active Data Streams */}
                                <line x1="50" y1="50" x2="150" y2="50" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" className="data-stream" />
                                <line x1="100" y1="150" x2="50" y2="50" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" className="data-stream-reverse" />
                                <line x1="150" y1="50" x2="100" y2="150" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" className="data-stream" />

                                {/* Nodes */}
                                <circle cx="50" cy="50" className="node-1" />
                                <circle cx="150" cy="50" className="node-2" />
                                <circle cx="100" cy="150" className="node-3" />
                                <circle cx="100" cy="0" className="node-4" />
                                <circle cx="100" cy="200" className="node-5" />
                                <circle cx="50" cy="150" className="node-1" />
                                <circle cx="150" cy="150" className="node-2" />
                            </pattern>
                        </defs>
                        <rect width="200%" height="200%" fill="url(#network-pattern)" className="-translate-x-1/4 -translate-y-1/4" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald/20 border border-emerald/30 flex items-center justify-center">
                            <span className="text-emerald font-bold font-mono">T</span>
                        </div>
                        <span className="font-display font-bold text-xl tracking-wide">traceon</span>
                    </div>

                    <div className="max-w-md">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-3xl font-display font-medium leading-normal text-text-0 mb-8"
                        >
                            Unlock absolute clarity for your codebase architecture.
                        </motion.h2>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="space-y-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald border border-emerald/20">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <p className="text-text-1 font-medium">Instantly map hidden dependencies</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald border border-emerald/20">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <p className="text-text-1 font-medium">Evaluate engineering talent effectively</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald border border-emerald/20">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <p className="text-text-1 font-medium">Enterprise-grade security and scale</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Authentication Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-surface-0">
                
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald/20 border border-emerald/30 flex items-center justify-center">
                        <span className="text-emerald font-bold font-mono">T</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-wide">traceon</span>
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[420px]"
                >
                    <div className="text-center md:text-left mb-10">
                        <h1 className="text-4xl font-display font-bold text-text-0 tracking-tight mb-3">
                            Welcome to <span className="text-emerald">Traceon</span>
                        </h1>
                        <p className="text-text-2 mb-6">
                            Sign in to access your intelligence graphs
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-stroke text-xs font-medium text-text-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
                            </span>
                            Secure Authentication
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-1 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-surface-0 border border-stroke text-text-0 text-md rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all placeholder:text-text-4 shadow-sm"
                                    placeholder="you@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-1 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-surface-0 border border-stroke text-text-0 text-md rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all placeholder:text-text-4 shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl bg-text-0 text-surface-0 font-medium text-md hover:bg-text-1 transition-colors relative overflow-hidden group mt-6 shadow-md"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-surface-0 relative z-10" />
                            ) : (
                                <span className="relative z-10">Sign in with Email</span>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stroke"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-surface-0 px-4 text-text-3 font-medium">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-stroke bg-surface-0 hover:bg-surface-1 transition-colors text-sm font-medium text-text-0 shadow-sm"
                        >
                            <Chrome className="w-5 h-5" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => signIn('github', { callbackUrl: '/' })}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-stroke bg-surface-0 hover:bg-surface-1 transition-colors text-sm font-medium text-text-0 shadow-sm"
                        >
                            <Github className="w-5 h-5" />
                            GitHub
                        </button>
                    </div>

                    <p className="text-center text-sm text-text-3">
                        By continuing, you agree to our <a href="#" className="underline hover:text-text-2">Terms of Service</a> and <a href="#" className="underline hover:text-text-2">Privacy Policy</a>.
                    </p>
                    
                    <p className="text-center text-sm text-text-3 mt-4">
                        Don't have an account? <Link href="/signup" className="text-emerald hover:text-emerald/80 transition-colors font-medium">Sign up</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
