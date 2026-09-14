"use client";

import type { AvailabilitySelection, AvailabilityWindow } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { WINDOW_LABEL, WINDOW_RANGE, isToday, isTomorrow, toISODate } from "@/lib/utils/format";
import { CalendarDays, Check, Zap } from "lucide-react";
import * as React from "react";

const WINDOWS: AvailabilityWindow[] = ["morning", "afternoon", "evening"];

function nextDays(count: number, from = new Date()): Date[] {
  const out: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  while (out.length < count) {
    out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function AvailabilityStep({
  value,
  onChange,
}: {
  value: AvailabilitySelection[];
  onChange: (v: AvailabilitySelection[]) => void;
}) {
  const [today] = React.useState(() => new Date());
  const days = React.useMemo(() => nextDays(14, today), [today]);
  const selectedDates = value.map((v) => v.date);
  const flexible = value.length === 0;

  function toggleDay(date: string) {
    const existing = value.find((v) => v.date === date);
    if (existing) {
      onChange(value.filter((v) => v.date !== date));
    } else {
      onChange(
        [...value, { date, windows: ["morning", "afternoon"] as AvailabilityWindow[] }].sort(
          (a, b) => a.date.localeCompare(b.date),
        ),
      );
    }
  }

  function toggleWindow(date: string, window: AvailabilityWindow) {
    onChange(
      value.map((v) => {
        if (v.date !== date) return v;
        const has = v.windows.includes(window);
        const windows = has ? v.windows.filter((w) => w !== window) : [...v.windows, window];
        return { ...v, windows };
      }),
    );
  }

  function dayLabel(d: Date) {
    const iso = toISODate(d);
    if (isToday(iso, today)) return "Today";
    if (isTomorrow(iso, today)) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          "flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-150 hover:-translate-y-px hover:shadow-md",
          flexible
            ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/18"
            : "border-ink-200 bg-white hover:border-ink-300",
        )}
      >
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg border",
            flexible
              ? "border-brand-200 bg-brand-100 text-brand-700"
              : "border-ink-200 bg-ink-50 text-ink-500",
          )}
        >
          <Zap className="size-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-ink-900">
            I&apos;m flexible — first available
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-500">
            The office will offer you the earliest slot they have
          </span>
        </span>
        {flexible ? <Check className="size-5 shrink-0 text-brand-600" aria-hidden /> : null}
      </button>

      <div className="relative">
        <div className="mb-2.5 flex items-center gap-2">
          <CalendarDays className="size-4 text-ink-400" aria-hidden />
          <p className="text-[13px] font-medium text-ink-700">Or pick the days that work</p>
        </div>
        <div
          className="scrollarea -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          role="group"
          aria-label="Choose preferred days"
        >
          {days.map((d) => {
            const iso = toISODate(d);
            const active = selectedDates.includes(iso);
            const weekend = d.getDay() === 0 || d.getDay() === 6;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggleDay(iso)}
                aria-pressed={active}
                className={cn(
                  "flex w-[76px] shrink-0 snap-start flex-col items-center rounded-xl border px-2 py-3 transition-all duration-150",
                  active
                    ? "border-brand-500 bg-brand-600 text-white shadow-sm"
                    : weekend
                      ? "border-ink-200 bg-ink-100/70 text-ink-400 hover:border-ink-300"
                      : "border-ink-200 bg-white text-ink-700 hover:-translate-y-px hover:border-ink-300 hover:shadow-sm",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold tracking-wide uppercase",
                    active ? "text-white/75" : "text-ink-500",
                  )}
                >
                  {dayLabel(d)}
                </span>
                <span className="tnum mt-1 font-display text-[19px] leading-none font-semibold">
                  {d.getDate()}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10.5px]",
                    active ? "text-white/70" : "text-ink-400",
                  )}
                >
                  {d.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-ink-500">
          {BUSINESS_HOURS_NOTE}
        </p>
      </div>

      {value.length > 0 ? (
        <div className="animate-rise space-y-2.5">
          {value.map((slot) => (
            <div key={slot.date} className="rounded-xl border border-ink-200 bg-white p-4">
              <p className="mb-3 text-[13.5px] font-semibold text-ink-900">
                {new Date(`${slot.date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {WINDOWS.map((w) => {
                  const on = slot.windows.includes(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleWindow(slot.date, w)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-left transition-colors",
                        on
                          ? "border-brand-400 bg-brand-50 text-brand-900"
                          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
                      )}
                    >
                      <span className="block text-[13.5px] font-medium">{WINDOW_LABEL[w]}</span>
                      <span className="tnum mt-0.5 block text-[11.5px] opacity-70">
                        {WINDOW_RANGE[w]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {slot.windows.length === 0 ? (
                <p className="mt-2.5 text-[12px] text-warn-700">
                  Pick at least one window, or remove this day.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const BUSINESS_HOURS_NOTE =
  "You can send this any time. The office is open Monday to Friday, 8:00am – 5:00pm.";
