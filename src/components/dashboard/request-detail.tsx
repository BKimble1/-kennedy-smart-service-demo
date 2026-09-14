"use client";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { answerRows } from "@/lib/ai/narrate";
import { BUSINESS } from "@/lib/domain/business";
import { URGENCY_LABEL } from "@/lib/domain/catalog";
import { primaryProtocol } from "@/lib/domain/safety";
import type { RequestStatus } from "@/lib/domain/types";
import { PHOTO_KIND_LABEL } from "@/lib/store/photo-placeholders";
import { useRequest } from "@/lib/store/use-requests";
import { cn } from "@/lib/utils/cn";
import {
  formatAvailability,
  formatDateTime,
  formatPhone,
  phoneHref,
  relativeTime,
  smsHref,
} from "@/lib/utils/format";
import {
  ArrowLeft,
  Building2,
  Camera,
  Clock,
  FileQuestion,
  Gauge,
  Hourglass,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  NotebookPen,
  Phone,
  Printer,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { PriorityBadge, StatusBadge, TradeChip } from "./indicators";
import { OfficeAssist } from "./office-assist";
import { StatusControl } from "./status-control";

export function RequestDetail({ id }: { id: string }) {
  const { request, hydrated, update, addActivity } = useRequest(id);
  const { push } = useToast();
  const [lightbox, setLightbox] = React.useState<string | null>(null);
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [note, setNote] = React.useState("");

  if (!hydrated) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={FileQuestion}
          title={`No request matching ${id}`}
          description="It may have been removed by a demo reset, or this link was opened in a different browser."
          action={
            <Button asChild>
              <Link href="/dashboard">Back to the inbox</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const protocol = primaryProtocol(request.safetyFlags);
  const rows = answerRows(request);

  function setStatus(status: RequestStatus) {
    if (!request) return;
    update(request.id, { status });
    push({ tone: "success", title: `Moved to ${status.replace("-", " ")}` });
  }

  return (
    <>
      <PageHeader
        className="print-block"
        title={request.customer.name}
        description={`${request.reference} · submitted ${relativeTime(request.createdAt)} · ${formatDateTime(request.createdAt)}`}
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft aria-hidden />
                Inbox
              </Link>
            </Button>
            <Button asChild size="sm">
              <a href={phoneHref(request.customer.phone)}>
                <Phone aria-hidden />
                {formatPhone(request.customer.phone)}
              </a>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer aria-hidden />
              Print
            </Button>
          </div>
        }
      />

      <div className="px-4 py-5 sm:px-6 lg:px-8">
        {protocol ? (
          <div className="animate-rise border-danger-300 bg-danger-50 mb-5 rounded-xl border-2 p-4 sm:p-5">
            <p className="font-display text-danger-800 flex items-center gap-2 text-[15px] font-semibold">
              <ShieldAlert className="size-5 shrink-0" aria-hidden />
              Safety condition reported at intake — {protocol.label.toLowerCase()}
            </p>
            <p className="text-danger-900 mt-2 text-[13.5px] leading-relaxed">
              The customer was shown emergency guidance before this request was submitted:{" "}
              <span className="font-medium">{protocol.headline}</span> Confirm they are safe and
              that the appropriate emergency service has been contacted before you discuss
              scheduling.
            </p>
          </div>
        ) : null}

        {request.completion === "partial" ? (
          <div className="animate-rise border-warn-300 bg-warn-50 mb-5 rounded-xl border p-4 sm:p-5">
            <p className="font-display text-warn-900 flex items-center gap-2 text-[15px] font-semibold">
              <Hourglass className="size-4.5 shrink-0" aria-hidden />
              This request was never finished
            </p>
            <p className="text-warn-900/90 mt-2 text-[13.5px] leading-relaxed">
              {request.customer.name.split(" ")[0]} got as far as the{" "}
              {request.abandonedAt ?? "contact"} step and left without submitting. Everything
              below had already been entered — the name, the number and the symptoms are real.
              What is missing is photos and preferred times.
            </p>
            <p className="text-warn-900/70 mt-2 text-[12.5px] leading-relaxed">
              On a plain contact form this request would not exist at all.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-5">
          <div className="space-y-4 xl:order-1">
            {/* ---- Overview ------------------------------------------- */}
            <section className="border-ink-200 rounded-xl border bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={request.triage.priority} size="md" />
                <StatusBadge status={request.status} size="md" />
                <TradeChip category={request.category} label={request.categoryLabel} />
                {request.propertyType === "business" ? (
                  <span className="border-ink-200 bg-ink-50 text-ink-600 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium">
                    <Building2 className="size-3" aria-hidden />
                    Commercial
                  </span>
                ) : null}
                {request.customer.returning ? (
                  <span className="border-ok-200 bg-ok-50 text-ok-700 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium">
                    <UserCheck className="size-3" aria-hidden />
                    Returning customer
                  </span>
                ) : null}
                {request.triage.afterHours ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
                    <Moon className="size-3" aria-hidden />
                    Arrived outside office hours
                  </span>
                ) : null}
              </div>

              <h2 className="font-display mt-3.5 text-xl leading-tight font-semibold">
                {request.issueLabel}
              </h2>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Fact
                  icon={Clock}
                  label="Customer urgency"
                  value={URGENCY_LABEL[request.urgency]}
                />
                <Fact
                  icon={Clock}
                  label="Preferred times"
                  value={formatAvailability(request.availability)}
                />
                <Fact
                  icon={MapPin}
                  label="Service address"
                  value={`${request.customer.address1}, ${request.customer.city}, ${request.customer.state} ${request.customer.zip}`}
                />
                <Fact
                  icon={request.customer.contactMethod === "email" ? Mail : Phone}
                  label="Preferred contact"
                  value={
                    request.customer.contactMethod === "email"
                      ? request.customer.email
                      : `${formatPhone(request.customer.phone)} (${request.customer.contactMethod})`
                  }
                />
              </dl>

              <div className="border-ink-150 mt-4 flex flex-wrap gap-2 border-t pt-4">
                <Button asChild size="sm" variant="secondary">
                  <a href={phoneHref(request.customer.phone)}>
                    <Phone aria-hidden />
                    Call
                  </a>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <a href={smsHref(request.customer.phone)}>
                    <MessageSquare aria-hidden />
                    Text
                  </a>
                </Button>
                {request.customer.email ? (
                  <Button asChild size="sm" variant="secondary">
                    <a href={`mailto:${request.customer.email}`}>
                      <Mail aria-hidden />
                      Email
                    </a>
                  </Button>
                ) : null}
                <Button asChild size="sm" variant="ghost">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${request.customer.address1}, ${request.customer.city}, ${request.customer.state} ${request.customer.zip}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <MapPin aria-hidden />
                    Map
                  </a>
                </Button>
              </div>
            </section>

            {/* ---- Why it's ranked here -------------------------------- */}
            <section className="border-ink-200 rounded-xl border bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-ink-950 flex items-center gap-2 text-[15px] font-semibold">
                    <Gauge className="text-ink-400 size-4" aria-hidden />
                    Why it&apos;s ranked here
                  </h2>
                  <p className="text-ink-500 mt-0.5 text-[12px]">
                    Fixed rules, not a model — the same answers always produce the same ranking.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tnum font-display text-ink-950 text-2xl leading-none font-semibold">
                    {request.triage.score}
                  </p>
                  <p className="text-ink-400 text-[10.5px] tracking-wide uppercase">Score</p>
                </div>
              </div>
              <ul className="mt-3.5 space-y-2">
                {request.triage.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="text-ink-700 flex gap-2.5 text-[13.5px] leading-relaxed"
                  >
                    <span
                      aria-hidden
                      className="bg-ink-400 mt-[8px] size-1 shrink-0 rounded-full"
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* ---- Structured answers ---------------------------------- */}
            <section className="border-ink-200 overflow-hidden rounded-xl border bg-white">
              <div className="border-ink-150 border-b px-4 py-3.5 sm:px-5">
                <h2 className="font-display text-ink-950 text-[15px] font-semibold">
                  What the customer told us
                </h2>
                <p className="text-ink-500 mt-0.5 text-[12px]">
                  {rows.length} answers captured at intake — before anyone picked up the phone.
                </p>
              </div>
              <dl className="divide-ink-150 divide-y">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,300px)_1fr] sm:gap-4 sm:px-5"
                  >
                    <dt className="text-ink-500 text-[13px]">{row.prompt}</dt>
                    <dd
                      className={cn(
                        "text-ink-900 text-[13.5px] font-medium",
                        row.isFreeText && "font-normal italic",
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
                {request.notes ? (
                  <div className="bg-ink-50/60 grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,300px)_1fr] sm:gap-4 sm:px-5">
                    <dt className="text-ink-500 text-[13px]">Note from the customer</dt>
                    <dd className="text-ink-900 text-[13.5px] italic">“{request.notes}”</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            {/* ---- Photos ---------------------------------------------- */}
            {request.photos.length ? (
              <section className="border-ink-200 rounded-xl border bg-white p-4 sm:p-5">
                <h2 className="font-display text-ink-950 flex items-center gap-2 text-[15px] font-semibold">
                  <Camera className="text-ink-400 size-4" aria-hidden />
                  Photos ({request.photos.length})
                </h2>
                <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {request.photos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setLightbox(p.dataUrl)}
                      className="group border-ink-200 bg-ink-100 overflow-hidden rounded-lg border text-left transition-all hover:-translate-y-px hover:shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.dataUrl}
                        alt={PHOTO_KIND_LABEL[p.kind]}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <span className="text-ink-600 block px-2.5 py-2 text-[11.5px] font-medium">
                        {PHOTO_KIND_LABEL[p.kind]}
                        {p.placeholder ? (
                          <span className="text-ink-400 ml-1">· demo image</span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ---- Activity -------------------------------------------- */}
            <section className="border-ink-200 rounded-xl border bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-ink-950 text-[15px] font-semibold">
                  Request history
                </h2>
                <Button variant="secondary" size="sm" onClick={() => setNoteOpen(true)}>
                  <NotebookPen aria-hidden />
                  Add note
                </Button>
              </div>
              <ol className="mt-4 space-y-0">
                {[...request.activity].reverse().map((entry, i, arr) => (
                  <li key={entry.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                    {i < arr.length - 1 ? (
                      <span
                        aria-hidden
                        className="bg-ink-200 absolute top-6 bottom-0 left-[11px] w-px"
                      />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 size-[22px] shrink-0 rounded-full border-2 border-white",
                        entry.kind === "submitted"
                          ? "bg-brand-600"
                          : entry.kind === "note"
                            ? "bg-ink-400"
                            : entry.kind === "assign"
                              ? "bg-ember-500"
                              : "bg-ok-500",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-900 text-[13.5px] font-medium">{entry.summary}</p>
                      {entry.detail ? (
                        <p className="text-ink-600 mt-0.5 text-[13px] leading-relaxed">
                          {entry.detail}
                        </p>
                      ) : null}
                      <p className="tnum text-ink-400 mt-1 text-[11.5px]">
                        {entry.actor} · {formatDateTime(entry.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* ---- Right column ------------------------------------------ */}
          <div className="space-y-4 xl:order-2 print:hidden">
            <OfficeAssist
              request={request}
              onMarkContacted={() => {
                update(request.id, { status: "contacted" });
                push({
                  tone: "success",
                  title: "Marked as contacted",
                  description: "It's out of the “needs response” queue.",
                });
              }}
            />
            <StatusControl
              request={request}
              onStatus={setStatus}
              onAssign={(tech) => {
                update(request.id, {
                  assignedTech: tech || undefined,
                  ...(tech && request.status === "scheduled"
                    ? { status: "assigned" as const }
                    : {}),
                });
              }}
            />
            <div className="border-ink-200 text-ink-500 rounded-xl border bg-white p-4 text-[12px] leading-relaxed sm:p-5">
              <p className="text-ink-700 mb-1.5 font-semibold">About this record</p>
              <p>
                Everything above came from one web form. Nothing here was typed by staff. In
                this concept demo the data lives only in your browser and never reaches{" "}
                {BUSINESS.name}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add an office note"
        description="Notes appear in the request history so the next person picking this up has the context."
        footer={
          <>
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!note.trim()}
              onClick={() => {
                addActivity(request.id, {
                  kind: "note",
                  actor: "Office",
                  summary: "Office note added",
                  detail: note.trim(),
                });
                setNote("");
                setNoteOpen(false);
                push({ tone: "success", title: "Note added" });
              }}
            >
              Add note
            </Button>
          </>
        }
      >
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          autoFocus
          placeholder="Called at 9:10, no answer. Left voicemail and texted."
          aria-label="Office note"
        />
      </Modal>

      {lightbox ? (
        <div
          className="animate-fade bg-ink-950/85 fixed inset-0 z-[70] grid place-items-center p-4 backdrop-blur-sm"
          role="dialog"
          aria-label="Photo preview"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Customer photo, enlarged"
            className="animate-pop max-h-full max-w-3xl rounded-xl shadow-xl"
          />
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close photo preview"
            className="absolute top-4 right-4 grid size-9 place-items-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="text-ink-400 mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <dt className="text-ink-500 text-[10.5px] font-semibold tracking-[0.07em] uppercase">
          {label}
        </dt>
        <dd className="text-ink-900 mt-0.5 text-[13.5px] leading-snug">{value}</dd>
      </div>
    </div>
  );
}
