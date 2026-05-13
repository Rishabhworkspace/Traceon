import { Loader2 } from "lucide-react";

export default function ProfileLoading() {
    return (
        <main className="min-h-screen noise dot-matrix bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-fade-up">
                <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-surface-1 border border-stroke/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald animate-spin" />
                    </div>
                    <div className="absolute -inset-2 bg-emerald/5 rounded-xl blur-xl animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-48 bg-surface-2 rounded-sm animate-pulse" />
                    <div className="h-3 w-36 bg-surface-2/50 rounded-sm animate-pulse" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-text-4 font-mono mt-2">
                    Analyzing profile DNA...
                </span>
                {/* Skeleton cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-4xl px-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-surface-1 border border-stroke/50 rounded-sm animate-pulse" />
                    ))}
                </div>
            </div>
        </main>
    );
}
