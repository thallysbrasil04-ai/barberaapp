export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-neutral-200 rounded w-40" />
          <div className="h-4 bg-neutral-200 rounded w-60" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-neutral-200 rounded w-28" />
          <div className="h-9 bg-neutral-200 rounded w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 bg-neutral-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-neutral-200 rounded-xl" />
        <div className="h-64 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  );
}
