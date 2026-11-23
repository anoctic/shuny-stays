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
  const { isCollapsed } = useSidebar();

  return (
    <>
      {sidebar}
      {mobileHeader}
      {topBar}
      <main
        className={cn(
          "flex-1 p-4 pb-24 lg:p-8 lg:pb-12 overflow-y-auto transition-[padding] duration-300 ease-in-out",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
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
