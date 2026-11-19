"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Megaphone, X, Sparkles } from "lucide-react";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";

interface NotificationCenterProps {
  broadcasts?: PlatformBroadcast[];
  userRole: UserRole;
}

export function NotificationCenter({
  broadcasts = [],
  userRole,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Restore read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("shunystays_read_notifications");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Close on outside click / tap
  useEffect(() => {
    function handleEventOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleEventOutside);
      document.addEventListener("touchstart", handleEventOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleEventOutside);
      document.removeEventListener("touchstart", handleEventOutside);
    };
  }, [isOpen]);

  // Filter broadcasts targeting current user role
  const relevantBroadcasts = broadcasts.filter((b) => {
    if (!b.is_active) return false;
    return b.target_roles.length === 0 || b.target_roles.includes(userRole);
  });

  const unreadCount = relevantBroadcasts.filter((b) => !readIds.includes(b.id)).length;

  const markAllAsRead = () => {
    const allIds = relevantBroadcasts.map((b) => b.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem("shunystays_read_notifications", JSON.stringify(updated));
    } catch {}
  };

  const markSingleAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    try {
      localStorage.setItem("shunystays_read_notifications", JSON.stringify(updated));
    } catch {}
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
        title="Notices & Broadcasts"
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center justify-center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white font-black text-[9.5px] leading-none flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Sleek Dark-Slate Popover Drawer */}
      {isOpen && (
        <>
          {/* Mobile Backdrop to prevent clipping and handle outside tap cleanly */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-16 mx-auto w-[calc(100vw-24px)] max-w-md sm:absolute sm:right-0 sm:inset-x-auto sm:top-full sm:mt-2 sm:w-96 bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 origin-top-right text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-black text-white">Notices & Alerts</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Broadcasts List */}
            <div className="mt-3 space-y-2.5 max-h-[75vh] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
              {relevantBroadcasts.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <CheckCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">All caught up!</p>
                  <p className="text-[10.5px] text-slate-500">
                    No active announcements or property broadcasts right now.
                  </p>
                </div>
              ) : (
                relevantBroadcasts.map((broadcast) => {
                  const isRead = readIds.includes(broadcast.id);
                  const isUrgent =
                    broadcast.priority === "urgent" || broadcast.priority === "emergency";

                  return (
                    <div
                      key={broadcast.id}
                      onClick={() => markSingleAsRead(broadcast.id)}
                      className={`bg-[#131A2B] border rounded-2xl p-3.5 space-y-1.5 transition-all cursor-pointer ${
                        isRead
                          ? "border-slate-800/60 opacity-80"
                          : "border-indigo-500/40 shadow-sm shadow-indigo-950/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                              isUrgent
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : broadcast.priority === "warning"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {isUrgent ? "⚡ Urgent Banner" : "Standard Notice"}
                          </span>
                          {!isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatTime(broadcast.created_at)}
                        </span>
                      </div>

                      <h4 className="text-[#818CF8] font-bold text-xs sm:text-sm leading-snug break-words">
                        {broadcast.title}
                      </h4>

                      <p className="text-slate-100 text-[11px] sm:text-xs leading-relaxed whitespace-pre-line break-words">
                        {broadcast.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
