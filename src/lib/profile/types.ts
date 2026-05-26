// src/lib/profile/types.ts
// CURISM Scoring Framework — Type Definitions

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

export interface MasterScore {
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

export interface CURISMAnalysisResult {
  curismScores: CURISMScores;
  curismDescriptions: CURISMDescriptions;
  acidBreakdown: ACIDBreakdown;
  masterScore: MasterScore;
  // AI-generated qualitative fields
  archetype: string;
  engineeringDNA: {
    problemSolving: string;
    architectureMaturity: string;
    documentation: string;
  };
  traits: {
    strengths: string[];
    weaknesses: string[];
  };
  skillsByDomain: {
    domain: string;
    skills: string[];
  }[];
}
