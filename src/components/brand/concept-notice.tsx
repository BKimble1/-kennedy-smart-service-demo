"use client";

import { CONCEPT_NOTICE } from "@/lib/domain/business";
import { cn } from "@/lib/utils/cn";
import { Info, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

/**
 * The ethics label. Present on every screen, never in the way.
 *
 * It has to be findable by anyone who wonders "is this really Kennedy's?" and
 * invisible to anyone who doesn't — so: one quiet line, expandable, dismissible
 * for the session.
 */
export function ConceptNotice({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("no-print", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors",
          variant === "dark"
            ? "text-white/55 hover:bg-white/10 hover:text-white/85"
            : "text-ink-500 hover:bg-ink-100 hover:text-ink-800",
        )}
      >
        <Info className="size-3" aria-hidden />
        {CONCEPT_NOTICE.short}
      </button>
      {open ? (
        <p
          className={cn(
            "animate-fade mt-1.5 max-w-md rounded-lg border px-3 py-2 text-[11.5px] leading-relaxed",
            variant === "dark"
              ? "border-white/12 bg-white/5 text-white/70"
              : "border-ink-200 bg-ink-50 text-ink-600",
          )}
        >
          {CONCEPT_NOTICE.long}{" "}
          <Link
            href="/about"
            className={cn(
              "font-medium underline underline-offset-2",
              variant === "dark" ? "text-white/85" : "text-brand-700",
            )}
          >
            More about this demo
          </Link>
        </p>
      ) : null}
    </div>
  );
}

/** Slim top ribbon used on the customer-facing screens. */
export function ConceptRibbon() {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <div className="no-print border-ink-900/10 bg-ink-950 relative z-30 border-b text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase">
          Concept demo
        </span>
        <p className="min-w-0 flex-1 truncate text-[11.5px] text-white/70">
          {CONCEPT_NOTICE.long}
        </p>
        <Link
          href="/about"
          className="hidden shrink-0 text-[11.5px] font-medium text-white/80 underline underline-offset-2 hover:text-white sm:inline"
        >
          More
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss concept notice"
          className="-m-1 rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
