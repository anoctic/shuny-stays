"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Users,
  Check,
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  Send,
  Eye,
  Trash2,
} from "lucide-react";
import { PlatformBroadcast, UserRole, BroadcastPriority } from "@/types/schema.types";
import { createBroadcastAction, toggleBroadcastAction } from "@/app/actions/passes-and-broadcasts";

interface BroadcastCreatorModalProps {
  initialBroadcasts: PlatformBroadcast[];
}

export function BroadcastCreatorModal({ initialBroadcasts }: BroadcastCreatorModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<BroadcastPriority>("normal");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["owner", "admin", "tenant"]);

  const roleOptions: { role: UserRole; label: string; desc: string }[] = [
    { role: "owner", label: "PG Owners", desc: "Financial & property owners" },
    { role: "admin", label: "Admins / Wardens", desc: "Building & hostel managers" },
    { role: "tenant", label: "Tenants / Students", desc: "Resident hostelers" },
  ];

  const toggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return; // keep at least 1
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const selectAll = () => {
    setSelectedRoles(["owner", "admin", "tenant"]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("priority", priority);
    selectedRoles.forEach((role) => formData.append("target_roles", role));

    const res = await createBroadcastAction(formData);
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.refresh();
      setTitle("");
      setMessage("");
      setIsSubmitting(false);
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all"
      >
        <Megaphone className="w-4 h-4" />
        <span>Create Targeted Broadcast</span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-[460px] w-full p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    Platform-wide Broadcast
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Publish announcements targeted to specific user roles
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Target Audience Multi-Select Chips */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Target Audience Roles (Multi-select)
                  </label>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Select All Roles
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((opt) => {
                    const isSelected = selectedRoles.includes(opt.role);
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => toggleRole(opt.role)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                          <span className="text-xs">{opt.label.split(" ")[0]}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 line-clamp-1">{opt.role}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selection: Urgent Banner vs Standard Notice */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display & Priority Level *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPriority("urgent")}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      priority === "urgent"
                        ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 shadow-sm ring-1 ring-rose-500/30"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white">
                        Urgent Banner
                      </span>
                      {priority === "urgent" && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Shows on Screen + Bell
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      High-priority dark alert pinned to the top of screens
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority("normal")}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      priority === "normal" || priority === "info"
                        ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Standard Notice
                      </span>
                      {(priority === "normal" || priority === "info") && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Notification Bell Only
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Silent notice routed exclusively to the header Bell
                    </p>
                  </button>
                </div>
              </div>

              {/* Broadcast Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Police Verification / Scheduled Maintenance"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide comprehensive instructions or timing details for the targeted audience..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Real-time Preview */}
              {title && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <Eye className="w-3.5 h-3.5" /> Live Preview
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-100 text-purple-800">
                      {priority}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Visible on: {selectedRoles.join(", ")}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Broadcasting..." : "Publish Broadcast"}
                </button>
              </div>
            </form>

            {/* Existing Broadcasts List */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Active Platform Broadcasts ({initialBroadcasts.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {initialBroadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{b.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {b.target_roles.join(", ")} • {b.priority}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await toggleBroadcastAction(b.id);
                        router.refresh();
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        b.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {b.is_active ? "Active" : "Paused"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
