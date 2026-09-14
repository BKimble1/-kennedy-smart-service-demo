"use client";

import { Badge } from "@/components/ui/badge";
import type { IntakeSummary } from "@/lib/ai/provider";
import { cn } from "@/lib/utils/cn";
import { Sparkle, TriangleAlert } from "lucide-react";

/**
 * The structured summary — the single artifact both sides of the product hand
 * each other. The customer sees it before submitting; the office sees the same
 * thing on arrival. Same data, same order, no translation loss.
 */
export function RequestSummary({
  summary,
  className,
  dense,
  showHeadline = true,
}: {
  summary: IntakeSummary;
  className?: string;
  dense?: boolean;
  showHeadline?: boolean;
}) {
  return (
    <div className={cn("border-ink-200 overflow-hidden rounded-xl border bg-white", className)}>
      {showHeadline ? (
        <div className="border-ink-150 bg-ink-50/70 flex items-start gap-3 border-b px-4 py-3.5 sm:px-5">
          <span className="border-brand-200 bg-brand-50 text-brand-700 mt-px grid size-6 shrink-0 place-items-center rounded-md border">
            <Sparkle className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-ink-500 text-[10.5px] font-semibold tracking-[0.09em] uppercase">
              Request summary
            </p>
            <p className="font-display text-ink-950 mt-0.5 text-[15px] leading-snug font-semibold">
              {summary.headline}
            </p>
          </div>
        </div>
      ) : null}

      <dl className={cn("divide-ink-150 divide-y", dense ? "text-[13px]" : "text-[13.5px]")}>
        {summary.sections.map((section) => (
          <div
            key={section.label}
            className={cn(
              "grid gap-1 px-4 sm:grid-cols-[132px_1fr] sm:gap-4 sm:px-5",
              dense ? "py-2.5" : "py-3",
              section.tone === "alert" && "bg-danger-50/60",
            )}
          >
            <dt
              className={cn(
                "flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.07em] uppercase",
                section.tone === "alert" ? "text-danger-700" : "text-ink-500",
              )}
            >
              {section.tone === "alert" ? (
                <TriangleAlert className="size-3 shrink-0" aria-hidden />
              ) : null}
              {section.label}
            </dt>
            <dd
              className={cn(
                "leading-relaxed",
                section.tone === "alert"
                  ? "text-danger-800 font-medium"
                  : section.tone === "accent"
                    ? "text-ink-900 font-medium"
                    : "text-ink-800",
              )}
            >
              {section.value ? <p>{section.value}</p> : null}
              {section.items?.length ? (
                <ul className={cn("space-y-1", section.value && "mt-1.5")}>
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[7px] size-1 shrink-0 rounded-full",
                          section.tone === "alert" ? "bg-danger-500" : "bg-ink-400",
                        )}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SummaryBadgeRow({
  items,
}: {
  items: { label: string; tone?: "danger" | "warn" | "brand" | "ok" }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Badge key={i.label} tone={i.tone ?? "neutral"} size="md">
          {i.label}
        </Badge>
      ))}
    </div>
  );
}
