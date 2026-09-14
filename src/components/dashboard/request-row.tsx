"use client";

import { buildOneLine } from "@/lib/ai/demo-provider";
import { URGENCY_LABEL } from "@/lib/domain/catalog";
import type { ServiceRequest } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { formatAvailability, relativeTime } from "@/lib/utils/format";
import {
  Building2,
  Camera,
  FileText,
  MapPin,
  Moon,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { PriorityBadge, StatusBadge, TradeAvatar } from "./indicators";

export function RequestRow({
  request,
  index = 0,
  highlight,
}: {
  request: ServiceRequest;
  index?: number;
  highlight?: boolean;
}) {
  const oneLine = React.useMemo(() => buildOneLine(request), [request]);
  const emergency = request.triage.priority === "emergency";

  return (
    <Link
      href={`/dashboard/requests/${request.reference}`}
      style={{ animationDelay: `${Math.min(index, 10) * 28}ms` }}
      className={cn(
        "animate-rise group relative block rounded-xl border bg-white p-3.5 transition-all duration-150 hover:-translate-y-px hover:shadow-md sm:p-4",
        emergency ? "border-danger-200" : "border-ink-200 hover:border-ink-300",
        highlight && "ring-2 ring-brand-500/50 ring-offset-2 ring-offset-ink-100",
      )}
    >
      {emergency ? (
        <span
          aria-hidden
          className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-danger-500"
        />
      ) : null}

      <div className="flex items-start gap-3">
        <TradeAvatar category={request.category} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-[15px] font-semibold text-ink-950">
              {request.customer.name}
            </span>
            {request.propertyType === "business" ? (
              <Building2 className="size-3.5 shrink-0 text-ink-400" aria-label="Commercial property" />
            ) : null}
            {request.customer.returning ? (
              <UserCheck className="size-3.5 shrink-0 text-ok-600" aria-label="Returning customer" />
            ) : null}
            <span className="font-mono text-[11px] text-ink-400">{request.reference}</span>
          </div>

          <p className="mt-1 text-[13.5px] leading-snug text-ink-700">
            <span className="font-medium text-ink-900">{request.issueLabel}</span>
            <span className="text-ink-400"> · </span>
            <span className="text-ink-600">{oneLine}</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={request.triage.priority} />
            <StatusBadge status={request.status} />
            {request.safetyFlags.length ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-danger-300 bg-danger-100 px-1.5 py-0.5 text-[11px] font-semibold text-danger-800">
                <ShieldAlert className="size-3" aria-hidden />
                Safety reported
              </span>
            ) : null}
            {request.triage.estimateOpportunity.flagged ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-ember-200 bg-ember-50 px-1.5 py-0.5 text-[11px] font-medium text-ember-800">
                <FileText className="size-3" aria-hidden />
                Estimate
              </span>
            ) : null}
            {request.photos.length ? (
              <span className="tnum inline-flex items-center gap-1 rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">
                <Camera className="size-3" aria-hidden />
                {request.photos.length}
              </span>
            ) : null}
            {request.triage.afterHours ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
                <Moon className="size-3" aria-hidden />
                After hours
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {request.customer.city}, {request.customer.state}
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Asked for: {URGENCY_LABEL[request.urgency]}</span>
            <span className="hidden sm:inline">·</span>
            <span className="truncate">{formatAvailability(request.availability)}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="tnum text-[12px] font-medium whitespace-nowrap text-ink-500">
            {relativeTime(request.createdAt)}
          </p>
          {request.assignedTech ? (
            <p className="mt-1 text-[11px] whitespace-nowrap text-ink-400">
              {request.assignedTech}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
