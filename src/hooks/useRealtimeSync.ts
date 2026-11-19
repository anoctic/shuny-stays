"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Reusable Supabase Realtime Hook for Live Cross-Device Synchronization
 *
 * Subscribes to `postgres_changes` (`event: '*'`, `schema: 'public'`)
 * on the specified tables via the browser Supabase client.
 * Debounces rapid database triggers (300ms) and invokes `router.refresh()`
 * so server components re-render with fresh live PostgreSQL data instantly.
 *
 * Automatically unsubscribes and removes channels on component unmount.
 */
export function useRealtimeSync(
  tables: string[],
  filter?: string,
  onUpdate?: () => void
) {
  const router = useRouter();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tablesKey = [...tables].sort().join(",");
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!tablesKey) return;
    const tableList = tablesKey.split(",");

    const supabase = createClient();
    const channelName = `live-sync-${tablesKey}-${filter || "all"}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase.channel(channelName);

    const triggerRefresh = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        router.refresh();
        onUpdateRef.current?.();
      }, 300);
    };

    tableList.forEach((table) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channel as any).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: filter || undefined,
        },
        () => {
          triggerRefresh();
        }
      );
    });

    channel.subscribe();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [tablesKey, filter, router]);
}
