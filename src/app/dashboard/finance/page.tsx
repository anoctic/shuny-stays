import { Wallet, IndianRupee, ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Financial Pulse</h1>
        <p className="text-xs text-slate-400">P&L, Monthly Collections, and Building Expenses</p>
      </div>

      <div className="p-4 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Operational Profit</span>
        <div className="text-2xl font-black mt-1 text-emerald-400">₹2,42,500</div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400">Rent Collected</span>
            <p className="text-sm font-bold text-white">₹2,85,000</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Expenses</span>
            <p className="text-sm font-bold text-rose-400">₹42,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}
