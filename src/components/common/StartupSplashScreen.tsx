"use client";

import { useEffect, useState } from "react";
import { ShunyStaysEmblem } from "./ShunyStaysLogo";

export function StartupSplashScreen() {
 const [mounted, setMounted] = useState(false);
 const [visible, setVisible] = useState(false);
 const [closing, setClosing] = useState(false);

 useEffect(() => {
 // Only show once per browser session
 try {
 const alreadyShown = sessionStorage.getItem("shuny_splash_shown");
 if (alreadyShown) {
 return;
 }
 sessionStorage.setItem("shuny_splash_shown", "true");
 } catch {
 // Ignore storage errors in restricted contexts
 }

 setMounted(true);
 setVisible(true);

 // Auto-dismiss smoothly after initial load
 const timer = setTimeout(() => {
 setClosing(true);
 const exitTimer = setTimeout(() => {
 setVisible(false);
 }, 450);
 return () => clearTimeout(exitTimer);
 }, 900);

 return () => clearTimeout(timer);
 }, []);

 if (!mounted || !visible) return null;

 return (
 <div
 onClick={() => {
 setClosing(true);
 setTimeout(() => setVisible(false), 200);
 }}
 className={`fixed inset-0 z-[100] max-w-[480px] mx-auto bg-[#F8FAFC] flex flex-col items-center justify-between p-8 text-center select-none transition-all duration-400 ease-out cursor-pointer ${
 closing ? "opacity-0 scale-98 pointer-events-none" : "opacity-100 scale-100"
 }`}
 >
 {/* Top spacer */}
 <div className="w-full flex justify-end">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
 v2.4
 </span>
 </div>

 {/* Center Brand Identity */}
 <div className="flex flex-col items-center space-y-4">
 {/* Glowing Logo */}
 <div className="relative flex items-center justify-center">
 <div className="absolute w-28 h-28 rounded-3xl bg-indigo-500/15 blur-2xl animate-pulse" />
 <div className="relative shadow-lg rounded-2xl transform transition hover:scale-105">
 <ShunyStaysEmblem className="w-16 h-16 shadow-indigo-500/20 shadow-md" />
 </div>
 </div>

 {/* Brand Name */}
 <div>
 <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
 Shuny<span className="text-[#4F46E5] ml-0.5">Stays</span>
 </h1>
 <p className="text-xs font-semibold text-slate-400 mt-1 tracking-wide">
 Multi-Tenant PG & Hostel Operating System
 </p>
 </div>

 {/* Sleek Fintech Indigo Indeterminate Loading Bar */}
 <div className="w-44 h-1.5 rounded-full bg-slate-200/80 overflow-hidden relative shadow-inner mt-2">
 <div className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-[#4F46E5] to-[#4338CA] animate-indeterminate" />
 </div>
 </div>

 {/* Bottom Footer */}
 <div className="space-y-1">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-400 text-[10.5px] font-semibold shadow-2xs">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span>Cloud-Native PG Management</span>
 </div>
 </div>
 </div>
 );
}
