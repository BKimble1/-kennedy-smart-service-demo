import { BUSINESS } from "@/lib/domain/business";
import { URGENCY_LABEL, getCategory } from "@/lib/domain/catalog";
import { SAFETY_PROTOCOLS } from "@/lib/domain/safety";
import type { ServiceRequest } from "@/lib/domain/types";
import {
  availabilityPhrase,
  formatAvailability,
  formatPhone,
  firstName,
  pluralize,
} from "@/lib/utils/format";
import {
  article,
  capitalize,
  clauseFor,
  clausesFor,
  joinClauses,
  joinSentenceClauses,
  lowerFirstOnly,
  sentence,
} from "./narrate";
import { onsiteChecks } from "./onsite-checks";
import type {
  AIProvider,
  AssistBundle,
  CustomerReply,
  IntakeSummary,
  ReplyChannel,
  SummarySection,
  TechNotes,
} from "./provider";

/**
 * DemoAIProvider — deterministic composition, no network, no API key.
 *
 * Because intake is structured, most of the value the office wants (a readable
 * summary, a prep sheet, a first-draft reply) can be produced from rules. That
 * is a feature, not a shortcut: the output is reproducible, auditable, costs
 * nothing per request, and never invents a fact that wasn't collected.
 *
 * `LiveAIProvider` implements the same interface against a hosted model for
 * richer phrasing; the facts it is allowed to use are exactly the ones here.
 */
export class DemoAIProvider implements AIProvider {
  readonly id = "demo" as const;
  readonly label = "Demo engine";
  readonly description =
    "Generated from the structured intake answers by a deterministic rules engine — no API key, no per-request cost.";

  async summarize(request: ServiceRequest): Promise<IntakeSummary> {
    return buildSummary(request);
  }

  async callSummary(request: ServiceRequest): Promise<string> {
    return buildCallSummary(request);
  }

  async reply(request: ServiceRequest, channel: ReplyChannel): Promise<CustomerReply> {
    return buildReply(request, channel);
  }

  async techNotes(request: ServiceRequest): Promise<TechNotes> {
    return buildTechNotes(request);
  }

  async assist(request: ServiceRequest, channel: ReplyChannel): Promise<AssistBundle> {
    return {
      callSummary: buildCallSummary(request),
      reply: buildReply(request, channel),
      techNotes: buildTechNotes(request),
    };
  }
}

/* ==========================================================================
   Summary
   ========================================================================== */

export function buildHeadline(request: ServiceRequest): string {
  const parts: string[] = [];
  const stateAnswer = request.answers.find(
    (a) => a.questionId === "cooling-state" || a.questionId === "heating-state",
  );
  const waterAnswer = request.answers.find((a) => a.questionId === "water-active");
  const hotWater = request.answers.find((a) => a.questionId === "hot-water-state");

  if (stateAnswer && clauseFor(stateAnswer)) {
    parts.push(capitalize(clauseFor(stateAnswer)!));
  } else if (hotWater && clauseFor(hotWater)) {
    parts.push(capitalize(clauseFor(hotWater)!));
  } else if (waterAnswer && clauseFor(waterAnswer)) {
    parts.push(capitalize(clauseFor(waterAnswer)!));
  } else {
    parts.push(`${request.categoryLabel} — ${request.issueLabel.toLowerCase()}`);
  }

  const age = request.answers.find((a) => a.questionId === "equipment-age");
  if (age?.valueIds[0] === "15-plus") parts.push("15+ yr equipment");
  else if (age?.valueIds[0] === "10-15") parts.push("10–15 yr equipment");

  if (request.signals.includes("whole-home")) parts.push("whole building");
  return parts.join(" · ");
}

export function buildSummary(request: ServiceRequest): IntakeSummary {
  const sections: SummarySection[] = [];

  sections.push({ label: "Service", value: request.categoryLabel });
  sections.push({ label: "Issue", value: describeIssue(request) });

  if (request.safetyFlags.length > 0) {
    sections.push({
      label: "Safety",
      value: "Safety guidance was shown during intake",
      items: request.safetyFlags.map((f) => SAFETY_PROTOCOLS[f].label),
      tone: "alert",
    });
  }

  sections.push({ label: "Urgency", value: URGENCY_LABEL[request.urgency] });

  const detail = detailLines(request);
  if (detail.length > 0) {
    sections.push({ label: "Detail", value: "", items: detail });
  }

  sections.push({
    label: "Photos",
    value:
      request.photos.length === 0
        ? "None attached"
        : `${request.photos.length} attached${photoKindSuffix(request)}`,
    tone: request.photos.length > 0 ? "accent" : "default",
  });

  sections.push({
    label: "Customer availability",
    value: formatAvailability(request.availability),
  });

  sections.push({
    label: "Location",
    value: `${request.customer.address1}, ${request.customer.city}, ${request.customer.state} ${request.customer.zip}`,
  });

  if (request.notes?.trim()) {
    sections.push({ label: "Customer note", value: request.notes.trim() });
  }

  return {
    headline: buildHeadline(request),
    sections,
    oneLine: buildOneLine(request),
  };
}

function photoKindSuffix(request: ServiceRequest): string {
  const kinds = new Set(request.photos.map((p) => p.kind));
  const names: string[] = [];
  if (kinds.has("equipment")) names.push("equipment");
  if (kinds.has("problem")) names.push("problem area");
  if (kinds.has("dataplate")) names.push("model/serial plate");
  return names.length ? ` (${names.join(", ")})` : "";
}

function describeIssue(request: ServiceRequest): string {
  const primary = request.answers.find((a) =>
    [
      "cooling-state",
      "heating-state",
      "water-active",
      "hot-water-state",
      "drain-scope",
      "no-water-scope",
      "sump-state",
      "toilet-issue",
      "faucet-issue",
      "pressure-scope",
      "maintenance-scope",
      "replace-scope",
    ].includes(a.questionId),
  );
  const clause = primary ? clauseFor(primary) : null;
  if (!clause) return request.issueLabel;
  return `${request.issueLabel} — ${clause}`;
}

/** Everything the office would otherwise have to ask on the phone. */
export function detailLines(request: ServiceRequest): string[] {
  const skip = new Set(["safety-check"]);
  return request.answers
    .filter((a) => !skip.has(a.questionId))
    .map((a) => {
      const clause = clauseFor(a);
      return clause ? sentence(clause) : null;
    })
    .filter((x): x is string => Boolean(x));
}

export function buildOneLine(request: ServiceRequest): string {
  /* A safety-flagged record must say so in one line — everywhere it appears. */
  if (request.safetyFlags.length > 0) {
    const labels = request.safetyFlags.map((f) => SAFETY_PROTOCOLS[f].label.toLowerCase());
    return sentence(`${joinClauses(labels)} — emergency guidance was shown at intake`);
  }
  const clauses = clausesFor(request).slice(0, 2);
  const base = clauses.length
    ? capitalize(joinSentenceClauses(clauses))
    : `${request.categoryLabel}: ${request.issueLabel.toLowerCase()}`;
  return sentence(base);
}

/* ==========================================================================
   Call summary
   ========================================================================== */

export function buildCallSummary(request: ServiceRequest): string {
  const name = request.customer.name;
  const city = request.customer.city;
  const category = getCategory(request.category).label.toLowerCase();
  const sentences: string[] = [];

  if (request.safetyFlags.length > 0) {
    const labels = request.safetyFlags.map((f) => SAFETY_PROTOCOLS[f].label.toLowerCase());
    sentences.push(
      `${name} in ${city} reported ${joinClauses(labels)} during intake, and was shown emergency guidance before the request was submitted.`,
    );
    sentences.push(
      "Confirm they are safe and that the appropriate emergency service has been contacted before discussing the service call.",
    );
  } else {
    const clauses = clausesFor(request);
    const lead = clauses[0] ?? request.issueLabel.toLowerCase();
    sentences.push(
      `${name} in ${city} submitted ${article(category)} ${category} request: ${lead}.`,
    );
    const middle = clauses.slice(1, 3);
    if (middle.length) {
      sentences.push(`${capitalize(joinSentenceClauses(middle))}.`);
    }
  }

  const urgencyLead: Record<string, string> = {
    emergency: "They marked it an emergency",
    today: "They asked for today if possible",
    "next-available": "They asked for the next available appointment",
    planning: "They're planning ahead, so there's no time pressure",
  };
  const availability = availabilityPhrase(request.availability);
  sentences.push(
    availability === "no preference given"
      ? `${urgencyLead[request.urgency]}, and gave no preferred window.`
      : `${urgencyLead[request.urgency]} — open ${availability}.`,
  );

  if (request.photos.length > 0) {
    sentences.push(
      `${request.photos.length} ${pluralize(request.photos.length, "photo")} attached — worth a look before you call.`,
    );
  }

  if (request.triage.estimateOpportunity.flagged) {
    sentences.push(
      request.triage.estimateOpportunity.kind === "asked"
        ? "They asked about replacement, so come prepared for an estimate conversation."
        : `Possible estimate conversation: ${lowerFirstOnly(request.triage.estimateOpportunity.reason ?? "")}`,
    );
  }

  if (request.completion === "partial") {
    sentences.push(
      "They left the form before finishing, so there are no photos or preferred times yet — worth asking for both on the call.",
    );
  }

  const preference: Record<string, string> = {
    phone: "prefers a phone call",
    text: "prefers a text message",
    email: "prefers email",
  };
  sentences.push(
    `${firstName(name)} ${preference[request.customer.contactMethod]} at ${
      request.customer.contactMethod === "email"
        ? request.customer.email
        : formatPhone(request.customer.phone)
    }.`,
  );

  return sentences.join(" ");
}

/* ==========================================================================
   Customer reply draft
   ========================================================================== */

export function buildReply(request: ServiceRequest, channel: ReplyChannel): CustomerReply {
  const name = firstName(request.customer.name);
  const understood = replyUnderstanding(request);
  const availability = availabilityPhrase(request.availability);

  if (channel === "text") {
    const bits = [
      `Hi ${name}, this is ${BUSINESS.shortName}.`,
      `Thanks for the details on ${understood}.`,
      availability === "no preference given"
        ? "What time works best for you today or tomorrow?"
        : `We have you down for ${availability} — I'll confirm a time with you.`,
      `Reply here or call ${BUSINESS.phone}.`,
    ];
    return { channel, body: bits.join(" ") };
  }

  const lines: string[] = [];
  lines.push(`Hi ${name},`);
  lines.push("");
  lines.push(
    `This is ${BUSINESS.shortName}. Thanks for sending over the details on ${understood} — having that up front helps us come prepared.`,
  );
  lines.push("");
  lines.push("Here's what we have on file:");
  lines.push("");
  for (const line of replyRecap(request)) lines.push(`  • ${line}`);
  lines.push("");

  if (request.safetyFlags.length > 0) {
    lines.push(
      "Before anything else: please make sure you've followed the emergency guidance shown when you submitted this, and that the appropriate emergency service has been contacted. We won't schedule around a safety issue.",
    );
    lines.push("");
  }

  lines.push(
    availability === "no preference given"
      ? "Let us know a couple of windows that work for you and we'll get you on the schedule."
      : `You told us ${availability} works. We'll call to confirm a time — if anything has changed, just let us know.`,
  );

  if (request.triage.estimateOpportunity.flagged) {
    lines.push("");
    lines.push(
      request.triage.estimateOpportunity.kind === "asked"
        ? "We'll bring what we need to put numbers together for you while we're out. No obligation either way."
        : "While we're there we can also walk you through your options if you'd like — no obligation.",
    );
  }

  lines.push("");
  lines.push(`If it's easier, you can reach us at ${BUSINESS.phone}.`);
  lines.push("");
  lines.push("Thanks,");
  lines.push(`${BUSINESS.name}`);
  lines.push(`${BUSINESS.phone} · ${BUSINESS.city}, ${BUSINESS.state}`);

  return {
    channel,
    subject: `${BUSINESS.shortName} — your service request ${request.reference}`,
    body: lines.join("\n"),
  };
}

function replyUnderstanding(request: ServiceRequest): string {
  const clause = clausesFor(request)[0];
  const noun = request.categoryLabel.toLowerCase();
  if (!clause) return `your ${noun} request`;
  return `your ${noun} — ${clause}`;
}

function replyRecap(request: ServiceRequest): string[] {
  const rows: string[] = [];
  rows.push(`${request.categoryLabel}: ${request.issueLabel.toLowerCase()}`);
  const detail = detailLines(request).slice(0, 3);
  for (const d of detail) rows.push(d.replace(/\.$/, ""));
  rows.push(`Urgency: ${URGENCY_LABEL[request.urgency].toLowerCase()}`);
  if (request.photos.length) {
    rows.push(`${request.photos.length} ${pluralize(request.photos.length, "photo")} received`);
  }
  rows.push(
    `Address: ${request.customer.address1}, ${request.customer.city} ${request.customer.zip}`,
  );
  rows.push(`Reference: ${request.reference}`);
  return rows;
}

/* ==========================================================================
   Technician notes
   ========================================================================== */

export function buildTechNotes(request: ServiceRequest): TechNotes {
  const age = request.answers.find((a) => a.questionId === "equipment-age");
  const ageMap: Record<string, string> = {
    "under-5": "Under 5 years (customer estimate)",
    "5-10": "5–10 years (customer estimate)",
    "10-15": "10–15 years (customer estimate)",
    "15-plus": "15+ years (customer estimate)",
    unknown: "Unknown — confirm from data plate",
  };

  const heaterType = request.answers.find((a) => a.questionId === "water-heater-type");
  const heaterMap: Record<string, string> = {
    "gas-tank": "Gas tank water heater",
    "electric-tank": "Electric tank water heater",
    tankless: "Tankless water heater",
    unsure: "Water heater — type not confirmed",
  };

  const equipment = heaterType?.valueIds[0]
    ? (heaterMap[heaterType.valueIds[0]] ?? request.categoryLabel)
    : equipmentFor(request);

  const symptoms = detailLines(request).map((s) => s.replace(/\.$/, ""));

  const safetyConcerns =
    request.safetyFlags.length > 0
      ? request.safetyFlags.map(
          (f) =>
            `${SAFETY_PROTOCOLS[f].label} — emergency guidance shown to customer at intake`,
        )
      : ["None reported during intake"];

  if (request.signals.includes("active-water") && request.safetyFlags.length === 0) {
    safetyConcerns[0] =
      "Active water present — check for damage near electrical before working";
  }

  const photoText =
    request.photos.length === 0
      ? "None"
      : request.photos
          .map((p) =>
            p.kind === "dataplate"
              ? "Model/serial plate"
              : p.kind === "equipment"
                ? "Equipment"
                : "Problem area",
          )
          .join(", ");

  const access = [
    `${request.propertyType === "business" ? "Commercial property" : "Residence"} · ${request.customer.address1}, ${request.customer.city} ${request.customer.zip}`,
    `${request.customer.name} · ${formatPhone(request.customer.phone)}`,
    request.scheduledFor
      ? `Scheduled: ${request.scheduledFor.date} ${request.scheduledFor.window}`
      : `Customer availability: ${formatAvailability(request.availability)}`,
  ].join("\n");

  return {
    reportedIssue: `${request.categoryLabel} — ${request.issueLabel}`,
    equipment,
    symptoms: symptoms.length ? symptoms : ["No additional detail captured"],
    approximateAge: age?.valueIds[0] ? (ageMap[age.valueIds[0]] ?? "Unknown") : "Not collected",
    photos: photoText,
    safetyConcerns,
    verifyOnsite: onsiteChecks(request.category, request.issueId, request.signals),
    access,
  };
}

function equipmentFor(request: ServiceRequest): string {
  switch (request.category) {
    case "cooling":
      return "Central air conditioning / heat pump";
    case "heating":
      return "Furnace / heating system";
    case "plumbing":
      return request.issueLabel;
    case "maintenance":
      return "Scheduled maintenance";
    case "install":
      return `Installation / replacement — ${request.issueLabel}`;
    default:
      return request.issueLabel;
  }
}

export const demoProvider = new DemoAIProvider();
