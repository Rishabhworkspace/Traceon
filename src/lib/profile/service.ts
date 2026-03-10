// src/lib/profile/service.ts

import connectDB from '@/lib/db/connection';
import { ProfileAnalysis } from '@/lib/db/models/ProfileAnalysis';
import { fetchGitHubProfileData } from '@/lib/profile/githubFetcher';
import { analyzeProfile } from '@/lib/profile/analyzer';

export async function getOrAnalyzeProfile(username: string) {
    username = username.toLowerCase();

    await connectDB();

    // 1. Check Cache
    // Find if we analyzed this profile within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedAnalysis = await ProfileAnalysis.findOne({
        username,
        lastAnalyzedAt: { $gte: twentyFourHoursAgo }
    });

    if (cachedAnalysis) {
        return {
            cached: true,
            data: cachedAnalysis
        };
    }

    // 2. Fetch Data from GitHub
    console.log(`[Profile Service] Fetching GitHub data for ${username}...`);
    const githubData = await fetchGitHubProfileData(username);

    // 3. Run AI Analysis
    console.log(`[Profile Service] Running AI Engineering DNA analysis for ${username}...`);
    const aiAssessment = await analyzeProfile(githubData);

    // 4. Save to Database Cache
    console.log(`[Profile Service] Caching analysis for ${username}...`);

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

    return {
        cached: false,
        data: profileDocument
    };
}
