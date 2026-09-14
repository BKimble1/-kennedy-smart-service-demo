"use client";

import { ConceptNotice } from "@/components/brand/concept-notice";
import { Logo } from "@/components/brand/logo";
import { RequestSummary } from "@/components/shared/request-summary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { SkeletonRows } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { buildSummary } from "@/lib/ai/demo-provider";
import { BUSINESS } from "@/lib/domain/business";
import { primaryProtocol } from "@/lib/domain/safety";
import type { IntakePhoto } from "@/lib/domain/types";
import { useRequest } from "@/lib/store/use-requests";
import { availabilityPhrase, formatAvailability, formatDateTime } from "@/lib/utils/format";
import { processPhoto } from "@/lib/utils/image";
import {
  ArrowRight,
  Check,
  CircleAlert,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Pencil,
  Phone,
  Printer,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function ConfirmationView({ id }: { id: string }) {
  const { request, hydrated, addActivity, update } = useRequest(id);
  const { push } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [extraPhotos, setExtraPhotos] = React.useState<IntakePhoto[]>([]);
  const [saving, setSaving] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const summary = React.useMemo(() => (request ? buildSummary(request) : null), [request]);

  if (!hydrated) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl">
          <SkeletonRows rows={3} />
        </div>
      </Shell>
    );
  }

  if (!request || !summary) {
    return (
      <Shell>
        <div className="animate-rise border-ink-200 mx-auto max-w-md rounded-xl border bg-white p-8 text-center">
          <span className="border-ink-200 bg-ink-50 text-ink-400 mx-auto mb-4 grid size-11 place-items-center rounded-xl border">
            <CircleAlert className="size-5" aria-hidden />
          </span>
          <h1 className="font-display text-xl font-semibold">We couldn&apos;t find {id}</h1>
          <p className="text-ink-600 mt-2 text-[14px] leading-relaxed">
            Requests in this demo live in your own browser, so a link won&apos;t open on a
            different device or after clearing site data.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild block>
              <Link href="/request">Start a new request</Link>
            </Button>
            <Button asChild variant="ghost" block>
              <Link href="/">Back to the overview</Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  const protocol = primaryProtocol(request.safetyFlags);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    const added: IntakePhoto[] = [];
    for (const file of Array.from(list).slice(0, 3)) {
      try {
        added.push(await processPhoto(file, "problem"));
      } catch {
        push({ tone: "error", title: "That image couldn't be added" });
      }
    }
    setExtraPhotos((p) => [...p, ...added]);
  }

  function saveEdit() {
    if (!request) return;
    setSaving(true);
    const parts: string[] = [];
    if (note.trim()) parts.push(note.trim());
    if (extraPhotos.length) parts.push(`${extraPhotos.length} additional photo(s) attached.`);
    addActivity(request.id, {
      kind: "note",
      actor: request.customer.name,
      summary: "Customer updated their request",
      detail: parts.join(" ") || "No changes.",
    });
    if (extraPhotos.length) {
      update(
        request.id,
        { photos: [...request.photos, ...extraPhotos] },
        request.customer.name,
      );
    }
    setSaving(false);
    setEditing(false);
    setNote("");
    setExtraPhotos([]);
    push({ tone: "success", title: "Update added to your request" });
  }

  return (
    <Shell>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="animate-rise border-ok-200 rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-8">
          <span className="animate-pop border-ok-200 bg-ok-50 text-ok-600 mx-auto mb-4 grid size-14 place-items-center rounded-full border-2">
            <Check className="size-7" strokeWidth={2.6} aria-hidden />
          </span>
          <h1 className="font-display text-[28px] leading-tight font-semibold sm:text-[32px]">
            You&apos;re all set.
          </h1>
          <p className="text-ink-600 mx-auto mt-2.5 max-w-md text-[15px] leading-relaxed">
            Your request is with the office. Someone will call you at{" "}
            <span className="text-ink-900 font-medium">{request.customer.phone}</span> to
            confirm a time.
          </p>
          <div className="border-ink-200 bg-ink-50 mt-5 inline-flex items-center gap-2.5 rounded-lg border px-3.5 py-2">
            <FileText className="text-ink-400 size-4" aria-hidden />
            <span className="text-ink-500 text-[11px] font-semibold tracking-[0.08em] uppercase">
              Reference
            </span>
            <span className="text-ink-950 font-mono text-[15px] font-medium">
              {request.reference}
            </span>
          </div>
          <p className="text-ink-500 mt-3 text-[12.5px]">
            Submitted {formatDateTime(request.createdAt)}
          </p>
        </div>

        {protocol ? (
          <div className="animate-rise border-danger-300 bg-danger-50 rounded-xl border p-4 sm:p-5">
            <p className="font-display text-danger-800 flex items-center gap-2 text-[15px] font-semibold">
              <CircleAlert className="size-4.5 shrink-0" aria-hidden />
              Safety first — {protocol.label.toLowerCase()}
            </p>
            <p className="text-danger-900 mt-2 text-[13.5px] leading-relaxed">
              {protocol.headline} If you have not already done so, call 911 before anything
              else. This request does not replace emergency help.
            </p>
            <Button asChild variant="danger" size="sm" className="mt-3.5">
              <a href="tel:911">
                <Phone aria-hidden />
                Call 911
              </a>
            </Button>
          </div>
        ) : null}

        <section className="animate-rise border-ink-200 rounded-xl border bg-white p-5 sm:p-6">
          <h2 className="font-display text-ink-950 text-[15px] font-semibold">
            What happens next
          </h2>
          <ol className="mt-4 space-y-3.5">
            {[
              {
                title: "The office reviews what you sent",
                body: `Everything you answered — including your photos and preferred times — arrives together, so nobody has to call you back for basics.`,
              },
              {
                title: "Someone calls you to confirm",
                body: `You said ${request.customer.contactMethod === "text" ? "a text" : request.customer.contactMethod === "email" ? "email" : "a phone call"} works best. The office is open ${BUSINESS.officeHoursLabel}.`,
              },
              {
                title: "You get a time",
                body:
                  formatAvailability(request.availability) === "No preference given"
                    ? "They'll offer you the earliest slot that works."
                    : `They'll work from what you gave them: ${availabilityPhrase(request.availability)}.`,
              },
            ].map((s, i) => (
              <li key={s.title} className="flex gap-3.5">
                <span className="tnum border-ink-200 bg-ink-50 text-ink-600 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[12px] font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-ink-900 text-[14px] font-medium">{s.title}</p>
                  <p className="text-ink-600 mt-0.5 text-[13.5px] leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <RequestSummary summary={summary} className="animate-rise print-block" />

        <div className="no-print grid gap-2.5 sm:grid-cols-2">
          <Button asChild size="lg" block>
            <a href={BUSINESS.phoneHref}>
              <Phone aria-hidden />
              Call {BUSINESS.phone}
            </a>
          </Button>
          <Button variant="secondary" size="lg" block onClick={() => setEditing(true)}>
            <Pencil aria-hidden />
            Add a note or photo
          </Button>
        </div>

        <div className="no-print border-brand-200 bg-brand-50/50 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-4">
          <div className="min-w-0">
            <p className="text-brand-950 text-[13.5px] font-medium">
              This is the demo — want to see the other side?
            </p>
            <p className="text-brand-800/80 mt-0.5 text-[12.5px]">
              {request.reference} is already at the top of the office inbox.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 bg-white">
            <Link href={`/dashboard/requests/${request.reference}`}>
              <LayoutDashboard aria-hidden />
              Open the dashboard
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={() => window.print()}
            className="text-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
          >
            <Printer className="size-3.5" aria-hidden />
            Print this page
          </button>
          <ConceptNotice />
        </div>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Add to your request"
        description={`Anything you add here goes straight onto ${request.reference} in the office inbox.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              loading={saving}
              disabled={!note.trim() && extraPhotos.length === 0}
            >
              Add to request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="For example: it started making the noise again this morning, and the upstairs is now warm too."
            aria-label="Add a note to your request"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus aria-hidden />
              Add a photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-label="Add photos to your request"
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {extraPhotos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.dataUrl}
                alt={p.name}
                className="border-ink-200 size-12 rounded-lg border object-cover"
              />
            ))}
          </div>
        </div>
      </Modal>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink-50 min-h-dvh">
      <header className="no-print border-ink-200 border-b bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="rounded-md">
            <Logo size="sm" />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/request">New request</Link>
          </Button>
        </div>
      </header>
      <main id="main" className="px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
