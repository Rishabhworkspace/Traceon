// src/lib/profile/analyzer.ts
// AI Qualitative Analyzer — generates descriptions and insights ONLY
// All numeric scores come from the deterministic CURISM engine (curismScorer.ts)

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import type { EnrichedProfileData } from './githubFetcher';
import type { CURISMScores, ACIDBreakdown, MasterScore } from './types';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

// ─── Schema: Qualitative output ONLY — no scores ───

const qualitativeSchema = z.object({
    archetype: z.string().describe("Matrix archetype. Primary Axis: Frontend Craftsman | Backend Engineer | Fullstack Generalist | DevOps Specialist | Data Engineer | Systems Programmer. Secondary Axis: Solo Builder | Team Collaborator | Open Source Leader | Enterprise Contributor | Educator/Mentor. Example: 'Fullstack Generalist × Open Source Leader'"),
    curismDescriptions: z.object({
        reliability: z.string().describe("1-sentence explanation of the reliability score, anchored in test presence, error handling, and CI/CD signals."),
        security: z.string().describe("1-sentence explanation of the security score, anchored in env management, dependency security, and secure coding practices."),
        maintainability: z.string().describe("1-sentence explanation of the maintainability score, anchored in code structure, linting, and documentation."),
        influence: z.string().describe("1-sentence explanation of the influence score, anchored in stars, forks, and follower counts."),
        contribution: z.string().describe("1-sentence explanation of the contribution score, anchored in PRs, reviews, and issue engagement."),
        uniqueness: z.string().describe("1-sentence explanation of the uniqueness/ACID score, anchored in architecture, cross-domain work, innovation, and documentation."),
    }).strict(),
    engineeringDNA: z.object({
        problemSolving: z.string().describe("2-sentence summary of their ability to solve original problems vs forking tutorials."),
        architectureMaturity: z.string().describe("2-sentence summary on design patterns, modularity, and code structure observed."),
        documentation: z.string().describe("2-sentence summary estimating the quality of their READMEs and commit messages."),
    }).strict(),
    traits: z.object({
        strengths: z.array(z.string()).max(4).describe("Short, bullet-point strings of strengths."),
        weaknesses: z.array(z.string()).max(4).describe("Short, bullet-point strings of areas to improve."),
    }).strict(),
    skillsByDomain: z.array(z.object({
        domain: z.string().describe("E.g., 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Security', etc."),
        skills: z.array(z.string()).describe("List of exact frameworks, tools, and languages (e.g. 'React', 'Docker', 'JWT', 'MongoDB')")
    })).min(1).max(6).describe("Categorize all observed technologies into their logical domains."),
}).strict();

export type AIQualitativeResult = z.infer<typeof qualitativeSchema>;

export interface QualitativeAnalysisOutput {
    archetype: string;
    curismDescriptions: {
        reliability: string;
        security: string;
        maintainability: string;
        influence: string;
        contribution: string;
        uniqueness: string;
    };
    engineeringDNA: { problemSolving: string; architectureMaturity: string; documentation: string };
    traits: { strengths: string[]; weaknesses: string[] };
    skillsByDomain: { domain: string; skills: string[] }[];
}

/**
 * Generate qualitative AI descriptions and insights.
 * 
 * The AI receives pre-computed CURISM scores and raw data,
 * and generates ONLY textual descriptions/insights — NOT scores.
 */
export async function analyzeProfileQualitative(
    data: EnrichedProfileData,
    curismScores: CURISMScores,
    acidBreakdown: ACIDBreakdown,
    masterScore: MasterScore,
): Promise<QualitativeAnalysisOutput> {
    // Slim down the payload for the LLM
    const summaryPayload = {
        username: data.user.login,
        bio: data.user.bio,
        publicRepos: data.user.public_repos,
        followers: data.user.followers,
        accountAge: data.accountAge,
        totalStarsReceived: data.totalStarsReceived,
        totalForksReceived: data.totalForksReceived,
        commitFrequency: data.commitFrequency,
        pullRequestActivity: data.pullRequestActivity,
        issueActivity: data.issueActivity,
        topRepositories: data.filteredRepos.slice(0, 10).map(r => ({
            name: r.name,
            description: r.description,
            language: r.language,
            topics: r.topics,
            stars: r.stargazers_count,
        })),
        recentCommitSamples: data.recentCommits.slice(0, 10),
        repoQualityHighlights: {
            totalAnalyzed: data.repoQualitySignals.length,
            withTests: data.repoQualitySignals.filter(r => r.hasTests).length,
            withCI: data.repoQualitySignals.filter(r => r.hasCI).length,
            withDocker: data.repoQualitySignals.filter(r => r.hasDockerfile).length,
            withLinter: data.repoQualitySignals.filter(r => r.hasPrettierOrLint).length,
            withLicense: data.repoQualitySignals.filter(r => r.hasLicense).length,
        },
    };

    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: `
You are an elite Staff Engineer performing a qualitative "Engineering DNA" analysis for @${summaryPayload.username}.

## Pre-Computed CURISM Scores (0-10 scale, already calculated deterministically):
- Reliability:     ${curismScores.reliability}/10
- Security:        ${curismScores.security}/10
- Maintainability: ${curismScores.maintainability}/10
- Influence:       ${curismScores.influence}/10
- Contribution:    ${curismScores.contribution}/10
- Uniqueness:      ${curismScores.uniqueness}/10

## ACID Breakdown (Uniqueness sub-dimensions):
- Architecture:    ${acidBreakdown.architecture}/10
- Cross-Domain:    ${acidBreakdown.crossDomain}/10
- Innovation:      ${acidBreakdown.innovation}/10
- Documentation:   ${acidBreakdown.documentation}/10

## Master Score: ${masterScore.finalScore}/10 — Grade: ${masterScore.grade} (${masterScore.gradeTitle})

## Raw Profile Data:
${JSON.stringify(summaryPayload, null, 2)}

## Your Task:
Generate QUALITATIVE descriptions that explain the pre-computed scores. Do NOT generate or change any scores.
Your descriptions should be honest, specific, and anchored in the actual data provided.

For the archetype, assign a matrix-based label:
- Primary Axis: Frontend Craftsman | Backend Engineer | Fullstack Generalist | DevOps Specialist | Data Engineer | Systems Programmer
- Secondary Axis: Solo Builder | Team Collaborator | Open Source Leader | Enterprise Contributor | Educator/Mentor

OUTPUT FORMAT:
Generate ONLY a valid JSON object. No markdown, no codeblocks, no explanations.
{
  "archetype": "string",
  "curismDescriptions": {
    "reliability": "string",
    "security": "string",
    "maintainability": "string",
    "influence": "string",
    "contribution": "string",
    "uniqueness": "string"
  },
  "engineeringDNA": {
    "problemSolving": "string",
    "architectureMaturity": "string",
    "documentation": "string"
  },
  "traits": {
    "strengths": ["string"],
    "weaknesses": ["string"]
  },
  "skillsByDomain": [{ "domain": "string", "skills": ["string"] }]
}
`,
    });

    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedJson = JSON.parse(cleanText);
        const validated = qualitativeSchema.parse(parsedJson);
        return validated;
    } catch (e) {
        console.error("[Traceon] Failed to parse AI qualitative response:", text, e);
        // Fallback: return template descriptions based on scores
        return generateFallbackDescriptions(curismScores, acidBreakdown, masterScore, data);
    }
}

/**
 * Fallback descriptions if AI fails — ensures scores always have accompanying text.
 */
function generateFallbackDescriptions(
    scores: CURISMScores,
    acid: ACIDBreakdown,
    master: MasterScore,
    data: EnrichedProfileData,
): QualitativeAnalysisOutput {
    const scoreLabel = (s: number) => s >= 8 ? 'excellent' : s >= 6 ? 'good' : s >= 4 ? 'moderate' : 'limited';

    // Infer primary languages from languageBytes
    const topLangs = Object.entries(data.languageBytes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang);

    return {
        archetype: `${topLangs[0] || 'General'} Developer × Solo Builder`,
        curismDescriptions: {
            reliability: `Shows ${scoreLabel(scores.reliability)} reliability with ${data.repoQualitySignals.filter(r => r.hasTests).length}/${data.repoQualitySignals.length} repos containing tests and ${data.repoQualitySignals.filter(r => r.hasCI).length} with CI/CD configured.`,
            security: `Demonstrates ${scoreLabel(scores.security)} security practices across analyzed repositories.`,
            maintainability: `Code maintainability is ${scoreLabel(scores.maintainability)}, based on documentation quality and code organization patterns.`,
            influence: `Community influence is ${scoreLabel(scores.influence)} with ${data.totalStarsReceived} total stars and ${data.user.followers} followers.`,
            contribution: `Open source contribution is ${scoreLabel(scores.contribution)} with ${data.pullRequestActivity.totalPRsMerged} merged PRs and ${data.pullRequestActivity.prReviewsDone} reviews.`,
            uniqueness: `Project uniqueness (ACID) is ${scoreLabel(scores.uniqueness)} — Architecture: ${acid.architecture}/10, Cross-Domain: ${acid.crossDomain}/10, Innovation: ${acid.innovation}/10, Documentation: ${acid.documentation}/10.`,
        },
        engineeringDNA: {
            problemSolving: `Based on repository analysis, problem-solving ability appears ${scoreLabel(master.finalScore)}. Projects show ${scores.uniqueness >= 6 ? 'original approaches' : 'standard patterns'}.`,
            architectureMaturity: `Architecture maturity is ${scoreLabel(acid.architecture)} with ${data.repoQualitySignals.filter(r => r.hasModularStructure).length}/${data.repoQualitySignals.length} repos showing modular structure.`,
            documentation: `Documentation quality is ${scoreLabel(acid.documentation)} based on README analysis across top repositories.`,
        },
        traits: {
            strengths: [
                ...(scores.reliability >= 7 ? ['Strong testing discipline'] : []),
                ...(scores.influence >= 6 ? ['Growing community presence'] : []),
                ...(scores.uniqueness >= 6 ? ['Original project ideas'] : []),
                ...(topLangs.length >= 3 ? ['Polyglot developer'] : []),
            ].slice(0, 4),
            weaknesses: [
                ...(scores.reliability < 5 ? ['Limited test coverage'] : []),
                ...(scores.security < 5 ? ['Security practices need improvement'] : []),
                ...(scores.maintainability < 5 ? ['Code documentation could be stronger'] : []),
                ...(scores.contribution < 4 ? ['Limited open source collaboration'] : []),
            ].slice(0, 4),
        },
        skillsByDomain: [{
            domain: 'Primary',
            skills: topLangs,
        }],
    };
}
