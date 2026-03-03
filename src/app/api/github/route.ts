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

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let repos = [];
        let starred = [];

        // If we have a GitHub provider with an access token, use the authenticated API
        if (session.user.provider === 'github' && session.user.accessToken) {
            const headers: HeadersInit = {
                'Authorization': `token ${session.user.accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            };

            // Fetch user's own repositories
            const reposResponse = await fetch(`${GITHUB_API_URL}/user/repos?sort=updated&per_page=6&affiliation=owner,collaborator`, {
                headers,
                next: { revalidate: 60 * 5 } // Cache for 5 minutes
            });

            // Fetch user's starred repositories
            const starredResponse = await fetch(`${GITHUB_API_URL}/user/starred?sort=created&per_page=6`, {
                headers,
                next: { revalidate: 60 * 5 }
            });

            if (!reposResponse.ok || !starredResponse.ok) {
                console.error('GitHub API error', await reposResponse.text(), await starredResponse.text());
                throw new Error('Failed to fetch data from GitHub API');
            }

            repos = await reposResponse.json();
            starred = await starredResponse.json();
        } else {
            // Fallback to unauthenticated public API if they linked a GitHub username to their account
            await dbConnect();
            const dbUser = await User.findOne({ email: session.user.email });

            if (!dbUser || !dbUser.githubUsername) {
                return NextResponse.json({
                    message: 'No GitHub connection available',
                    repos: [],
                    starred: []
                }, { status: 200 }); // Return empty arrays, UI will show connect form
            }

            const username = dbUser.githubUsername;
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github.v3+json',
            };

            // Unauthenticated requests for public repos
            const reposResponse = await fetch(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=6`, {
                headers,
                next: { revalidate: 60 * 5 }
            });

            const starredResponse = await fetch(`${GITHUB_API_URL}/users/${username}/starred?sort=created&per_page=6`, {
                headers,
                next: { revalidate: 60 * 5 }
            });

            if (!reposResponse.ok || !starredResponse.ok) {
                console.error('GitHub API unauthenticated error', await reposResponse.text(), await starredResponse.text());
                throw new Error('Failed to fetch public data from GitHub API');
            }

            repos = await reposResponse.json();
            starred = await starredResponse.json();
        }

        // Map abstracting away unnecessary fields
        const formattedRepos = repos.map((repo: GitHubApiRepo) => ({
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
        }));

        const formattedStarred = starred.map((repo: GitHubApiRepo) => ({
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
        }));

        return NextResponse.json({
            repos: formattedRepos,
            starred: formattedStarred
        });

    } catch (error) {
        console.error('GitHub Profile API Error:', error);
        return NextResponse.json({ message: 'Internal server error while fetching GitHub profile' }, { status: 500 });
    }
}
