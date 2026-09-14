"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";
import * as React from "react";

/**
 * Two-category horizontal comparison of one measure (minutes of office time per
 * request). Palette validated for CVD separation: #196ba9 / #c85f34, ΔE 18.8
 * (protan) against a white surface. Identity never rests on color alone — every
 * bar carries a row label and a value at its tip, and the numbers are repeated
 * in a table view below.
 */

const SERIES = {
  current: { fill: "#c85f34", label: "Today — details collected on the phone" },
  improved: { fill: "#196ba9", label: "With structured intake" },
} as const;

export interface CalcInputs {
  inquiriesPerWeek: number;
  minutesNow: number;
  minutesAfter: number;
  hourlyCost: number;
}

export interface CalcResult {
  weeklyHoursNow: number;
  weeklyHoursAfter: number;
  weeklyHoursSaved: number;
  annualHoursSaved: number;
  annualCostNow: number;
  annualCostAfter: number;
  annualCostDifference: number;
}

export function calculate(input: CalcInputs): CalcResult {
  const weeklyMinutesNow = input.inquiriesPerWeek * input.minutesNow;
  const weeklyMinutesAfter =
    input.inquiriesPerWeek * Math.min(input.minutesAfter, input.minutesNow);
  const weeklyHoursNow = weeklyMinutesNow / 60;
  const weeklyHoursAfter = weeklyMinutesAfter / 60;
  const weeklyHoursSaved = Math.max(0, weeklyHoursNow - weeklyHoursAfter);
  return {
    weeklyHoursNow,
    weeklyHoursAfter,
    weeklyHoursSaved,
    annualHoursSaved: weeklyHoursSaved * 52,
    annualCostNow: weeklyHoursNow * 52 * input.hourlyCost,
    annualCostAfter: weeklyHoursAfter * 52 * input.hourlyCost,
    annualCostDifference: weeklyHoursSaved * 52 * input.hourlyCost,
  };
}

export function ComparisonBars({ input, result }: { input: CalcInputs; result: CalcResult }) {
  const max = Math.max(result.weeklyHoursNow, 0.001);
  const rows = [
    { key: "current", hours: result.weeklyHoursNow, minutes: input.minutesNow },
    {
      key: "improved",
      hours: result.weeklyHoursAfter,
      minutes: Math.min(input.minutesAfter, input.minutesNow),
    },
  ] as const;

  return (
    <figure className="m-0">
      <figcaption className="text-ink-700 text-[13px] font-medium">
        Office time spent gathering request details
        <span className="text-ink-500 ml-1.5 font-normal">— hours per week</span>
      </figcaption>

      <div className="mt-4 space-y-4">
        {rows.map((row) => {
          const series = SERIES[row.key];
          const pct = Math.max(1.5, (row.hours / max) * 100);
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-ink-600 flex items-center gap-2 text-[12.5px]">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ background: series.fill }}
                  />
                  {series.label}
                </span>
                <span className="tnum text-ink-500 text-[12px] whitespace-nowrap">
                  {row.minutes} min each
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-ink-100 h-5 min-w-0 flex-1 rounded-[2px]">
                  <div
                    className="h-full rounded-r-[4px] transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%`, background: series.fill }}
                    role="img"
                    aria-label={`${series.label}: ${row.hours.toFixed(1)} hours per week`}
                  />
                </div>
                <span className="tnum font-display text-ink-950 w-[74px] shrink-0 text-right text-[15px] font-semibold">
                  {row.hours.toFixed(1)} h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-ink-200 mt-4 border-t pt-3">
        <p className="text-ink-600 text-[12.5px] leading-relaxed">
          The difference —{" "}
          <span className="tnum text-ink-900 font-semibold">
            {result.weeklyHoursSaved.toFixed(1)} hours a week
          </span>{" "}
          — is the part of intake that structured questions can carry instead of a person.
        </p>
      </div>
    </figure>
  );
}

export function NumbersTable({ input, result }: { input: CalcInputs; result: CalcResult }) {
  const [open, setOpen] = React.useState(false);
  const rows: [string, string][] = [
    ["Service inquiries per week", `${input.inquiriesPerWeek}`],
    ["Minutes collecting details today", `${input.minutesNow} min`],
    [
      "Minutes collecting details after",
      `${Math.min(input.minutesAfter, input.minutesNow)} min`,
    ],
    ["Office labor cost", `$${input.hourlyCost}/hour`],
    ["Hours per week — today", `${result.weeklyHoursNow.toFixed(1)} h`],
    ["Hours per week — after", `${result.weeklyHoursAfter.toFixed(1)} h`],
    ["Hours per year — difference", `${Math.round(result.annualHoursSaved)} h`],
    [
      "Estimated annual value of that time",
      `$${Math.round(result.annualCostDifference).toLocaleString("en-US")}`,
    ],
  ];

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-ink-600 hover:text-ink-900 inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          aria-hidden
        />
        {open ? "Hide the numbers" : "Show the numbers"}
      </button>
      {open ? (
        <table className="animate-fade mt-3 w-full border-collapse text-[13px]">
          <caption className="sr-only">
            Inputs and calculated results for the intake time estimate
          </caption>
          <tbody>
            {rows.map(([label, value], i) => (
              <tr key={label} className={cn(i % 2 === 0 && "bg-ink-50")}>
                <th scope="row" className="text-ink-600 py-1.5 pr-3 pl-2 text-left font-normal">
                  {label}
                </th>
                <td className="tnum text-ink-900 py-1.5 pr-2 text-right font-medium">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
