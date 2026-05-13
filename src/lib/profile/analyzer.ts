// src/lib/profile/analyzer.ts

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import { EnrichedProfileData } from './githubFetcher';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

const profileSchema = z.object({
    archetype: z.string().describe("E.g., 'Fullstack Generalist × Open Source Leader', 'Frontend Craftsman × Solo Builder', etc."),
    reliabilityScore: z.number().min(0).max(100),
    securityScore: z.number().min(0).max(100),
    maintainabilityScore: z.number().min(0).max(100),
    uniquenessScore: z.number().min(0).max(100),
    influenceScore: z.number().min(0).max(100),
    contributionScore: z.number().min(0).max(100),
    consistencyScore: z.number().min(0).max(100),
    collaborationScore: z.number().min(0).max(100),
    growthTrajectoryScore: z.number().min(0).max(100),
    productionReadinessScore: z.number().min(0).max(100),
    reliabilityDescription: z.string().describe("1 sentence explanation anchored in test presence and error handling."),
    securityDescription: z.string().describe("1 sentence explanation anchored in dependency management and secure coding."),
    maintainabilityDescription: z.string().describe("1 sentence explanation anchored in linting and repo structure."),
    uniquenessDescription: z.string().describe("1 sentence explanation anchored in project originality."),
    influenceDescription: z.string().describe("1 sentence explanation anchored in stars, forks, and followers."),
    contributionDescription: z.string().describe("1 sentence explanation anchored in open source involvement."),
    consistencyDescription: z.string().describe("1 sentence explanation anchored in commit frequency and streaks."),
    collaborationDescription: z.string().describe("1 sentence explanation anchored in PR and issue engagement."),
    growthTrajectoryDescription: z.string().describe("1 sentence explanation anchored in learning and complexity over time."),
    productionReadinessDescription: z.string().describe("1 sentence explanation anchored in CI/CD, Docker, and deployment config."),
    engineeringDNA: z.object({
        problemSolving: z.string().describe("2-sentence summary of their ability to solve original problems vs forking tutorials."),
        architectureMaturity: z.string().describe("2-sentence summary on design patterns, modularity, and code structure observed."),
        documentation: z.string().describe("2-sentence summary estimating the quality of their READMEs and commit messages."),
    }).strict(),
    traits: z.object({
        strengths: z.array(z.string()).max(4).describe("Short, bullet-point strings of strengths."),
        weaknesses: z.array(z.string()).max(4).describe("Short, bullet-point strings of areas to improve or constructive vulnerabilities found."),
    }).strict(),
    skillsByDomain: z.array(z.object({
        domain: z.string().describe("E.g., 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Security', etc."),
        skills: z.array(z.string()).describe("List of exact frameworks, tools, and languages (e.g. 'React', 'Docker', 'JWT', 'MongoDB')")
    })).min(1).max(6).describe("Categorize all observed technologies into their logical domains based on their GitHub topics and repositories."),
}).strict();

export type AIProfileResult = z.infer<typeof profileSchema>;

export interface ProfileAnalysisOutput {
    archetype: string;
    domainScores: Record<string, number>;
    domainDescriptions: Record<string, string>;
    engineeringDNA: { problemSolving: string; architectureMaturity: string; documentation: string };
    traits: { strengths: string[]; weaknesses: string[] };
    skillsByDomain: { domain: string; skills: string[] }[];
}

export async function analyzeProfile(data: EnrichedProfileData): Promise<ProfileAnalysisOutput> {
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
        repoQualitySignals: data.repoQualitySignals,
        topRepositories: data.topRepos.slice(0, 10).map(r => ({
            name: r.name,
            description: r.description,
            language: r.language,
            topics: r.topics
        })),
        recentCommitSamples: data.recentCommits.slice(0, 10),
        documentationSamples: data.readmeSnippets,
    };

    const totalRepos = data.repoQualitySignals.length;
    const reposWithTests = data.repoQualitySignals.filter(r => r.hasTests).length;
    const reposWithCI = data.repoQualitySignals.filter(r => r.hasCI).length;
    const avgCommitLength = data.recentCommits.length > 0 
        ? Math.round(data.recentCommits.reduce((acc, c) => acc + c.message.length, 0) / data.recentCommits.length)
        : 0;

    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: `
You are an elite, highly critical Staff Engineer and Technical Recruiter at a top-tier tech company. Your task is to analyze the following enriched GitHub profile data for @${summaryPayload.username} and perform a deep, recruiter-grade "Engineering DNA" analysis.

Raw Data:
${JSON.stringify(summaryPayload, null, 2)}

## Quantitative Anchors (Use these to calibrate scores 0-100):

### Actual Data to Score Against:
- Repos analyzed for quality: ${totalRepos}
- Repos with tests: ${reposWithTests}/${totalRepos}
- Repos with CI/CD: ${reposWithCI}/${totalRepos}
- Commit message avg length: ${avgCommitLength} chars

### Reliability Score Anchors:
- 90-100: Tests in >80% of repos, CI/CD in >50%, highly descriptive commit messages
- 70-89:  Tests in >40% of repos, some CI/CD, mostly descriptive commits
- 50-69:  Tests in <20% of repos, no CI/CD, mixed commit quality
- 30-49:  No tests anywhere, no CI/CD, lazy commits ("fix", "update")
- 0-29:   Clear evidence of broken, untested, unmaintained code

### Production Readiness Anchors:
- 90-100: Dockerfiles, CI/CD workflows, strict linting, robust documentation
- 50-89:  Some standard config files, mostly relies on framework defaults
- 0-49:   Localhost-only code, no build steps, no env management

### Consistency & Collaboration Anchors:
- Evaluate based on 'commitFrequency' (30/90/365 days) and 'pullRequestActivity'.
- A user with 0 PRs should score very low on Collaboration.

### Phase 4: Differentiated Archetypes
Assign a matrix-based archetype.
Primary Axis: Frontend Craftsman | Backend Engineer | Fullstack Generalist | DevOps Specialist | Data Engineer | Systems Programmer
Secondary Axis: Solo Builder | Team Collaborator | Open Source Leader | Enterprise Contributor | Educator/Mentor
Example: "Fullstack Generalist × Open Source Leader"

### Output Instructions:
Provide an honest and brutally accurate assessment based strictly on the provided data. Return EXACTLY 10 scores and EXACTLY 10 corresponding short, one-sentence text explanations.

OUTPUT FORMAT:
Generate ONLY a valid JSON object matching this schema. Do not include any other markdown text, explanations, or codeblock formatting (NO \`\`\`json).
{
  "archetype": "string",
  "reliabilityScore": 0,
  "securityScore": 0,
  "maintainabilityScore": 0,
  "uniquenessScore": 0,
  "influenceScore": 0,
  "contributionScore": 0,
  "consistencyScore": 0,
  "collaborationScore": 0,
  "growthTrajectoryScore": 0,
  "productionReadinessScore": 0,
  "reliabilityDescription": "string",
  "securityDescription": "string",
  "maintainabilityDescription": "string",
  "uniquenessDescription": "string",
  "influenceDescription": "string",
  "contributionDescription": "string",
  "consistencyDescription": "string",
  "collaborationDescription": "string",
  "growthTrajectoryDescription": "string",
  "productionReadinessDescription": "string",
  "engineeringDNA": {
    "problemSolving": "string",
    "architectureMaturity": "string",
    "documentation": "string"
  },
  "traits": {
    "strengths": ["string", "string"],
    "weaknesses": ["string", "string"]
  },
  "skillsByDomain": [
    {
      "domain": "string",
      "skills": ["string", "string"]
    }
  ]
}
`,
    });

    try {
        console.log("========== RAW AI TEXT ==========");
        console.log(text);
        console.log("=================================");

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedJson = JSON.parse(cleanText);
        const validated = profileSchema.parse(parsedJson);

        return {
            archetype: validated.archetype,
            domainScores: {
                reliability: validated.reliabilityScore,
                security: validated.securityScore,
                maintainability: validated.maintainabilityScore,
                uniqueness: validated.uniquenessScore,
                influence: validated.influenceScore,
                contribution: validated.contributionScore,
                consistency: validated.consistencyScore,
                collaboration: validated.collaborationScore,
                growthTrajectory: validated.growthTrajectoryScore,
                productionReadiness: validated.productionReadinessScore,
            },
            domainDescriptions: {
                reliability: validated.reliabilityDescription,
                security: validated.securityDescription,
                maintainability: validated.maintainabilityDescription,
                uniqueness: validated.uniquenessDescription,
                influence: validated.influenceDescription,
                contribution: validated.contributionDescription,
                consistency: validated.consistencyDescription,
                collaboration: validated.collaborationDescription,
                growthTrajectory: validated.growthTrajectoryDescription,
                productionReadiness: validated.productionReadinessDescription,
            },
            engineeringDNA: validated.engineeringDNA,
            traits: validated.traits,
            skillsByDomain: validated.skillsByDomain
        };

    } catch (e) {
        console.error("Failed to parse AI response:", text, e);
        throw new Error("AI generated an invalid response format.");
    }
}
