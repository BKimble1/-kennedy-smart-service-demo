"use client";

import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABEL } from "@/lib/domain/triage";
import type { RequestStatus, ServiceCategoryId, TriagePriority } from "@/lib/domain/types";
import { STATUS_LABEL } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";
import {
  CircleCheck,
  CircleDashed,
  CircleDot,
  Droplets,
  FileText,
  Flame,
  type LucideIcon,
  Package,
  PhoneCall,
  Snowflake,
  UserCheck,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

const PRIORITY_TONE: Record<TriagePriority, "danger" | "warn" | "brand" | "neutral"> = {
  emergency: "danger",
  high: "warn",
  standard: "brand",
  planned: "neutral",
};

export function PriorityBadge({
  priority,
  showIcon = true,
  size = "sm",
}: {
  priority: TriagePriority;
  showIcon?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <Badge tone={PRIORITY_TONE[priority]} size={size}>
      {showIcon && priority === "emergency" ? <Zap aria-hidden /> : null}
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}

export const STATUS_ICON: Record<RequestStatus, LucideIcon> = {
  new: CircleDot,
  contacted: PhoneCall,
  scheduled: CircleDashed,
  assigned: UserCheck,
  "estimate-sent": FileText,
  completed: CircleCheck,
  closed: XCircle,
};

const STATUS_TONE: Record<RequestStatus, "brand" | "violet" | "warn" | "ok" | "neutral" | "ember"> = {
  new: "brand",
  contacted: "violet",
  scheduled: "warn",
  assigned: "ember",
  "estimate-sent": "violet",
  completed: "ok",
  closed: "neutral",
};

export function StatusBadge({ status, size = "sm" }: { status: RequestStatus; size?: "sm" | "md" }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge tone={STATUS_TONE[status]} size={size}>
      <Icon aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export const TRADE_ICON: Record<ServiceCategoryId, LucideIcon> = {
  cooling: Snowflake,
  heating: Flame,
  plumbing: Droplets,
  maintenance: Wrench,
  install: Package,
  other: CircleDot,
};

export const TRADE_TINT: Record<ServiceCategoryId, string> = {
  cooling: "border-brand-100 bg-brand-50 text-brand-700",
  heating: "border-ember-100 bg-ember-50 text-ember-700",
  plumbing: "border-brand-100 bg-brand-50 text-brand-700",
  maintenance: "border-ok-100 bg-ok-50 text-ok-700",
  install: "border-violet-100 bg-violet-50 text-violet-700",
  other: "border-ink-200 bg-ink-100 text-ink-600",
};

export function TradeChip({
  category,
  label,
  className,
}: {
  category: ServiceCategoryId;
  label: string;
  className?: string;
}) {
  const Icon = TRADE_ICON[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        TRADE_TINT[category],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  );
}

export function TradeAvatar({
  category,
  size = "md",
}: {
  category: ServiceCategoryId;
  size?: "sm" | "md";
}) {
  const Icon = TRADE_ICON[category];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg border",
        size === "sm" ? "size-8" : "size-10",
        TRADE_TINT[category],
      )}
    >
      <Icon className={size === "sm" ? "size-4" : "size-[18px]"} aria-hidden />
    </span>
  );
}
