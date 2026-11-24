"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ userId, className, compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Check user-specific localStorage first, then general
    const userKey = userId ? `shuny_theme_${userId}` : null;
    let stored: string | null = null;
    if (userKey) {
      stored = localStorage.getItem(userKey);
    }
    if (!stored) {
      stored = localStorage.getItem("shuny_theme");
    }

    if (
      stored === "dark" ||
      (!stored && document.documentElement.classList.contains("dark"))
    ) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: "light" | "dark"; userId?: string }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener("shuny:themechange", handleThemeChange);
    return () => {
      window.removeEventListener("shuny:themechange", handleThemeChange);
    };
  }, [userId]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    // Apply or remove dark class on <html>
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to user-specific localStorage and cookie for persistence
    const userKey = userId ? `shuny_theme_${userId}` : "shuny_theme";
    try {
      localStorage.setItem(userKey, nextTheme);
      localStorage.setItem("shuny_theme", nextTheme);
      document.cookie = `${userKey}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `shuny_theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Theme storage error:", e);
    }

    // Broadcast change across tabs / components
    window.dispatchEvent(
      new CustomEvent("shuny:themechange", {
        detail: { theme: nextTheme, userId },
      })
    );
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-slate-50 transition opacity-0",
          compact ? "p-1.5 w-7 h-7" : "p-2 w-8 h-8",
          className
        )}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      className={cn(
        "relative rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer",
        isDark
          ? "bg-slate-800 text-amber-300 hover:text-amber-200 hover:bg-slate-700 border border-slate-700 shadow-2xs"
          : "bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 shadow-2xs",
        compact ? "p-1.5 w-7 h-7" : "p-2 w-8 h-8",
        className
      )}
    >
      {isDark ? (
        <Sun className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4", "animate-in spin-in-90 duration-200")} />
      ) : (
        <Moon className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4", "animate-in -rotate-90 duration-200")} />
      )}
    </button>
  );
}
