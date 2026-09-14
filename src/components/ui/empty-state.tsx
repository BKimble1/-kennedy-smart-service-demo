import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-ink-300 flex flex-col items-center justify-center rounded-xl border border-dashed bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="border-ink-200 bg-ink-50 text-ink-400 mb-4 grid size-11 place-items-center rounded-xl border">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="font-display text-ink-900 text-[15px] font-semibold">{title}</p>
      {description ? (
        <p className="text-ink-500 mt-1.5 max-w-sm text-[13px] leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
