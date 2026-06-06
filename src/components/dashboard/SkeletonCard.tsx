export default function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-stroke bg-surface-1 p-4 animate-pulse ${className}`}
    >
      <div className="h-4 w-24 rounded bg-white/10 mb-3" />
      <div className="h-6 w-16 rounded bg-white/10 mb-2" />
      <div className="h-3 w-32 rounded bg-white/10" />
    </div>
  );
}