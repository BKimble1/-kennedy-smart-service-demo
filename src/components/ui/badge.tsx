import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badge = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border font-medium [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-ink-200 bg-ink-100 text-ink-700",
        brand: "border-brand-200 bg-brand-50 text-brand-800",
        danger: "border-danger-200 bg-danger-50 text-danger-700",
        warn: "border-warn-200 bg-warn-50 text-warn-900",
        ok: "border-ok-200 bg-ok-50 text-ok-700",
        ember: "border-ember-200 bg-ember-50 text-ember-800",
        violet: "border-violet-200 bg-violet-50 text-violet-700",
        outline: "border-ink-300 bg-transparent text-ink-600",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[11px]",
        md: "px-2 py-1 text-[11.5px]",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

export function Badge({
  className,
  tone,
  size,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone, size }), className)} {...props} />;
}
