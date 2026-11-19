export const runtime = "edge";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-900">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-black text-xl mb-4 shadow-sm">
        404
      </div>
      <h1 className="text-xl font-black mb-1">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-xs mb-6">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
      >
        <Home className="w-4 h-4" />
        Return to Portal
      </Link>
    </div>
  );
}
