'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { Loader2, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

type AnalyzingState = 'initializing' | 'cloning' | 'scanning' | 'parsing' | 'analyzing' | 'complete' | 'failed';

const STATUS_MESSAGES: Record<AnalyzingState, string> = {
    initializing: 'Preparing environment...',
    cloning: 'Cloning repository securely...',
    scanning: 'Walking directory tree...',
    parsing: 'Building abstract syntax trees...',
    analyzing: 'Extracting dependency graph...',
    complete: 'Analysis complete!',
    failed: 'Analysis failed.',
};

function AnalyzeContent() {
    const searchParams = useSearchParams();
    const repoId = searchParams.get('id');
    const router = useRouter();

    const [status, setStatus] = useState<AnalyzingState>('initializing');
    const [error, setError] = useState<string | null>(null);

    // Track lines purely for the terminal effect UI
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const hasStartedRef = useRef(false);

    const pollStatus = useCallback(async (id: string, sessionId: string) => {
        try {
            const res = await fetch(`/api/repository/${id}?sessionId=${sessionId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error occurred while checking status');
            }

            const { repository } = data;
            const currentStatus = repository.status as AnalyzingState;

            setStatus(currentStatus);

            if (currentStatus === 'complete') {
                setTerminalLines(prev => [...prev, `✓ AST generation done. Detected ${repository.fileCount} source files.`]);
                setTerminalLines(prev => [...prev, '→ Redirecting to Visualizer...']);
                // Phase 6 Redirect
                setTimeout(() => {
                    router.push(`/graph/${id}`);
                }, 1500);
            } else if (currentStatus === 'failed') {
                setError(repository.errorMessage || 'Task aborted');
                setTerminalLines(prev => [...prev, `! Task aborted: ${repository.errorMessage}`]);
            } else {
                // Keep polling
                setTimeout(() => pollStatus(id, sessionId), 800);
            }

        } catch (err: unknown) {
            setStatus('failed');
            const msg = err instanceof Error ? err.message : 'Connection error';
            setError(msg);
            setTerminalLines(prev => [...prev, `! Connection error: ${msg}`]);
        }
    }, [router]);

    useEffect(() => {
        if (!repoId) {
            setError('No repository ID provided.');
            return;
        }

        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        let localSessionId = localStorage.getItem('traceon_guest_session');
        if (!localSessionId) {
            localSessionId = crypto.randomUUID();
            localStorage.setItem('traceon_guest_session', localSessionId);
        }

        setTerminalLines([
            `$ Tracking analysis session: ${repoId}`,
            `→ Engine engaged. Awaiting status...`
        ]);

        // Start polling loop directly since initialization happened on the previous page
        pollStatus(repoId, localSessionId);

    }, [repoId, pollStatus]);

    if (!repoId) {
        return (
            <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-rose mb-4" />
                <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
                <p className="text-text-2">{error}</p>
                <button onClick={() => router.push('/')} className="mt-6 btn-ghost">
                    Go Back Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-16 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-surface-1),transparent_50%-[)] opacity-50" />

            <div className="w-full max-w-3xl px-5 relative z-10">

                <div className="flex flex-col items-center text-center mb-12">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-surface-1 border border-stroke mb-4">
                        {status === 'complete' ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald" />
                        ) : status === 'failed' ? (
                            <AlertCircle className="w-6 h-6 text-rose" />
                        ) : (
                            <Loader2 className="w-6 h-6 text-emerald animate-spin" />
                        )}
                    </div>

                    <h1 className="text-4xl font-display font-bold tracking-tight mb-3 text-text-0">
                        {STATUS_MESSAGES[status]}
                    </h1>
                    <p className="text-sm font-mono text-text-2 bg-surface-1 px-3 py-1.5 rounded-md border border-stroke inline-flex items-center">
                        <span className="text-emerald mr-2">Target ID:</span>
                        {repoId}
                    </p>
                </div>

                {/* Console / Terminal Viewer */}
                <div className="card w-full border-stroke overflow-hidden transition-all duration-300 shadow-xl shadow-black/20">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-stroke bg-surface-1">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-rose/80" />
                            <div className="w-3 h-3 rounded-full bg-amber/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald/80" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-text-3 font-medium tracking-wide">
                            <Terminal className="w-3.5 h-3.5" />
                            <span className="uppercase">Ingestion Engine</span>
                        </div>
                    </div>

                    <div className="p-5 font-mono text-sm leading-relaxed h-[360px] overflow-y-auto bg-[#0a0a0a]">
                        {terminalLines.map((line, i) => (
                            <div
                                key={i}
                                className={`mb-1.5 animate-fade-in ${line.startsWith('$') ? 'text-text-0' :
                                    line.startsWith('!') ? 'text-rose' :
                                        line.startsWith('✓') ? 'text-emerald' : 'text-text-3'
                                    }`}
                            >
                                {line}
                            </div>
                        ))}

                        {status !== 'failed' && status !== 'complete' && (
                            <div className="mt-4 flex items-center text-emerald">
                                <span className="mr-2">_</span>
                                <span className="w-2 h-4 bg-emerald animate-pulse" />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-emerald animate-spin mb-4" />
                <h2 className="text-xl font-mono text-text-2">Initializing Traceon Engine...</h2>
            </div>
        }>
            <AnalyzeContent />
        </Suspense>
    );
}
