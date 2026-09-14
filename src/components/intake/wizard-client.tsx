"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

/**
 * The intake wizard is client-only on purpose: it restores an in-progress draft
 * from sessionStorage during its first render, which is only safe when there is
 * no server-rendered markup to mismatch against.
 */
const IntakeWizard = dynamic(() => import("./wizard").then((m) => m.IntakeWizard), {
  ssr: false,
  loading: () => (
    <div className="bg-ink-50 min-h-dvh">
      <div className="border-ink-200 border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </div>
      <div className="mx-auto max-w-xl space-y-3 px-4 pt-10 sm:px-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mb-6 h-4 w-1/2" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
        <span className="sr-only">Loading the service request form…</span>
      </div>
    </div>
  ),
});

export function IntakeWizardClient() {
  return <IntakeWizard />;
}
