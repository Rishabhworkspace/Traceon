'use client';

import { useState, useEffect } from 'react';
import { Github, Star, Terminal, Link as LinkIcon, AlertCircle, ChevronDown } from 'lucide-react';
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
    const [githubUsername, setGithubUsername] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    // Pagination state
    const [visibleRepos, setVisibleRepos] = useState(6);
    const [visibleStarred, setVisibleStarred] = useState(6);

    const router = useRouter();

    const fetchGitHubData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/github');
            const json = await res.json();

            // Handle unauthorized (actual auth failure)
            if (res.status === 401) {
                setData({ message: 'Unauthorized', repos: [], starred: [] });
                return;
            }

            // The API returns a message 'No GitHub connection available' if the user isn't logged in with GitHub
            if (json.message && (json.message === 'No GitHub connection available' || json.message === 'Unauthorized')) {
                setData({ message: json.message, repos: [], starred: [] });
            } else {
                setData({
                    repos: json.repos || [],
                    starred: json.starred || [],
                    message: json.message,
                });
            }
        } catch (err: unknown) {
            console.error('Error fetching GitHub profile:', err);
            const msg = err instanceof Error ? err.message : 'Failed to fetch GitHub profile';
            setError(msg);
            setData({ repos: [], starred: [] });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
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

    const handleLinkGitHub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!githubUsername.trim()) return;

        setIsLinking(true);
        setError(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUsername: githubUsername.trim() }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || 'Failed to link GitHub account');
            }

            // Immediately refetch data which will now use the unauthenticated fallback
            await fetchGitHubData();
        } catch (err: unknown) {
            console.error('Error linking GitHub:', err);
            setError(err instanceof Error ? err.message : 'Failed to link GitHub account');
        } finally {
            setIsLinking(false);
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

    // Empty state: show connect UI
    if (data?.message === 'No GitHub connection available' || (!data?.repos?.length && !data?.starred?.length)) {
        return (
            <div className="card p-6 border-stroke mt-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-1 border border-stroke flex items-center justify-center shrink-0">
                        <Github className="w-6 h-6 text-text-2" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-lg font-mono text-text-0 mb-1">Connect GitHub Profile</h2>
                            <p className="text-sm text-text-2 leading-relaxed">
                                Link your GitHub username to quickly analyze your public repositories and stars directly from your dashboard.
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose text-sm font-mono bg-rose/5 p-3 rounded-lg border border-rose/10">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLinkGitHub} className="flex gap-3 max-w-md">
                            <input
                                type="text"
                                value={githubUsername}
                                onChange={(e) => setGithubUsername(e.target.value)}
                                placeholder="Enter GitHub username..."
                                required
                                disabled={isLinking}
                                className="flex-1 bg-surface-0 border border-stroke rounded-lg px-4 py-2 text-sm font-mono text-text-0 placeholder:text-text-3 outline-none focus:border-emerald transition-colors disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isLinking || !githubUsername.trim()}
                                className="btn-cta !px-6 !py-2 !text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLinking ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-surface-0 border-t-transparent rounded-full animate-spin" />
                                        Linking...
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="w-4 h-4" />
                                        Connect
                                    </>
                                )}
                            </button>
                        </form>
                        <p className="text-xs text-text-3 font-mono">
                            This allows Traceon to fetch your public data. Log in with GitHub to access private repositories.
                        </p>
                    </div>
                </div>
            </div>
        );
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
                        {data.repos.slice(0, visibleRepos).map((repo) => (
                            <RepoCard
                                key={`owned-${repo.id}`}
                                repo={repo}
                                isAnalyzing={analyzingRepo === repo.url}
                                onAnalyze={() => handleAnalyze(repo.url)}
                            />
                        ))}
                    </div>
                    {data.repos.length > visibleRepos && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setVisibleRepos(prev => prev + 6)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke bg-surface-1 hover:bg-surface-2 transition-colors text-sm font-mono text-text-1"
                            >
                                Show More
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}
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
                        {data.starred.slice(0, visibleStarred).map((repo) => (
                            <RepoCard
                                key={`starred-${repo.id}`}
                                repo={repo}
                                isAnalyzing={analyzingRepo === repo.url}
                                onAnalyze={() => handleAnalyze(repo.url)}
                            />
                        ))}
                    </div>
                    {data.starred.length > visibleStarred && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setVisibleStarred(prev => prev + 6)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke bg-surface-1 hover:bg-surface-2 transition-colors text-sm font-mono text-text-1"
                            >
                                Show More
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function RepoCard({ repo, isAnalyzing, onAnalyze }: { repo: GitHubRepo, isAnalyzing: boolean, onAnalyze: () => void }) {
    return (
        <div className="flex flex-col p-4 rounded-xl border border-stroke bg-surface-1 hover:bg-surface-2 transition-colors h-full overflow-hidden">
            <div className="flex justify-between items-start gap-2 mb-2">
                <Link href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-text-0 font-mono hover:text-emerald transition-colors truncate min-w-0">
                    {repo.name}
                </Link>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-stroke bg-surface-0 text-text-2 shrink-0">
                    {repo.visibility}
                </span>
            </div>

            <p className="text-xs text-text-2 line-clamp-2 mb-4 flex-grow">
                {repo.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-stroke/50">
                <div className="flex items-center gap-3 text-[10px] font-mono text-text-3 min-w-0 overflow-hidden">
                    {repo.language && (
                        <div className="flex items-center gap-1 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-emerald shrink-0" />
                            <span className="truncate">{repo.language}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3" />
                        <span>{repo.stargazers_count}</span>
                    </div>
                </div>

                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 bg-emerald/10 hover:bg-emerald/20 text-emerald px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border border-emerald/20 transition-all disabled:opacity-50 shrink-0"
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
