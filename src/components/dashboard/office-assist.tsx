"use client";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { getProvider, isLiveMode, type AssistBundle, type ReplyChannel } from "@/lib/ai";
import { BUSINESS } from "@/lib/domain/business";
import type { ServiceRequest } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { phoneHref, smsHref } from "@/lib/utils/format";
import {
  AlertTriangle,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  Sparkle,
  Wrench,
} from "lucide-react";
import * as React from "react";

type Tab = "call" | "reply" | "tech";

export function OfficeAssist({
  request,
  onMarkContacted,
}: {
  request: ServiceRequest;
  onMarkContacted: () => void;
}) {
  const [tab, setTab] = React.useState<Tab>("call");
  const [channel, setChannel] = React.useState<ReplyChannel>(
    request.customer.contactMethod === "email" ? "email" : "text",
  );
  const [cache, setCache] = React.useState<{ key: string; bundle: AssistBundle } | null>(null);
  const [edited, setEdited] = React.useState<{ key: string; text: string } | null>(null);
  const [nonce, setNonce] = React.useState(0);
  const { push } = useToast();
  const provider = React.useMemo(() => getProvider(), []);

  /*
   * Keyed on the request revision, the channel and a regenerate nonce. Deriving
   * `bundle` and `loading` from whether the cached key still matches keeps the
   * effect to a single subscribe-and-write, with no synchronous state updates.
   */
  const key = `${request.id}:${request.updatedAt}:${channel}:${nonce}`;

  React.useEffect(() => {
    let cancelled = false;
    provider.assist(request, channel).then((result) => {
      if (!cancelled) setCache({ key, bundle: result });
    });
    return () => {
      cancelled = true;
    };
  }, [provider, request, channel, key]);

  const bundle = cache?.key === key ? cache.bundle : null;
  const loading = bundle === null;
  const editedBody = edited?.key === key ? edited.text : null;

  const replyBody = editedBody ?? bundle?.reply.body ?? "";
  const emailText = bundle?.reply.subject
    ? `Subject: ${bundle.reply.subject}\n\n${replyBody}`
    : replyBody;

  return (
    <section
      className="overflow-hidden rounded-xl border border-ink-200 bg-white"
      aria-labelledby="assist-heading"
      data-tour="assist"
    >
      <header className="border-b border-ink-150 bg-gradient-to-b from-ink-50 to-white px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-px grid size-7 shrink-0 place-items-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700">
            <Sparkle className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="assist-heading"
              className="font-display text-[15px] font-semibold text-ink-950"
            >
              Smart office assist
            </h2>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
              {isLiveMode() ? provider.description : "Written from the structured intake answers."}{" "}
              Drafts only — nothing sends on its own.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNonce((n) => n + 1)}
            aria-label="Regenerate drafts"
            className="shrink-0"
          >
            <RefreshCw className={cn(loading && "animate-spin")} aria-hidden />
          </Button>
        </div>

        <div className="mt-3">
          <Segmented
            ariaLabel="Assist output"
            size="sm"
            value={tab}
            onChange={setTab}
            options={[
              { value: "call", label: "Call summary" },
              { value: "reply", label: "Reply draft" },
              { value: "tech", label: "Tech notes" },
            ]}
          />
        </div>
      </header>

      <div className="p-4 sm:p-5">
        {loading || !bundle ? (
          <AssistSkeleton />
        ) : tab === "call" ? (
          <div className="animate-fade space-y-4">
            <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-4">
              <p className="text-[14.5px] leading-relaxed text-ink-800">{bundle.callSummary}</p>
            </div>
            {request.triage.estimateOpportunity.flagged ? (
              <EstimateCallout reason={request.triage.estimateOpportunity.reason} />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={phoneHref(request.customer.phone)}>
                  <PhoneCall aria-hidden />
                  Call {request.customer.name.split(" ")[0]}
                </a>
              </Button>
              <CopyButton value={bundle.callSummary} label="Copy summary" />
              {request.status === "new" ? (
                <Button variant="secondary" size="sm" onClick={onMarkContacted}>
                  <ClipboardList aria-hidden />
                  Mark contacted
                </Button>
              ) : null}
            </div>
          </div>
        ) : tab === "reply" ? (
          <div className="animate-fade space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                ariaLabel="Reply channel"
                size="sm"
                value={channel}
                onChange={setChannel}
                options={[
                  { value: "text", label: "Text" },
                  { value: "email", label: "Email" },
                ]}
              />
              <span className="text-[12px] text-ink-500">
                Customer prefers{" "}
                <span className="font-medium text-ink-700">
                  {request.customer.contactMethod === "phone"
                    ? "a phone call"
                    : request.customer.contactMethod}
                </span>
              </span>
            </div>

            {channel === "email" && bundle.reply.subject ? (
              <div className="rounded-lg border border-ink-200 bg-ink-50/70 px-3.5 py-2.5">
                <p className="text-[10.5px] font-semibold tracking-[0.08em] text-ink-500 uppercase">
                  Subject
                </p>
                <p className="mt-0.5 text-[13.5px] font-medium text-ink-900">
                  {bundle.reply.subject}
                </p>
              </div>
            ) : null}

            <div>
              <label htmlFor="reply-body" className="sr-only">
                Reply draft — edit before sending
              </label>
              <textarea
                id="reply-body"
                value={replyBody}
                onChange={(e) => setEdited({ key, text: e.target.value })}
                rows={channel === "text" ? 5 : 16}
                className="w-full resize-y rounded-lg border border-ink-200 bg-white p-3.5 font-sans text-[13.5px] leading-relaxed text-ink-800 shadow-xs focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
              />
              <p className="mt-1.5 flex items-center justify-between text-[11.5px] text-ink-500">
                <span>Edit anything before you copy it.</span>
                {channel === "text" ? (
                  <span className={cn("tnum", replyBody.length > 320 && "font-medium text-warn-700")}>
                    {replyBody.length} characters
                  </span>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <CopyButton
                value={channel === "email" ? emailText : replyBody}
                label={channel === "email" ? "Copy email" : "Copy text"}
                onCopied={() => push({ tone: "success", title: "Copied to clipboard" })}
              />
              {channel === "email" ? (
                <Button asChild variant="secondary" size="sm">
                  <a
                    href={`mailto:${request.customer.email}?subject=${encodeURIComponent(
                      bundle.reply.subject ?? "",
                    )}&body=${encodeURIComponent(replyBody)}`}
                  >
                    <Mail aria-hidden />
                    Open in email
                  </a>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm">
                  <a href={smsHref(request.customer.phone, replyBody)}>
                    <MessageSquare aria-hidden />
                    Open in messages
                  </a>
                </Button>
              )}
              {request.status === "new" ? (
                <Button variant="ghost" size="sm" onClick={onMarkContacted}>
                  Mark contacted
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <TechNotesPanel bundle={bundle} request={request} />
        )}
      </div>
    </section>
  );
}

function EstimateCallout({ reason }: { reason?: string }) {
  return (
    <div className="rounded-lg border border-ember-200 bg-ember-50/70 p-3.5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ember-900">
        <FileText className="size-4 shrink-0" aria-hidden />
        Possible replacement estimate opportunity
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ember-900/85">{reason}</p>
      <p className="mt-2 text-[11.5px] leading-relaxed text-ember-800/70">
        This is a prompt to ask, not a recommendation. Nothing here says the equipment needs
        replacing — only a technician who has seen it can say that.
      </p>
    </div>
  );
}

function TechNotesPanel({ bundle, request }: { bundle: AssistBundle; request: ServiceRequest }) {
  const notes = bundle.techNotes;
  const plain = [
    `TECHNICIAN PREP — ${request.reference}`,
    ``,
    `Reported issue: ${notes.reportedIssue}`,
    `Equipment: ${notes.equipment}`,
    `Approximate age: ${notes.approximateAge}`,
    `Photos: ${notes.photos}`,
    ``,
    `Symptoms:`,
    ...notes.symptoms.map((s) => `  - ${s}`),
    ``,
    `Safety concerns:`,
    ...notes.safetyConcerns.map((s) => `  - ${s}`),
    ``,
    `Confirm onsite (observations, not a diagnosis):`,
    ...notes.verifyOnsite.map((s) => `  - ${s}`),
    ``,
    `Access:`,
    notes.access,
    ``,
    `${BUSINESS.name} · ${BUSINESS.phone}`,
  ].join("\n");

  const hasSafety = request.safetyFlags.length > 0;

  return (
    <div className="animate-fade space-y-4">
      <dl className="divide-y divide-ink-150 overflow-hidden rounded-lg border border-ink-200">
        <Row label="Reported issue" value={notes.reportedIssue} />
        <Row label="Equipment" value={notes.equipment} />
        <Row label="Approx. age" value={notes.approximateAge} />
        <Row label="Photos" value={notes.photos} />
        <Row label="Symptoms" items={notes.symptoms} />
        <Row label="Safety" items={notes.safetyConcerns} tone={hasSafety ? "alert" : "default"} />
      </dl>

      <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-4">
        <p className="flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.08em] text-ink-600 uppercase">
          <Wrench className="size-3.5" aria-hidden />
          Confirm onsite
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {notes.verifyOnsite.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-700">
              <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-400" />
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-start gap-2 border-t border-ink-200 pt-2.5 text-[11.5px] leading-relaxed text-ink-500">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          Things to check and record, based on what the customer reported. Not a diagnosis — no form
          can diagnose equipment.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={plain} label="Copy prep sheet" />
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <FileText aria-hidden />
          Print
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  items,
  tone = "default",
}: {
  label: string;
  value?: string;
  items?: string[];
  tone?: "default" | "alert";
}) {
  return (
    <div
      className={cn(
        "grid gap-1 px-3.5 py-2.5 sm:grid-cols-[118px_1fr] sm:gap-3",
        tone === "alert" && "bg-danger-50/60",
      )}
    >
      <dt
        className={cn(
          "text-[10.5px] font-semibold tracking-[0.07em] uppercase",
          tone === "alert" ? "text-danger-700" : "text-ink-500",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-[13px] leading-relaxed",
          tone === "alert" ? "font-medium text-danger-800" : "text-ink-800",
        )}
      >
        {value ? value : null}
        {items ? (
          <ul className="space-y-1">
            {items.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "mt-[7px] size-1 shrink-0 rounded-full",
                    tone === "alert" ? "bg-danger-500" : "bg-ink-400",
                  )}
                />
                {s}
              </li>
            ))}
          </ul>
        ) : null}
      </dd>
    </div>
  );
}

function AssistSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Generating drafts">
      <div className="skeleton h-3.5 w-11/12 rounded" />
      <div className="skeleton h-3.5 w-full rounded" />
      <div className="skeleton h-3.5 w-9/12 rounded" />
      <div className="skeleton mt-5 h-9 w-40 rounded-lg" />
      <span className="sr-only">Generating drafts…</span>
    </div>
  );
}
