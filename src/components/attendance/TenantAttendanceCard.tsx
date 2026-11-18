"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Moon,
  ChevronDown,
  ChevronUp,
  Calendar,
  ShieldCheck,
  UserCheck,
  Info,
} from "lucide-react";
import { AttendanceStatus } from "@/types/schema.types";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  note?: string;
}

interface TenantAttendanceCardProps {
  todayStatus: AttendanceStatus;
  markedAt: string;
  markedBy: string;
  history: AttendanceRecord[];
}

export function TenantAttendanceCard({
  todayStatus,
  markedAt,
  markedBy,
  history,
}: TenantAttendanceCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Status visual configs
  const statusConfig = {
    present: {
      label: "Present",
      subtext: "Roll call verified in bed",
      icon: CheckCircle2,
      cardBg: "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/80 dark:border-emerald-900/60",
      badgeBg: "bg-emerald-500 text-white",
      textColor: "text-emerald-700 dark:text-emerald-300",
      iconColor: "text-emerald-500",
    },
    absent: {
      label: "Absent",
      subtext: "Unmarked / Not found during roll call",
      icon: XCircle,
      cardBg: "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/80 dark:border-rose-900/60",
      badgeBg: "bg-rose-500 text-white",
      textColor: "text-rose-700 dark:text-rose-300",
      iconColor: "text-rose-500",
    },
    day_pass: {
      label: "On Day Pass",
      subtext: "Permitted day outing till curfew hours",
      icon: Clock,
      cardBg: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/80 dark:border-amber-900/60",
      badgeBg: "bg-amber-500 text-white",
      textColor: "text-amber-700 dark:text-amber-300",
      iconColor: "text-amber-500",
    },
    night_pass: {
      label: "On Night Pass",
      subtext: "Overnight leave approved & logged",
      icon: Moon,
      cardBg: "bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/80 dark:border-indigo-900/60",
      badgeBg: "bg-indigo-600 text-white",
      textColor: "text-indigo-700 dark:text-indigo-300",
      iconColor: "text-indigo-500",
    },
  }[todayStatus] || {
    label: "Present",
    subtext: "Roll call verified",
    icon: CheckCircle2,
    cardBg: "bg-emerald-50 border-emerald-200",
    badgeBg: "bg-emerald-500 text-white",
    textColor: "text-emerald-700",
    iconColor: "text-emerald-500",
  };

  const StatusIcon = statusConfig.icon;

  // Calculate 30-day attendance percentage
  const totalDays = history.length;
  const presentDays = history.filter(
    (h) => h.status === "present" || h.status === "day_pass" || h.status === "night_pass"
  ).length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const formattedTime = new Date(markedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "rounded-3xl border p-4 shadow-xs transition-all space-y-3",
        statusConfig.cardBg
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today&apos;s Attendance
          </h2>
        </div>
        <span
          className={cn(
            "text-[11px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs",
            statusConfig.badgeBg
          )}
        >
          <StatusIcon className="w-3 h-3 stroke-[2.5]" />
          {statusConfig.label}
        </span>
      </div>

      {/* Main Status Display */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-black tracking-tight", statusConfig.textColor)}>
              {statusConfig.label}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              at {formattedTime}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {statusConfig.subtext}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            Verified by: {markedBy}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            30-Day Record
          </span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {attendanceRate}%
          </span>
        </div>
      </div>

      {/* Collapsible 30-Day History Toggle Button */}
      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
        <button
          type="button"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            30-Day Attendance History ({presentDays}/{totalDays} Present)
          </span>
          {isHistoryOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Collapsible History List */}
        {isHistoryOpen && (
          <div className="mt-2.5 space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
            {history.map((record) => {
              const formattedDate = new Date(record.date).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });

              return (
                <div
                  key={record.date}
                  className="pt-1.5 pb-1 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formattedDate}
                    </span>
                    {record.note && (
                      <p className="text-[10px] text-slate-400">{record.note}</p>
                    )}
                  </div>

                  <div>
                    {record.status === "present" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        Present
                      </span>
                    )}
                    {record.status === "absent" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                        Absent
                      </span>
                    )}
                    {record.status === "day_pass" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        Day Pass
                      </span>
                    )}
                    {record.status === "night_pass" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                        Night Pass
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
