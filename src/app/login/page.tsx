'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Key } from 'lucide-react';

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
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-surface-1),transparent_50%-[)] opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-1 border border-stroke mb-4 text-emerald">
                        <Key className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-text-0 mb-2">
                        Welcome back
                    </h1>
                    <p className="text-sm text-text-2 font-mono">
                        {'// Authenticate to access your graph'}
                    </p>
                </div>

                <div className="card p-6 border-stroke">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-mono text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
                                {`> Error: ${error}`}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono text-text-3 font-medium mb-1.5 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-emerald font-mono">$</span>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface-0 border border-stroke text-text-0 text-sm rounded-md pl-8 pr-3 py-2.5 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all font-mono placeholder:text-text-4"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono text-text-3 font-medium mb-1.5 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-emerald font-mono">_</span>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-surface-0 border border-stroke text-text-0 text-sm rounded-md pl-8 pr-3 py-2.5 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all font-mono placeholder:text-text-4"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-cta mt-6 py-2.5 group relative"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto text-surface-0" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Sign in</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-text-3">New to Traceon? </span>
                        <Link
                            href="/signup"
                            className="text-emerald hover:text-emerald/80 transition-colors font-mono ml-1"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
