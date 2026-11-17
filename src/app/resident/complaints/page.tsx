"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Plus, Send } from "lucide-react";

export default function ResidentComplaintsPage() {
  const [complaints, setComplaints] = useState([
    {
      id: "70000000-0000-0000-0000-000000000001",
      title: "Wi-Fi speed fluctuation in Room 101",
      category: "Wi-Fi",
      description: "Internet signal drops during peak evening hours between 8 PM and 10 PM. Speed test shows under 5 Mbps.",
      status: "in_progress" as const,
      created_at: "16 Nov 2026",
    },
    {
      id: "70000000-0000-0000-0000-000000000009",
      title: "Geyser switch replacement",
      category: "Electricity",
      description: "Geyser power switch in bathroom 101 sparking intermittently. Replaced with new 16A switch.",
      status: "resolved" as const,
      created_at: "04 Nov 2026",
    },
  ]);

  const [category, setCategory] = useState("Wi-Fi");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newComplaint = {
      id: "comp_" + Date.now(),
      title,
      category,
      description,
      status: "open" as const,
      created_at: "Just now",
    };

    setComplaints([newComplaint, ...complaints]);
    setTitle("");
    setDescription("");
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-emerald-600" />
          Support & Maintenance Tickets
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Report issues directly to your PG warden.
        </p>
      </div>

      {isSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Ticket submitted successfully! Warden will review it shortly.
        </div>
      )}

      {/* Raise New Complaint Form */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
          File New Maintenance Request
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Wi-Fi", "Plumbing", "Electricity", "Cleaning", "Food", "Other"].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    category === cat
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600"
                      : "border-zinc-200 text-zinc-600 dark:text-zinc-400 dark:border-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              Issue Summary
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bathroom tap leaking water continuously"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              Details
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details (room number 101, specific timings, device, etc.)..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Send className="h-3.5 w-3.5" />
            Submit Ticket to Warden
          </button>
        </form>
      </div>

      {/* Ticket List */}
      <div className="space-y-3.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 px-1">
          My Past Tickets ({complaints.length})
        </h3>

        {complaints.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {c.category}
              </span>
              <span className="text-[11px] text-zinc-400">{c.created_at}</span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                {c.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {c.description}
              </p>
            </div>

            {/* Visual Stepper */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className="text-emerald-600">1. Lodged</span>
                <span
                  className={
                    c.status !== "open" ? "text-emerald-600" : "text-zinc-400"
                  }
                >
                  2. Assigned
                </span>
                <span
                  className={
                    c.status === "resolved" ? "text-emerald-600" : "text-zinc-400"
                  }
                >
                  3. Resolved
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width:
                      c.status === "resolved"
                        ? "100%"
                        : c.status === "in_progress"
                        ? "65%"
                        : "30%",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
