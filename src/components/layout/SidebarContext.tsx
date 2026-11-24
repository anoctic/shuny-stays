"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  effectiveWidth: number;
  isDragging: boolean;
  startDragging: (e: React.MouseEvent) => void;
}

const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const COLLAPSE_THRESHOLD = 130;
const COLLAPSED_WIDTH = 72;

const STORAGE_KEY_COLLAPSED = "shuny_sidebar_collapsed";
const STORAGE_KEY_WIDTH = "shuny_sidebar_width";

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
  setCollapsed: () => {},
  sidebarWidth: DEFAULT_WIDTH,
  setSidebarWidth: () => {},
  effectiveWidth: DEFAULT_WIDTH,
  isDragging: false,
  startDragging: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidthState] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Initialize from localStorage after client hydration
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === "true");
      }
      const savedWidth = localStorage.getItem(STORAGE_KEY_WIDTH);
      if (savedWidth !== null) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setSidebarWidthState(parsed);
        }
      }
    } catch {
      // localStorage may fail in private browsing
    }
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, String(collapsed));
    } catch {}
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
    setSidebarWidthState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_WIDTH, String(clamped));
    } catch {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_COLLAPSED, String(next));
      } catch {}
      return next;
    });
  }, []);

  // Native Split View Dragging Handler
  const startDragging = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      isDraggingRef.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const currentX = moveEvent.clientX;

        // Snapping: if dragged below collapse threshold, snap to collapsed
        if (currentX < COLLAPSE_THRESHOLD) {
          setIsCollapsed(true);
          try {
            localStorage.setItem(STORAGE_KEY_COLLAPSED, "true");
          } catch {}
        } else {
          // Uncollapse and resize
          setIsCollapsed(false);
          try {
            localStorage.setItem(STORAGE_KEY_COLLAPSED, "false");
          } catch {}
          const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, currentX));
          setSidebarWidthState(newWidth);
          try {
            localStorage.setItem(STORAGE_KEY_WIDTH, String(newWidth));
          } catch {}
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        isDraggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    []
  );

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle desktop sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const effectiveWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setCollapsed,
        sidebarWidth,
        setSidebarWidth,
        effectiveWidth,
        isDragging,
        startDragging,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      toggleSidebar: () => {},
      setCollapsed: () => {},
      sidebarWidth: DEFAULT_WIDTH,
      setSidebarWidth: () => {},
      effectiveWidth: DEFAULT_WIDTH,
      isDragging: false,
      startDragging: () => {},
    };
  }
  return context;
}
