"use client";

import { Button } from "@/components/ui/button";
import {
  TOUR_STEPS,
  getTourServerSnapshot,
  getTourSnapshot,
  subscribeTour,
  writeTour,
} from "@/lib/demo/tour";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, ArrowRight, MousePointerClick, Play, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export function TourBar() {
  const state = React.useSyncExternalStore(
    subscribeTour,
    getTourSnapshot,
    getTourServerSnapshot,
  );
  const router = useRouter();
  const pathname = usePathname();

  const step = TOUR_STEPS[state.index];

  /* Outline whatever this step is pointing at, once the page has painted. */
  React.useEffect(() => {
    if (!state.active || !step?.highlight) return;
    let raf = 0;
    let cleanup: (() => void) | undefined;
    const attempt = (tries: number) => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.highlight}"]`);
      if (el) {
        el.classList.add("tour-spot");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        cleanup = () => el.classList.remove("tour-spot");
      } else if (tries > 0) {
        raf = window.setTimeout(() => attempt(tries - 1), 180);
      }
    };
    attempt(12);
    return () => {
      window.clearTimeout(raf);
      cleanup?.();
    };
  }, [state.active, state.index, step?.highlight, pathname]);

  if (!state.active || !step) return null;

  const total = TOUR_STEPS.length;
  const last = state.index === total - 1;

  function goTo(index: number) {
    const next = TOUR_STEPS[index];
    if (!next) return;
    writeTour({ active: true, index });
    if (next.route && next.route !== pathname) router.push(next.route);
  }

  function stop() {
    writeTour({ active: false, index: 0 });
  }

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[75] flex justify-center p-3 sm:p-5">
      <div className="animate-rise pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-ink-950/97 shadow-pop backdrop-blur-md">
        <div className="flex items-start gap-3.5 p-4 sm:p-5">
          <span className="tnum mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-600 text-[12px] font-semibold text-white">
            {state.index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] leading-tight font-semibold text-white">
              {step.title}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">{step.body}</p>
            {step.action ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-400/25 bg-brand-500/12 px-2 py-1 text-[11.5px] font-medium text-brand-200">
                <MousePointerClick className="size-3" aria-hidden />
                {step.action}
              </p>
            ) : null}
          </div>
          <button
            onClick={stop}
            aria-label="End the guided demo"
            className="-m-1 shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-white/8 bg-white/[0.03] px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-1" aria-hidden>
            {TOUR_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to step ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === state.index
                    ? "w-5 bg-brand-400"
                    : i < state.index
                      ? "w-1.5 bg-white/45"
                      : "w-1.5 bg-white/15 hover:bg-white/30",
                )}
              />
            ))}
          </div>
          <span className="tnum text-[11.5px] text-white/40">
            {state.index + 1} / {total}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => goTo(state.index - 1)}
              disabled={state.index === 0}
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft aria-hidden />
              <span className="hidden sm:inline">Back</span>
            </Button>
            {last ? (
              <Button size="sm" variant="secondary" onClick={stop}>
                Finish
              </Button>
            ) : (
              <Button size="sm" onClick={() => goTo(state.index + 1)}>
                Next
                <ArrowRight aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StartTourButton({
  children = "Start the 90-second demo",
  size = "xl",
}: {
  children?: React.ReactNode;
  size?: "lg" | "xl";
}) {
  const router = useRouter();
  return (
    <Button
      size={size}
      onClick={() => {
        writeTour({ active: true, index: 0 });
        router.push(TOUR_STEPS[0].route ?? "/request");
      }}
    >
      <Play aria-hidden />
      {children}
    </Button>
  );
}
