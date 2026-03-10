// src/app/profile/[username]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileDashboardView } from '@/components/profile/ProfileDashboardView';
import { getOrAnalyzeProfile } from '@/lib/profile/service';

async function getProfileData(username: string) {
    try {
        const result = await getOrAnalyzeProfile(username);
        return result.data;
    } catch (err: any) {
        if (err.message === 'User not found') {
            return { error: 'GitHub user not found' };
        }
        if (err.message === 'GitHub API rate limit exceeded') {
            return { error: 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.' };
        }
        return { error: `Analysis failed: ${err.message}` };
    }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params;
    const data = await getProfileData(resolvedParams.username);

    if (!data) {
        notFound();
    }

    if ((data as any)?.error) {
        return (
            <main className="min-h-screen noise dot-matrix bg-background flex flex-col items-center justify-center p-5">
                <div className="card w-full max-w-lg text-center border-rose/30 bg-rose/5 animate-fade-up">
                    <AlertTriangle className="w-12 h-12 text-rose mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-0 mb-2">Analysis Failed</h2>
                    <p className="text-sm text-text-2 font-mono mb-6">{(data as any).error}</p>
                    <a href="/" className="px-4 py-2 rounded-lg bg-surface-3 text-text-1 hover:text-text-0 transition-colors inline-block text-sm font-medium">Return Home</a>
                </div>
            </main>
        );
    }

    // We can safely cast data to any or our profile schema type here since error is handled
    const profile = data as any;

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
