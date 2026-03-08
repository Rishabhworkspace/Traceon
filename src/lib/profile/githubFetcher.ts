// src/lib/profile/githubFetcher.ts

// Type Definitions
export interface GitHubUser {
    login: string;
    avatar_url: string;
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    created_at: string;
}

export interface GitHubRepo {
    name: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    topics: string[];
    updated_at: string;
    fork: boolean;
    owner: { login: string };
    html_url: string;
}

export interface CommitSample {
    repoName: string;
    message: string;
    date: string;
}

export interface AggregatedProfileData {
    user: GitHubUser;
    topRepos: GitHubRepo[];
    languageBytes: Record<string, number>;
    recentCommits: CommitSample[];
    readmeSnippets: Record<string, string>;
}

// Ensure we use a token if available to get 5,000 requests/hr instead of 60.
const getHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'traceon-analyzer',
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

export async function fetchGitHubProfileData(username: string): Promise<AggregatedProfileData> {
    const headers = getHeaders();

    // 1. Fetch User Data
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) {
        if (userRes.status === 404) throw new Error('User not found');
        if (userRes.status === 403) throw new Error('GitHub API rate limit exceeded');
        throw new Error(`Failed to fetch user: ${userRes.statusText}`);
    }
    const user: GitHubUser = await userRes.json();

    // 2. Fetch Repositories (Up to 100, sort by recently pushed)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers });
    if (!reposRes.ok) {
        throw new Error(`Failed to fetch repositories: ${reposRes.statusText}`);
    }
    const allRepos: GitHubRepo[] = await reposRes.json();

    // Filter out forks and keep the top 50
    const topRepos = allRepos.filter(r => !r.fork).slice(0, 50);

    // 3. Aggregate Languages, Grab Recent Commits, & READMEs
    // We run these parallel requests in chunks to avoid slamming GitHub API concurrently
    const languageBytes: Record<string, number> = {};
    const recentCommits: CommitSample[] = [];
    const readmeSnippets: Record<string, string> = {};

    // Prioritize top 10 repos for deep analysis (commits + exact language bytes) to save time/requests
    const deepAnalysisRepos = topRepos.slice(0, 10);

    const chunkArray = <T>(arr: T[], size: number): T[][] => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );
    };

    const repoChunks = chunkArray(deepAnalysisRepos, 5);

    for (const chunk of repoChunks) {
        await Promise.all(chunk.map(async (repo) => {
            try {
                // Fetch Languages
                const langRes = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`, { headers });
                if (langRes.ok) {
                    const langs: Record<string, number> = await langRes.json();
                    for (const [lang, bytes] of Object.entries(langs)) {
                        languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
                    }
                }

                // Fetch Recent Commits (grab max 3 per repo to get a spread)
                const commitsRes = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?author=${username}&per_page=3`, { headers });
                if (commitsRes.ok) {
                    const commits = await commitsRes.json();
                    if (Array.isArray(commits)) {
                        commits.forEach((c: any) => {
                            if (c.commit && c.commit.message) {
                                recentCommits.push({
                                    repoName: repo.name,
                                    message: c.commit.message,
                                    date: c.commit.author.date,
                                });
                            }
                        });
                    }
                }

                // Fetch README for the top 3 repos to gauge documentation quality
                if (deepAnalysisRepos.indexOf(repo) < 3) {
                    const readmeRes = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`, { headers });
                    if (readmeRes.ok) {
                        const readmeJson = await readmeRes.json();
                        if (readmeJson.content) {
                            const decoded = Buffer.from(readmeJson.content, 'base64').toString('utf-8');
                            // Store first 600 chars of the README as a sample
                            readmeSnippets[repo.name] = decoded.substring(0, 600) + (decoded.length > 600 ? '...' : '');
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed deep analysis for repo ${repo.name}:`, error);
                // Non-fatal, continue with other repos
            }
        }));
    }

    return {
        user,
        topRepos,
        languageBytes,
        recentCommits,
        readmeSnippets
    };
}
