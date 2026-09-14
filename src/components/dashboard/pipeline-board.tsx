"use client";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { buildOneLine } from "@/lib/ai/demo-provider";
import type { RequestStatus, ServiceRequest } from "@/lib/domain/types";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/store/types";
import { useRequests } from "@/lib/store/use-requests";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Camera, GripVertical, Info, MoveRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { PriorityBadge, TradeAvatar } from "./indicators";

const COLUMN_TINT: Record<RequestStatus, string> = {
  new: "border-t-brand-500",
  contacted: "border-t-violet-600",
  scheduled: "border-t-warn-500",
  assigned: "border-t-ember-500",
  "estimate-sent": "border-t-violet-600",
  completed: "border-t-ok-500",
  closed: "border-t-ink-400",
};

export function PipelineBoard() {
  const { requests, hydrated, update } = useRequests();
  const { push } = useToast();
  const [dragging, setDragging] = React.useState<ServiceRequest | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byStatus = React.useMemo(() => {
    const map = new Map<RequestStatus, ServiceRequest[]>();
    for (const s of STATUS_ORDER) map.set(s, []);
    for (const r of requests) map.get(r.status)?.push(r);
    for (const [, list] of map) {
      list.sort((a, b) => b.triage.score - a.triage.score || b.createdAt.localeCompare(a.createdAt));
    }
    return map;
  }, [requests]);

  function onDragStart(event: DragStartEvent) {
    setDragging(requests.find((r) => r.id === event.active.id) ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    const target = event.over?.id as RequestStatus | undefined;
    const id = event.active.id as string;
    if (!target) return;
    const request = requests.find((r) => r.id === id);
    if (!request || request.status === target) return;
    update(id, { status: target });
    push({
      tone: "success",
      title: `${request.customer.name} → ${STATUS_LABEL[target]}`,
    });
  }

  function moveBy(request: ServiceRequest, delta: number) {
    const i = STATUS_ORDER.indexOf(request.status);
    const next = STATUS_ORDER[Math.max(0, Math.min(STATUS_ORDER.length - 1, i + delta))];
    if (next === request.status) return;
    update(request.id, { status: next });
    push({ tone: "success", title: `${request.customer.name} → ${STATUS_LABEL[next]}` });
  }

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Drag a request between stages, or use the arrow on each card. Every move is written to the request history."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard">Back to inbox</Link>
          </Button>
        }
      />

      {!hydrated ? (
        <div className="flex gap-3 overflow-hidden p-4 sm:p-6 lg:p-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-[280px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="scrollarea flex gap-3 overflow-x-auto px-4 py-5 sm:px-6 lg:px-8">
            {STATUS_ORDER.map((status) => (
              <Column
                key={status}
                status={status}
                requests={byStatus.get(status) ?? []}
                onMove={moveBy}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {dragging ? <Card request={dragging} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <p className="flex items-center gap-2 px-4 pb-8 text-[12px] text-ink-500 sm:px-6 lg:px-8">
        <Info className="size-3.5 shrink-0" aria-hidden />
        Cards are ordered by triage score inside each stage, so the most urgent work is always at
        the top of the column.
      </p>
    </>
  );
}

function Column({
  status,
  requests,
  onMove,
}: {
  status: RequestStatus;
  requests: ServiceRequest[];
  onMove: (r: ServiceRequest, delta: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[270px] shrink-0 flex-col rounded-xl border border-t-[3px] bg-ink-150/50 transition-colors sm:w-[290px]",
        COLUMN_TINT[status],
        isOver ? "border-brand-400 bg-brand-50/70" : "border-ink-200",
      )}
      aria-label={`${STATUS_LABEL[status]} — ${requests.length} requests`}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 py-3">
        <h2 className="text-[12.5px] font-semibold text-ink-800">{STATUS_LABEL[status]}</h2>
        <span className="tnum rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-ink-600 ring-1 ring-ink-200">
          {requests.length}
        </span>
      </header>
      <div className="flex-1 space-y-2 px-2 pb-2.5">
        {requests.length === 0 ? (
          <p
            className={cn(
              "rounded-lg border border-dashed px-3 py-6 text-center text-[12px] transition-colors",
              isOver ? "border-brand-300 text-brand-700" : "border-ink-300 text-ink-400",
            )}
          >
            {isOver ? "Drop here" : "Nothing here"}
          </p>
        ) : (
          requests.map((r) => <DraggableCard key={r.id} request={r} onMove={onMove} />)
        )}
      </div>
    </section>
  );
}

function DraggableCard({
  request,
  onMove,
}: {
  request: ServiceRequest;
  onMove: (r: ServiceRequest, delta: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: request.id });
  return (
    <div ref={setNodeRef} className={cn(isDragging && "opacity-30")}>
      <Card request={request} dragHandle={{ ...attributes, ...listeners }} onMove={onMove} />
    </div>
  );
}

function Card({
  request,
  dragHandle,
  overlay,
  onMove,
}: {
  request: ServiceRequest;
  dragHandle?: Record<string, unknown>;
  overlay?: boolean;
  onMove?: (r: ServiceRequest, delta: number) => void;
}) {
  const oneLine = React.useMemo(() => buildOneLine(request), [request]);
  return (
    <article
      className={cn(
        "group rounded-lg border bg-white p-2.5 transition-shadow",
        request.triage.priority === "emergency" ? "border-danger-200" : "border-ink-200",
        overlay ? "rotate-2 shadow-pop" : "shadow-xs hover:shadow-md",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...dragHandle}
          aria-label={`Drag ${request.customer.name}'s request`}
          className="-ml-1 cursor-grab rounded p-0.5 text-ink-300 transition-colors hover:bg-ink-100 hover:text-ink-600 active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
        <TradeAvatar category={request.category} size="sm" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/requests/${request.reference}`}
            className="block truncate text-[13.5px] font-semibold text-ink-950 hover:underline"
          >
            {request.customer.name}
          </Link>
          <p className="truncate text-[11.5px] text-ink-500">
            {request.customer.city} · {relativeTime(request.createdAt)}
          </p>
        </div>
        {onMove ? (
          <button
            onClick={() => onMove(request, 1)}
            aria-label={`Move ${request.customer.name} to the next stage`}
            className="rounded p-1 text-ink-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-ink-100 hover:text-ink-700 focus-visible:opacity-100"
          >
            <MoveRight className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-[12.5px] leading-snug text-ink-700">{oneLine}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <PriorityBadge priority={request.triage.priority} showIcon={false} />
        {request.safetyFlags.length ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-danger-300 bg-danger-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-danger-800">
            <ShieldAlert className="size-2.5" aria-hidden />
            Safety
          </span>
        ) : null}
        {request.photos.length ? (
          <span className="tnum inline-flex items-center gap-1 rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10.5px] text-ink-600">
            <Camera className="size-2.5" aria-hidden />
            {request.photos.length}
          </span>
        ) : null}
        {request.assignedTech ? (
          <span className="ml-auto text-[10.5px] font-medium text-ink-500">
            {request.assignedTech}
          </span>
        ) : null}
      </div>
    </article>
  );
}
