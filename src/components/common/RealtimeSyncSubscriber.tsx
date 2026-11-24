"use client";

import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface RealtimeSyncSubscriberProps {
 tables: string[];
 filter?: string;
}

export function RealtimeSyncSubscriber({ tables, filter }: RealtimeSyncSubscriberProps) {
 useRealtimeSync(tables, filter);
 return null;
}
