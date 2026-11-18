"use client";

import { useEffect, useState } from "react";
import { Share, X, PlusSquare } from "lucide-react";

export function IOSSmartBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only run in client browser
    if (typeof window === "undefined") return;

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("shunyos_ios_prompt_dismissed");
    if (isDismissed) return;

    // Detect iOS devices (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    // Detect if already running in standalone mode (installed PWA)
    const isStandalone =
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isIOS && !isStandalone) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("shunyos_ios_prompt_dismissed", "true");
  };

  return (
    <div className="fixed top-3 left-3 right-3 z-50 max-w-[460px] mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
          <Share className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-xs leading-relaxed">
          <div className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
            Install ShunyOS PWA
          </div>
          <p className="text-slate-300 mt-0.5">
            Tap <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" /> Share icon and select{" "}
            <span className="font-semibold text-white inline-flex items-center gap-1">
              &apos;Add to Home Screen&apos; <PlusSquare className="w-3 h-3 text-blue-400" />
            </span>{" "}
            for the full app experience.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
