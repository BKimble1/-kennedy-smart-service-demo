"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";

export function StepShell({
  eyebrow,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  nextIcon = true,
  footerNote,
  direction = 1,
  stepKey,
  wide,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextIcon?: boolean;
  footerNote?: React.ReactNode;
  direction?: 1 | -1;
  stepKey: string;
  wide?: boolean;
}) {
  return (
    <div
      key={stepKey}
      className={cn(
        "mx-auto w-full",
        wide ? "max-w-3xl" : "max-w-xl",
        direction === 1 ? "animate-rise" : "animate-fade",
      )}
    >
      <header className="mb-5 sm:mb-6">
        {eyebrow ? (
          <p className="text-brand-700 mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[26px] leading-[1.15] font-semibold sm:text-[30px]">{title}</h1>
        {subtitle ? (
          <p className="text-ink-600 mt-2.5 text-[15px] leading-relaxed">{subtitle}</p>
        ) : null}
      </header>

      <div>{children}</div>

      {onBack || onNext ? (
        <div className="mt-7 flex items-center gap-3 sm:mt-8">
          {onBack ? (
            <Button variant="ghost" size="lg" onClick={onBack}>
              <ArrowLeft aria-hidden />
              Back
            </Button>
          ) : null}
          {onNext ? (
            <Button
              size="lg"
              onClick={onNext}
              disabled={nextDisabled}
              className="ml-auto min-w-[140px]"
            >
              {nextLabel}
              {nextIcon ? <ArrowRight aria-hidden /> : null}
            </Button>
          ) : null}
        </div>
      ) : null}

      {footerNote ? (
        <p className="text-ink-500 mt-5 text-center text-[12.5px] leading-relaxed">
          {footerNote}
        </p>
      ) : null}
    </div>
  );
}
