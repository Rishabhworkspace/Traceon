export default function GraphLoading() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080808' }}>
            <div className="relative">
                <div className="w-12 h-12 rounded-xl border-2 border-emerald/20 border-t-emerald animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-mono animate-pulse">Loading dependency graph...</p>
            <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald/40 animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald/40 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald/40 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}
