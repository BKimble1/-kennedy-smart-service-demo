"use client";

import { cn } from "@/lib/utils/cn";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
  className,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "border-ink-200 bg-ink-100/70 inline-flex items-center gap-0.5 rounded-lg border p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] font-medium transition-all duration-150",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active
                ? "text-ink-900 ring-ink-200 bg-white shadow-xs ring-1"
                : "text-ink-600 hover:text-ink-900",
            )}
          >
            {o.label}
            {typeof o.count === "number" ? (
              <span
                className={cn(
                  "tnum rounded px-1 text-[10.5px] font-semibold",
                  active ? "bg-ink-100 text-ink-700" : "bg-ink-200/70 text-ink-600",
                )}
              >
                {o.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
