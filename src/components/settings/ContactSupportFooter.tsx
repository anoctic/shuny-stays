"use client";

import { MessageCircle, PhoneCall, Headphones } from "lucide-react";

const FOUNDER_SUPPORT_PHONE = "9027003865";
const FOUNDER_SUPPORT_DISPLAY = "+91 90270 03865";

interface ContactSupportFooterProps {
  pgName?: string | null;
  userName?: string | null;
  role?: "owner" | "admin" | "super_admin" | "tenant";
}

export function ContactSupportFooter({
  pgName,
  userName,
  role = "owner",
}: ContactSupportFooterProps) {
  if (role !== "owner" && role !== "admin") return null;

  const waMessage = [
    "Namaste! Mujhe Shuny Stays PG account me support chahiye.",
    `• PG Name: ${pgName || "My PG Property"}`,
    `• Account: ${userName || "User"} (${role === "owner" ? "PG Owner" : "Warden / Admin"})`,
    "• Support Query: ",
  ].join("\n");

  const waUrl = `https://wa.me/91${FOUNDER_SUPPORT_PHONE}?text=${encodeURIComponent(waMessage)}`;

  return (
    <footer className="mt-8 pt-2 pb-4">
      <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-slate-900">
              Contact Support — Shuny Stays Founder Desk
            </div>
            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
              Direct WhatsApp &amp; Call Helpline:{" "}
              <span className="font-mono font-black text-emerald-800">{FOUNDER_SUPPORT_DISPLAY}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:+91${FOUNDER_SUPPORT_PHONE}`}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-extrabold inline-flex items-center gap-1.5 transition active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
            <span>Call</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1fbd59] text-white text-xs font-black inline-flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
