'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GitBranch, Menu, X, LogIn } from 'lucide-react';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/20 group-hover:bg-accent-primary/20 transition-colors">
                            <GitBranch className="w-5 h-5 text-accent-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Trace<span className="gradient-text">on</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                            How it works
                        </Link>
                        <Link href="#demo" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                            Demo
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="btn-secondary !py-2.5 !px-5 text-sm flex items-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Login
                        </Link>
                        <Link href="/analyze" className="btn-primary !py-2.5 !px-5 text-sm">
                            Try Free
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-text-secondary hover:text-text-primary"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-bg-primary/95 backdrop-blur-xl">
                    <div className="px-4 py-4 space-y-3">
                        <Link href="#features" className="block text-sm text-text-secondary hover:text-text-primary py-2">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="block text-sm text-text-secondary hover:text-text-primary py-2">
                            How it works
                        </Link>
                        <Link href="#demo" className="block text-sm text-text-secondary hover:text-text-primary py-2">
                            Demo
                        </Link>
                        <div className="pt-3 border-t border-border flex gap-3">
                            <Link href="/login" className="btn-secondary !py-2.5 !px-5 text-sm flex-1 text-center">
                                Login
                            </Link>
                            <Link href="/analyze" className="btn-primary !py-2.5 !px-5 text-sm flex-1 text-center">
                                Try Free
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
