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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 1. Check user-specific localStorage first, then general, then html class
    const userKey = userId ? `shuny_theme_${userId}` : null;
    let stored = userKey ? localStorage.getItem(userKey) : null;
    if (!stored) {
      stored = localStorage.getItem("shuny_theme");
    }

    const isDarkMode =
      stored === "dark" ||
      (!stored && document.documentElement.classList.contains("dark"));

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: "light" | "dark"; userId?: string }>;
      if (customEvent.detail?.theme) {
        setIsDark(customEvent.detail.theme === "dark");
      }
    };

    window.addEventListener("shuny:themechange", handleThemeChange);
    return () => {
      window.removeEventListener("shuny:themechange", handleThemeChange);
    };
  }, [userId]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    const nextTheme = nextDark ? "dark" : "light";
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const userKey = userId ? `shuny_theme_${userId}` : "shuny_theme";
    try {
      localStorage.setItem(userKey, nextTheme);
      localStorage.setItem("shuny_theme", nextTheme);
      document.cookie = `${userKey}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `shuny_theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Theme storage error:", e);
    }

    window.dispatchEvent(
      new CustomEvent("shuny:themechange", {
        detail: { theme: nextTheme, userId },
      })
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      className={cn(
        "relative rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0",
        isDark
          ? "bg-slate-800 text-amber-300 hover:text-amber-200 hover:bg-slate-700 border border-slate-700 shadow-2xs"
          : "bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 shadow-2xs",
        compact ? "p-1.5 w-8 h-8" : "p-2 w-9 h-9",
        className
      )}
    >
      {isDark ? (
        <Sun className={cn(compact ? "w-4 h-4" : "w-4 h-4", "text-amber-400")} />
      ) : (
        <Moon className={cn(compact ? "w-4 h-4" : "w-4 h-4", "text-slate-600")} />
      )}
    </button>
  );
}
