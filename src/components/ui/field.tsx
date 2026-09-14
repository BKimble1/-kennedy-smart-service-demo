"use client";

import { cn } from "@/lib/utils/cn";
import { AlertCircle } from "lucide-react";
import * as React from "react";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("text-ink-800 block text-[13px] font-medium", className)} {...props}>
      {children}
      {required ? <span className="text-danger-600 ml-0.5">*</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 disabled:bg-ink-100 disabled:text-ink-500 sm:text-sm";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        control,
        invalid && "border-danger-500 ring-danger-500/10 hover:border-danger-500 ring-4",
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        control,
        "min-h-[96px] resize-y leading-relaxed",
        invalid && "border-danger-500 ring-danger-500/10 ring-4",
        className,
      )}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(control, "cursor-pointer appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="text-ink-500 pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {hint ? <p className="text-ink-500 text-xs leading-relaxed">{hint}</p> : null}
      {children}
      {error ? (
        <p
          className="text-danger-600 flex items-center gap-1.5 text-xs font-medium"
          role="alert"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
