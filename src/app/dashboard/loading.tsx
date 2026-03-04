export default function DashboardLoading() {
    return (
        <div className="min-h-screen pt-28 pb-12 px-5 max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="h-8 w-40 rounded-lg animate-shimmer" />
                    <div className="h-4 w-56 rounded mt-2 animate-shimmer" />
                </div>
                <div className="h-9 w-24 rounded-lg animate-shimmer" />
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Stats grid skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl animate-shimmer" />
                        ))}
                    </div>

                    {/* Charts skeleton */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-56 rounded-xl animate-shimmer" />
                        ))}
                    </div>

                    {/* Repos skeleton */}
                    <div className="h-64 rounded-xl animate-shimmer" />
                </div>

                {/* Sidebar skeleton */}
                <div className="space-y-5">
                    <div className="h-64 rounded-xl animate-shimmer" />
                    <div className="h-48 rounded-xl animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
