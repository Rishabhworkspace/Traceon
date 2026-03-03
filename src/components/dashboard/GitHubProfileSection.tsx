'use client';

import { useState, useEffect } from 'react';
import { Github, Star, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    url: string;
    language: string;
    stargazers_count: number;
    updated_at: string;
    visibility: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

interface GitHubDataResponse {
    message?: string;
    repos?: GitHubRepo[];
    starred?: GitHubRepo[];
}

export default function GitHubProfileSection() {
    const [data, setData] = useState<GitHubDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                const res = await fetch('/api/github');
                if (!res.ok) {
                    throw new Error('Failed to fetch GitHub data');
                }
                const json = await res.json();
                console.log('GitHub API response:', json);
                // The API returns a message 'No GitHub connection available' if the user isn't logged in with GitHub
                if (json.message && (json.message === 'No GitHub connection available' || json.message === 'Unauthorized')) {
                    setData(null);
                } else {
                    setData(json);
                }
            } catch (err: unknown) {
                console.error('Error fetching GitHub profile:', err);
                const msg = err instanceof Error ? err.message : 'Failed to fetch GitHub profile';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubData();
    }, []);

    const handleAnalyze = async (url: string) => {
        if (!url) return;

        try {
            setAnalyzingRepo(url);

            // Get or create guest session ID
            let localSessionId = localStorage.getItem('traceon_guest_session');
            if (!localSessionId) {
                localSessionId = crypto.randomUUID();
                localStorage.setItem('traceon_guest_session', localSessionId);
            }

            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl: url, sessionId: localSessionId }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.message || 'Error initializing analysis');
            }

            router.push(`/analyze?id=${responseData.repositoryId}`);
        } catch (err: unknown) {
            console.error('Failed to trigger analysis:', err);
            alert(err instanceof Error ? err.message : 'Error starting analysis');
            setAnalyzingRepo(null);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="flex items-center gap-3 text-text-3 font-mono text-sm">
                    <span className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
                    Loading GitHub profile...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-4 border border-rose/20 bg-rose/5 rounded-xl text-rose font-mono text-sm">
                ! Error: {error}
            </div>
        );
    }

    if (!data || (!data.repos?.length && !data.starred?.length)) {
        return null; // Silent skip if no git data exists or they didn't login with GH
    }

    return (
        <div className="space-y-8 mt-8 pb-8">
            {/* Pinned / Owned Repositories */}
            {data.repos && data.repos.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Github className="w-5 h-5 text-text-2" />
                        <h2 className="text-xl font-mono text-text-0">Your Repositories</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {data.repos.map((repo) => (
                            <RepoCard
                                key={`owned-${repo.id}`}
                                repo={repo}
                                isAnalyzing={analyzingRepo === repo.url}
                                onAnalyze={() => handleAnalyze(repo.url)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Starred Repositories */}
            {data.starred && data.starred.length > 0 && (
                <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber" />
                        <h2 className="text-xl font-mono text-text-0">Starred Repositories</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {data.starred.map((repo) => (
                            <RepoCard
                                key={`starred-${repo.id}`}
                                repo={repo}
                                isAnalyzing={analyzingRepo === repo.url}
                                onAnalyze={() => handleAnalyze(repo.url)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function RepoCard({ repo, isAnalyzing, onAnalyze }: { repo: GitHubRepo, isAnalyzing: boolean, onAnalyze: () => void }) {
    return (
        <div className="flex flex-col p-4 rounded-xl border border-stroke bg-surface-1 hover:bg-surface-2 transition-colors h-full">
            <div className="flex justify-between items-start mb-2">
                <Link href={repo.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-text-0 font-mono hover:text-emerald transition-colors truncate pr-4">
                    {repo.full_name}
                </Link>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-stroke bg-surface-0 text-text-2 my-auto shrink-0">
                    {repo.visibility}
                </span>
            </div>

            <p className="text-sm text-text-2 line-clamp-2 mb-4 flex-grow">
                {repo.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-stroke/50">
                <div className="flex items-center gap-4 text-xs font-mono text-text-3">
                    {repo.language && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald shrink-0" />
                            <span>{repo.language}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        <span>{repo.stargazers_count}</span>
                    </div>
                </div>

                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 bg-emerald/10 hover:bg-emerald/20 text-emerald px-3 py-1.5 rounded-md text-xs font-mono font-medium border border-emerald/20 transition-all disabled:opacity-50"
                >
                    {isAnalyzing ? (
                        <>
                            <span className="w-3 h-3 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
                            Starting...
                        </>
                    ) : (
                        <>
                            <Terminal className="w-3 h-3" />
                            Analyze
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
