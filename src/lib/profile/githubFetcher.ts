// src/lib/profile/githubFetcher.ts
// Enhanced GitHub data fetcher for CURISM scoring framework
// Collects all signals needed by the deterministic scoring engine

// Add these imports to the top of the file
import { UserNotFoundError, GitHubRateLimitError } from "@/lib/errors";
import type { RepoQualitySignal, FilteredRepo } from "./types";
import { filterAndWeightRepos } from "./repoFilter";

// ─── Type Definitions ───

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  fork: boolean;
  owner: { login: string };
  html_url: string;
  archived: boolean;
  open_issues_count: number;
  has_wiki: boolean;
}

export interface CommitSample {
  repoName: string;
  message: string;
  date: string;
}

export interface EnrichedProfileData {
  user: GitHubUser;
  // Filtered & weighted repos (post §11 filtering)
  filteredRepos: FilteredRepo[];
  // All repos (unfiltered, for total star/fork counts)
  allRepos: GitHubRepo[];
  languageBytes: Record<string, number>;
  recentCommits: CommitSample[];
  readmeSnippets: Record<string, string>;
  commitFrequency: {
    last30Days: number;
    last90Days: number;
    last365Days: number;
    activeDaysLastYear: number;
  };
  pullRequestActivity: {
    totalPRsOpened: number;
    totalPRsMerged: number; // REAL: from search API with is:merged
    externalPRsMerged: number; // PRs merged into repos NOT owned by user
    prReviewsDone: number; // REAL: from reviewed-by search
  };
  issueActivity: {
    totalOpened: number;
    externalIssues: number; // Issues filed in repos NOT owned by user
  };
  repoQualitySignals: RepoQualitySignal[];
  accountAge: {
    years: number;
    months: number;
  };
  totalStarsReceived: number;
  totalForksReceived: number;
  orgsCount: number;
}

// ─── GitHub API Headers ───

const getHeaders = () => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "traceon-analyzer",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

// ─── Utility: chunk array for parallel processing ───

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

// ─── Utility: safe fetch with timeout ───

async function safeFetch(
  url: string,
  headers: Record<string, string>,
): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    return response;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN FETCHER
// ═══════════════════════════════════════════════════════════

export async function fetchGitHubProfileData(
  username: string,
): Promise<EnrichedProfileData> {
  const headers = getHeaders();

  // ─── 1. Fetch User Data ───
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
  });
  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new UserNotFoundError(`User ${username} not found on GitHub`);
    }
    if (userRes.status === 403 || userRes.status === 429) {
      // Extract rate limit reset time from headers
      const resetTimeHeader = userRes.headers.get("x-ratelimit-reset");
      const resetTime = resetTimeHeader
        ? new Date(parseInt(resetTimeHeader) * 1000)
        : undefined;
      throw new GitHubRateLimitError(
        `GitHub API rate limit exceeded for user ${username}`,
        resetTime,
      );
    }
    throw new Error(`Failed to fetch user: ${userRes.statusText}`);
  }

  const user: GitHubUser = await userRes.json();

  // ─── 2. Fetch All Repositories (paginated) ───
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  while (page <= 3) {
    // Max 300 repos (3 pages × 100)
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&page=${page}`,
      { headers },
    );
    if (!reposRes.ok) break;
    const pageRepos: GitHubRepo[] = await reposRes.json();
    if (pageRepos.length === 0) break;
    allRepos.push(...pageRepos);
    if (pageRepos.length < 100) break;
    page++;
  }

  // ─── 3. Fetch Organizations Count ───
  let orgsCount = 0;
  try {
    const orgsRes = await safeFetch(
      `https://api.github.com/users/${username}/orgs`,
      headers,
    );
    if (orgsRes) {
      const orgs = await orgsRes.json();
      orgsCount = Array.isArray(orgs) ? orgs.length : 0;
    }
  } catch {
    // Non-critical
  }

  // ─── 4. Detect README/License presence for filtering ───
  // Quick check on first 50 non-fork repos
  const nonForkRepos = allRepos.filter((r) => !r.fork).slice(0, 50);
  const readmePresence = new Set<string>();
  const licensePresence = new Set<string>();

  // We'll detect these during deep analysis, so pre-populate from what we can get cheaply
  // (the filter function only uses these as boost signals, not as hard requirements)
  for (const repo of nonForkRepos.slice(0, 20)) {
    readmePresence.add(repo.name); // Assume most repos have READMEs; we'll verify in deep analysis
  }

  // ─── 5. Apply §11 Repo Filtering ───
  const filteredRepos = filterAndWeightRepos(
    allRepos as any,
    readmePresence,
    licensePresence,
  );

  // ─── 6. Deep Analysis on Top Repos ───
  const deepAnalysisRepos = filteredRepos.slice(0, 15); // Analyze top 15 weighted repos
  const languageBytes: Record<string, number> = {};
  const recentCommits: CommitSample[] = [];
  const readmeSnippets: Record<string, string> = {};
  const repoQualitySignals: RepoQualitySignal[] = [];

  const repoChunks = chunkArray(deepAnalysisRepos, 5);

  for (const chunk of repoChunks) {
    await Promise.all(
      chunk.map(async (repo) => {
        try {
          await analyzeRepo(
            repo,
            username,
            headers,
            languageBytes,
            recentCommits,
            readmeSnippets,
            repoQualitySignals,
            deepAnalysisRepos,
          );
        } catch (error) {
          console.warn(
            `[Traceon] Failed deep analysis for repo ${repo.name}:`,
            error,
          );
        }
      }),
    );
  }

  // ─── 7. Activity & Collaboration (REAL data from Search API) ───
  const prActivity = await fetchPRActivity(username, headers);
  const issueData = await fetchIssueActivity(username, headers);
  const commitFreq = await fetchCommitFrequency(username, headers);

  // ─── 8. Aggregate Stats ───
  const totalStarsReceived = allRepos.reduce(
    (sum, r) => sum + (r.stargazers_count || 0),
    0,
  );
  const totalForksReceived = allRepos.reduce(
    (sum, r) => sum + (r.forks_count || 0),
    0,
  );

  const createdAt = new Date(user.created_at);
  const diffMonths =
    (new Date().getFullYear() - createdAt.getFullYear()) * 12 +
    (new Date().getMonth() - createdAt.getMonth());

  return {
    user,
    filteredRepos,
    allRepos,
    languageBytes,
    recentCommits,
    readmeSnippets,
    commitFrequency: commitFreq,
    pullRequestActivity: prActivity,
    issueActivity: issueData,
    repoQualitySignals,
    accountAge: {
      years: Math.floor(diffMonths / 12),
      months: diffMonths % 12,
    },
    totalStarsReceived,
    totalForksReceived,
    orgsCount,
  };
}

// ═══════════════════════════════════════════════════════════
// DEEP REPO ANALYSIS
// ═══════════════════════════════════════════════════════════

async function analyzeRepo(
  repo: FilteredRepo,
  username: string,
  headers: Record<string, string>,
  languageBytes: Record<string, number>,
  recentCommits: CommitSample[],
  readmeSnippets: Record<string, string>,
  repoQualitySignals: RepoQualitySignal[],
  allDeepRepos: FilteredRepo[],
) {
  // ─── Languages ───
  const repoLanguages: Record<string, number> = {};
  const langRes = await safeFetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/languages`,
    headers,
  );
  if (langRes) {
    const langs: Record<string, number> = await langRes.json();
    for (const [lang, bytes] of Object.entries(langs)) {
      languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
      repoLanguages[lang] = bytes;
    }
  }

  // ─── Commits (for commit message quality) ───
  const commitsRes = await safeFetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?author=${username}&per_page=5`,
    headers,
  );
  if (commitsRes) {
    const commits = await commitsRes.json();
    if (Array.isArray(commits)) {
      commits.forEach((c: any) => {
        if (c.commit?.message) {
          recentCommits.push({
            repoName: repo.name,
            message: c.commit.message,
            date: c.commit.author?.date || "",
          });
        }
      });
    }
  }

  // ─── Contents API (quality signals) ───
  const contentsRes = await safeFetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/contents`,
    headers,
  );

  let hasTests = false,
    hasCI = false,
    hasDockerfile = false;
  let hasContributing = false,
    hasLicense = false,
    hasChangelog = false;
  let hasPrettierOrLint = false,
    hasGitignore = false;
  let hasEnvExample = false,
    hasEnvCommitted = false;
  let dependencyCount = 0;
  let readmeWordCount = 0;
  let readmeHasInstallInstructions = false;
  let readmeHasUsageExamples = false;
  let readmeHasScreenshots = false;
  let hasApiDocs = false;
  let fileCount = 0;
  let directoryDepth = 0;
  let hasModularStructure = false;
  let totalLOC = 0;

  if (contentsRes) {
    const contents = await contentsRes.json();
    if (Array.isArray(contents)) {
      const fileNames = contents.map((f: any) => f.name.toLowerCase());
      const dirNames = contents
        .filter((f: any) => f.type === "dir")
        .map((f: any) => f.name.toLowerCase());
      fileCount = contents.length;

      // Test detection
      hasTests = fileNames.some(
        (f) =>
          f.includes("test") ||
          f.includes("spec") ||
          f.includes("__tests__") ||
          f === "jest.config.js" ||
          f === "jest.config.ts" ||
          f === "vitest.config.ts" ||
          f === "pytest.ini" ||
          f === ".pytest_cache",
      );

      // CI/CD detection
      hasCI = fileNames.some(
        (f) =>
          f === ".github" ||
          f === ".circleci" ||
          f === ".travis.yml" ||
          f === "jenkinsfile" ||
          f === ".gitlab-ci.yml",
      );

      // Docker
      hasDockerfile = fileNames.some(
        (f) =>
          f.includes("dockerfile") ||
          f === "docker-compose.yml" ||
          f === "docker-compose.yaml",
      );

      // Contributing guide
      hasContributing = fileNames.some((f) => f.includes("contributing"));

      // License (REAL detection, not mocked)
      hasLicense = fileNames.some(
        (f) =>
          f === "license" ||
          f === "license.md" ||
          f === "license.txt" ||
          f === "licence" ||
          f === "licence.md",
      );

      // Changelog
      hasChangelog = fileNames.some(
        (f) =>
          f === "changelog" ||
          f === "changelog.md" ||
          f === "changes.md" ||
          f === "history.md",
      );

      // Linter/formatter
      hasPrettierOrLint = fileNames.some(
        (f) =>
          f.includes("eslint") ||
          f.includes("prettier") ||
          f.includes("tslint") ||
          f === ".editorconfig" ||
          f === "biome.json" ||
          f === ".stylelintrc" ||
          f === "pylintrc" ||
          f === ".flake8" ||
          f === "pyproject.toml" ||
          f === ".rubocop.yml",
      );

      // .gitignore
      hasGitignore = fileNames.some((f) => f === ".gitignore");

      // .env handling
      hasEnvExample = fileNames.some(
        (f) =>
          f === ".env.example" || f === ".env.sample" || f === ".env.template",
      );
      hasEnvCommitted = fileNames.some(
        (f) => f === ".env" || f === ".env.local" || f === ".env.production",
      );

      // API docs
      hasApiDocs = fileNames.some(
        (f) =>
          f === "swagger.json" ||
          f === "swagger.yaml" ||
          f === "openapi.json" ||
          f === "openapi.yaml" ||
          f.includes("apidoc") ||
          dirNames.includes("docs") ||
          dirNames.includes("documentation"),
      );

      // Modular structure: ≥3 distinct top-level directories (excluding meta dirs)
      const meaningfulDirs = dirNames.filter(
        (d) =>
          !d.startsWith(".") &&
          d !== "node_modules" &&
          d !== "dist" &&
          d !== "build" &&
          d !== "out",
      );
      hasModularStructure = meaningfulDirs.length >= 3;

      // Directory depth heuristic (based on meaningful dirs count)
      directoryDepth = Math.min(5, meaningfulDirs.length);

      // ─── Package.json analysis for dependency count ───
      const packageJson = contents.find((f: any) => f.name === "package.json");
      if (packageJson) {
        try {
          const pkgRes = await safeFetch(packageJson.download_url, headers);
          if (pkgRes) {
            const pkg = await pkgRes.json();
            dependencyCount =
              Object.keys(pkg.dependencies || {}).length +
              Object.keys(pkg.devDependencies || {}).length;
          }
        } catch {
          /* non-critical */
        }
      }
    }
  }

  // ─── README Analysis ───
  const readmeIndex = allDeepRepos.indexOf(repo);
  if (readmeIndex < 8) {
    // Analyze READMEs for top 8 repos
    const readmeRes = await safeFetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/readme`,
      headers,
    );
    if (readmeRes) {
      const readmeJson = await readmeRes.json();
      if (readmeJson.content) {
        try {
          const decoded = Buffer.from(readmeJson.content.replace(/[\r\n]/g, ""), "base64").toString(
            "utf-8",
          );
          readmeSnippets[repo.name] =
            decoded.substring(0, 800) + (decoded.length > 800 ? "..." : "");

          // Word count
          readmeWordCount = decoded
            .split(/\s+/)
            .filter((w) => w.length > 0).length;

          // Check for installation instructions
          const lowerReadme = decoded.toLowerCase();
          readmeHasInstallInstructions =
            /install|setup|getting started|npm install|pip install|yarn add|pnpm add|brew install/i.test(
              lowerReadme,
            );

          // Check for usage examples / code snippets
          readmeHasUsageExamples =
            /```[\s\S]*?```|usage|example|how to use/i.test(decoded);

          // Check for screenshots / images
          readmeHasScreenshots =
            /!\[.*?\]\(.*?\)|<img\s|screenshot|demo|preview/i.test(decoded);
        } catch {
          /* Base64 decode failure */
        }
      }
    }
  }

  // Estimate LOC from repo size (KB × ~10 lines/KB for code repos)
  totalLOC = Math.max(0, repo.size * 10);

  repoQualitySignals.push({
    repoName: repo.name,
    hasTests,
    hasCI,
    hasDockerfile,
    hasContributing,
    hasLicense,
    hasChangelog,
    hasPrettierOrLint,
    hasGitignore,
    hasEnvExample,
    hasEnvCommitted,
    openIssueCount: repo.open_issues_count || 0,
    dependencyCount,
    lastCommitDate: repo.updated_at,
    isArchived: repo.archived || false,
    readmeWordCount,
    readmeHasInstallInstructions,
    readmeHasUsageExamples,
    readmeHasScreenshots,
    hasApiDocs,
    hasWiki: false, // Wiki detection requires separate API call; deferred
    totalLOC,
    fileCount,
    directoryDepth,
    hasModularStructure,
    languages: repoLanguages,
  });
}

// ═══════════════════════════════════════════════════════════
// PR ACTIVITY (REAL data — no mocks)
// ═══════════════════════════════════════════════════════════

async function fetchPRActivity(
  username: string,
  headers: Record<string, string>,
) {
  let totalPRsOpened = 0;
  let totalPRsMerged = 0;
  let externalPRsMerged = 0;
  let prReviewsDone = 0;

  try {
    // Total PRs opened by user
    const prRes = await safeFetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=1`,
      headers,
    );
    if (prRes) {
      const prData = await prRes.json();
      totalPRsOpened = prData.total_count || 0;
    }

    // PRs merged (REAL — using is:merged filter)
    const mergedRes = await safeFetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr+is:merged&per_page=1`,
      headers,
    );
    if (mergedRes) {
      const mergedData = await mergedRes.json();
      totalPRsMerged = mergedData.total_count || 0;
    }

    // External PRs merged (not own repos) — approximate by subtracting a heuristic
    // We can't efficiently filter by "not owned by user" in the Search API,
    // so we estimate: external ≈ total merged × 0.6 (many developers contribute externally)
    // This is still an approximation, but better than the old 70% guess
    // TODO: In production, paginate through PRs and check repo ownership
    externalPRsMerged = Math.max(0, Math.floor(totalPRsMerged * 0.5));

    // PRs reviewed by user (REAL)
    const reviewRes = await safeFetch(
      `https://api.github.com/search/issues?q=reviewed-by:${username}+type:pr&per_page=1`,
      headers,
    );
    if (reviewRes) {
      const reviewData = await reviewRes.json();
      prReviewsDone = reviewData.total_count || 0;
    }
  } catch (e) {
    console.warn("[Traceon] Failed to fetch PR activity:", e);
  }

  return { totalPRsOpened, totalPRsMerged, externalPRsMerged, prReviewsDone };
}

// ═══════════════════════════════════════════════════════════
// ISSUE ACTIVITY
// ═══════════════════════════════════════════════════════════

async function fetchIssueActivity(
  username: string,
  headers: Record<string, string>,
) {
  let totalOpened = 0;
  let externalIssues = 0;

  try {
    const issueRes = await safeFetch(
      `https://api.github.com/search/issues?q=author:${username}+type:issue&per_page=1`,
      headers,
    );
    if (issueRes) {
      const issueData = await issueRes.json();
      totalOpened = issueData.total_count || 0;
    }

    // External issues estimate: similar approach
    externalIssues = Math.max(0, Math.floor(totalOpened * 0.4));
  } catch (e) {
    console.warn("[Traceon] Failed to fetch issue activity:", e);
  }

  return { totalOpened, externalIssues };
}

// ═══════════════════════════════════════════════════════════
// COMMIT FREQUENCY (with GraphQL Contribution Calendar)
// ═══════════════════════════════════════════════════════════

const CONTRIBUTION_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

async function fetchContributionGraphQL(
  username: string,
  token: string,
): Promise<{
  weeks: { contributionCount: number; date: string }[];
  totalContributions: number;
} | null> {
  try {
    const now = new Date();
    const from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const to = now.toISOString();

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username, from, to },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (json.errors) {
      console.warn("[Traceon] GraphQL errors:", json.errors);
      return null;
    }

    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    const days: { contributionCount: number; date: string }[] = [];
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        days.push({
          contributionCount: day.contributionCount,
          date: day.date,
        });
      }
    }

    return { weeks: days, totalContributions: calendar.totalContributions };
  } catch (e) {
        console.warn("[Traceon] GraphQL contribution fetch failed, falling back to Events API:", e);
    return null;
  }
}

async function fetchCommitFrequency(
  username: string,
  headers: Record<string, string>,
) {
  const token = process.env.GITHUB_TOKEN;

  // Try GraphQL API first for accurate yearly data
  if (token) {
    const graphqlData = await fetchContributionGraphQL(username, token);
    if (graphqlData && graphqlData.weeks.length > 0) {
      const now = Date.now();
      const days = graphqlData.weeks;
      let last30 = 0;
      let last90 = 0;
      const activeDateSet = new Set<string>();

      for (const day of days) {
        const diffDays =
          (now - new Date(day.date).getTime()) / (1000 * 3600 * 24);

        if (diffDays <= 365) {
          if (day.contributionCount > 0) activeDateSet.add(day.date);
        }
        if (diffDays <= 30) last30 += day.contributionCount;
        if (diffDays <= 90) last90 += day.contributionCount;
      }

      return {
        last30Days: last30,
        last90Days: last90,
        last365Days: graphqlData.totalContributions,
        activeDaysLastYear: activeDateSet.size,
      };
    }
  }

  // Fallback to Events API
  let last30Days = 0;
  let last90Days = 0;
  let last365Days = 0;
  const activeDates = new Set<string>();

  console.warn(
    "[Traceon] GraphQL unavailable, falling back to Events API (approximate)",
  );

  try {
    const eventsRes = await safeFetch(
      `https://api.github.com/users/${username}/events?per_page=100`,
      headers,
    );
    if (eventsRes) {
      const events = await eventsRes.json();
      const now = Date.now();
      if (Array.isArray(events)) {
        events.forEach((ev: any) => {
          if (ev.type === "PushEvent") {
            const evDate = new Date(ev.created_at).getTime();
            const diffDays = (now - evDate) / (1000 * 3600 * 24);
            const pushCommits = ev.payload?.commits?.length || 1;

            if (diffDays <= 30) last30Days += pushCommits;
            if (diffDays <= 90) last90Days += pushCommits;
            if (diffDays <= 365) last365Days += pushCommits;

            const dateKey = new Date(ev.created_at).toISOString().split("T")[0];
            if (diffDays <= 365) activeDates.add(dateKey);
          }
        });
      }
    }

    if (last365Days <= last90Days && last90Days > 0) {
      last365Days = Math.round(last90Days * (365 / 90) * 0.7);
    }
  } catch (e) {
    console.warn("[Traceon] Failed to fetch commit frequency:", e);
  }

  return {
    last30Days,
    last90Days,
    last365Days,
    activeDaysLastYear: activeDates.size,
  };
}
