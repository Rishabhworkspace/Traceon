'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, LogOut, Moon, Sun } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const defaultNavLinks = [
    { label: 'Repo Analysis', href: '/repo' },
    { label: 'Profile DNA', href: '/profile-analytics' },
    { label: 'Docs', href: '/docs' },
];

const repoNavLinks = [
    { label: 'Features', href: '/repo#features' },
    { label: 'How it Works', href: '/repo#how-it-works' },
    { label: 'Docs', href: '/docs' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof document === 'undefined') return 'dark';
        return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    });
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const navLinks = pathname === '/repo' ? repoNavLinks : defaultNavLinks;
    const isDark = theme === 'dark';

    const applyTheme = (nextTheme: 'dark' | 'light') => {
        document.documentElement.dataset.theme = nextTheme;
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        document.documentElement.classList.toggle('light', nextTheme === 'light');
        window.localStorage.setItem('traceon-theme', nextTheme);
        setTheme(nextTheme);
    };

    const toggleTheme = () => {
        applyTheme(isDark ? 'light' : 'dark');
    };

    if (pathname === '/') {
        return null;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stroke bg-surface-0/70 backdrop-blur-2xl">
            <div className="mx-auto max-w-6xl px-5">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/home"
                        className="flex items-center gap-2 group"
                        onClick={() => {
                            if (window.location.pathname === '/home') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    >
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
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stroke text-text-2 transition-colors hover:bg-surface-2 hover:text-text-0"
                            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        {status === 'loading' ? (
                            <div className="w-20 h-8 rounded bg-surface-2 animate-pulse" />
                        ) : session ? (
                            <>
                                {pathname === '/repo' && (
                                    <Link
                                        href="/dashboard"
                                        className="px-3 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="px-2 py-1.5 text-[13px] text-text-2 hover:text-text-0 transition-colors flex items-center gap-2"
                                >
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="Profile" width={20} height={20} className="w-5 h-5 rounded-full object-cover border border-stroke" unoptimized />
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
                                    href="/signup"
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
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="btn-ghost flex justify-center items-center !text-sm w-full"
                                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                {isDark ? 'Light mode' : 'Dark mode'}
                            </button>
                            {status === 'loading' ? (
                                <div className="h-9 w-full rounded bg-surface-2 animate-pulse" />
                            ) : session ? (
                                <>
                                    {pathname === '/repo' && (
                                        <Link
                                            href="/dashboard"
                                            className="btn-ghost flex justify-center !text-sm w-full"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
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
                                        href="/signup"
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
