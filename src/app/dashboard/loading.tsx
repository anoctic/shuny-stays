export const runtime = "edge";

export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none pb-24">
      {/* Top Header Shimmer */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="h-5 w-36 bg-slate-200/80 rounded-lg animate-pulse" />
          <div className="h-3 w-56 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-slate-200/70 rounded-xl animate-pulse" />
      </div>

      {/* Metric Cards Shimmer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="w-7 h-7 rounded-xl bg-slate-100 animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-slate-200/90 rounded-lg animate-pulse" />
            <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Card Shimmer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="h-4 w-32 bg-slate-200/80 rounded animate-pulse" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2.5 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse flex items-center px-3 justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200/80 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-200/70 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
