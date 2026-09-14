"use client";

import { ConceptNotice } from "@/components/brand/concept-notice";
import { LogoDark } from "@/components/brand/logo";
import { StartTourButton } from "@/components/demo/tour-bar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { TOUR_STEPS } from "@/lib/demo/tour";
import { SEED_COUNT } from "@/lib/store/seed";
import { useRequests } from "@/lib/store/use-requests";
import { ArrowRight, LayoutDashboard, RotateCcw, Smartphone, Timer } from "lucide-react";
import Link from "next/link";

export function DemoLauncher() {
  const { reset, requests } = useRequests();
  const { push } = useToast();

  return (
    <div className="texture-grid bg-ink-950 min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_60%_at_50%_0%,oklch(0.372_0.085_249)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href="/" className="inline-block rounded-md">
          <LogoDark />
        </Link>

        <div className="mt-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase">
            <Timer className="size-3" aria-hidden />
            About 90 seconds
          </p>
          <h1 className="font-display mt-5 text-[34px] leading-[1.1] font-semibold text-white sm:text-[42px]">
            Follow one service request
            <br />
            from a phone to the schedule.
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/65">
            A bar at the bottom of the screen tells you what to click next, one step at a time.
            You can skip it whenever you like — nothing in the app depends on it.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StartTourButton />
            <Button
              variant="secondary"
              size="xl"
              className="border-white/20 bg-white/[0.08] text-white hover:border-white/30 hover:bg-white/[0.14]"
              onClick={() => {
                reset();
                push({
                  tone: "success",
                  title: "Demo data reset",
                  description: `The inbox is back to its ${SEED_COUNT} seeded requests.`,
                });
              }}
            >
              <RotateCcw aria-hidden />
              Reset the demo data
            </Button>
          </div>
          <p className="mt-4 text-[12.5px] text-white/40">
            {requests.length > 0
              ? `${requests.length} requests currently in this browser's inbox.`
              : "Loading the inbox…"}
          </p>
        </div>

        <ol className="mt-12 space-y-2">
          {TOUR_STEPS.map((s, i) => (
            <li
              key={s.id}
              className="flex gap-3.5 rounded-xl border border-white/8 bg-white/[0.04] p-4"
            >
              <span className="tnum grid size-6 shrink-0 place-items-center rounded-md bg-white/10 text-[12px] font-semibold text-white/75">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-white">{s.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-white/55">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
          <Button
            asChild
            variant="ghost"
            className="text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Link href="/request">
              <Smartphone aria-hidden />
              Just open the customer form
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden />
              Just open the dashboard
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <ConceptNotice variant="dark" />
        </div>
      </div>
    </div>
  );
}
