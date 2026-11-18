"use client";

import { useState } from "react";
import { Megaphone, AlertTriangle, AlertCircle, Info, X, ChevronRight } from "lucide-react";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";

interface ActiveBroadcastBannerProps {
  broadcasts: PlatformBroadcast[];
  userRole: UserRole;
}

export function ActiveBroadcastBanner({ broadcasts, userRole }: ActiveBroadcastBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter broadcasts strictly to the user's role
  const relevantBroadcasts = broadcasts.filter((b) => {
    if (dismissedIds.includes(b.id)) return false;
    if (!b.is_active) return false;
    // Broadcast must target this role or be for all
    return b.target_roles.length === 0 || b.target_roles.includes(userRole);
  });

  if (relevantBroadcasts.length === 0) return null;

  return (
    <div className="space-y-2 mb-3">
      {relevantBroadcasts.map((broadcast) => {
        const isExpanded = expandedId === broadcast.id;

        // Visual styles by priority
        const priorityStyles = {
          info: {
            container: "bg-blue-50/90 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-100",
            icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
            badge: "bg-blue-200/70 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            title: "text-blue-950 dark:text-blue-100",
          },
          warning: {
            container: "bg-amber-50/90 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-100",
            icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
            badge: "bg-amber-200/70 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
            title: "text-amber-950 dark:text-amber-100",
          },
          urgent: {
            container: "bg-rose-50/95 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 shadow-sm",
            icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />,
            badge: "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200 font-bold",
            title: "text-rose-950 dark:text-rose-50 font-bold",
          },
        };

        const style = priorityStyles[broadcast.priority] || priorityStyles.info;

        return (
          <div
            key={broadcast.id}
            className={`rounded-2xl border p-3 text-xs transition-all relative shadow-2xs backdrop-blur-sm ${style.container}`}
          >
            <div className="flex items-start gap-2.5">
              {style.icon}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${style.badge}`}>
                    {broadcast.priority} Broadcast
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Targeted to: {broadcast.target_roles.join(", ")}
                  </span>
                </div>

                <h3 className={`font-bold mt-1 text-xs leading-snug ${style.title}`}>
                  {broadcast.title}
                </h3>

                <p
                  className={`mt-0.5 text-[11px] leading-relaxed opacity-90 ${
                    isExpanded ? "" : "line-clamp-2"
                  }`}
                >
                  {broadcast.message}
                </p>

                {broadcast.message.length > 80 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : broadcast.id)}
                    className="mt-1 text-[10px] font-bold underline opacity-80 hover:opacity-100"
                  >
                    {isExpanded ? "Show less" : "Read full announcement"}
                  </button>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => setDismissedIds((prev) => [...prev, broadcast.id])}
                className="absolute right-2.5 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
