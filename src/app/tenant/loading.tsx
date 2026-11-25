export const runtime = "edge";

export default function TenantLoading() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none pb-24">
      {/* Resident Hero Profile Card Shimmer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/60 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-32 bg-slate-200/90 rounded-md animate-pulse" />
            <div className="h-3 w-48 bg-slate-100 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="h-10 bg-white border border-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-white border border-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Action Cards Shimmer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100/70 animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/70 animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* List Card Shimmer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-3">
        <div className="h-4 w-32 bg-slate-200/80 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse flex items-center px-3 justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2 w-14 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-12 bg-slate-200/80 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
