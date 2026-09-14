"use client";

import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/domain/business";
import type { SafetyProtocol } from "@/lib/domain/safety";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Phone, ShieldAlert, TriangleAlert } from "lucide-react";
import * as React from "react";

/**
 * Full-screen safety takeover.
 *
 * Deliberately not a dialog or a banner: when someone tells us they smell gas,
 * the request form is no longer the most important thing on the screen. There
 * is no diagnosis here and no attempt to keep them in the flow — the primary
 * action is a phone call to emergency services.
 */
export function SafetyInterstitial({
  protocol,
  onContinue,
  onBack,
}: {
  protocol: SafetyProtocol;
  onContinue: () => void;
  onBack: () => void;
}) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, [protocol.id]);

  const evacuate = protocol.severity === "evacuate";

  return (
    <div
      className="animate-fade fixed inset-0 z-[80] overflow-y-auto bg-ink-950"
      role="alertdialog"
      aria-labelledby="safety-heading"
      aria-modal="true"
    >
      <div
        className={cn(
          "min-h-full w-full",
          evacuate
            ? "bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(0.478_0.171_27)_0%,oklch(0.158_0.014_265)_62%)]"
            : "bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(0.560_0.122_58)_0%,oklch(0.158_0.014_265)_62%)]",
        )}
      >
        <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "animate-pulse-ring grid size-11 place-items-center rounded-xl border text-white",
                evacuate
                  ? "border-danger-300/40 bg-danger-600/80"
                  : "border-warn-200/40 bg-warn-600/80",
              )}
              style={
                {
                  "--pulse-color": evacuate
                    ? "oklch(0.626 0.205 26 / 0.5)"
                    : "oklch(0.690 0.148 65 / 0.5)",
                } as React.CSSProperties
              }
            >
              {evacuate ? (
                <TriangleAlert className="size-5.5" aria-hidden />
              ) : (
                <ShieldAlert className="size-5.5" aria-hidden />
              )}
            </span>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">
              Stop — this needs emergency help
            </p>
          </div>

          <h1
            id="safety-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 text-[28px] leading-[1.14] font-semibold text-white outline-none sm:text-[34px]"
          >
            {protocol.headline}
          </h1>

          <ol className="mt-7 space-y-3">
            {protocol.steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-3.5 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-[1px]"
              >
                <span className="tnum grid size-6 shrink-0 place-items-center rounded-md bg-white/12 text-[12px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-[14.5px] leading-relaxed text-white/90">{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-7 space-y-2.5">
            {protocol.contacts.map((c) =>
              c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-xl border px-4 py-4 transition-colors",
                    c.primary
                      ? "border-white/25 bg-white text-ink-950 hover:bg-ink-100"
                      : "border-white/15 bg-white/[0.07] text-white hover:bg-white/[0.12]",
                  )}
                >
                  <span>
                    <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase opacity-60">
                      {c.label}
                    </span>
                    <span className="mt-0.5 block font-display text-xl font-semibold">
                      {c.detail}
                    </span>
                  </span>
                  <Phone className="size-5 shrink-0 opacity-70" aria-hidden />
                </a>
              ) : (
                <div
                  key={c.label}
                  className="rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3.5"
                >
                  <span className="block text-[11px] font-semibold tracking-[0.08em] text-white/55 uppercase">
                    {c.label}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-white/80">
                    {c.detail}
                  </span>
                </div>
              ),
            )}
          </div>

          <p className="mt-7 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[13.5px] leading-relaxed text-white/70">
            {protocol.closing}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:items-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={onContinue}
              className="sm:ml-auto"
              block
            >
              I&apos;m safe — finish my request
            </Button>
            <Button size="lg" variant="ghost" onClick={onBack} className="text-white/70 hover:bg-white/10 hover:text-white">
              <ArrowLeft aria-hidden />
              Change my answer
            </Button>
          </div>

          <p className="mt-8 border-t border-white/10 pt-5 text-[11.5px] leading-relaxed text-white/45">
            This is a concept demonstration and not an official {BUSINESS.name} system. It cannot
            contact anyone on your behalf. In a real emergency, call 911 — not a web form.
          </p>
        </div>
      </div>
    </div>
  );
}
