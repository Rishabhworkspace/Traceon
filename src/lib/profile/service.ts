// src/lib/profile/service.ts
// Profile Analysis Service — Orchestrates the CURISM pipeline
//
// Flow:
//   1. Check cache (24h TTL)
//   2. Fetch GitHub data (enhanced fetcher)
//   3. Compute CURISM scores deterministically
//   4. Compute master score & grade
//   5. Generate AI qualitative descriptions
//   6. Save combined result to database

import connectDB from '@/lib/db/connection';
import { ProfileAnalysis } from '@/lib/db/models/ProfileAnalysis';
import { fetchGitHubProfileData } from '@/lib/profile/githubFetcher';
import { analyzeProfileQualitative } from '@/lib/profile/analyzer';
import { computeAllCURISMScores } from '@/lib/profile/curismScorer';
import { computeMasterScore } from '@/lib/profile/rankCalculator';

export async function getOrAnalyzeProfile(username: string) {
    username = username.toLowerCase();

    await connectDB();

    // ─── 1. Check Cache (24h TTL) ───
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedAnalysis = await ProfileAnalysis.findOne({
        username,
        schemaVersion: 2, // Only accept v2 (CURISM) cached data
        lastAnalyzedAt: { $gte: twentyFourHoursAgo }
    });

    if (cachedAnalysis) {
        return {
            cached: true,
            data: JSON.parse(JSON.stringify(cachedAnalysis))
        };
    }

    // ─── 2. Fetch Data from GitHub ───
    console.log(`[Profile Service] Fetching GitHub data for ${username}...`);
    const githubData = await fetchGitHubProfileData(username);

    // ─── 3. Compute CURISM Scores Deterministically ───
    console.log(`[Profile Service] Computing CURISM scores for ${username}...`);

    const avgCommitMessageLength = githubData.recentCommits.length > 0
        ? Math.round(githubData.recentCommits.reduce((acc, c) => acc + c.message.length, 0) / githubData.recentCommits.length)
        : 0;

    const { scores: curismScores, acidBreakdown } = computeAllCURISMScores({
        repoSignals: githubData.repoQualitySignals,
        avgCommitMessageLength,
        totalStars: githubData.totalStarsReceived,
        totalForks: githubData.totalForksReceived,
        followers: githubData.user.followers,
        filteredRepos: githubData.filteredRepos,
        totalPRsOpened: githubData.pullRequestActivity.totalPRsOpened,
        externalPRsMerged: githubData.pullRequestActivity.externalPRsMerged,
        prReviewsDone: githubData.pullRequestActivity.prReviewsDone,
        externalIssues: githubData.issueActivity.externalIssues,
        activeDaysLastYear: githubData.commitFrequency.activeDaysLastYear,
        orgsCount: githubData.orgsCount,
        readmeSnippets: githubData.readmeSnippets,
    });

    // ─── 4. Compute Master Score & Grade ───
    const masterScore = computeMasterScore(curismScores);

    console.log(`[Profile Service] CURISM Scores for ${username}:`, {
        ...curismScores,
        master: masterScore.finalScore,
        grade: masterScore.grade,
    });

    // ─── 5. Generate AI Qualitative Descriptions ───
    console.log(`[Profile Service] Running AI qualitative analysis for ${username}...`);
    let aiResult;
    try {
        aiResult = await analyzeProfileQualitative(
            githubData,
            curismScores,
            acidBreakdown,
            masterScore,
        );
    } catch (e) {
        console.error(`[Profile Service] AI analysis failed for ${username}, using fallback:`, e);
        // The analyzer has its own fallback, but if the entire call throws, use a minimal fallback
        const topLangs = Object.entries(githubData.languageBytes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([lang]) => lang);

        aiResult = {
            archetype: `${topLangs[0] || 'General'} Developer × Solo Builder`,
            curismDescriptions: {
                reliability: `Reliability score: ${curismScores.reliability}/10`,
                security: `Security score: ${curismScores.security}/10`,
                maintainability: `Maintainability score: ${curismScores.maintainability}/10`,
                influence: `Influence score: ${curismScores.influence}/10`,
                contribution: `Contribution score: ${curismScores.contribution}/10`,
                uniqueness: `Uniqueness score: ${curismScores.uniqueness}/10`,
            },
            engineeringDNA: {
                problemSolving: 'Analysis pending.',
                architectureMaturity: 'Analysis pending.',
                documentation: 'Analysis pending.',
            },
            traits: {
                strengths: ['Active GitHub presence'],
                weaknesses: ['Detailed analysis unavailable'],
            },
            skillsByDomain: [{ domain: 'Primary', skills: topLangs }],
        };
    }

    // ─── 6. Save to Database ───
    console.log(`[Profile Service] Saving CURISM analysis for ${username}...`);

    const payloadToSave = {
        username,
        schemaVersion: 2,
        avatarUrl: githubData.user.avatar_url,
        bio: githubData.user.bio,
        techStack: githubData.languageBytes,
        // CURISM deterministic scores
        curismScores,
        acidBreakdown,
        masterScore: {
            finalScore: masterScore.finalScore,
            grade: masterScore.grade,
            gradeTitle: masterScore.gradeTitle,
            hardSkills: masterScore.hardSkills,
            softSkills: masterScore.softSkills,
            builderSkills: masterScore.builderSkills,
            percentile: masterScore.percentile,
        },
        // AI qualitative assessment
        aiAssessment: {
            archetype: aiResult.archetype,
            curismDescriptions: aiResult.curismDescriptions,
            engineeringDNA: aiResult.engineeringDNA,
            traits: aiResult.traits,
            skillsByDomain: aiResult.skillsByDomain,
        },
        // Repository data
        repositories: githubData.filteredRepos.slice(0, 30).map(repo => ({
            name: repo.name,
            description: repo.description,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            topics: repo.topics,
            updated_at: repo.updated_at,
            html_url: repo.html_url,
        })),
        commitFrequency: githubData.commitFrequency,
        pullRequestActivity: githubData.pullRequestActivity,
        issueActivity: githubData.issueActivity,
        accountAge: githubData.accountAge,
        totalStarsReceived: githubData.totalStarsReceived,
        totalForksReceived: githubData.totalForksReceived,
        orgsCount: githubData.orgsCount,
        lastAnalyzedAt: new Date(),
    };

    const profileDocument = await ProfileAnalysis.findOneAndUpdate(
        { username },
        { $set: payloadToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
        cached: false,
        data: JSON.parse(JSON.stringify(profileDocument))
    };
}
