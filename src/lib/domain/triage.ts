import { getIssue, URGENCY_OPTIONS, QUESTION_BANK } from "./catalog";
import { BUSINESS } from "./business";
import type {
  EstimateOpportunity,
  IntakeAnswer,
  PropertyType,
  RequestSignal,
  ServiceCategoryId,
  TriagePriority,
  TriageResult,
  UrgencyId,
} from "./types";

/**
 * Deterministic triage.
 *
 * This is intentionally a rules engine, not a model. The office has to be able
 * to trust the ordering of its own inbox, and "the model said so" is not a
 * defensible answer when a no-heat call gets buried. Every point added here
 * also produces a human-readable reason, shown in the UI.
 */

export interface TriageInput {
  category: ServiceCategoryId;
  issueId: string;
  urgency: UrgencyId;
  answers: IntakeAnswer[];
  safetyFlags: string[];
  propertyType: PropertyType;
  /** Submission time — injected so tests and seeds are reproducible. */
  submittedAt: Date;
}

const URGENCY_WEIGHT: Record<UrgencyId, number> = Object.fromEntries(
  URGENCY_OPTIONS.map((u) => [u.id, u.weight]),
) as Record<UrgencyId, number>;

/** Business office hours, used only to mark after-hours arrivals. */
export function isAfterHours(at: Date): boolean {
  const day = at.getDay();
  const hour = at.getHours();
  if (day === 0 || day === 6) return true;
  return hour < BUSINESS.officeHours.openHour || hour >= BUSINESS.officeHours.closeHour;
}

/** Collect the machine-readable signals every answer contributed. */
export function collectSignals(
  category: ServiceCategoryId,
  issueId: string,
  answers: IntakeAnswer[],
  propertyType: PropertyType,
): RequestSignal[] {
  const out = new Set<RequestSignal>();
  getIssue(category, issueId)?.signals?.forEach((s) => out.add(s));
  if (propertyType === "business") out.add("business-property");
  if (category === "install") out.add("replacement-intent");

  for (const answer of answers) {
    const question = QUESTION_BANK[answer.questionId];
    if (!question?.options) continue;
    for (const id of answer.valueIds) {
      question.options.find((o) => o.id === id)?.signals?.forEach((s) => out.add(s));
    }
  }
  return [...out];
}

interface ScoredReason {
  points: number;
  reason: string;
}

export function runTriage(input: TriageInput): TriageResult {
  const { category, issueId, urgency, answers, safetyFlags, propertyType, submittedAt } = input;
  const signals = collectSignals(category, issueId, answers, propertyType);
  const afterHours = isAfterHours(submittedAt);
  const scored: ScoredReason[] = [];

  /* Safety short-circuits everything else. */
  if (safetyFlags.length > 0) {
    return {
      priority: "emergency",
      score: 100,
      reasons: [
        "Customer reported a safety condition during intake — safety guidance was shown.",
      ],
      estimateOpportunity: { flagged: false },
      comfortRisk: signals.includes("no-conditioning"),
      waterRisk: signals.includes("active-water"),
      afterHours,
    };
  }

  /* Base weight of the issue the customer picked. */
  const issue = getIssue(category, issueId);
  if (issue?.weight) {
    scored.push({
      points: issue.weight,
      reason: `Reported issue: ${issue.label.toLowerCase()}.`,
    });
  }

  /* What the customer told us about urgency. */
  const urgencyPoints = URGENCY_WEIGHT[urgency] ?? 0;
  if (urgencyPoints > 0) {
    const label = URGENCY_OPTIONS.find((u) => u.id === urgency)?.label ?? urgency;
    scored.push({ points: urgencyPoints, reason: `Customer selected “${label}”.` });
  }

  /* Every weighted answer option. */
  for (const answer of answers) {
    const question = QUESTION_BANK[answer.questionId];
    if (!question?.options) continue;
    for (let i = 0; i < answer.valueIds.length; i++) {
      const option = question.options.find((o) => o.id === answer.valueIds[i]);
      if (option?.weight) {
        scored.push({
          points: option.weight,
          reason: `${question.prompt} — “${option.label}”.`,
        });
      }
    }
  }

  /* Cross-cutting conditions the office cares about most. */
  const comfortRisk = signals.includes("no-conditioning") || signals.includes("no-water");
  const waterRisk = signals.includes("active-water");

  if (waterRisk) {
    scored.push({
      points: 6,
      reason: "Water is escaping — property damage risk while it waits.",
    });
  }
  if (signals.includes("no-water")) {
    scored.push({ points: 10, reason: "Building has no water." });
  }
  if (signals.includes("no-conditioning") && signals.includes("whole-home")) {
    scored.push({ points: 8, reason: "Whole building is without conditioned air." });
  }
  if (propertyType === "business") {
    scored.push({ points: 8, reason: "Commercial property — downtime affects the business." });
  }
  if (signals.includes("repeat-repair")) {
    scored.push({
      points: 4,
      reason: "Recent service on the same equipment — may be a callback.",
    });
  }

  const raw = scored.reduce((sum, s) => sum + s.points, 0);
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  /*
   * Thresholds are tuned so "Emergency" stays rare enough to mean something. An
   * inbox where four of five rows are red is no more useful than one with no
   * ranking at all, so a request only reaches Emergency when the customer said
   * so themselves, or when the answers are overwhelming on their own.
   */
  let priority: TriagePriority;
  if (urgency === "emergency" && raw >= 25) priority = "emergency";
  else if (raw >= 78) priority = "emergency";
  else if (raw >= 34) priority = "high";
  else if (raw >= 14) priority = "standard";
  else priority = "planned";

  /* The customer's own read on urgency caps how far a request can climb. */
  if (urgency === "planning") {
    priority = raw >= 34 ? "standard" : "planned";
  } else if (urgency === "next-available" && priority === "emergency") {
    priority = "high";
  }

  const reasons = scored
    .slice()
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)
    .map((s) => s.reason);

  if (reasons.length === 0) {
    reasons.push("No urgency signals in the intake — safe to schedule normally.");
  }

  return {
    priority,
    score,
    reasons,
    estimateOpportunity: detectEstimateOpportunity(category, issueId, signals, answers),
    comfortRisk,
    waterRisk,
    afterHours,
  };
}

/**
 * Flags a *conversation worth having* — never a recommendation to replace
 * anything. The reason string is always about what the customer said, so the
 * office can read it out loud without over-claiming.
 */
export function detectEstimateOpportunity(
  category: ServiceCategoryId,
  issueId: string,
  signals: RequestSignal[],
  answers: IntakeAnswer[],
): EstimateOpportunity {
  if (signals.includes("estimate-request")) {
    return {
      flagged: true,
      kind: "asked",
      reason: "Customer asked about replacement or new equipment directly.",
    };
  }
  if (category === "install") {
    return {
      flagged: true,
      kind: "asked",
      reason: "Request came in under installation / replacement.",
    };
  }

  const reasons: string[] = [];
  if (signals.includes("very-old-equipment")) {
    reasons.push("customer estimates the equipment at 15 years or more");
  } else if (signals.includes("aging-equipment")) {
    reasons.push("customer estimates the equipment at 10 to 15 years");
  }
  if (signals.includes("repeat-repair")) {
    reasons.push("the same equipment has had recent service");
  }
  if (signals.includes("replacement-intent")) {
    reasons.push("the customer mentioned replacement");
  }
  if (issueId === "water-heater" && signals.includes("active-water")) {
    reasons.push("the water heater tank is reported to be leaking");
  }

  if (reasons.length === 0) return { flagged: false };

  /* One weak signal on its own isn't worth interrupting a repair call for. */
  const strong =
    signals.includes("very-old-equipment") ||
    signals.includes("replacement-intent") ||
    reasons.length >= 2;
  if (!strong) return { flagged: false };

  void answers;
  return {
    flagged: true,
    kind: "signal",
    reason: `Worth asking about — ${joinList(reasons)}.`,
  };
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const PRIORITY_LABEL: Record<TriagePriority, string> = {
  emergency: "Emergency",
  high: "High priority",
  standard: "Standard",
  planned: "Planned",
};

export const PRIORITY_ORDER: Record<TriagePriority, number> = {
  emergency: 0,
  high: 1,
  standard: 2,
  planned: 3,
};
