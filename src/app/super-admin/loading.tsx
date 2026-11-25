export const runtime = "edge";

export default function SuperAdminLoading() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none pb-24">
      {/* Top Header Shimmer */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="h-6 w-44 bg-slate-200/90 rounded-lg animate-pulse" />
          <div className="h-3 w-64 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-indigo-200/60 rounded-xl animate-pulse" />
      </div>

      {/* Stats Shimmer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2"
          >
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table Shimmer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
