"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";

interface ActiveBroadcastBannerProps {
  broadcasts: PlatformBroadcast[];
  userRole: UserRole;
  className?: string;
}

export function ActiveBroadcastBanner({
  broadcasts,
  userRole,
  className = "",
}: ActiveBroadcastBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Load dismissed IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("shunystays_dismissed_broadcasts");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem("shunystays_dismissed_broadcasts", JSON.stringify(updated));
    } catch {}
  };

  // Strict Priority Split: ONLY 'urgent' or 'emergency' render inline on screen
  // All normal / info / warning broadcasts are routed exclusively to the Notification Bell
  const urgentBroadcasts = broadcasts.filter((b) => {
    if (!b.is_active) return false;
    if (dismissedIds.includes(b.id)) return false;
    const isUrgent = b.priority === "urgent" || b.priority === "emergency";
    if (!isUrgent) return false;
    return b.target_roles.length === 0 || b.target_roles.includes(userRole);
  });

  if (urgentBroadcasts.length === 0) return null;

  return (
    <div className={`space-y-2.5 mb-3 ${className}`}>
      {urgentBroadcasts.map((broadcast) => (
        <div
          key={broadcast.id}
          className="bg-[#131A2B] border border-slate-800/80 rounded-2xl px-4 py-3.5 shadow-lg flex items-start justify-between gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Megaphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-[#818CF8] font-semibold text-sm leading-snug">
                {broadcast.title}
              </h4>
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed mt-0.5 whitespace-pre-line">
                {broadcast.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDismiss(broadcast.id)}
            aria-label="Dismiss banner"
            className="w-7 h-7 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 transition active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
