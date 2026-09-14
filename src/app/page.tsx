import { ConceptNotice, ConceptRibbon } from "@/components/brand/concept-notice";
import { Logo, LogoDark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { BUSINESS, CONCEPT_NOTICE, PRODUCT } from "@/lib/domain/business";
import {
  ArrowRight,
  Camera,
  ClipboardList,
  Clock,
  LayoutDashboard,
  ListChecks,
  Play,
  ShieldAlert,
  Smartphone,
  Sparkle,
} from "lucide-react";
import Link from "next/link";

const PREVIEW = [
  {
    name: "Denise Ahlgren",
    line: "Leaking pipe · water running through a ceiling, shutoff not found",
    tag: "Emergency",
    tone: "danger" as const,
    time: "11m",
  },
  {
    name: "Sarah Whitcomb",
    line: "Blowing warm air · runs but isn't cold, 10–15 yr system, 2 photos",
    tag: "High",
    tone: "warn" as const,
    time: "37m",
  },
  {
    name: "Priya Raman",
    line: "Water heater · runs out fast, asked about replacement",
    tag: "Estimate",
    tone: "ember" as const,
    time: "3h",
  },
];

const TONE_CLASS = {
  danger: "border-danger-400/40 bg-danger-500/15 text-danger-200",
  warn: "border-warn-400/40 bg-warn-500/15 text-warn-200",
  ember: "border-ember-400/40 bg-ember-500/15 text-ember-200",
};

export default function Home() {
  return (
    <div className="min-h-dvh bg-ink-50">
      <ConceptRibbon />

      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard/impact">Business impact</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/demo">
                <Play aria-hidden />
                90-second demo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ---- Hero ------------------------------------------------------ */}
        <section className="texture-grid relative overflow-hidden bg-ink-950">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(110%_70%_at_80%_-10%,oklch(0.372_0.085_249)_0%,transparent_58%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pt-24 lg:pb-36">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase">
                Concept demonstration
              </p>
              <h1 className="mt-5 font-display text-[38px] leading-[1.06] font-semibold text-white sm:text-[52px]">
                Every service request,
                <br />
                ready to dispatch.
              </h1>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/70 sm:text-[17px]">
                A replacement for the generic contact form: the customer answers a handful of
                questions about what&apos;s actually happening, and the office receives a triaged,
                structured request with photos, address and availability already attached.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="xl" className="shadow-lg">
                  <Link href="/demo">
                    <Play aria-hidden />
                    Start the 90-second demo
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="secondary"
                  className="border-white/20 bg-white/[0.08] text-white hover:border-white/30 hover:bg-white/[0.14]"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard aria-hidden />
                    Open the dashboard
                  </Link>
                </Button>
              </div>

              <p className="mt-5 text-[12.5px] text-white/45">
                Nothing to install. No account. Everything runs in your browser.
              </p>
            </div>

            {/* Decorative inbox preview — mirrors the real seeded data. */}
            <div aria-hidden className="relative select-none">
              <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-3 shadow-2xl backdrop-blur-[2px] sm:p-4">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold tracking-[0.08em] text-white/50 uppercase">
                    Office inbox
                  </span>
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10.5px] font-medium text-white/60">
                    15 open
                  </span>
                </div>
                <div className="space-y-2">
                  {PREVIEW.map((p, i) => (
                    <div
                      key={p.name}
                      style={{ animationDelay: `${180 + i * 110}ms` }}
                      className="animate-rise rounded-xl border border-white/10 bg-ink-900/70 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold text-white">
                          {p.name}
                        </span>
                        <span
                          className={`ml-auto shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${TONE_CLASS[p.tone]}`}
                        >
                          {p.tag}
                        </span>
                        <span className="shrink-0 text-[11px] text-white/40">{p.time}</span>
                      </div>
                      <p className="mt-1 truncate text-[12.5px] text-white/55">{p.line}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="animate-rise absolute -bottom-16 -left-4 hidden rounded-xl border border-white/12 bg-ink-900 p-3.5 shadow-xl lg:block xl:-bottom-14 xl:-left-14"
                style={{ animationDelay: "560ms" }}
              >
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wide text-brand-300 uppercase">
                  <Sparkle className="size-3" />
                  Call summary
                </p>
                <p className="mt-1 max-w-[248px] text-[12px] leading-relaxed text-white/65">
                  “Sarah Whitcomb in Marion submitted a cooling request: the system runs but the air
                  isn&apos;t cold…”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Two sides -------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-2">
            <SideCard
              icon={Smartphone}
              eyebrow="Customer side"
              title="A request that takes a minute"
              body="Pick the trade, pick what's happening, answer two to four follow-ups that change based on the answer, add photos if you have them, and say when you're free. No subject line. No blank message box."
              href="/request"
              cta="Try the customer experience"
              points={[
                "Questions adapt to the issue — a leak and a furnace noise aren't asked the same things",
                "Gas, carbon monoxide, smoke or flooding stops the form and points to emergency services",
                "A clean summary to check before anything is sent",
              ]}
            />
            <SideCard
              icon={LayoutDashboard}
              eyebrow="Office side"
              title="An inbox that already knows what matters"
              body="Requests arrive triaged and sorted, with the reasons shown. Open one and the call summary, the reply draft and the technician prep sheet are already written from what the customer answered."
              href="/dashboard"
              cta="Open the office dashboard"
              points={[
                "Emergencies and estimate conversations surface without anyone reading every message",
                "Drafts to copy — nothing is ever sent automatically",
                "A drag-and-drop pipeline from New through to Completed",
              ]}
              dark
            />
          </div>
        </section>

        {/* ---- What's inside ---------------------------------------------- */}
        <section className="border-y border-ink-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <h2 className="font-display text-[24px] leading-tight font-semibold sm:text-[28px]">
              What&apos;s actually in here
            </h2>
            <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-ink-600">
              This is a working application, not a slide deck. Everything below is clickable.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: ListChecks,
                  title: "Adaptive question trees",
                  body: "Six trades, thirty-plus issues, and a shared bank of follow-up questions selected by what the customer reported.",
                },
                {
                  icon: Clock,
                  title: "Deterministic triage",
                  body: "A rules engine ranks every request and shows its reasoning in plain English. No black box deciding whose heat comes first.",
                },
                {
                  icon: ShieldAlert,
                  title: "Safety interlocks",
                  body: "Six conditions stop intake and show an emergency protocol. The product never attempts to diagnose equipment.",
                },
                {
                  icon: ClipboardList,
                  title: "Smart office assist",
                  body: "Call summary, customer reply draft and technician prep sheet, generated from the structured answers.",
                },
                {
                  icon: Camera,
                  title: "Photos that survive the trip",
                  body: "Equipment, problem area and model plate, resized in the browser and attached to the request.",
                },
                {
                  icon: Sparkle,
                  title: "No API bill to run it",
                  body: "The drafting engine is deterministic by default. A hosted model can be plugged in later behind the same interface.",
                },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <article key={f.title} className="rounded-xl border border-ink-200 bg-ink-50/60 p-5">
                    <span className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <h3 className="mt-3.5 font-display text-[15px] font-semibold text-ink-950">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{f.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- Closing ---------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="rounded-2xl border border-ink-200 bg-white p-6 text-center sm:p-10">
            <h2 className="font-display text-[24px] leading-tight font-semibold sm:text-[28px]">
              Ninety seconds is enough to see it
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-[15px] leading-relaxed text-ink-600">
              The guided demo walks a request from a homeowner&apos;s phone through to a scheduled
              job on the office board, one short step at a time.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/demo">
                  <Play aria-hidden />
                  Start the guided demo
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/request">Skip it — just show me the form</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 bg-ink-950">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <LogoDark />
              <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-white/50">
                {CONCEPT_NOTICE.long}
              </p>
            </div>
            <div className="text-[12.5px] leading-relaxed text-white/50">
              <p className="font-medium text-white/70">{BUSINESS.name}</p>
              <p className="mt-1">
                {BUSINESS.address}, {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
              </p>
              <p>{BUSINESS.phone}</p>
              <p className="mt-1">{BUSINESS.serviceAreaLabel}</p>
              <a
                href={BUSINESS.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-block text-white/60 underline underline-offset-4 hover:text-white"
              >
                {BUSINESS.website}
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="text-[11.5px] text-white/35">
              {PRODUCT.fullName} · an independent concept build
            </p>
            <ConceptNotice variant="dark" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function SideCard({
  icon: Icon,
  eyebrow,
  title,
  body,
  href,
  cta,
  points,
  dark,
}: {
  icon: typeof Smartphone;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  points: string[];
  dark?: boolean;
}) {
  return (
    <article
      className={
        dark
          ? "flex flex-col rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"
          : "flex flex-col rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"
      }
    >
      <span className="grid size-10 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-[11px] font-semibold tracking-[0.09em] text-brand-700 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[22px] leading-tight font-semibold">{title}</h2>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-600">{body}</p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-700">
            <span aria-hidden className="mt-[8px] size-1 shrink-0 rounded-full bg-brand-500" />
            {p}
          </li>
        ))}
      </ul>
      <Button asChild size="lg" className="mt-6 self-start">
        <Link href={href}>
          {cta}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </article>
  );
}
