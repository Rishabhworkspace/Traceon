// src/app/api/profile/[username]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubProfileData } from '@/lib/profile/githubFetcher';
import { analyzeProfile } from '@/lib/profile/analyzer';
import connectDB from '@/lib/db/connection';
import { ProfileAnalysis } from '@/lib/db/models/ProfileAnalysis';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const resolvedParams = await params;
        const username = resolvedParams.username.toLowerCase();

        await connectDB();

        // 1. Check Cache
        // Find if we analyzed this profile within the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const cachedAnalysis = await ProfileAnalysis.findOne({
            username,
            lastAnalyzedAt: { $gte: twentyFourHoursAgo }
        });

        if (cachedAnalysis) {
            return NextResponse.json({
                cached: true,
                data: cachedAnalysis
            });
        }

        // 2. Fetch Data from GitHub
        console.log(`[Profile API] Fetching GitHub data for ${username}...`);
        const githubData = await fetchGitHubProfileData(username);

        // 3. Run AI Analysis
        console.log(`[Profile API] Running AI Engineering DNA analysis for ${username}...`);
        const aiAssessment = await analyzeProfile(githubData);

        // 4. Save to Database Cache
        console.log(`[Profile API] Caching analysis for ${username}...`);

        const payloadToSave = {
            username,
            avatarUrl: githubData.user.avatar_url,
            bio: githubData.user.bio,
            techStack: githubData.languageBytes,
            aiAssessment,
            repositories: githubData.topRepos.map(repo => ({
                name: repo.name,
                description: repo.description,
                stargazers_count: repo.stargazers_count,
                language: repo.language,
                updated_at: repo.updated_at,
                html_url: repo.html_url
            })),
            lastAnalyzedAt: new Date()
        };

        const profileDocument = await ProfileAnalysis.findOneAndUpdate(
            { username },
            { $set: payloadToSave },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({
            cached: false,
            data: profileDocument
        });

    } catch (error: any) {
        console.error('[Profile API Error]:', error);

        // Handle specific fetcher errors (e.g., 404 User Not Found)
        if (error.message === 'User not found') {
            return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
        }

        if (error.message === 'GitHub API rate limit exceeded') {
            return NextResponse.json({ error: 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.' }, { status: 429 });
        }

        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred during profile analysis' },
            { status: 500 }
        );
    }
}
