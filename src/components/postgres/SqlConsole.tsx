"use client";

import { useState } from "react";
import { Play, Sparkles, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface QueryPreset {
 name: string;
 sql: string;
 description: string;
}

const PRESETS: QueryPreset[] = [
 {
 name: "Tenant Properties & Occupancy",
 description: "Multi-tenant join between properties, rooms, and occupied beds",
 sql: `SELECT 
 p.name AS property_name,
 p.gender_type,
 p.city,
 count(DISTINCT rm.id) AS total_rooms,
 count(b.id) AS total_beds,
 count(b.id) FILTER (WHERE b.status = 'occupied') AS occupied_beds,
 count(b.id) FILTER (WHERE b.status = 'vacant') AS vacant_beds
FROM public.properties p
LEFT JOIN public.rooms rm ON rm.property_id = p.id
LEFT JOIN public.beds b ON b.room_id = rm.id
GROUP BY p.id, p.name, p.gender_type, p.city;`,
 },
 {
 name: "Pending Rent Collection (November 2026)",
 description: "Audit unpaid invoices grouped by room and resident",
 sql: `SELECT 
 i.invoice_number,
 r.full_name AS resident_name,
 r.phone,
 i.total_amount_paise / 100.0 AS amount_inr,
 i.due_date,
 i.status
FROM public.invoices i
JOIN public.residents r ON r.id = i.resident_id
WHERE i.status IN ('pending', 'overdue')
ORDER BY i.due_date ASC;`,
 },
 {
 name: "PostgreSQL Database Catalog & RLS Inspection",
 description: "Query pg_class and pg_namespace for schema metadata and RLS state",
 sql: `SELECT 
 c.relname AS table_name,
 c.reltuples::bigint AS estimated_rows,
 pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
 c.relrowsecurity AS rls_enabled,
 c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;`,
 },
];

export function SqlConsole() {
 const [activeSql, setActiveSql] = useState(PRESETS[0].sql);
 const [isRunning, setIsRunning] = useState(false);
 const [result, setResult] = useState<{
 columns: string[];
 rows: Record<string, unknown>[];
 rowCount: number;
 durationMs: number;
 } | null>({
 columns: ["property_name", "gender_type", "city", "total_rooms", "total_beds", "occupied_beds", "vacant_beds"],
 rows: [
 { property_name: "Zenith Heights (Men)", gender_type: "male", city: "Bengaluru", total_rooms: 12, total_beds: 32, occupied_beds: 28, vacant_beds: 4 },
 { property_name: "Zenith Flora (Women)", gender_type: "female", city: "Bengaluru", total_rooms: 8, total_beds: 20, occupied_beds: 19, vacant_beds: 1 },
 ],
 rowCount: 2,
 durationMs: 4.8,
 });

 const handleRunQuery = () => {
 setIsRunning(true);
 // Simulate real-time PostgreSQL query execution
 setTimeout(() => {
 setIsRunning(false);
 if (activeSql.includes("invoices") || activeSql.includes("Pending")) {
 setResult({
 columns: ["invoice_number", "resident_name", "phone", "amount_inr", "due_date", "status"],
 rows: [
 { invoice_number: "INV-2026-11-002", resident_name: "Rohan Verma", phone: "+91 97766 55443", amount_inr: 7820, due_date: "2026-11-05", status: "pending" },
 { invoice_number: "INV-2026-11-003", resident_name: "Karan Singhania", phone: "+91 96655 22110", amount_inr: 7790, due_date: "2026-11-05", status: "overdue" },
 ],
 rowCount: 2,
 durationMs: 3.2,
 });
 } else if (activeSql.includes("pg_class") || activeSql.includes("RLS")) {
 setResult({
 columns: ["table_name", "estimated_rows", "total_size", "rls_enabled", "rls_forced"],
 rows: [
 { table_name: "beds", estimated_rows: 6, total_size: "48 kB", rls_enabled: true, rls_forced: true },
 { table_name: "complaints", estimated_rows: 2, total_size: "56 kB", rls_enabled: true, rls_forced: true },
 { table_name: "invoices", estimated_rows: 3, total_size: "80 kB", rls_enabled: true, rls_forced: true },
 { table_name: "properties", estimated_rows: 2, total_size: "56 kB", rls_enabled: true, rls_forced: true },
 { table_name: "residents", estimated_rows: 3, total_size: "72 kB", rls_enabled: true, rls_forced: true },
 { table_name: "rooms", estimated_rows: 3, total_size: "64 kB", rls_enabled: true, rls_forced: true },
 ],
 rowCount: 6,
 durationMs: 2.7,
 });
 } else {
 setResult({
 columns: ["property_name", "gender_type", "city", "total_rooms", "total_beds", "occupied_beds", "vacant_beds"],
 rows: [
 { property_name: "Zenith Heights (Men)", gender_type: "male", city: "Bengaluru", total_rooms: 12, total_beds: 32, occupied_beds: 28, vacant_beds: 4 },
 { property_name: "Zenith Flora (Women)", gender_type: "female", city: "Bengaluru", total_rooms: 8, total_beds: 20, occupied_beds: 19, vacant_beds: 1 },
 ],
 rowCount: 2,
 durationMs: 4.1,
 });
 }
 }, 400);
 };

 return (
 <div className="space-y-4">
 {/* Query Presets */}
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
 <Sparkles className="h-3.5 w-3.5 text-amber-500" />
 Preset Queries:
 </span>
 {PRESETS.map((preset) => (
 <button
 key={preset.name}
 onClick={() => setActiveSql(preset.sql)}
 className="px-2.5 py-1 text-xs rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold shadow-2xs transition-colors cursor-pointer"
 >
 {preset.name}
 </button>
 ))}
 </div>

 {/* SQL Editor Area */}
 <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-sm">
 {/* Editor Toolbar */}
 <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
 <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
 <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
 <span className="text-xs text-slate-400 font-mono ml-2">
 postgres://postgres@supabase-pooler:6543/postgres (Tenant Isolated)
 </span>
 </div>

 <button
 onClick={handleRunQuery}
 disabled={isRunning}
 className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
 >
 <Play className="h-3.5 w-3.5 fill-current" />
 {isRunning ? "Executing..." : "Run Query (Ctrl + Enter)"}
 </button>
 </div>

 {/* Text Area */}
 <textarea
 value={activeSql}
 onChange={(e) => setActiveSql(e.target.value)}
 rows={7}
 className="w-full bg-slate-950 text-emerald-300 p-4 font-mono text-xs focus:outline-none resize-none selection:bg-indigo-900"
 placeholder="SELECT * FROM public.properties WHERE organization_id = '...';"
 />

 {/* Safety Note */}
 <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
 <span className="flex items-center gap-1.5">
 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
 RLS Enforcement Active: Queries automatically scoped to active organization_id
 </span>
 <span className="text-slate-500">Statement Timeout: 5000ms</span>
 </div>
 </div>

 {/* Query Results */}
 {result && (
 <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
 {/* Result Header */}
 <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
 <div className="flex items-center gap-3">
 <span className="font-extrabold text-slate-900">
 Query Results
 </span>
 <span className="px-2 py-0.5 rounded-md bg-slate-200/80 font-mono text-[11px] font-bold text-slate-700">
 {result.rowCount} {result.rowCount === 1 ? "row" : "rows"}
 </span>
 </div>
 <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
 <Clock className="h-3 w-3" />
 <span>{result.durationMs} ms</span>
 </div>
 </div>

 {/* Results Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs font-mono">
 <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
 <tr>
 {result.columns.map((col) => (
 <th key={col} className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-slate-500">
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {result.rows.map((row, i) => (
 <tr key={i} className="hover:bg-slate-50/80 transition-colors">
 {result.columns.map((col) => (
 <td key={col} className="px-4 py-2 text-slate-800">
 {typeof row[col] === "boolean" ? (
 <span
 className={
 row[col]
 ? "text-emerald-700 font-bold"
 : "text-slate-400"
 }
 >
 {String(row[col])}
 </span>
 ) : (
 String(row[col] ?? "NULL")
 )}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
}
