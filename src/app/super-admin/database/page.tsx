import { SqlConsole } from "@/components/postgres/SqlConsole";
import { Database, ShieldCheck, Layers, Terminal } from "lucide-react";
import { MOCK_PG_TABLES } from "@/lib/mock-data";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SuperAdminDatabasePage() {
 return (
 <div className="space-y-6">
 <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
 <Database className="h-5 w-5" />
 </span>
 <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
 PostgreSQL Studio & SQL Console
 </h1>
 </div>
 <p className="text-xs text-slate-600 mt-1">
 Execute SQL queries directly against Supabase PostgreSQL and inspect Row Level Security.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
 <ShieldCheck className="h-3.5 w-3.5" />
 Super Admin Only
 </span>
 </div>
 </div>

 {/* SQL Runner */}
 <SqlConsole />

 {/* Database Schema & Tables */}
 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
 <Layers className="h-4 w-4 text-purple-600" />
 Public Tables & RLS Status
 </h3>
 <span className="text-xs font-medium text-slate-500">11 Tables Registered</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {MOCK_PG_TABLES.map((table) => (
 <div
 key={table.table_name}
 className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between hover:border-slate-300 transition"
 >
 <div>
 <p className="font-mono text-xs font-bold text-slate-900">
 public.{table.table_name}
 </p>
 <p className="text-[10px] text-slate-500 mt-0.5">
 ~{table.row_count_estimate} rows • {table.total_size_pretty}
 </p>
 </div>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
 RLS
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
