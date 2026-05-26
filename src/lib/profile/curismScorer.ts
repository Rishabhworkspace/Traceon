// src/lib/profile/curismScorer.ts
// Deterministic CURISM Scoring Engine
// Implements all 6 dimensions from the GitHub Profile Analysis Algorithm spec

import type {
  CURISMScores,
  ACIDBreakdown,
  RepoQualitySignal,
  FilteredRepo,
} from './types';

// ═══════════════════════════════════════════════════════════
// Utility: clamp a value between min and max
// ═══════════════════════════════════════════════════════════

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, inputMin: number, inputMax: number, outputMin: number = 0, outputMax: number = 10): number {
  if (inputMax === inputMin) return outputMin;
  const ratio = (value - inputMin) / (inputMax - inputMin);
  return clamp(outputMin + ratio * (outputMax - outputMin), outputMin, outputMax);
}

// ═══════════════════════════════════════════════════════════
// §4 — DIMENSION 1: RELIABILITY (Hard Skill)
// ═══════════════════════════════════════════════════════════
//
// "Demonstrates strong logical thinking and produces code
//  that behaves predictably."
//
// Without full static analysis (lizard/ESLint), we use
// heuristic signals: test presence, CI, linter config,
// commit message quality, and open issue ratio.
// ═══════════════════════════════════════════════════════════

export function computeReliability(
  repoSignals: RepoQualitySignal[],
  avgCommitMessageLength: number
): number {
  if (repoSignals.length === 0) return 0;

  const total = repoSignals.length;

  // Ratio of repos with tests (proxy for error handling coverage & test coverage)
  const testRatio = repoSignals.filter(r => r.hasTests).length / total;

  // Ratio of repos with CI/CD (signals quality culture)
  const ciRatio = repoSignals.filter(r => r.hasCI).length / total;

  // Ratio of repos with linter/formatter (proxy for code consistency)
  const lintRatio = repoSignals.filter(r => r.hasPrettierOrLint).length / total;

  // Ratio of repos with .gitignore (basic hygiene)
  const gitignoreRatio = repoSignals.filter(r => r.hasGitignore).length / total;

  // Commit message quality: avg length > 50 chars = good, < 20 = lazy
  const commitQuality = avgCommitMessageLength > 50 ? 1.0
    : avgCommitMessageLength > 30 ? 0.6
    : avgCommitMessageLength > 15 ? 0.3
    : 0.1;

  // Open issue ratio (lower is better — fewer unresolved bugs)
  const totalOpenIssues = repoSignals.reduce((s, r) => s + r.openIssueCount, 0);
  const totalLOC = repoSignals.reduce((s, r) => s + r.totalLOC, 0);
  // Normalize: 0 issues = 1.0, many issues per LOC = 0.0
  const issueRatio = totalLOC > 0 ? Math.min(1, totalOpenIssues / (totalLOC / 100)) : 0;

  // §4.3 Scoring Formula (adapted for heuristic approach)
  const raw = 10
    - (1 - testRatio) * 2.5           // Penalize missing tests (up to -2.5)
    - (1 - ciRatio) * 1.5             // Penalize missing CI (up to -1.5)
    - (1 - lintRatio) * 1.0           // Penalize missing linter (up to -1.0)
    - (1 - gitignoreRatio) * 0.5      // Penalize missing .gitignore (up to -0.5)
    - (1 - commitQuality) * 1.0       // Penalize lazy commits (up to -1.0)
    - issueRatio * 1.5                // Penalize high open issue ratio (up to -1.5)
    + (testRatio > 0.5 ? 0.5 : 0)    // Bonus: tests in >50% of repos
    + (ciRatio > 0.3 ? 0.5 : 0);     // Bonus: CI in >30% of repos

  return clamp(Math.round(raw * 10) / 10, 0, 10);
}

// ═══════════════════════════════════════════════════════════
// §5 — DIMENSION 2: SECURITY (Hard Skill)
// ═══════════════════════════════════════════════════════════
//
// "Ability to produce secure code without vulnerabilities
//  or data leaks."
//
// Heuristic signals: .env committed, .gitignore presence,
// dependency management, license presence.
// ═══════════════════════════════════════════════════════════

export function computeSecurity(repoSignals: RepoQualitySignal[]): number {
  if (repoSignals.length === 0) return 0;

  const total = repoSignals.length;

  // Critical: .env files committed (secrets leak)
  const envLeakCount = repoSignals.filter(r => r.hasEnvCommitted).length;
  const envLeakPenalty = envLeakCount * 2.5; // §5.3: Critical severity = 2.5

  // High: No .gitignore (risk of committing secrets/build artifacts)
  const noGitignoreCount = repoSignals.filter(r => !r.hasGitignore).length;
  const gitignorePenalty = (noGitignoreCount / total) * 1.5;

  // Medium: No dependency lock file (uncontrolled transitive deps)
  const hasDepManagement = repoSignals.filter(r => r.dependencyCount > 0).length;
  const depManagementRatio = total > 0 ? hasDepManagement / total : 0;
  const depPenalty = (1 - depManagementRatio) * 0.8;

  // Positive: .env.example present (shows secure env handling)
  const envExampleBonus = repoSignals.filter(r => r.hasEnvExample).length > 0 ? 0.5 : 0;

  // Positive: License present (shows awareness of open source practices)
  const licenseRatio = repoSignals.filter(r => r.hasLicense).length / total;

  // §5.3: Security_Score = max(0, 10 - Security_Penalty)
  const penalty = envLeakPenalty + gitignorePenalty + depPenalty;
  const bonus = envExampleBonus + (licenseRatio > 0.5 ? 0.5 : 0);

  return clamp(Math.round((10 - penalty + bonus) * 10) / 10, 0, 10);
}

// ═══════════════════════════════════════════════════════════
// §6 — DIMENSION 3: MAINTAINABILITY (Hard Skill)
// ═══════════════════════════════════════════════════════════
//
// "Ability to write clean, easily readable, and
//  maintainable code."
//
// Heuristic signals: file organization, documentation,
// linting, comment ratio, dependency coupling.
// ═══════════════════════════════════════════════════════════

export function computeMaintainability(repoSignals: RepoQualitySignal[]): number {
  if (repoSignals.length === 0) return 0;

  const total = repoSignals.length;

  // README quality: word count as proxy for documentation
  const avgReadmeWords = repoSignals.reduce((s, r) => s + r.readmeWordCount, 0) / total;
  const readmeScore = avgReadmeWords > 300 ? 2.0
    : avgReadmeWords > 100 ? 1.0
    : avgReadmeWords > 30 ? 0.5
    : 0;

  // Modular structure (≥3 distinct top-level dirs)
  const modularRatio = repoSignals.filter(r => r.hasModularStructure).length / total;

  // Linter/formatter presence
  const lintRatio = repoSignals.filter(r => r.hasPrettierOrLint).length / total;

  // Contributing guide presence
  const contributingRatio = repoSignals.filter(r => r.hasContributing).length / total;

  // Average file count per repo (extreme values = bad)
  const avgFileCount = repoSignals.reduce((s, r) => s + r.fileCount, 0) / total;
  // Penalize very large repos (>500 files) or very tiny ones (<5 files)
  const fileCountPenalty = avgFileCount > 500 ? 0.5
    : avgFileCount < 5 ? 0.3
    : 0;

  // Dependency count as complexity proxy (too many deps = harder to maintain)
  const avgDeps = repoSignals.reduce((s, r) => s + r.dependencyCount, 0) / total;
  const depComplexityPenalty = avgDeps > 50 ? 0.8
    : avgDeps > 30 ? 0.4
    : 0;

  // §6.3 adapted formula
  const raw = 10
    * (0.25 * Math.min(1, readmeScore / 2))        // Documentation quality (up to 25%)
    + 10 * (0.20 * modularRatio)                     // Architecture modularity (up to 20%)
    + 10 * (0.20 * lintRatio)                        // Code formatting consistency (up to 20%)
    + 10 * (0.15 * (contributingRatio > 0 ? 1 : 0)) // Contributing guide (up to 15%)
    + 10 * (0.10 * Math.min(1, avgReadmeWords / 200)) // Comment ratio proxy (up to 10%)
    + 10 * (0.10)                                    // Base score (10%)
    - fileCountPenalty
    - depComplexityPenalty;

  return clamp(Math.round(raw * 10) / 10, 0, 10);
}

// ═══════════════════════════════════════════════════════════
// §7 — DIMENSION 4: INFLUENCE (Soft Skill)
// ═══════════════════════════════════════════════════════════
//
// "Experience leading projects acknowledged by
//  other developers."
//
// Uses logarithmic normalization to prevent a single
// mega-popular repo from dominating.
// ═══════════════════════════════════════════════════════════

export function computeInfluence(
  totalStars: number,
  totalForks: number,
  followers: number,
  repos: FilteredRepo[]
): number {
  // §7.3 — Logarithmic Normalization
  // Normalized to [0,10] assuming 10k stars = 10, 5k forks = 10, 1k followers = 10
  const starScore = Math.log2(totalStars + 1) / Math.log2(10001) * 10;
  const forkScore = Math.log2(totalForks + 1) / Math.log2(5001) * 10;
  const followerScore = Math.log2(followers + 1) / Math.log2(1001) * 10;

  // §7.4 — Recency Weighting
  // Apply recency weights to star contributions per repo
  let weightedStarScore = 0;
  let totalWeight = 0;

  for (const repo of repos) {
    const monthsOld = monthsSince(repo.created_at);
    const recencyWeight = monthsOld < 6 ? 1.0
      : monthsOld < 12 ? 0.8
      : monthsOld < 24 ? 0.6
      : 0.3;

    const repoStarContribution = Math.log2(repo.stargazers_count + 1);
    weightedStarScore += repoStarContribution * recencyWeight;
    totalWeight += recencyWeight;
  }

  // Blend raw star score with recency-weighted star score
  const recencyAdjustedStarScore = totalWeight > 0
    ? normalize(weightedStarScore / totalWeight, 0, Math.log2(10001) / repos.length || 1, 0, 10)
    : starScore;

  const blendedStarScore = (starScore * 0.6) + (recencyAdjustedStarScore * 0.4);

  // §7.3 — Final weighted combination
  const raw = (blendedStarScore * 0.45) + (forkScore * 0.35) + (followerScore * 0.20);

  return clamp(Math.round(raw * 10) / 10, 0, 10);
}

// ═══════════════════════════════════════════════════════════
// §8 — DIMENSION 5: CONTRIBUTION (Soft Skill)
// ═══════════════════════════════════════════════════════════
//
// "Contribution to influential open-source projects."
//
// Measures collaborative engagement beyond own projects.
// ═══════════════════════════════════════════════════════════

export function computeContribution(
  totalPRsOpened: number,
  externalPRsMerged: number,
  prReviewsDone: number,
  externalIssues: number,
  activeDaysLastYear: number,
  orgsCount: number
): number {
  // §8.3 — Quality vs Quantity Weighting
  // External PRs are the highest signal
  const prMergedScore = Math.min(5, externalPRsMerged * 0.5);

  // PR reviews show expertise & collaboration
  const reviewScore = Math.min(3, prReviewsDone * 0.3);

  // External issues filed
  const issueScore = Math.min(1.5, externalIssues * 0.1);

  // §8.4 — Commit Activity Matrix
  // contribution_density = active_days / 365
  const streakScore = Math.min(2, (activeDaysLastYear / 365) * 2);

  // Org membership as a collaboration signal
  const orgBonus = Math.min(0.5, orgsCount * 0.15);

  // Total PRs opened as intent signal (even if not all merged)
  const intentBonus = Math.min(1, totalPRsOpened * 0.05);

  const raw = prMergedScore + reviewScore + issueScore + streakScore + orgBonus + intentBonus;

  return clamp(Math.round(normalize(raw, 0, 13, 0, 10) * 10) / 10, 0, 10);
}

// ═══════════════════════════════════════════════════════════
// §9 — DIMENSION 6: UNIQUENESS / ACID Builder Score
// ═══════════════════════════════════════════════════════════
//
// A — Architecture
// C — Cross-Domain Integration
// I — Innovation
// D — Documentation
//
// ACID_Score = (A × 0.30) + (C × 0.25) + (I × 0.20) + (D × 0.25)
// ═══════════════════════════════════════════════════════════

export function computeACID(
  repos: FilteredRepo[],
  repoSignals: RepoQualitySignal[],
  readmeSnippets: Record<string, string>
): { score: number; breakdown: ACIDBreakdown } {
  const architecture = computeArchitectureScore(repoSignals);
  const crossDomain = computeCrossDomainScore(repos, repoSignals);
  const innovation = computeInnovationScore(repos);
  const documentation = computeDocumentationScore(repoSignals, readmeSnippets);

  // §9.2 — ACID Final Score
  const score = clamp(
    Math.round(
      ((architecture * 0.30) + (crossDomain * 0.25) + (innovation * 0.20) + (documentation * 0.25)) * 10
    ) / 10,
    0, 10
  );

  return {
    score,
    breakdown: {
      architecture: Math.round(architecture * 10) / 10,
      crossDomain: Math.round(crossDomain * 10) / 10,
      innovation: Math.round(innovation * 10) / 10,
      documentation: Math.round(documentation * 10) / 10,
    },
  };
}

// ─── §9.1.A — Architecture Sub-Score ───

function computeArchitectureScore(repoSignals: RepoQualitySignal[]): number {
  if (repoSignals.length === 0) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const signal of repoSignals) {
    let repoScore = 0;
    const weight = 1;

    // Modular design (≥3 distinct layers)
    if (signal.hasModularStructure) repoScore += 3.0;

    // Well-defined entry points (detected via fileCount > threshold with structure)
    if (signal.fileCount > 5 && signal.directoryDepth >= 2) repoScore += 1.5;

    // Config externalisation (.env.example present, no .env committed)
    if (signal.hasEnvExample && !signal.hasEnvCommitted) repoScore += 2.0;
    else if (signal.hasEnvExample) repoScore += 1.0;

    // No God files (proxy: modular structure + reasonable file count)
    if (signal.hasModularStructure && signal.fileCount > 10) repoScore += 1.5;

    // Good directory depth (2-5 is healthy)
    if (signal.directoryDepth >= 2 && signal.directoryDepth <= 5) repoScore += 2.0;
    else if (signal.directoryDepth >= 1) repoScore += 1.0;

    totalScore += Math.min(10, repoScore) * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

// ─── §9.1.C — Cross-Domain Integration Sub-Score ───

function computeCrossDomainScore(repos: FilteredRepo[], repoSignals: RepoQualitySignal[]): number {
  const domains = new Set<string>();

  // Count unique languages across all repos
  const allLanguages = new Set<string>();
  for (const signal of repoSignals) {
    for (const lang of Object.keys(signal.languages)) {
      allLanguages.add(lang);
    }
  }
  if (allLanguages.size >= 2) domains.add('multi-language');

  // Check for infrastructure-as-code
  if (repoSignals.some(r => r.hasDockerfile)) domains.add('containers');

  // Check for CI/CD (deployment infrastructure)
  if (repoSignals.some(r => r.hasCI)) domains.add('ci-cd');

  // Check for database diversity (from topics/description)
  const allTopics = repos.flatMap(r => r.topics.map(t => t.toLowerCase()));
  const dbKeywords = ['database', 'sql', 'mongodb', 'postgres', 'redis', 'mysql', 'sqlite', 'nosql', 'prisma', 'drizzle', 'mongoose'];
  if (allTopics.some(t => dbKeywords.some(k => t.includes(k)))) domains.add('database');

  // Check for cloud integrations
  const cloudKeywords = ['aws', 'gcp', 'azure', 'cloud', 'serverless', 'lambda', 'vercel', 'netlify', 'docker', 'kubernetes'];
  if (allTopics.some(t => cloudKeywords.some(k => t.includes(k)))) domains.add('cloud');

  // Check for API integrations
  const apiKeywords = ['api', 'rest', 'graphql', 'grpc', 'webhook', 'oauth', 'jwt'];
  if (allTopics.some(t => apiKeywords.some(k => t.includes(k)))) domains.add('api');

  // Check for auth systems
  const authKeywords = ['auth', 'oauth', 'jwt', 'session', 'passport', 'clerk', 'supabase'];
  if (allTopics.some(t => authKeywords.some(k => t.includes(k)))) domains.add('auth');

  // Check for messaging/queues
  const msgKeywords = ['kafka', 'rabbitmq', 'redis', 'pubsub', 'queue', 'worker', 'bull'];
  if (allTopics.some(t => msgKeywords.some(k => t.includes(k)))) domains.add('messaging');

  // Also infer from repo descriptions
  const allDescriptions = repos.map(r => (r.description || '').toLowerCase()).join(' ');
  for (const keyword of [...dbKeywords, ...cloudKeywords, ...apiKeywords]) {
    if (allDescriptions.includes(keyword)) {
      const domainName = dbKeywords.includes(keyword) ? 'database'
        : cloudKeywords.includes(keyword) ? 'cloud'
        : 'api';
      domains.add(domainName);
    }
  }

  // Language diversity bonus
  if (allLanguages.size >= 4) domains.add('polyglot');

  // §9.1.C: CrossDomain_Score = min(10, unique_domains × 1.5)
  return Math.min(10, domains.size * 1.5);
}

// ─── §9.1.I — Innovation Sub-Score ───

function computeInnovationScore(repos: FilteredRepo[]): number {
  const allTopics = repos.flatMap(r => r.topics.map(t => t.toLowerCase()));

  // Novel topic tags (ML, blockchain, IoT, AR/VR, WebAssembly, etc.)
  const novelTopics = [
    'machine-learning', 'ml', 'deep-learning', 'ai', 'artificial-intelligence',
    'blockchain', 'web3', 'smart-contracts', 'nft', 'defi',
    'iot', 'internet-of-things', 'embedded',
    'ar', 'vr', 'augmented-reality', 'virtual-reality', 'xr',
    'webassembly', 'wasm',
    'quantum', 'quantum-computing',
    'robotics', 'computer-vision', 'nlp', 'natural-language-processing',
    'generative-ai', 'llm', 'transformer',
  ];

  const novelCount = new Set(allTopics.filter(t => novelTopics.some(n => t.includes(n)))).size;
  const noveltyScore = Math.min(10, novelCount * 2.5);

  // Original problem statement: check descriptions aren't tutorial/clone
  const tutorialKeywords = ['clone', 'tutorial', 'course', 'bootcamp', 'exercise', 'practice', 'learning', 'example', 'demo', 'template', 'starter', 'boilerplate'];
  const originalRepos = repos.filter(r => {
    const desc = (r.description || '').toLowerCase();
    const name = r.name.toLowerCase();
    return !tutorialKeywords.some(k => desc.includes(k) || name.includes(k));
  });
  const originalityRatio = repos.length > 0 ? originalRepos.length / repos.length : 0;
  const originalityScore = originalityRatio * 10;

  // Recency of repos (newer projects = more likely cutting-edge)
  const recentRepos = repos.filter(r => monthsSince(r.created_at) < 12);
  const recencyRatio = repos.length > 0 ? recentRepos.length / repos.length : 0;
  const recencyScore = recencyRatio * 10;

  // Topic diversity (repos spanning multiple categories)
  const uniqueTopics = new Set(allTopics);
  const diversityScore = Math.min(10, uniqueTopics.size * 0.5);

  // Average the sub-scores
  return clamp(
    (noveltyScore * 0.35) + (originalityScore * 0.30) + (recencyScore * 0.15) + (diversityScore * 0.20),
    0, 10
  );
}

// ─── §9.1.D — Documentation Sub-Score ───

function computeDocumentationScore(
  repoSignals: RepoQualitySignal[],
  readmeSnippets: Record<string, string>
): number {
  if (repoSignals.length === 0) return 0;

  let totalPoints = 0;
  let maxPoints = 0;

  for (const signal of repoSignals) {
    let repoPoints = 0;
    const repoMax = 10;

    // §9.1.D scoring table
    // README present: 1.0
    if (signal.readmeWordCount > 0) repoPoints += 1.0;

    // README length > 300 words: 1.0
    if (signal.readmeWordCount > 300) repoPoints += 1.0;

    // README has installation instructions: 1.5
    if (signal.readmeHasInstallInstructions) repoPoints += 1.5;

    // README has usage examples / code snippets: 1.5
    if (signal.readmeHasUsageExamples) repoPoints += 1.5;

    // README has screenshots / demo GIF: 1.0
    if (signal.readmeHasScreenshots) repoPoints += 1.0;

    // API documentation: 1.5
    if (signal.hasApiDocs) repoPoints += 1.5;

    // CONTRIBUTING.md: 0.5
    if (signal.hasContributing) repoPoints += 0.5;

    // LICENSE file: 0.5
    if (signal.hasLicense) repoPoints += 0.5;

    // CHANGELOG or release notes: 0.5
    if (signal.hasChangelog) repoPoints += 0.5;

    // Wiki enabled with content: 0.5
    if (signal.hasWiki) repoPoints += 0.5;

    totalPoints += Math.min(repoMax, repoPoints);
    maxPoints += repoMax;
  }

  return maxPoints > 0 ? clamp(Math.round((totalPoints / maxPoints) * 10 * 10) / 10, 0, 10) : 0;
}

// ═══════════════════════════════════════════════════════════
// §10 — MASTER SCORING: Weighted Aggregation
// ═══════════════════════════════════════════════════════════

export interface WeightedRepoScore {
  repoName: string;
  reliability: number;
  security: number;
  maintainability: number;
  weight: number;
}

/**
 * Compute weighted average of hard skills across all repos.
 * Each repo's hard skill scores are weighted by recency × complexity × quality.
 */
export function computeWeightedHardSkills(
  repoScores: WeightedRepoScore[]
): { reliability: number; security: number; maintainability: number; average: number } {
  if (repoScores.length === 0) {
    return { reliability: 0, security: 0, maintainability: 0, average: 0 };
  }

  let totalWeight = 0;
  let weightedR = 0;
  let weightedS = 0;
  let weightedM = 0;

  for (const rs of repoScores) {
    weightedR += rs.reliability * rs.weight;
    weightedS += rs.security * rs.weight;
    weightedM += rs.maintainability * rs.weight;
    totalWeight += rs.weight;
  }

  const reliability = totalWeight > 0 ? weightedR / totalWeight : 0;
  const security = totalWeight > 0 ? weightedS / totalWeight : 0;
  const maintainability = totalWeight > 0 ? weightedM / totalWeight : 0;

  return {
    reliability: Math.round(reliability * 10) / 10,
    security: Math.round(security * 10) / 10,
    maintainability: Math.round(maintainability * 10) / 10,
    average: Math.round(((reliability + security + maintainability) / 3) * 10) / 10,
  };
}

/**
 * §10.3 — Final Score Computation
 *
 * Final_Score = (Hard_Skills × 0.30) + (Soft_Skills × 0.40) + (Builder_Skills × 0.30)
 */
export function computeFinalScore(
  hardSkillsAvg: number,
  softSkillsAvg: number,
  builderSkills: number
): number {
  const raw = (hardSkillsAvg * 0.30) + (softSkillsAvg * 0.40) + (builderSkills * 0.30);
  return clamp(Math.round(raw * 10) / 10, 0, 10);
}

/**
 * Convenience: compute all CURISM scores from collected data.
 */
export function computeAllCURISMScores(input: {
  repoSignals: RepoQualitySignal[];
  avgCommitMessageLength: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  filteredRepos: FilteredRepo[];
  totalPRsOpened: number;
  externalPRsMerged: number;
  prReviewsDone: number;
  externalIssues: number;
  activeDaysLastYear: number;
  orgsCount: number;
  readmeSnippets: Record<string, string>;
}): { scores: CURISMScores; acidBreakdown: ACIDBreakdown } {
  const reliability = computeReliability(input.repoSignals, input.avgCommitMessageLength);
  const security = computeSecurity(input.repoSignals);
  const maintainability = computeMaintainability(input.repoSignals);
  const influence = computeInfluence(input.totalStars, input.totalForks, input.followers, input.filteredRepos);
  const contribution = computeContribution(
    input.totalPRsOpened,
    input.externalPRsMerged,
    input.prReviewsDone,
    input.externalIssues,
    input.activeDaysLastYear,
    input.orgsCount
  );
  const acid = computeACID(input.filteredRepos, input.repoSignals, input.readmeSnippets);

  return {
    scores: {
      reliability,
      security,
      maintainability,
      influence,
      contribution,
      uniqueness: acid.score,
    },
    acidBreakdown: acid.breakdown,
  };
}

// ═══════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════

function monthsSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}
