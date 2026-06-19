// src/lib/profile/types.ts
// CURISM Scoring Framework — Type Definitions
import { z } from 'zod';

// ─── CURISM Dimension Scores (0–10 scale) ───

export interface CURISMScores {
  reliability: number;
  security: number;
  maintainability: number;
  influence: number;
  contribution: number;
  uniqueness: number;
}

export interface CURISMDescriptions {
  reliability: string;
  security: string;
  maintainability: string;
  influence: string;
  contribution: string;
  uniqueness: string;
}

// ─── ACID Breakdown for Uniqueness Dimension ───

export interface ACIDBreakdown {
  architecture: number;   // 0–10
  crossDomain: number;    // 0–10
  innovation: number;     // 0–10
  documentation: number;  // 0–10
}

// ─── Master Score & Grade ───

export type DeveloperGrade = 'C' | 'B' | 'A' | 'S' | 'S+';

export interface MasterScoreData {
  finalScore: number;       // 0–10
  grade: DeveloperGrade;
  gradeTitle: string;       // "Senior Developer", etc.
  hardSkills: number;       // avg(R, S, M) weighted
  softSkills: number;       // avg(I, C)
  builderSkills: number;    // U (ACID)
  percentile?: number;
}

// ─── Repo Filtering & Weighting ───

export interface FilteredRepo {
  name: string;
  owner: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  fork: boolean;
  archived: boolean;
  html_url: string;
  open_issues_count: number;
  // Computed weights
  recencyWeight: number;
  complexityWeight: number;
  qualityBoost: number;
  combinedWeight: number;
}

export interface RepoQualitySignal {
  repoName: string;
  hasTests: boolean;
  hasCI: boolean;
  hasDockerfile: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  hasChangelog: boolean;
  hasPrettierOrLint: boolean;
  hasGitignore: boolean;
  hasEnvExample: boolean;
  hasEnvCommitted: boolean;
  openIssueCount: number;
  dependencyCount: number;
  lastCommitDate: string;
  isArchived: boolean;
  readmeWordCount: number;
  readmeHasInstallInstructions: boolean;
  readmeHasUsageExamples: boolean;
  readmeHasScreenshots: boolean;
  hasApiDocs: boolean;
  hasWiki: boolean;
  totalLOC: number;
  fileCount: number;
  directoryDepth: number;
  hasModularStructure: boolean; // ≥3 distinct top-level directories
  languages: Record<string, number>; // language → bytes
}

// ─── Complete Analysis Output ───

export interface EngineeringDNAType {
  problemSolving: string;
  architectureMaturity: string;
  documentation: string;
}

export interface ProfileTraits {
  strengths: string[];
  weaknesses: string[];
}

export interface DomainSkill {
    domain: string;
    skills: string[];
}

export interface AIAssessmentType {
  archetype: string;
  curismDescriptions: Record<string, string>;
  engineeringDNA: EngineeringDNAType;
  traits: ProfileTraits;
  skillsByDomain: DomainSkill[];
}

// ─── Profile Data ───

export interface RepositorySummary {
    name: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    updated_at: string;
    html_url: string;
}

export interface CommitFrequency {
    last30Days: number;
    last90Days: number;
    last365Days: number;
    activeDaysLastYear: number;
}

export interface PullRequestActivity {
    totalPRsOpened: number;
    totalPRsMerged: number;
    externalPRsMerged: number;
    prReviewsDone: number;
}

export interface IssueActivity {
    totalOpened: number;
    externalIssues: number;
}

export interface AccountAge {
    years: number;
    months: number;
}

export interface ProfileData {
    username: string;
    avatarUrl: string;
    bio: string | null;
    techStack: Record<string, number>;
    curismScores: CURISMScores;
    acidBreakdown: ACIDBreakdown;
    masterScore: MasterScoreData;
    aiAssessment: AIAssessmentType;
    repositories: RepositorySummary[];
    commitFrequency: CommitFrequency;
    pullRequestActivity: PullRequestActivity;
    issueActivity: IssueActivity;
    accountAge: AccountAge;
    totalStarsReceived: number;
    totalForksReceived: number;
    lastAnalyzedAt?: string | Date;
}

// ─── Zod Validation Schemas ───

export const CURISMScoresSchema = z.object({
  reliability: z.number(),
  security: z.number(),
  maintainability: z.number(),
  influence: z.number(),
  contribution: z.number(),
  uniqueness: z.number(),
});

export const CURISMDescriptionsSchema = z.object({
  reliability: z.string(),
  security: z.string(),
  maintainability: z.string(),
  influence: z.string(),
  contribution: z.string(),
  uniqueness: z.string(),
});

export const ACIDBreakdownSchema = z.object({
  architecture: z.number(),
  crossDomain: z.number(),
  innovation: z.number(),
  documentation: z.number(),
});

export const DeveloperGradeSchema = z.enum(['C', 'B', 'A', 'S', 'S+']);

export const MasterScoreDataSchema = z.object({
  finalScore: z.number(),
  grade: DeveloperGradeSchema,
  gradeTitle: z.string(),
  hardSkills: z.number(),
  softSkills: z.number(),
  builderSkills: z.number(),
  percentile: z.number().optional(),
});

export const EngineeringDNASchema = z.object({
  problemSolving: z.string(),
  architectureMaturity: z.string(),
  documentation: z.string(),
});

export const ProfileTraitsSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export const DomainSkillSchema = z.object({
  domain: z.string(),
  skills: z.array(z.string()),
});

export const AIAssessmentSchema = z.object({
  archetype: z.string(),
  curismDescriptions: z.record(z.string(), z.string()),
  engineeringDNA: EngineeringDNASchema,
  traits: ProfileTraitsSchema,
  skillsByDomain: z.array(DomainSkillSchema),
});

export const RepositorySummarySchema = z.object({
  name: z.string(),
  description: z.string().nullable().or(z.string()),
  stargazers_count: z.number(),
  language: z.string().nullable().or(z.string()),
  updated_at: z.string(),
  html_url: z.string(),
});

export const CommitFrequencySchema = z.object({
  last30Days: z.number(),
  last90Days: z.number(),
  last365Days: z.number(),
  activeDaysLastYear: z.number(),
});

export const PullRequestActivitySchema = z.object({
  totalPRsOpened: z.number(),
  totalPRsMerged: z.number(),
  externalPRsMerged: z.number(),
  prReviewsDone: z.number(),
});

export const IssueActivitySchema = z.object({
  totalOpened: z.number(),
  externalIssues: z.number(),
});

export const AccountAgeSchema = z.object({
  years: z.number(),
  months: z.number(),
});

export const ProfileDataSchema = z.object({
  username: z.string(),
  avatarUrl: z.string(),
  bio: z.string().nullable(),
  techStack: z.record(z.string(), z.number()),
  curismScores: CURISMScoresSchema,
  acidBreakdown: ACIDBreakdownSchema,
  masterScore: MasterScoreDataSchema,
  aiAssessment: AIAssessmentSchema,
  repositories: z.array(RepositorySummarySchema),
  commitFrequency: CommitFrequencySchema,
  pullRequestActivity: PullRequestActivitySchema,
  issueActivity: IssueActivitySchema,
  accountAge: AccountAgeSchema,
  totalStarsReceived: z.number(),
  totalForksReceived: z.number(),
  lastAnalyzedAt: z.union([z.string(), z.date()]).optional(),
});