import { getCategory, getIssue } from "@/lib/domain/catalog";
import { collectSignals, runTriage } from "@/lib/domain/triage";
import type {
  ActivityEntry,
  IntakeDraft,
  PartialIntake,
  ServiceRequest,
} from "@/lib/domain/types";
import { shortId } from "@/lib/utils/id";

/**
 * Turns an intake draft into a full request record. Shared by the store (when
 * the customer submits) and by the review screen (to preview exactly what the
 * office will receive) so the two can never drift apart.
 */
export function composeRequest(
  draft: IntakeDraft,
  options: {
    id: string;
    reference: string;
    now: Date;
    completion?: "complete" | "partial";
    abandonedAt?: string;
  },
): ServiceRequest {
  const { id, reference, now, completion = "complete", abandonedAt } = options;
  const category = getCategory(draft.category);
  const issue = getIssue(draft.category, draft.issueId);

  const activity: ActivityEntry[] = [
    {
      id: shortId("act"),
      at: now.toISOString(),
      kind: "submitted",
      actor: draft.customer.name || "Customer",
      summary:
        completion === "partial"
          ? "Customer entered their details but did not finish"
          : "Request submitted through the website",
      detail:
        completion === "partial"
          ? `Reached the ${abandonedAt ?? "contact"} step. ${category.label} — ${issue?.label ?? draft.issueId}`
          : `${category.label} — ${issue?.label ?? draft.issueId}`,
    },
  ];
  if (draft.safetyFlags.length > 0) {
    activity.push({
      id: shortId("act"),
      at: now.toISOString(),
      kind: "note",
      actor: "System",
      summary: "Safety guidance shown to customer before submission",
      detail: "Customer was directed to emergency services before completing the request.",
    });
  }

  return {
    id,
    reference,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    channel: "web",
    propertyType: draft.propertyType,
    category: draft.category,
    categoryLabel: category.label,
    issueId: draft.issueId,
    issueLabel: issue?.label ?? draft.issueId,
    urgency: draft.urgency,
    answers: draft.answers,
    signals: collectSignals(draft.category, draft.issueId, draft.answers, draft.propertyType),
    safetyFlags: draft.safetyFlags,
    photos: draft.photos,
    availability: draft.availability,
    notes: draft.notes,
    customer: draft.customer,
    status: "new",
    triage: runTriage({
      category: draft.category,
      issueId: draft.issueId,
      urgency: draft.urgency,
      answers: draft.answers,
      safetyFlags: draft.safetyFlags,
      propertyType: draft.propertyType,
      submittedAt: now,
    }),
    activity,
    demoCreated: true,
    completion,
    abandonedAt,
  };
}

/** Turns a mid-flow capture into a request record the office can work. */
export function composePartial(
  partial: PartialIntake,
  options: { id: string; reference: string; now: Date },
): ServiceRequest {
  return composeRequest(
    {
      propertyType: partial.propertyType,
      category: partial.category,
      issueId: partial.issueId,
      urgency: partial.urgency,
      answers: partial.answers,
      safetyFlags: partial.safetyFlags,
      photos: [],
      availability: [],
      notes: partial.notes,
      customer: partial.customer,
    },
    { ...options, completion: "partial", abandonedAt: partial.reachedStep },
  );
}

/** A throwaway record used to render the pre-submit review screen. */
export function previewRequest(draft: IntakeDraft, now = new Date()): ServiceRequest {
  return composeRequest(draft, { id: "preview", reference: "KSD-••••", now });
}
