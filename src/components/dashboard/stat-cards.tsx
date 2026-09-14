"use client";

import type { DashboardMetrics } from "@/lib/dashboard/metrics";
import { formatWait } from "@/lib/dashboard/metrics";
import { cn } from "@/lib/utils/cn";
import {
  CalendarCheck,
  CircleCheck,
  FileText,
  Inbox,
  type LucideIcon,
  PhoneCall,
  Zap,
} from "lucide-react";

export type MetricKey =
  | "new"
  | "needs-response"
  | "emergency"
  | "scheduled"
  | "estimates"
  | "completed";

interface Tile {
  key: MetricKey;
  label: string;
  icon: LucideIcon;
  value: (m: DashboardMetrics) => number;
  sub: (m: DashboardMetrics) => string;
  tone: "brand" | "violet" | "danger" | "warn" | "ember" | "ok";
}

const TILES: Tile[] = [
  {
    key: "new",
    label: "New requests",
    icon: Inbox,
    value: (m) => m.newCount,
    sub: (m) =>
      m.oldestWaitingMinutes === null
        ? "Nothing waiting"
        : `Oldest waiting ${formatWait(m.oldestWaitingMinutes)}`,
    tone: "brand",
  },
  {
    key: "needs-response",
    label: "Needs response",
    icon: PhoneCall,
    value: (m) => m.needsResponse,
    sub: () => "Not yet scheduled",
    tone: "violet",
  },
  {
    key: "emergency",
    label: "Emergency",
    icon: Zap,
    value: (m) => m.emergency,
    sub: (m) => (m.emergency ? "Work these first" : "None open"),
    tone: "danger",
  },
  {
    key: "scheduled",
    label: "Scheduled",
    icon: CalendarCheck,
    value: (m) => m.scheduled,
    sub: () => "On the board",
    tone: "warn",
  },
  {
    key: "estimates",
    label: "Estimate opportunities",
    icon: FileText,
    value: (m) => m.estimates,
    sub: () => "Worth a conversation",
    tone: "ember",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CircleCheck,
    value: (m) => m.completed,
    sub: () => "In this inbox",
    tone: "ok",
  },
];

const TONE: Record<Tile["tone"], { icon: string; ring: string; value: string }> = {
  brand: { icon: "border-brand-100 bg-brand-50 text-brand-700", ring: "hover:border-brand-300", value: "text-ink-950" },
  violet: { icon: "border-violet-100 bg-violet-50 text-violet-700", ring: "hover:border-violet-200", value: "text-ink-950" },
  danger: { icon: "border-danger-100 bg-danger-50 text-danger-600", ring: "hover:border-danger-300", value: "text-danger-700" },
  warn: { icon: "border-warn-100 bg-warn-50 text-warn-700", ring: "hover:border-warn-200", value: "text-ink-950" },
  ember: { icon: "border-ember-100 bg-ember-50 text-ember-700", ring: "hover:border-ember-200", value: "text-ink-950" },
  ok: { icon: "border-ok-100 bg-ok-50 text-ok-700", ring: "hover:border-ok-200", value: "text-ink-950" },
};

export function StatCards({
  metrics,
  active,
  onSelect,
}: {
  metrics: DashboardMetrics;
  active: MetricKey | "all";
  onSelect: (key: MetricKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
      {TILES.map((t, i) => {
        const Icon = t.icon;
        const tone = TONE[t.tone];
        const value = t.value(metrics);
        const selected = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            aria-pressed={selected}
            style={{ animationDelay: `${i * 35}ms` }}
            className={cn(
              "animate-rise group rounded-xl border bg-white p-3.5 text-left transition-all duration-150 hover:-translate-y-px hover:shadow-md",
              selected ? "border-ink-900 ring-2 ring-ink-900/10" : cn("border-ink-200", tone.ring),
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn("grid size-7 place-items-center rounded-lg border", tone.icon)}>
                <Icon className="size-3.5" aria-hidden />
              </span>
              {t.key === "emergency" && value > 0 ? (
                <span
                  className="animate-pulse-ring mt-1 size-1.5 rounded-full bg-danger-500"
                  aria-hidden
                />
              ) : null}
            </div>
            <p
              className={cn(
                "tnum mt-2.5 font-display text-[26px] leading-none font-semibold",
                value === 0 ? "text-ink-300" : tone.value,
              )}
            >
              {value}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-tight font-medium text-ink-700">{t.label}</p>
            <p className="mt-0.5 truncate text-[11px] text-ink-400">{t.sub(metrics)}</p>
          </button>
        );
      })}
    </div>
  );
}
