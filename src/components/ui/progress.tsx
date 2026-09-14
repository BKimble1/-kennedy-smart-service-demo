import { cn } from "@/lib/utils/cn";

export function Progress({
  value,
  max = 100,
  className,
  label,
  tone = "brand",
}: {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  tone?: "brand" | "danger" | "ok" | "ember";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    brand: "bg-brand-600",
    danger: "bg-danger-600",
    ok: "bg-ok-600",
    ember: "bg-ember-600",
  }[tone];
  return (
    <div
      className={cn("bg-ink-200 h-1.5 w-full overflow-hidden rounded-full", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
