// src/components/profile/ProfileHeader.tsx

import { Github } from 'lucide-react';
import Image from 'next/image';

interface ProfileHeaderProps {
    username: string;
    avatarUrl: string;
    bio: string | null;
    archetype: string;
}

export function ProfileHeader({ username, avatarUrl, bio, archetype }: ProfileHeaderProps) {
    return (
        <section className="relative w-full rounded-sm border border-stroke bg-surface-1 overflow-hidden p-8 sm:p-10 animate-fade-up shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            {/* Background scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] mix-blend-overlay bg-[length:100%_4px,3px_100%] z-0" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Avatar */}
                <div className="shrink-0 relative group">
                    <div className="absolute inset-0 bg-emerald/10 border border-emerald/30 scale-105 rounded-sm animate-pulse-glow group-hover:scale-110 transition-transform duration-500" />
                    <Image
                        src={avatarUrl}
                        alt={`${username} avatar`}
                        width={120}
                        height={120}
                        className="rounded-sm relative z-10 border border-stroke bg-background grayscale group-hover:grayscale-0 transition-all duration-700"
                        priority
                    />
                </div>

                {/* Identity & Bio */}
                <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-0">
                            {username}
                        </h1>
                        <a
                            href={`https://github.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-sm bg-surface-3 hover:bg-emerald/10 hover:text-emerald text-text-2 transition-colors border border-stroke hover:border-emerald/30 inline-flex"
                            title="View GitHub Profile"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    </div>

                    {bio && (
                        <p className="text-text-2 text-base sm:text-lg max-w-2xl leading-relaxed mb-6 font-mono">
                            {bio}
                        </p>
                    )}

                    {/* Archetype Badge */}
                    <div className="relative inline-flex group mt-auto">
                        <div className="absolute -inset-0.5 bg-emerald/20 rounded-sm blur opacity-50 animate-pulse group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center gap-2 px-5 py-2.5 bg-surface-0 rounded-sm border border-emerald/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-sm font-bold text-emerald uppercase tracking-widest font-mono">
                                [ {archetype} ]
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
