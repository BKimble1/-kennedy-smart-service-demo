"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import type { RequestStatus, ServiceRequest } from "@/lib/domain/types";
import { STATUS_LABEL, STATUS_ORDER, TECHNICIANS } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";
import { Check, UserCog } from "lucide-react";
import { STATUS_ICON } from "./indicators";

const PIPELINE: RequestStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "assigned",
  "estimate-sent",
  "completed",
];

export function StatusControl({
  request,
  onStatus,
  onAssign,
}: {
  request: ServiceRequest;
  onStatus: (s: RequestStatus) => void;
  onAssign: (tech: string) => void;
}) {
  const currentIndex = PIPELINE.indexOf(request.status);
  const closed = request.status === "closed";

  return (
    <section className="rounded-xl border border-ink-200 bg-white p-4 sm:p-5" data-tour="status">
      <h2 className="font-display text-[15px] font-semibold text-ink-950">Status</h2>

      <ol className="mt-4 space-y-1" aria-label="Request pipeline">
        {PIPELINE.map((status, i) => {
          const done = !closed && i < currentIndex;
          const active = !closed && i === currentIndex;
          const Icon = STATUS_ICON[status];
          return (
            <li key={status}>
              <button
                onClick={() => onStatus(status)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                  active ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-ink-100",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    done
                      ? "border-ok-500 bg-ok-500 text-white"
                      : active
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-ink-250 bg-white text-ink-400 group-hover:border-ink-400",
                  )}
                  style={
                    !done && !active
                      ? { borderColor: "var(--color-ink-300)" }
                      : undefined
                  }
                >
                  {done ? (
                    <Check className="size-3" strokeWidth={3.2} aria-hidden />
                  ) : (
                    <Icon className="size-3" aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[13.5px]",
                    active
                      ? "font-semibold text-brand-900"
                      : done
                        ? "font-medium text-ink-700"
                        : "text-ink-500",
                  )}
                >
                  {STATUS_LABEL[status]}
                </span>
                {active ? (
                  <span className="ml-auto text-[10.5px] font-semibold tracking-wide text-brand-700 uppercase">
                    Current
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 space-y-3 border-t border-ink-150 pt-4">
        <div>
          <label
            htmlFor="assign-tech"
            className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700"
          >
            <UserCog className="size-3.5 text-ink-400" aria-hidden />
            Assigned technician
          </label>
          <Select
            id="assign-tech"
            value={request.assignedTech ?? ""}
            onChange={(e) => onAssign(e.target.value)}
          >
            <option value="">Unassigned</option>
            {TECHNICIANS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        {!closed ? (
          <Button
            variant="ghost"
            size="sm"
            block
            onClick={() => onStatus("closed")}
            className="text-ink-500 hover:text-danger-700"
          >
            Mark lost / cancelled
          </Button>
        ) : (
          <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-center">
            <p className="text-[12.5px] font-medium text-ink-600">
              {STATUS_LABEL[request.status]}
            </p>
            <Button variant="link" size="xs" onClick={() => onStatus("new")} className="mt-0.5">
              Reopen
            </Button>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
        Statuses follow {STATUS_ORDER.length} stages. Click any stage to move the request there.
      </p>
    </section>
  );
}
