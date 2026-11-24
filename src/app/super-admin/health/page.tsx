import { Activity, ShieldCheck, Database, CheckCircle2, Server, Cpu } from "lucide-react";
import { MOCK_CLUSTER_STATS, MOCK_PG_TABLES } from "@/lib/mock-data";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SuperAdminHealthPage() {
 return (
 <div className="space-y-6">
 <div className="pb-5 border-b border-slate-200">
 <div className="flex items-center gap-2 mb-1">
 <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
 <Activity className="h-5 w-5" />
 </span>
 <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
 Platform Health & Database Uptime
 </h1>
 </div>
 <p className="text-xs text-slate-600 mt-1">
 Real-time PostgreSQL engine status, RLS policy enforcement, and infrastructure metrics.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
 DB Connection Pool
 </span>
 <Server className="h-4 w-4 text-purple-600" />
 </div>
 <p className="text-3xl font-extrabold text-slate-900">
 {MOCK_CLUSTER_STATS.activeConnections} / {MOCK_CLUSTER_STATS.maxConnections}
 </p>
 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
 <div className="bg-purple-600 h-full rounded-full" style={{ width: "13%" }} />
 </div>
 <p className="text-[11px] font-medium text-slate-500">Connection headroom: 87% available</p>
 </div>

 <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
 Cache Hit Ratio
 </span>
 <Activity className="h-4 w-4 text-emerald-600" />
 </div>
 <p className="text-3xl font-extrabold text-emerald-600">
 {MOCK_CLUSTER_STATS.cacheHitRatio}%
 </p>
 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
 <div className="bg-emerald-500 h-full rounded-full" style={{ width: "99.4%" }} />
 </div>
 <p className="text-[11px] font-medium text-slate-500">High in-memory buffer cache efficiency</p>
 </div>

 <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
 RLS Policy Status
 </span>
 <ShieldCheck className="h-4 w-4 text-purple-600" />
 </div>
 <p className="text-3xl font-extrabold text-purple-700">
 100% Enforced
 </p>
 <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
 <CheckCircle2 className="h-4 w-4" />
 <span>All 11 tables guarded by tenant membership</span>
 </div>
 </div>
 </div>

 {/* Database Node Info */}
 <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
 <h3 className="font-bold text-base text-slate-900">
 Engine Details
 </h3>
 <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono space-y-2">
 <div className="flex justify-between">
 <span className="text-slate-500">PostgreSQL Engine:</span>
 <span className="text-slate-900 font-bold">{MOCK_CLUSTER_STATS.postgresVersion}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500">Database Size:</span>
 <span className="text-slate-900 font-bold">{MOCK_CLUSTER_STATS.databaseSize}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500">Cluster Uptime:</span>
 <span className="text-emerald-600 font-bold">{MOCK_CLUSTER_STATS.uptime}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500">Region:</span>
 <span className="text-slate-800">ap-south-1 (Mumbai, AWS)</span>
 </div>
 </div>
 </div>
 </div>
 );
}
