"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

interface DesktopLayoutShellProps {
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  mobileHeader?: React.ReactNode;
  children: React.ReactNode;
}

function DesktopLayoutShellInner({
  sidebar,
  topBar,
  mobileHeader,
  children,
}: DesktopLayoutShellProps) {
  const { effectiveWidth, isDragging } = useSidebar();

  return (
    <>
      {sidebar}
      {mobileHeader}
      {topBar}
      <main
        style={{ ["--sidebar-w" as any]: `${effectiveWidth}px` }}
        className={cn(
          "flex-1 p-4 pb-32 lg:p-8 lg:pb-12 overflow-y-auto lg:pl-[var(--sidebar-w)]",
          isDragging ? "transition-none" : "transition-[padding] duration-200 ease-in-out"
        )}
      >
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          {children}
        </div>
      </main>
    </>
  );
}

export function DesktopLayoutShell({
  sidebar,
  topBar,
  mobileHeader,
  children,
}: DesktopLayoutShellProps) {
  return (
    <SidebarProvider>
      <DesktopLayoutShellInner
        sidebar={sidebar}
        topBar={topBar}
        mobileHeader={mobileHeader}
      >
        {children}
      </DesktopLayoutShellInner>
    </SidebarProvider>
  );
}
