"use client";

import { ConceptNotice } from "@/components/brand/concept-notice";
import { Logo } from "@/components/brand/logo";
import { RequestSummary } from "@/components/shared/request-summary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { buildSummary } from "@/lib/ai/demo-provider";
import { BUSINESS } from "@/lib/domain/business";
import { SAFETY_QUESTION, URGENCY_OPTIONS } from "@/lib/domain/catalog";
import { SERVICE_CATEGORIES } from "@/lib/domain/catalog";
import { primaryProtocol } from "@/lib/domain/safety";
import type { SafetyFlagId, UrgencyId } from "@/lib/domain/types";
import { previewRequest } from "@/lib/store/compose";
import { useRequests } from "@/lib/store/use-requests";
import { cn } from "@/lib/utils/cn";
import { formatAvailability } from "@/lib/utils/format";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  ImageIcon,
  Lock,
  Phone,
  ShieldQuestion,
  Timer,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AvailabilityStep } from "./availability-step";
import { ContactStep, validateContact, type ContactErrors } from "./contact-step";
import { CATEGORY_ACCENT, CATEGORY_ICON, OptionCard } from "./option-card";
import { PhotoStep } from "./photo-step";
import { SafetyInterstitial } from "./safety-interstitial";
import { StepShell } from "./step-shell";
import { useIntake } from "./use-intake";

const URGENCY_ICON: Record<UrgencyId, typeof Zap> = {
  emergency: Zap,
  today: Timer,
  "next-available": CalendarClock,
  planning: Clock,
};

export function IntakeWizard() {
  const intake = useIntake();
  const { create } = useRequests();
  const router = useRouter();
  const { push } = useToast();

  const [dismissedSafety, setDismissedSafety] = React.useState<SafetyFlagId[]>([]);
  const [contactErrors, setContactErrors] = React.useState<ContactErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const { state, step, steps, index, direction, followUps, safetyFlags, draft } = intake;

  /* Any newly reported safety condition takes over the screen immediately. */
  const shownSafety = safetyFlags.find((f) => !dismissedSafety.includes(f)) ?? null;

  const progress = Math.round(((index + 1) / steps.length) * 100);

  async function submit() {
    if (!draft) return;
    setSubmitting(true);
    /* A beat of latency so the confirmation doesn't feel like a page jump. */
    await new Promise((r) => setTimeout(r, 620));
    const created = create(draft);
    intake.clearDraft();
    push({
      tone: "success",
      title: `Request ${created.reference} sent`,
      description: "It's already showing in the office dashboard.",
    });
    router.push(`/request/${created.reference}`);
  }

  const protocol = shownSafety ? primaryProtocol([shownSafety]) : null;

  return (
    <div className="bg-ink-50 relative flex min-h-dvh flex-col">
      <IntakeHeader progress={progress} onExit={() => router.push("/")} />

      <main id="main" className="flex-1 px-4 pt-6 pb-14 sm:px-6 sm:pt-10">
        {step === "category" ? (
          <StepShell
            stepKey={step}
            direction={direction}
            eyebrow="Step 1 of 8"
            title="What do you need help with?"
            subtitle="Pick the closest match. About a minute, no account, and you can stop at any point."
            footerNote={
              <>
                In a hurry?{" "}
                <a href={BUSINESS.phoneHref} className="text-brand-700 font-medium underline">
                  Call {BUSINESS.phone}
                </a>{" "}
                instead.
              </>
            }
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SERVICE_CATEGORIES.map((c) => (
                <OptionCard
                  key={c.id}
                  size="lg"
                  label={c.label}
                  hint={c.blurb}
                  icon={CATEGORY_ICON[c.icon]}
                  accent={CATEGORY_ACCENT[c.id]}
                  selected={state.category === c.id}
                  onClick={() => {
                    intake.selectCategory(c.id);
                    intake.go(1);
                  }}
                />
              ))}
            </div>
          </StepShell>
        ) : null}

        {step === "issue" && intake.category ? (
          <StepShell
            stepKey={step}
            direction={direction}
            eyebrow={`Step 2 of 8 · ${intake.category.label}`}
            title="What's happening?"
            subtitle="Closest match is fine — this decides which questions we ask next."
            onBack={() => intake.go(-1)}
          >
            <div className="grid gap-2.5">
              {intake.category.issues.map((issue) => (
                <OptionCard
                  key={issue.id}
                  label={issue.label}
                  hint={issue.hint}
                  selected={state.issueId === issue.id}
                  onClick={() => {
                    intake.selectIssue(issue.id);
                    intake.go(1);
                  }}
                />
              ))}
            </div>
          </StepShell>
        ) : null}

        {step.startsWith("q:")
          ? (() => {
              const questionId = step.slice(2);
              const question =
                followUps.find((q) => q.id === questionId) ??
                (questionId === SAFETY_QUESTION.id ? SAFETY_QUESTION : null);
              if (!question) return null;
              const current = state.answers[question.id] ?? { valueIds: [] as string[] };
              const isSafety = question.id === SAFETY_QUESTION.id;
              const qIndex = followUps.findIndex((q) => q.id === question.id);
              const answered =
                question.type === "text"
                  ? Boolean(current.freeText?.trim())
                  : current.valueIds.length > 0;

              return (
                <StepShell
                  stepKey={step}
                  direction={direction}
                  eyebrow={`Step 3 of 8 · Question ${qIndex + 1} of ${followUps.length}`}
                  title={question.prompt}
                  subtitle={question.helper}
                  onBack={() => intake.go(-1)}
                  onNext={
                    question.type === "single" && !isSafety ? undefined : () => intake.go(1)
                  }
                  nextDisabled={
                    question.type === "text"
                      ? !question.optional && !answered
                      : isSafety
                        ? !answered
                        : false
                  }
                  nextLabel={
                    isSafety ? "Continue" : question.optional && !answered ? "Skip" : "Continue"
                  }
                >
                  {question.type === "text" ? (
                    <Textarea
                      value={current.freeText ?? ""}
                      onChange={(e) => intake.setAnswer(question.id, [], e.target.value)}
                      placeholder={question.placeholder}
                      rows={5}
                      maxLength={800}
                      autoFocus
                    />
                  ) : (
                    <div className="grid gap-2.5">
                      {question.options?.map((option) => {
                        const selected = current.valueIds.includes(option.id);
                        return (
                          <OptionCard
                            key={option.id}
                            label={option.label}
                            hint={option.hint}
                            danger={Boolean(option.safety)}
                            multi={question.type === "multi"}
                            selected={selected}
                            onClick={() => {
                              if (question.type === "single") {
                                intake.setAnswer(question.id, [option.id]);
                                if (!option.safety) intake.go(1);
                              } else {
                                let next: string[];
                                if (option.exclusive) {
                                  next = selected ? [] : [option.id];
                                } else {
                                  const withoutExclusive = current.valueIds.filter(
                                    (id) =>
                                      !question.options?.find((o) => o.id === id)?.exclusive,
                                  );
                                  next = selected
                                    ? withoutExclusive.filter((id) => id !== option.id)
                                    : [...withoutExclusive, option.id];
                                }
                                intake.setAnswer(question.id, next);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {question.optional && question.type === "single" ? (
                    <button
                      type="button"
                      onClick={() => intake.go(1)}
                      className="text-ink-500 hover:text-ink-800 mt-4 inline-flex items-center gap-1 text-[13px] font-medium underline underline-offset-4 transition-colors"
                    >
                      I don&apos;t know — skip this
                      <ChevronRight className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                </StepShell>
              );
            })()
          : null}

        {step === "urgency" ? (
          <StepShell
            stepKey={step}
            direction={direction}
            eyebrow="Step 4 of 8"
            title="How soon do you need someone?"
            subtitle="This helps the office sort today's calls. Be honest — it works better for everyone."
            onBack={() => intake.go(-1)}
          >
            <div className="grid gap-2.5">
              {URGENCY_OPTIONS.map((u) => (
                <OptionCard
                  key={u.id}
                  size="lg"
                  label={u.label}
                  hint={u.hint}
                  icon={URGENCY_ICON[u.id]}
                  danger={u.id === "emergency"}
                  selected={state.urgency === u.id}
                  onClick={() => {
                    intake.update({ urgency: u.id });
                    intake.go(1);
                  }}
                />
              ))}
            </div>
            <div className="border-ink-200 mt-4 flex items-start gap-2.5 rounded-lg border bg-white px-3.5 py-3">
              <ShieldQuestion className="text-ink-400 mt-px size-4 shrink-0" aria-hidden />
              <p className="text-ink-600 text-[12.5px] leading-relaxed">
                If anyone is in danger right now — gas, smoke, carbon monoxide or flooding you
                can&apos;t stop — call 911 first. This form can&apos;t help with that.
              </p>
            </div>
          </StepShell>
        ) : null}

        {step === "contact" ? (
          <StepShell
            stepKey={step}
            direction={direction}
            eyebrow="Step 5 of 8"
            title="Where are we headed?"
            subtitle="The office needs this before they can put you on the schedule."
            onBack={() => intake.go(-1)}
            onNext={() => {
              const errors = validateContact(state.customer);
              setContactErrors(errors);
              if (Object.keys(errors).length === 0) intake.go(1);
              else {
                document
                  .querySelector('[aria-invalid="true"]')
                  ?.scrollIntoView({ block: "center", behavior: "smooth" });
              }
            }}
            footerNote={
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3" aria-hidden />
                In this demo nothing leaves your browser.
              </span>
            }
          >
            <ContactStep
              value={state.customer}
              onChange={(customer) => {
                intake.update({ customer });
                if (Object.keys(contactErrors).length)
                  setContactErrors(validateContact(customer));
              }}
              propertyType={state.propertyType}
              onPropertyType={(propertyType) => intake.update({ propertyType })}
              notes={state.notes}
              onNotes={(notes) => intake.update({ notes })}
              errors={contactErrors}
            />
          </StepShell>
        ) : null}

        {step === "photos" ? (
          <StepShell
            stepKey={step}
            direction={direction}
            eyebrow="Step 6 of 8 · Optional"
            title="Photos help more than you'd think"
            subtitle="A shot of the model plate often means the right part is on the truck the first time."
            onBack={() => intake.go(-1)}
            onNext={() => intake.go(1)}
            nextLabel={state.photos.length ? "Continue" : "Skip photos"}
          >
            <PhotoStep photos={state.photos} onChange={(photos) => intake.update({ photos })} />
          </StepShell>
        ) : null}

        {step === "availability" ? (
          <StepShell
            stepKey={step}
            direction={direction}
            eyebrow="Step 7 of 8"
            title="When works for you?"
            subtitle="Pick anything that works. The office will confirm an actual time with you."
            onBack={() => intake.go(-1)}
            onNext={() => intake.go(1)}
            nextDisabled={state.availability.some((a) => a.windows.length === 0)}
          >
            <AvailabilityStep
              value={state.availability}
              onChange={(availability) => intake.update({ availability })}
            />
          </StepShell>
        ) : null}

        {step === "review" && draft ? (
          <StepShell
            stepKey={step}
            direction={direction}
            wide
            eyebrow="Step 8 of 8"
            title="Here's what we'll send"
            subtitle="Check it over. Anything you change here is what the office sees."
            onBack={() => intake.go(-1)}
          >
            <ReviewPanel
              intake={intake}
              submitting={submitting}
              onSubmit={() => void submit()}
            />
          </StepShell>
        ) : null}
      </main>

      <footer className="no-print border-ink-200 border-t bg-white/70 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-ink-400 text-[11.5px]">
            {BUSINESS.name} · {BUSINESS.serviceAreaLabel}
          </p>
          <ConceptNotice />
        </div>
      </footer>

      {protocol ? (
        <SafetyInterstitial
          protocol={protocol}
          onContinue={() => setDismissedSafety((d) => [...d, protocol.id])}
          onBack={() => {
            /* Clear the answer that raised the flag, then stay on this step. */
            for (const q of [...followUps, SAFETY_QUESTION]) {
              const answer = state.answers[q.id];
              if (!answer) continue;
              const raised = answer.valueIds.filter(
                (id) => q.options?.find((o) => o.id === id)?.safety === protocol.id,
              );
              if (raised.length) {
                intake.setAnswer(
                  q.id,
                  answer.valueIds.filter((id) => !raised.includes(id)),
                );
              }
            }
            setDismissedSafety((d) => d.filter((f) => f !== protocol.id));
          }}
        />
      ) : null}
    </div>
  );
}

function IntakeHeader({ progress, onExit }: { progress: number; onExit: () => void }) {
  return (
    <header className="no-print border-ink-200 sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={onExit}
          className="text-ink-500 hover:bg-ink-100 hover:text-ink-900 -ml-1.5 rounded-lg p-1.5 transition-colors sm:hidden"
          aria-label="Leave the request form"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <Link href="/" className="rounded-md">
          <Logo size="sm" />
        </Link>
        <a
          href={BUSINESS.phoneHref}
          className="border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50 ml-auto inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[12.5px] font-medium transition-colors"
        >
          <Phone className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{BUSINESS.phone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
      <div className="bg-ink-150 h-[3px] w-full">
        <div
          className="bg-brand-600 h-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Request progress"
        />
      </div>
    </header>
  );
}

function ReviewPanel({
  intake,
  submitting,
  onSubmit,
}: {
  intake: ReturnType<typeof useIntake>;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { draft, state } = intake;
  const preview = React.useMemo(() => (draft ? previewRequest(draft) : null), [draft]);
  const summary = React.useMemo(() => (preview ? buildSummary(preview) : null), [preview]);
  if (!preview || !summary) return null;

  const edits: { label: string; target: Parameters<typeof intake.jumpTo>[0]; value: string }[] =
    [
      { label: "Service", target: "category", value: preview.categoryLabel },
      { label: "Issue", target: "issue", value: preview.issueLabel },
      { label: "Contact", target: "contact", value: state.customer.name || "Not set" },
      { label: "Photos", target: "photos", value: `${state.photos.length} attached` },
      {
        label: "Availability",
        target: "availability",
        value: formatAvailability(preview.availability),
      },
    ];

  return (
    <div className="space-y-5">
      <RequestSummary summary={summary} />

      <div className="border-ink-200 rounded-xl border bg-white p-4 sm:p-5">
        <p className="text-ink-500 mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase">
          Need to change something?
        </p>
        <div className="flex flex-wrap gap-2">
          {edits.map((e) => (
            <button
              key={e.label}
              type="button"
              onClick={() => intake.jumpTo(e.target)}
              className="group border-ink-200 text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900 inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[12.5px] transition-colors"
            >
              <span className="font-medium">{e.label}</span>
              <span className="text-ink-400 group-hover:text-brand-600">·</span>
              <span className="text-ink-500 group-hover:text-brand-700 max-w-[140px] truncate">
                {e.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {state.photos.length > 0 ? (
        <div className="border-ink-200 text-ink-600 flex items-center gap-2.5 rounded-lg border bg-white px-4 py-3 text-[13px]">
          <ImageIcon className="text-ink-400 size-4 shrink-0" aria-hidden />
          {state.photos.length} photo{state.photos.length === 1 ? "" : "s"} will be attached to
          this request.
        </div>
      ) : null}

      <Button size="xl" block loading={submitting} onClick={onSubmit}>
        {submitting ? "Sending your request" : "Send this to Kennedy's"}
        {!submitting ? <CheckCircle2 aria-hidden /> : null}
      </Button>

      <p className="text-ink-500 text-center text-[12.5px] leading-relaxed">
        The office is open {BUSINESS.officeHoursLabel}. If this can&apos;t wait, call{" "}
        <a href={BUSINESS.phoneHref} className="text-brand-700 font-medium underline">
          {BUSINESS.phone}
        </a>
        .
      </p>

      <div className={cn("flex justify-center pt-1")}>
        <ConceptNotice />
      </div>
    </div>
  );
}
