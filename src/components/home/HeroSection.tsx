'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, Upload, Link2, FileArchive, X, Loader2 } from 'lucide-react';

const REPO_TYPING_LINES = [
    '$ traceon analyze https://github.com/vercel/next.js',
    '→ Cloning repository...',
    '→ Scanning 2,847 files',
    '→ Building dependency graph',
    '✓ Analysis complete — 342 modules, 1,208 edges',
];

const PROFILE_TYPING_LINES = [
    '$ traceon profile @octocat',
    '→ Fetching GitHub developer history...',
    '→ Analyzing 54 repositories & languages...',
    '→ Evaluating architectural maturity...',
    '✓ DNA Decode complete — Fullstack Visionary',
];

type AppFeatures = 'repo' | 'profile';
type InputMode = 'url' | 'upload';

export function HeroSection() {
    const [appFeature, setAppFeature] = useState<AppFeatures>('repo');
    const [profileHandle, setProfileHandle] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [mode, setMode] = useState<InputMode>('url');
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const router = useRouter();
    const terminalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset terminal when switching features
    useEffect(() => {
        setTerminalLines([]);
        setCurrentLine(0);
        setCurrentChar(0);
    }, [appFeature]);

    // Terminal typing effect
    useEffect(() => {
        const activeLines = appFeature === 'repo' ? REPO_TYPING_LINES : PROFILE_TYPING_LINES;
        if (currentLine >= activeLines.length) return;

        const line = activeLines[currentLine];
        if (currentChar < line.length) {
            const speed = currentLine === 0 ? 40 : 20;
            const timer = setTimeout(() => {
                setCurrentChar((c) => c + 1);
            }, speed);
            return () => clearTimeout(timer);
        } else {
            const delay = currentLine === 0 ? 800 : 400;
            const timer = setTimeout(() => {
                setTerminalLines((prev) => [...prev, line]);
                setCurrentLine((l) => l + 1);
                setCurrentChar(0);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [currentLine, currentChar, appFeature]);

    // Cursor blink
    useEffect(() => {
        const interval = setInterval(() => setShowCursor((v) => !v), 530);
        return () => clearInterval(interval);
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        const urlToAnalyze = repoUrl.trim();
        if (!urlToAnalyze) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            let localSessionId = localStorage.getItem('traceon_guest_session');
            if (!localSessionId) {
                localSessionId = crypto.randomUUID();
                localStorage.setItem('traceon_guest_session', localSessionId);
            }

            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl: urlToAnalyze, sessionId: localSessionId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error initializing analysis');

            router.push(`/analyze?id=${data.repositoryId}`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to analyze repository';
            setSubmitError(msg);
            setIsSubmitting(false);
        }
    };

    const handleUploadAnalyze = async () => {
        if (!uploadedFile) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            let localSessionId = localStorage.getItem('traceon_guest_session');
            if (!localSessionId) {
                localSessionId = crypto.randomUUID();
                localStorage.setItem('traceon_guest_session', localSessionId);
            }

            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('sessionId', localSessionId);

            const res = await fetch('/api/analyze/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error uploading file');

            router.push(`/analyze?id=${data.repositoryId}`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to upload repository';
            setSubmitError(msg);
            setIsSubmitting(false);
        }
    };

    const handleProfileAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        const handle = profileHandle.trim().replace(/^@/, ''); // Remove @ if they typed it
        if (!handle) return;

        setIsSubmitting(true);
        router.push(`/profile/${handle}`);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            const file = files[0];
            if (file.name.endsWith('.zip')) {
                setUploadedFile(file);
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files?.[0]) {
            setUploadedFile(files[0]);
        }
    };

    const clearFile = () => {
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const activeLines = appFeature === 'repo' ? REPO_TYPING_LINES : PROFILE_TYPING_LINES;
    const currentTypingText =
        currentLine < activeLines.length
            ? activeLines[currentLine].slice(0, currentChar)
            : '';

    return (
        <section className="relative overflow-hidden">
            {/* Subtle Matrix glow */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMjAgMEwwIDBaTTAgMjBMMjAgMjBaIiBzdHJva2U9IiMzZjNmNDYiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] pointer-events-none opacity-50" />

            <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-28 sm:pb-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — Copy */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-stroke bg-surface-1 mb-8 animate-fade-up relative group cursor-default">
                            <span className="w-1.5 h-1.5 bg-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="mono-label !text-[10px] sm:!text-xs tracking-widest">SYSTEM INITIALIZED</span>
                            <ChevronRight className="w-3.5 h-3.5 text-text-3" />
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-display font-bold leading-[1.05] mb-6 animate-fade-up animate-delay-1 tracking-tighter">
                            {appFeature === 'repo' ? (
                                <>
                                    Understand any<br />
                                    codebase in<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-dim to-emerald pb-2 inline-block">seconds.</span>
                                </>
                            ) : (
                                <>
                                    Decode their<br />
                                    Engineering<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-dim to-amber pb-2 inline-block">DNA.</span>
                                </>
                            )}
                        </h1>

                        <p className="text-base sm:text-lg text-text-2 max-w-md leading-relaxed mb-8 animate-fade-up animate-delay-2">
                            {appFeature === 'repo'
                                ? 'Paste a GitHub URL or upload a zip file. Get an interactive dependency graph, architecture map, and impact analysis.'
                                : 'Enter a developer\'s GitHub handle to AI-analyze their commits, architectural maturity, and tech stack in real-time.'}
                        </p>

                        {/* Mode Switcher */}
                        <div className="animate-fade-up animate-delay-4 h-[180px]">
                            {appFeature === 'profile' ? (
                                /* Profile Form */
                                <form onSubmit={handleProfileAnalyze} className="max-w-lg mb-8">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 p-1.5 rounded-sm bg-surface-0 border border-stroke focus-within:border-amber/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                            <span className="pl-3 text-amber font-mono text-sm font-bold select-none">@</span>
                                            <input
                                                type="text"
                                                value={profileHandle}
                                                onChange={(e) => setProfileHandle(e.target.value)}
                                                placeholder="username (e.g. torvalds)"
                                                className="flex-1 bg-transparent text-text-0 placeholder-text-3 text-sm outline-none py-2.5 font-mono"
                                                id="profile-handle-input"
                                                disabled={isSubmitting}
                                                spellCheck={false}
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !profileHandle.trim()}
                                                className="btn-cta !rounded-[2px] !text-sm flex items-center gap-2 min-w-[120px] justify-center !bg-amber hover:!bg-amber-dim !text-black disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono tracking-wider font-bold"
                                            >
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Scan <ArrowRight className="w-3.5 h-3.5" /></>}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-amber/60 font-mono uppercase tracking-widest">
                                        Neural Biometric Scan Active
                                    </p>
                                </form>
                            ) : (
                                /* Existing Repo UI */
                                <>
                                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-1 border border-stroke mb-3 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setMode('url')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${mode === 'url'
                                                ? 'bg-surface-3 text-text-0 shadow-sm'
                                                : 'text-text-2 hover:text-text-1'
                                                }`}
                                        >
                                            <Link2 className="w-3 h-3" />
                                            GitHub URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('upload')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${mode === 'upload'
                                                ? 'bg-surface-3 text-text-0 shadow-sm'
                                                : 'text-text-2 hover:text-text-1'
                                                }`}
                                        >
                                            <Upload className="w-3 h-3" />
                                            Upload ZIP
                                        </button>
                                    </div>

                                    {/* URL Input */}
                                    {mode === 'url' && (
                                        <form onSubmit={handleAnalyze}>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 p-1.5 rounded-sm bg-surface-0 border border-stroke max-w-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus-within:border-emerald/40 transition-all duration-300">
                                                    <span className="pl-3 text-emerald font-mono text-sm select-none opacity-70">
                                                        $
                                                    </span>
                                                    <input
                                                        type="url"
                                                        value={repoUrl}
                                                        onChange={(e) => setRepoUrl(e.target.value)}
                                                        placeholder="github.com/user/repo"
                                                        className="flex-1 bg-transparent text-text-0 placeholder-text-3 text-sm outline-none py-2.5 font-mono"
                                                        id="repo-url-input"
                                                        disabled={isSubmitting}
                                                        spellCheck={false}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting || !repoUrl.trim()}
                                                        className="btn-cta !rounded-[2px] !text-sm flex items-center gap-2 min-w-[100px] justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-3 transition-all font-mono uppercase tracking-widest font-bold !bg-emerald !text-black hover:!bg-emerald-dim"
                                                    >
                                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Exec <ArrowRight className="w-3.5 h-3.5" /></>}
                                                    </button>
                                                </div>
                                                {submitError && <span className="text-xs text-rose font-mono pl-3">{submitError}</span>}
                                            </div>
                                        </form>
                                    )}

                                    {/* ZIP Upload */}
                                    {mode === 'upload' && (
                                        <div className="max-w-lg">
                                            {!uploadedFile ? (
                                                <div
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-dashed cursor-pointer transition-all duration-200 ${dragActive
                                                        ? 'border-emerald bg-emerald/[0.05]'
                                                        : 'border-stroke hover:border-text-3 bg-surface-1'
                                                        }`}
                                                >
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".zip"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                        id="zip-upload-input"
                                                    />
                                                    <div className="w-10 h-10 rounded-lg bg-surface-3 border border-stroke flex items-center justify-center">
                                                        <FileArchive
                                                            className={`w-5 h-5 ${dragActive ? 'text-emerald' : 'text-text-2'
                                                                }`}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-text-1 mb-0.5">
                                                            {dragActive
                                                                ? 'Drop your zip here'
                                                                : 'Drag & drop a .zip file'}
                                                        </p>
                                                        <p className="text-xs text-text-3 font-mono">
                                                            or click to browse · max 100MB
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col w-full gap-2">
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-stroke">
                                                        <div className="w-9 h-9 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center shrink-0">
                                                            <FileArchive className="w-4 h-4 text-emerald" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-text-0 font-mono truncate">
                                                                {uploadedFile.name}
                                                            </p>
                                                            <p className="text-xs text-text-3 font-mono">
                                                                {formatFileSize(uploadedFile.size)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={clearFile}
                                                            className="p-1.5 rounded-md text-text-3 hover:text-text-0 hover:bg-surface-3 transition-colors"
                                                            aria-label="Remove file"
                                                            disabled={isSubmitting}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleUploadAnalyze}
                                                            disabled={isSubmitting}
                                                            className="btn-cta !rounded-lg !text-sm flex items-center gap-2 min-w-[100px] justify-center"
                                                        >
                                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Analyze <ArrowRight className="w-3.5 h-3.5" /></>}
                                                        </button>
                                                    </div>
                                                    {submitError && <span className="text-xs text-rose font-mono pl-3">{submitError}</span>}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {appFeature === 'repo' && (
                                        <p className="mt-4 text-xs text-text-3 font-mono animate-fade-up animate-delay-5">
                                            JS / TS repos · Free tier · No account needed
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right — Terminal mockup */}
                    <div className="animate-fade-up animate-delay-4 relative">
                        {/* Ambient glow behind terminal */}
                        <div className="absolute inset-0 bg-emerald/10 blur-[80px] rounded-full scale-75 opacity-70 pointer-events-none" />

                        <div className="relative rounded-2xl overflow-hidden border border-stroke/60 bg-surface-0/60 backdrop-blur-2xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]">
                            {/* Inner highlight border */}
                            <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />

                            {/* Terminal title bar */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke/60 bg-surface-1/40">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                                    <div className="w-3 h-3 rounded-full bg-amber/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                                    <div className="w-3 h-3 rounded-full bg-emerald/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
                                </div>
                                <span className="text-[12px] text-text-3 font-mono ml-3 font-medium tracking-wide">
                                    traceon — terminal
                                </span>
                            </div>

                            {/* Terminal body */}
                            <div
                                ref={terminalRef}
                                className="p-5 font-mono text-[13px] leading-relaxed h-[240px] overflow-hidden relative z-10"
                            >
                                {terminalLines.map((line, i) => (
                                    <div
                                        key={i}
                                        className={`${line.startsWith('$')
                                            ? 'text-text-1 font-bold'
                                            : line.startsWith('✓')
                                                ? appFeature === 'repo' ? 'text-emerald text-shadow-glow-emerald' : 'text-amber text-shadow-glow-amber'
                                                : 'text-text-2'
                                            }`}
                                    >
                                        {line}
                                    </div>
                                ))}
                                {currentLine < activeLines.length && (
                                    <div
                                        className={`${activeLines[currentLine].startsWith('$')
                                            ? 'text-text-1 font-bold'
                                            : activeLines[currentLine].startsWith('✓')
                                                ? appFeature === 'repo' ? 'text-emerald text-shadow-glow-emerald' : 'text-amber text-shadow-glow-amber'
                                                : 'text-text-2'
                                            }`}
                                    >
                                        {currentTypingText}
                                        <span
                                            className={`inline-block w-[8px] h-[15px] ${appFeature === 'repo' ? 'bg-emerald' : 'bg-amber'} ml-[2px] align-middle ${showCursor ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="divider" />
        </section>
    );
}
