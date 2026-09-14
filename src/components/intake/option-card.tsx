"use client";

import { cn } from "@/lib/utils/cn";
import {
  Check,
  ChevronRight,
  CircleHelp,
  Droplets,
  Flame,
  type LucideIcon,
  Package,
  Snowflake,
  Wrench,
} from "lucide-react";
import * as React from "react";

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  flame: Flame,
  droplets: Droplets,
  wrench: Wrench,
  package: Package,
  "circle-help": CircleHelp,
};

export const CATEGORY_ACCENT: Record<string, string> = {
  cooling: "text-brand-600 bg-brand-50 border-brand-100",
  heating: "text-ember-600 bg-ember-50 border-ember-100",
  plumbing: "text-brand-700 bg-brand-50 border-brand-100",
  maintenance: "text-ok-700 bg-ok-50 border-ok-100",
  install: "text-violet-700 bg-violet-50 border-violet-100",
  other: "text-ink-600 bg-ink-100 border-ink-200",
};

export function OptionCard({
  label,
  hint,
  icon: Icon,
  accent,
  selected,
  multi,
  danger,
  onClick,
  size = "md",
}: {
  label: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: string;
  selected?: boolean;
  multi?: boolean;
  danger?: boolean;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={multi ? Boolean(selected) : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3.5 rounded-xl border bg-white text-left transition-all duration-150",
        "hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm",
        size === "lg" ? "p-4 sm:p-[18px]" : "px-4 py-3.5",
        selected
          ? danger
            ? "border-danger-400 bg-danger-50/70 ring-danger-500/20 ring-2"
            : "border-brand-500 bg-brand-50/60 ring-brand-500/18 ring-2"
          : danger
            ? "border-danger-200 hover:border-danger-300"
            : "border-ink-200 hover:border-ink-300",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-lg border transition-colors",
            size === "lg" ? "size-11" : "size-9",
            selected && !danger
              ? "border-brand-200 bg-brand-100 text-brand-700"
              : danger
                ? "border-danger-100 bg-danger-50 text-danger-600"
                : (accent ?? "border-ink-200 bg-ink-50 text-ink-500"),
          )}
        >
          <Icon className={size === "lg" ? "size-[22px]" : "size-[18px]"} aria-hidden />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "text-ink-900 block font-medium",
            size === "lg" ? "text-[15.5px]" : "text-[15px]",
            danger && "text-danger-800",
          )}
        >
          {label}
        </span>
        {hint ? (
          <span className="text-ink-500 mt-0.5 block text-[13px] leading-snug">{hint}</span>
        ) : null}
      </span>

      <span
        className={cn(
          "grid shrink-0 place-items-center transition-all duration-150",
          multi ? "size-5 rounded-md border-2" : "size-5",
          multi
            ? selected
              ? danger
                ? "border-danger-600 bg-danger-600 text-white"
                : "border-brand-600 bg-brand-600 text-white"
              : "border-ink-300 text-transparent"
            : selected
              ? "text-brand-600"
              : "text-ink-300 group-hover:text-ink-400",
        )}
      >
        {multi ? (
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        ) : selected ? (
          <Check className="size-5" aria-hidden />
        ) : (
          <ChevronRight className="size-5" aria-hidden />
        )}
      </span>
    </button>
  );
}
