"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ActivityEntry, IntakeDraft, ServiceRequest } from "@/lib/domain/types";
import { getStore } from "./local-store";
import type { RequestPatch } from "./types";

const EMPTY: ServiceRequest[] = [];

/**
 * Subscribes to the store with `useSyncExternalStore`, so a write in *any* tab
 * re-renders every open view. The server snapshot is intentionally empty —
 * the data lives in the visitor's browser, so the first paint is a real loading
 * state rather than a hydration mismatch.
 */
export function useRequests() {
  const store = getStore();
  const subscribe = useCallback((cb: () => void) => store.subscribe(cb), [store]);
  const requests = useSyncExternalStore(
    subscribe,
    () => store.list(),
    () => EMPTY,
  );

  const actions = useMemo(
    () => ({
      create: (draft: IntakeDraft) => store.create(draft),
      update: (id: string, patch: RequestPatch, actor?: string) =>
        store.update(id, patch, actor),
      addActivity: (id: string, entry: Omit<ActivityEntry, "id" | "at">) =>
        store.addActivity(id, entry),
      reset: () => store.reset(),
    }),
    [store],
  );

  return { requests, hydrated: requests !== EMPTY, ...actions };
}

export function useRequest(id: string | undefined) {
  const { requests, hydrated, ...actions } = useRequests();
  const request = useMemo(
    () => (id ? requests.find((r) => r.id === id || r.reference === id) : undefined),
    [requests, id],
  );
  return { request, hydrated, ...actions };
}
