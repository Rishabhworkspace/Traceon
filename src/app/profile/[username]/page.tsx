// src/app/profile/[username]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileDashboardView } from '@/components/profile/ProfileDashboardView';

async function getProfileData(username: string) {
    // We fetch via the API route to trigger the AI analysis or hit the cache
    const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${url}/api/profile/${username}`, {
            cache: 'no-store' // We want the API route's internal cache logic to handle caching, not Next's App Router cache here
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            try {
                const errorObj = await res.json();
                return { error: errorObj.error || res.statusText };
            } catch {
                return { error: `Failed to fetch profile: ${res.statusText}` };
            }
        }

        const { data } = await res.json();
        return data;
    } catch (err: any) {
        return { error: `Network connection failed: ${err.message}` };
    }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params;
    const data = await getProfileData(resolvedParams.username);

    if (!data) {
        notFound();
    }

    if (data.error) {
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

    if (!data.aiAssessment) {
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
                    username={data.username}
                    avatarUrl={data.avatarUrl}
                    bio={data.bio}
                    archetype={data.aiAssessment.archetype}
                />

                {/* Dashboard View Manager */}
                <ProfileDashboardView data={data} />

            </div>
        </main>
    );
}
