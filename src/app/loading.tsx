import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";

export default function RootLoading() {
 return (
 <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
 {/* Centered Pulsing Logo */}
 <div className="relative flex items-center justify-center">
 {/* Soft Indigo Glow Background */}
 <div className="absolute w-20 h-20 rounded-3xl bg-indigo-500/20 blur-xl animate-pulse" />

 {/* Animated Emblem */}
 <div className="relative shadow-md rounded-2xl transform active:scale-95 transition">
 <ShunyStaysEmblem className="w-14 h-14" />
 </div>
 </div>

 {/* Brand Title */}
 <div className="mt-4 text-center">
 <h1 className="text-lg font-black tracking-tight text-[#0F172A]">
 Shuny<span className="text-[#4F46E5] ml-0.5">Stays</span>
 </h1>
 <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
 Multi-Tenant Property OS
 </p>
 </div>

 {/* Sleek Fintech Indigo Loading Bar */}
 <div className="w-40 h-1.5 rounded-full bg-slate-200/90 overflow-hidden mt-6 relative shadow-inner">
 <div className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-[#4F46E5] to-[#4338CA] animate-indeterminate" />
 </div>

 {/* Bottom Status Tag */}
 <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-400 text-[10px] font-bold shadow-2xs">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
 <span>Syncing Cloud Instance...</span>
 </div>
 </div>
 );
}
