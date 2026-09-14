"use client";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const button = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:translate-y-px",
    "[&_svg]:shrink-0 [&_svg]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand-700 text-white shadow-sm hover:bg-brand-800 border border-brand-800/60 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.14),var(--shadow-sm)]",
        danger:
          "bg-danger-600 text-white shadow-sm hover:bg-danger-700 border border-danger-700/60 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.16),var(--shadow-sm)]",
        secondary:
          "bg-white text-ink-800 border border-ink-200 shadow-xs hover:bg-ink-50 hover:border-ink-300",
        ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
        subtle: "bg-ink-100 text-ink-800 hover:bg-ink-200/80 border border-transparent",
        outline:
          "bg-transparent text-brand-800 border border-brand-300 hover:bg-brand-50 hover:border-brand-400",
        link: "text-brand-700 underline underline-offset-4 hover:text-brand-900 active:translate-y-0",
      },
      size: {
        xs: "h-7 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-9 rounded-lg px-3 text-[13px] [&_svg]:size-4",
        md: "h-10 rounded-lg px-4 text-sm [&_svg]:size-4",
        lg: "h-12 rounded-xl px-5 text-[15px] [&_svg]:size-[18px]",
        xl: "h-14 rounded-xl px-6 text-base [&_svg]:size-5",
        icon: "size-9 rounded-lg [&_svg]:size-4",
        "icon-sm": "size-7 rounded-md [&_svg]:size-3.5",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, asChild, loading, children, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(button({ variant, size, block }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          <span className="sr-only">Working…</span>
          <span aria-hidden className="opacity-70">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

export { button as buttonVariants };
