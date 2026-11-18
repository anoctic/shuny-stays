"use client";

import { useState } from "react";
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  X,
  Sparkles,
  Send,
} from "lucide-react";
import { submitTenantComplaintAction } from "@/app/actions/rooms-and-ops";

interface TicketItem {
  id: string;
  cat: string;
  desc: string;
  status: "Open" | "In Progress" | "Resolved";
  note?: string;
  time: string;
}

const initialTickets: TicketItem[] = [
  {
    id: "T-209",
    cat: "Wi-Fi",
    desc: "Router speed drops after 10:30 PM in Room 101",
    status: "In Progress",
    note: "Technician assigned for 5:00 PM by Warden Ramesh",
    time: "2 hrs ago",
  },
  {
    id: "T-184",
    cat: "Plumbing",
    desc: "Washroom tap leaking continuously in Room 101",
    status: "Resolved",
    note: "Fixed & verified by PG maintenance staff.",
    time: "Yesterday",
  },
];

export default function TenantComplaintsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cat, setCat] = useState("Wi-Fi");
  const [desc, setDesc] = useState("AC cooling filter needs cleaning");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("cat", cat);
      fd.append("desc", desc);
      const res = await submitTenantComplaintAction(fd);

      const newTicket: TicketItem = {
        id: res?.complaint?.id || `T-${Math.floor(220 + Math.random() * 700)}`,
        cat,
        desc,
        status: "Open",
        time: "Just now",
      };

      setTickets([newTicket, ...tickets]);
      setIsModalOpen(false);
      setDesc("");
      showToast("Ticket raised! Synced to Warden & Owner.");
    } catch {
      const newTicket: TicketItem = {
        id: `T-${Math.floor(220 + Math.random() * 700)}`,
        cat,
        desc,
        status: "Open",
        time: "Just now",
      };
      setTickets([newTicket, ...tickets]);
      setIsModalOpen(false);
      showToast("Ticket created!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Top Banner & Raise Ticket Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Raise Maintenance Ticket</h3>
          <p className="text-[10px] text-slate-400">Wi-Fi, Electrical, Plumbing, Cleaning, Food</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold shrink-0 shadow-xs transition"
        >
          + New Ticket
        </button>
      </div>

      {/* My Tickets List */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white px-0.5">
          My Tickets ({tickets.length})
        </h3>

        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
            No complaints raised yet!
          </div>
        ) : (
          tickets.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 space-y-1 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {c.cat} • {c.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    c.status === "Resolved"
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-amber-500/20 text-amber-600"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.desc}</p>
              {c.note && (
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                  ✓ {c.note}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Raise Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Raise Maintenance Ticket
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option>Wi-Fi</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                  <option>Cleaning</option>
                  <option>Food</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Issue Description
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe what needs repair or attention..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Submitting..." : "Submit Ticket"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Brand Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold border border-slate-200/50 dark:border-slate-700/50">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Powered by</span>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
            ShunyOS
          </span>
        </div>
      </footer>
    </div>
  );
}
