import { BUSINESS, PRODUCT } from "@/lib/domain/business";
import { cn } from "@/lib/utils/cn";

/**
 * Product mark. The tile is split on the diagonal — cool on one side, warm on
 * the other — which is the whole business in one glyph: cooling and heating.
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <clipPath id="ksd-tile">
          <rect width="32" height="32" rx="8.5" />
        </clipPath>
        <linearGradient id="ksd-cool" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.372 0.085 249)" />
          <stop offset="100%" stopColor="oklch(0.224 0.050 252)" />
        </linearGradient>
      </defs>
      <g clipPath="url(#ksd-tile)">
        <rect width="32" height="32" fill="url(#ksd-cool)" />
        <path d="M32 0 L32 32 L10 32 Z" fill="oklch(0.606 0.145 42)" opacity="0.92" />
        <path
          d="M10.5 8 L10.5 24 M10.5 16.4 L20 8 M13.6 14 L21.2 24"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  size = "md",
  showProduct = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showProduct?: boolean;
}) {
  const mark = size === "sm" ? 26 : size === "lg" ? 40 : 32;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={mark} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-[-0.02em] text-ink-950",
            size === "sm" ? "text-[13px]" : size === "lg" ? "text-lg" : "text-[15px]",
          )}
        >
          {BUSINESS.shortName}
        </span>
        {showProduct ? (
          <span
            className={cn(
              "mt-0.5 font-medium tracking-[0.08em] text-ink-500 uppercase",
              size === "sm" ? "text-[8.5px]" : "text-[9.5px]",
            )}
          >
            {PRODUCT.name}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function LogoDark({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const mark = size === "sm" ? 26 : 32;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={mark} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-white">
          {BUSINESS.shortName}
        </span>
        <span className="mt-0.5 text-[9.5px] font-medium tracking-[0.08em] text-white/55 uppercase">
          {PRODUCT.name}
        </span>
      </span>
    </span>
  );
}
