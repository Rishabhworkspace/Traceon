import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';

const GITHUB_API_URL = 'https://api.github.com';

interface GitHubApiRepo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    updated_at: string;
    visibility: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

function formatRepo(repo: GitHubApiRepo) {
    return {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        updated_at: repo.updated_at,
        visibility: repo.visibility,
        owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url
        }
    };
}

async function fetchGitHubApi(url: string, headers: HeadersInit): Promise<GitHubApiRepo[]> {
    const response = await fetch(url, {
        headers,
        next: { revalidate: 60 * 5 }
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`GitHub API error [${response.status}] for ${url}:`, errorText);

        // Rate limit hit — return empty instead of throwing
        if (response.status === 403 || response.status === 429) {
            console.warn('GitHub API rate limit hit, returning empty results');
            return [];
        }

        // Not found — likely invalid username
        if (response.status === 404) {
            console.warn('GitHub user not found, returning empty results');
            return [];
        }

        return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let repos: GitHubApiRepo[] = [];
        let starred: GitHubApiRepo[] = [];

        // If we have a GitHub provider with an access token, use the authenticated API
        if (session.user.provider === 'github' && session.user.accessToken) {
            const headers: HeadersInit = {
                'Authorization': `token ${session.user.accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Traceon-App',
            };

            // Fetch repos and starred in parallel
            [repos, starred] = await Promise.all([
                fetchGitHubApi(
                    `${GITHUB_API_URL}/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator`,
                    headers
                ),
                fetchGitHubApi(
                    `${GITHUB_API_URL}/user/starred?sort=created&per_page=100`,
                    headers
                ),
            ]);
        } else {
            // Fallback to unauthenticated public API if they linked a GitHub username
            await dbConnect();
            const dbUser = await User.findOne({ email: session.user.email });

            if (!dbUser || !dbUser.githubUsername) {
                return NextResponse.json({
                    message: 'No GitHub connection available',
                    repos: [],
                    starred: []
                }, { status: 200 });
            }

            const username = dbUser.githubUsername;
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Traceon-App',
            };

            // Fetch repos and starred in parallel
            [repos, starred] = await Promise.all([
                fetchGitHubApi(
                    `${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=100`,
                    headers
                ),
                fetchGitHubApi(
                    `${GITHUB_API_URL}/users/${username}/starred?sort=created&per_page=100`,
                    headers
                ),
            ]);
        }

        return NextResponse.json({
            repos: repos.map(formatRepo),
            starred: starred.map(formatRepo)
        });

    } catch (error) {
        console.error('GitHub Profile API Error:', error);
        // Return empty data instead of 500 so the UI doesn't break
        return NextResponse.json({
            message: 'Failed to fetch GitHub data',
            repos: [],
            starred: []
        }, { status: 200 });
    }
}
