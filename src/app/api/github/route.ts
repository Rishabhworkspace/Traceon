import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Only GitHub users will have an access token we can use for these specific requests
        if (session.user.provider !== 'github' || !session.user.accessToken) {
            return NextResponse.json({
                message: 'No GitHub connection available',
                repos: [],
                starred: []
            }, { status: 200 }); // Return 200 with empty arrays so the UI knows there's no data, but it's not a hard error
        }

        const headers = {
            'Authorization': `token ${session.user.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
        };

        // Fetch user's own repositories
        // Limit to recently updated repos
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

        const repos = await reposResponse.json();
        const starred = await starredResponse.json();

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
