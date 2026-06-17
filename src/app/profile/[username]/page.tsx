// src/app/profile/[username]/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import dbConnect from '@/lib/db/connection';
import { ProfileAnalysis } from '@/lib/db/models/ProfileAnalysis';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { notFound } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileDashboardView } from '@/components/profile/ProfileDashboardView';
import { getOrAnalyzeProfile } from '@/lib/profile/service';
// Import our typed error classes
import { UserNotFoundError, GitHubRateLimitError } from '@/lib/errors';
import { ProfileData } from '@/lib/profile/types';


async function getProfileData(username: string): Promise<ProfileData | { error: string }> {
    try {
        const result = await getOrAnalyzeProfile(username);
        return result.data as ProfileData;
    } catch (err: unknown) { // Changed from 'any' to 'unknown' for type safety
        // Replace string comparisons with instanceof checks
        if (err instanceof UserNotFoundError) {
            return { error: 'GitHub user not found' };
        }
        
        if (err instanceof GitHubRateLimitError) {
            return { error: 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.' };
        }
        
        // Fallback for all other errors
        return { 
            error: err instanceof Error 
                ? `Analysis failed: ${err.message}` 
                : 'An unexpected error occurred during profile analysis' 
        };
    }
}

function createFallbackMetadata(username: string): Metadata {
    const displayUsername = username.charAt(0).toUpperCase() + username.slice(1);
    const fallbackTitle = `${displayUsername}'s Traceon Profile`;
    const fallbackDescription = `View ${displayUsername}'s developer fit, engineering DNA, and codebase intelligence profile on Traceon.`;
    const fallbackImage = `https://github.com/${username}.png`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const profileUrl = `${baseUrl}/profile/${username}`;

    return {
        title: fallbackTitle,
        description: fallbackDescription,
        openGraph: {
            title: fallbackTitle,
            description: fallbackDescription,
            url: profileUrl,
            siteName: 'Traceon',
            images: [
                {
                    url: fallbackImage,
                    width: 1200,
                    height: 630,
                    alt: `${displayUsername}'s Avatar`,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fallbackTitle,
            description: fallbackDescription,
            images: [fallbackImage],
        },
    };
}

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const resolvedParams = await params;
    const username = resolvedParams.username;
    const lowercaseUsername = username.toLowerCase();

    try {
        await dbConnect();
        const profile = await ProfileAnalysis.findOne({ username: lowercaseUsername });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const profileUrl = `${baseUrl}/profile/${username}`;
        const displayUsername = username.charAt(0).toUpperCase() + username.slice(1);

        if (!profile || !profile.aiAssessment || !profile.masterScore) {
            return createFallbackMetadata(username);
        }

        const { archetype } = profile.aiAssessment;
        const { grade, finalScore } = profile.masterScore;
        const scoreString = typeof finalScore === 'number' ? finalScore.toFixed(1) : '0.0';
        const avatarUrl = profile.avatarUrl;

        // Extract top skills from techStack
        let skillsList: string[] = [];
        if (profile.techStack) {
            if (profile.techStack instanceof Map) {
                skillsList = Array.from(profile.techStack.keys());
            } else {
                skillsList = Object.keys(profile.techStack);
            }
        }
        const topSkills = skillsList.slice(0, 5).join(', ');

        const title = `${displayUsername}'s Traceon Profile | Grade ${grade} · ${scoreString}/10`;
        const description = `${archetype} | Grade ${grade} (${scoreString}/10)${topSkills ? ` | Top Skills: ${topSkills}` : ''}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: profileUrl,
                siteName: 'Traceon',
                images: [
                    {
                        url: avatarUrl,
                        width: 1200,
                        height: 630,
                        alt: `${displayUsername}'s Avatar`,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [avatarUrl],
            },
        };
    } catch (error) {
        console.error('Error generating metadata for profile:', error);
        return createFallbackMetadata(username);
    }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params;
    const data = await getProfileData(resolvedParams.username);

    if (!data) {
        notFound();
    }

    if ('error' in data) {
        return (
            <main className="min-h-screen noise dot-matrix bg-background flex flex-col items-center justify-center p-5">
                <div className="card w-full max-w-lg text-center border-rose/30 bg-rose/5 animate-fade-up">
                    <AlertTriangle className="w-12 h-12 text-rose mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-0 mb-2">Analysis Failed</h2>
                    <p className="text-sm text-text-2 font-mono mb-6">{data.error}</p>
                    <a href="/" className="px-4 py-2 rounded-lg bg-surface-3 text-text-1 hover:text-text-0 transition-colors inline-block text-sm font-medium">Return Home</a>
                </div>
            </main>
        );
    }

    // We can safely cast data to our profile schema type here since error is handled
    const profile = data as ProfileData;

    if (!profile.aiAssessment) {
        return (
            <main className="min-h-screen noise dot-matrix bg-background flex flex-col items-center justify-center p-5">
                <div className="card w-full max-w-lg text-center border-amber/30 bg-amber/5 animate-fade-up">
                    <AlertTriangle className="w-12 h-12 text-amber mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-0 mb-2">Analysis Incomplete</h2>
                    <p className="text-sm text-text-2 font-mono mb-6">
                        We could not complete the AI assessment for this profile. They might have 0 public repositories or missing data.
                    </p>
                    <a href="/" className="px-4 py-2 rounded-lg bg-surface-3 text-text-1 hover:text-text-0 transition-colors inline-block text-sm font-medium">Return Home</a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen noise dot-matrix bg-background selection:bg-emerald/30 selection:text-emerald">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">

                {/* Header Section */}
                <ProfileHeader
                    username={profile.username}
                    avatarUrl={profile.avatarUrl}
                    bio={profile.bio}
                    archetype={profile.aiAssessment.archetype}
                />

                {/* Dashboard View Manager */}
                <ProfileDashboardView data={profile} />

            </div>
        </main>
    );
}
