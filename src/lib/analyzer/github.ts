// Native fetch is available in Node 18+

export interface GithubCommit {
    sha: string;
    message: string;
    date: string;
    author: string;
}

export async function fetchRecentCommits(owner: string, repo: string, limit: number = 3): Promise<GithubCommit[]> {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`;
        console.log(`[Traceon] Fetching commits: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Traceon-Analyzer',
                'Accept': 'application/vnd.github.v3+json',
                ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
            }
        });

        if (!response.ok) {
            console.warn(`[Traceon] Failed to fetch commits: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((commit: any) => ({
            sha: commit.sha,
            message: commit.commit.message.split('\n')[0], // First line only
            date: commit.commit.author.date,
            author: commit.commit.author.name
        }));
    } catch (error) {
        console.error('[Traceon] Error fetching commits:', error);
        return [];
    }
}
