'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Docs', href: '/docs' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: session, status } = useSession();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stroke bg-surface-0/70 backdrop-blur-2xl">
            <div className="mx-auto max-w-6xl px-5">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logo.png"
                            alt="Traceon Logo"
                            width={28}
                            height={28}
                            className="rounded-md group-hover:opacity-80 transition-opacity"
                        />
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
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium">
                        {status === 'loading' ? (
                            <div className="w-20 h-8 rounded bg-surface-2 animate-pulse" />
                        ) : session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="px-3 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/profile"
                                    className="px-2 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors flex items-center gap-2"
                                >
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-stroke" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center text-[10px] font-bold font-mono">
                                            {session.user?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                    Profile
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="px-3 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors flex items-center gap-1.5"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/"
                                    className="btn-cta !text-[13px] !py-1.5 !px-4"
                                >
                                    Get Started
                                    <span className="kbd">⌘K</span>
                                </Link>
                            </>
                        )}
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
                        <div className="pt-3 mt-2 border-t border-stroke flex flex-col gap-2">
                            {status === 'loading' ? (
                                <div className="h-9 w-full rounded bg-surface-2 animate-pulse" />
                            ) : session ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="btn-ghost flex justify-center !text-sm w-full"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="btn-ghost flex justify-center items-center gap-2 !text-sm w-full"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="btn-ghost flex justify-center !text-sm w-full"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/"
                                        className="btn-cta flex justify-center !text-sm w-full"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
