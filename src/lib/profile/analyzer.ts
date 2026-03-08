// src/lib/profile/analyzer.ts

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import { AggregatedProfileData } from './githubFetcher';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

const profileSchema = z.object({
    archetype: z.string().describe("E.g., 'Frontend Visionary', 'Fullstack Architect', 'Systems Engineer', etc."),
    reliabilityScore: z.number().min(0).max(100),
    securityScore: z.number().min(0).max(100),
    maintainabilityScore: z.number().min(0).max(100),
    uniquenessScore: z.number().min(0).max(100),
    influenceScore: z.number().min(0).max(100),
    contributionScore: z.number().min(0).max(100),
    reliabilityDescription: z.string().describe("1 sentence explanation of their logic and unexpected cost risk."),
    securityDescription: z.string().describe("1 sentence explanation of their secure coding practices."),
    maintainabilityDescription: z.string().describe("1 sentence explanation of their code readability and technical debt."),
    uniquenessDescription: z.string().describe("1 sentence explanation about their use of novel architectures or unique features."),
    influenceDescription: z.string().describe("1 sentence explanation of their project popularity or highlighted status."),
    contributionDescription: z.string().describe("1 sentence explanation of their open source involvement."),
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

export async function analyzeProfile(data: AggregatedProfileData): Promise<AIProfileResult> {
    // We need to slim down the data payload to remain within token limits and improve speed
    const summaryPayload = {
        username: data.user.login,
        bio: data.user.bio,
        publicRepos: data.user.public_repos,
        followers: data.user.followers,
        accountCreated: data.user.created_at,
        totalLanguageBytes: data.languageBytes,
        topRepositories: data.topRepos.slice(0, 15).map(r => ({
            name: r.name,
            description: r.description,
            language: r.language,
            topics: r.topics
        })),
        recentCommitSamples: data.recentCommits.slice(0, 15),
        documentationSamples: data.readmeSnippets,
    };

    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: `
You are an elite, highly critical Staff Engineer at a top-tier tech company. Your task is to analyze the following GitHub profile data for @${summaryPayload.username} and perform a deep "Engineering DNA" analysis.

Raw Data:
${JSON.stringify(summaryPayload, null, 2)}

### Scoring Rubric (0-100 for each domain):
Be harsh but fair. A score of 90+ implies they are world-class or highly prolific. A score of 50 implies average competence.
- **Reliability**: Do they structure code safely? Are there tests? Does their language choice imply faulty logical thinking or unexpected costs?
- **Security**: Look for cryptography, penetration testing tools, safe memory practices, and token management. Do they adhere to best practices to produce secure code?
- **Maintainability**: Is the code modular? Are there design patterns? Does their code complicate maintenance or is it scalable?
- **Uniqueness**: Do they build original concepts, or do they clone tutorials? Are there sophisticated cross-domain features or exceptional innovation?
- **Influence**: Do their repos have stars/forks? Do they have followers? Do they have prominently highlighted original projects?
- **Contribution**: Are they active in open-source? Do they collaborate? Or do they operate as an independent coder with minimal involvement in open-source communities?

### Qualitative Analysis:
- **Problem Solving**: Evaluate if they fork generic tutorials or build original, complex projects. Do their descriptions suggest they tackle unique problems?
- **Architecture Maturity**: Do their top repositories show evidence of scalable design (e.g., microservices, clear separation of concerns, advanced language features) or is it spaghetti code?
- **Documentation**: Look closely at the \`documentationSamples\` (README snippets) and \`recentCommitSamples\`. Are their commits descriptive ("refactor auth flow to use JWT") or lazy ("fix", "update")? Are their READMEs professional and clear?

### Output Instructions:
Provide an honest and brutally accurate assessment. You MUST return EXACTLY 6 scores and EXACTLY 6 corresponding short, one-sentence text explanations. Do not omit ANY keys from the schema.

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
  "reliabilityDescription": "string",
  "securityDescription": "string",
  "maintainabilityDescription": "string",
  "uniquenessDescription": "string",
  "influenceDescription": "string",
  "contributionDescription": "string",
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

        // Re-map it to the expected interface so we don't break the DB or UI layers
        return {
            archetype: validated.archetype,
            domainScores: {
                reliability: validated.reliabilityScore,
                security: validated.securityScore,
                maintainability: validated.maintainabilityScore,
                uniqueness: validated.uniquenessScore,
                influence: validated.influenceScore,
                contribution: validated.contributionScore
            },
            domainDescriptions: {
                reliability: validated.reliabilityDescription,
                security: validated.securityDescription,
                maintainability: validated.maintainabilityDescription,
                uniqueness: validated.uniquenessDescription,
                influence: validated.influenceDescription,
                contribution: validated.contributionDescription
            },
            engineeringDNA: validated.engineeringDNA,
            traits: validated.traits,
            skillsByDomain: validated.skillsByDomain
        } as any;

    } catch (e) {
        console.error("Failed to parse AI response:", text, e);
        throw new Error("AI generated an invalid response format.");
    }
}
