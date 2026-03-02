'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Terminal } from 'lucide-react';

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Docs', href: '/docs' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stroke bg-surface-0/70 backdrop-blur-2xl">
            <div className="mx-auto max-w-6xl px-5">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald/10 border border-emerald/20 group-hover:bg-emerald/20 transition-all duration-200">
                            <Terminal className="w-3.5 h-3.5 text-emerald" />
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight font-display text-text-0">
                            traceon
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="px-3 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors rounded-md hover:bg-surface-2"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/login"
                            className="px-3 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/analyze"
                            className="btn-cta !text-[13px] !py-1.5 !px-4"
                        >
                            Get Started
                            <span className="kbd">⌘K</span>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-1.5 text-text-2 hover:text-text-0 rounded-md hover:bg-surface-2 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-stroke bg-surface-0/95 backdrop-blur-2xl">
                    <div className="px-5 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="block px-3 py-2 text-sm text-text-2 hover:text-text-0 hover:bg-surface-2 rounded-md transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 mt-2 border-t border-stroke flex gap-2">
                            <Link
                                href="/login"
                                className="btn-ghost flex-1 justify-center !text-sm"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/analyze"
                                className="btn-cta flex-1 justify-center !text-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
