"use client";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { BUSINESS } from "@/lib/domain/business";
import { computeMetrics } from "@/lib/dashboard/metrics";
import { useRequests } from "@/lib/store/use-requests";
import { cn } from "@/lib/utils/cn";
import {
  Camera,
  ClipboardCheck,
  FileText,
  Info,
  ListChecks,
  Moon,
  ShieldCheck,
  Sparkle,
  Timer,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {
  ComparisonBars,
  NumbersTable,
  calculate,
  type CalcInputs,
} from "./impact-calculator";

const BENEFITS = [
  {
    icon: Timer,
    title: "Faster intake",
    body: "The customer provides the useful information before anyone picks up the phone. The first call starts from facts instead of questions.",
  },
  {
    icon: ListChecks,
    title: "Better lead organization",
    body: "Emergencies and replacement conversations are visible at a glance instead of buried in a list of identical-looking messages.",
  },
  {
    icon: Camera,
    title: "Less back-and-forth",
    body: "Photos, availability, address and problem detail all arrive together, so fewer calls are needed just to find out what is going on.",
  },
  {
    icon: Moon,
    title: "After-hours lead capture",
    body: `The office is open ${BUSINESS.officeHoursLabel}. A request submitted at 11pm arrives complete and is ready to work first thing.`,
  },
  {
    icon: ClipboardCheck,
    title: "Technician preparation",
    body: "A structured prep sheet — reported symptoms, approximate equipment age, photos, what to confirm onsite — can go to the truck before it leaves.",
  },
  {
    icon: ShieldCheck,
    title: "A safety path that isn't a form",
    body: "Gas odor, carbon monoxide, smoke and uncontrolled water stop the intake and direct the customer to emergency services. No diagnosis is attempted.",
  },
];

const DEFAULTS: CalcInputs = {
  inquiriesPerWeek: 35,
  minutesNow: 7,
  minutesAfter: 3,
  hourlyCost: 24,
};

export function ImpactView() {
  const { requests, hydrated } = useRequests();
  const [input, setInput] = React.useState<CalcInputs>(DEFAULTS);
  const result = React.useMemo(() => calculate(input), [input]);
  const metrics = React.useMemo(() => computeMetrics(requests), [requests]);

  const set = <K extends keyof CalcInputs>(key: K, raw: string) => {
    const n = Number(raw.replace(/[^\d.]/g, ""));
    setInput((i) => ({ ...i, [key]: Number.isFinite(n) ? n : 0 }));
  };

  return (
    <>
      <PageHeader
        title="Business impact"
        description="What structured intake changes, and a way to put your own numbers against it."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard">Back to inbox</Link>
          </Button>
        }
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---- What changes ------------------------------------------ */}
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <article
                key={b.title}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-rise rounded-xl border border-ink-200 bg-white p-5"
              >
                <span className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-ink-50 text-ink-600">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <h2 className="mt-3.5 font-display text-[15px] font-semibold text-ink-950">
                  {b.title}
                </h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{b.body}</p>
              </article>
            );
          })}
        </section>

        {/* ---- Calculator --------------------------------------------- */}
        <section className="grid gap-4 rounded-xl border border-ink-200 bg-white p-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8 lg:p-7">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-950">
              Put your own numbers in
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">
              These are your figures, not ours. Change anything that looks wrong — the estimate
              updates as you type.
            </p>

            <div className="mt-5 space-y-4">
              <NumberField
                id="calc-inquiries"
                label="Service inquiries a week"
                hint="Calls, form submissions and messages combined"
                value={input.inquiriesPerWeek}
                onChange={(v) => set("inquiriesPerWeek", v)}
                suffix="per week"
              />
              <NumberField
                id="calc-minutes-now"
                label="Minutes spent collecting details"
                hint="Per inquiry, on the phone, before anything is scheduled"
                value={input.minutesNow}
                onChange={(v) => set("minutesNow", v)}
                suffix="minutes"
              />
              <NumberField
                id="calc-minutes-after"
                label="Minutes you'd still spend"
                hint="With the details already in front of you. This one is an assumption — adjust it."
                value={input.minutesAfter}
                onChange={(v) => set("minutesAfter", v)}
                suffix="minutes"
                accent
              />
              <NumberField
                id="calc-hourly"
                label="Office labor cost an hour"
                hint="Wage plus whatever you carry on top of it"
                value={input.hourlyCost}
                onChange={(v) => set("hourlyCost", v)}
                prefix="$"
                suffix="per hour"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setInput(DEFAULTS)}
              disabled={JSON.stringify(input) === JSON.stringify(DEFAULTS)}
            >
              Reset to defaults
            </Button>
          </div>

          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <Stat
                label="Intake time each week"
                value={`${result.weeklyHoursNow.toFixed(1)}`}
                unit="hours"
                sub="At your current numbers"
              />
              <Stat
                label="Hours a year that shifts"
                value={`${Math.round(result.annualHoursSaved)}`}
                unit="hours"
                sub="Difference between the two bars"
                emphasis
              />
              <Stat
                label="Estimated value of that time"
                value={`$${Math.round(result.annualCostDifference).toLocaleString("en-US")}`}
                unit="a year"
                sub="Admin time only — not revenue"
              />
            </div>

            <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50/60 p-5">
              <ComparisonBars input={input} result={result} />
              <NumbersTable input={input} result={result} />
            </div>

            <div className="mt-4 flex gap-2.5 rounded-lg border border-warn-200 bg-warn-50/70 p-3.5">
              <Info className="mt-px size-4 shrink-0 text-warn-700" aria-hidden />
              <div className="text-[12.5px] leading-relaxed text-warn-900">
                <p className="font-semibold">This is an estimate, and only of admin time.</p>
                <p className="mt-1 text-warn-900/85">
                  It multiplies numbers you entered. It is not a revenue projection, it does not
                  assume you win more work, and it does not assume anyone is let go — the realistic
                  outcome is the same people spending less of the day retyping what a customer
                  already knows. Treat the second bar as a hypothesis to test, not a promise.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Grounded in this inbox --------------------------------- */}
        <section className="rounded-xl border border-ink-200 bg-white p-5 lg:p-7">
          <h2 className="font-display text-lg font-semibold text-ink-950">
            What the demo inbox actually contains
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-600">
            Not a projection — a count of the {requests.length} seeded requests you can open right
            now. Realistic for a contractor of this size, and the same counts you would be reading
            from real traffic.
          </p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            <InboxFact
              icon={Moon}
              value={hydrated ? metrics.afterHours : 0}
              total={requests.length}
              label="arrived outside office hours"
            />
            <InboxFact
              icon={Camera}
              value={hydrated ? metrics.withPhotos : 0}
              total={requests.length}
              label="came with photos attached"
            />
            <InboxFact
              icon={FileText}
              value={hydrated ? metrics.estimates : 0}
              total={requests.length}
              label="flagged as estimate conversations"
            />
            <InboxFact
              icon={Sparkle}
              value={hydrated ? metrics.emergency : 0}
              total={requests.length}
              label="ranked emergency and surfaced first"
            />
          </div>
        </section>

        {/* ---- What this does not claim ------------------------------- */}
        <section className="rounded-xl border border-ink-200 bg-white p-5 lg:p-7">
          <h2 className="font-display text-lg font-semibold text-ink-950">
            What this does not claim
          </h2>
          <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
            {[
              "That you will get more leads. Nothing here markets the business — it organizes requests that already arrive.",
              "That it can diagnose equipment. It collects what the customer can see and hands it to a technician.",
              "That it replaces a phone call. The office still calls; it just starts the call already knowing the situation.",
              "That every customer will use it. Some people will always want to dial the number, and they should.",
              "That the second bar is guaranteed. It is your assumption, and it should be measured against the first month of real use.",
              "That it is affiliated with Kennedy's Inc. This is an independent concept build, shown without their involvement.",
            ].map((t) => (
              <li
                key={t}
                className="flex gap-2.5 rounded-lg border border-ink-150 bg-ink-50/50 p-3.5 text-[13px] leading-relaxed text-ink-700"
              >
                <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-400" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  accent,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-800">
        {label}
      </label>
      <p className="mt-0.5 mb-1.5 text-[11.5px] leading-relaxed text-ink-500">{hint}</p>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] text-ink-500">
            {prefix}
          </span>
        ) : null}
        <Input
          id={id}
          inputMode="numeric"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "tnum pr-20 font-display text-[17px] font-semibold",
            prefix && "pl-7",
            accent && "border-brand-300 bg-brand-50/40",
          )}
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[12px] text-ink-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  sub,
  emphasis,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        emphasis ? "border-brand-200 bg-brand-50/60" : "border-ink-200 bg-white",
      )}
    >
      <p className="text-[11px] font-medium tracking-[0.04em] text-ink-500 uppercase">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "tnum font-display text-[28px] leading-none font-semibold",
            emphasis ? "text-brand-800" : "text-ink-950",
          )}
        >
          {value}
        </span>
        <span className="text-[12.5px] text-ink-500">{unit}</span>
      </p>
      <p className="mt-1.5 text-[11.5px] leading-snug text-ink-500">{sub}</p>
    </div>
  );
}

function InboxFact({
  icon: Icon,
  value,
  total,
  label,
}: {
  icon: typeof Moon;
  value: number;
  total: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4">
      <span className="grid size-8 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600">
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="tnum mt-3 font-display text-[22px] leading-none font-semibold text-ink-950">
        {value}
        <span className="text-[15px] font-medium text-ink-400"> / {total}</span>
      </p>
      <p className="mt-1.5 text-[12.5px] leading-snug text-ink-600">{label}</p>
    </div>
  );
}
