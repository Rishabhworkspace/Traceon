import { GitBranch, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GraphNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6" style={{ background: '#080808' }}>
            <div className="w-14 h-14 rounded-2xl bg-surface-1 border border-stroke flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-text-2" />
            </div>
            <div className="text-center max-w-sm">
                <h2 className="text-lg font-bold text-text-0 mb-1">Repository not found</h2>
                <p className="text-sm text-text-2 leading-relaxed">
                    This repository doesn&apos;t exist or hasn&apos;t been analyzed yet. Run an analysis first to view the dependency graph.
                </p>
            </div>
            <div className="flex gap-3">
                <Link
                    href="/analyze"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg bg-emerald text-surface-0 hover:bg-emerald/90 font-semibold transition-colors"
                >
                    Analyze a Repo
                </Link>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg border border-stroke bg-surface-1 hover:bg-surface-2 text-text-1 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard
                </Link>
            </div>
        </div>
    );
}
