import { BUSINESS } from "@/lib/domain/business";
import { URGENCY_LABEL } from "@/lib/domain/catalog";
import { SAFETY_PROTOCOLS } from "@/lib/domain/safety";
import type { ServiceRequest } from "@/lib/domain/types";
import { formatAvailability, formatPhone } from "@/lib/utils/format";
import { answerRows } from "./narrate";

/**
 * The live provider gets exactly the same facts the demo provider works from —
 * nothing more. A model can improve the *phrasing*; it is never given room to
 * introduce a fact, a diagnosis, or a commitment the business hasn't made.
 */
export function groundingFacts(request: ServiceRequest): string {
  const lines: string[] = [];
  lines.push(`Reference: ${request.reference}`);
  lines.push(`Submitted: ${new Date(request.createdAt).toLocaleString("en-US")}`);
  lines.push(`Channel: submitted through the website intake form`);
  lines.push(`Property type: ${request.propertyType === "business" ? "commercial" : "residential"}`);
  lines.push(`Service category: ${request.categoryLabel}`);
  lines.push(`Reported issue: ${request.issueLabel}`);
  lines.push(`Urgency selected by customer: ${URGENCY_LABEL[request.urgency]}`);
  lines.push("");
  lines.push("Intake answers (the only detail the customer provided):");
  for (const row of answerRows(request)) {
    lines.push(`- ${row.prompt} → ${row.value}`);
  }
  if (request.notes?.trim()) {
    lines.push(`- Free-text note from customer: "${request.notes.trim()}"`);
  }
  lines.push("");
  lines.push(
    `Photos attached: ${
      request.photos.length === 0
        ? "none"
        : request.photos.map((p) => p.kind).join(", ")
    } (you cannot see them — only say how many and what kind)`,
  );
  lines.push(`Customer availability: ${formatAvailability(request.availability)}`);
  lines.push(
    `Customer: ${request.customer.name}, ${request.customer.address1}, ${request.customer.city}, ${request.customer.state} ${request.customer.zip}`,
  );
  lines.push(
    `Preferred contact: ${request.customer.contactMethod} (${formatPhone(request.customer.phone)}, ${request.customer.email})`,
  );
  lines.push(
    `Triage: ${request.triage.priority} (deterministic rules engine, score ${request.triage.score}) — ${request.triage.reasons.join(" ")}`,
  );
  if (request.triage.estimateOpportunity.flagged) {
    lines.push(`Estimate flag: ${request.triage.estimateOpportunity.reason}`);
  }
  if (request.safetyFlags.length > 0) {
    lines.push(
      `SAFETY CONDITIONS REPORTED AT INTAKE: ${request.safetyFlags
        .map((f) => SAFETY_PROTOCOLS[f].label)
        .join(", ")}. Emergency guidance was shown to the customer before submission.`,
    );
  }
  return lines.join("\n");
}

export const ASSIST_SYSTEM_PROMPT = `You write internal notes and customer-facing drafts for the dispatch desk at ${BUSINESS.name}, a ${BUSINESS.trade.toLowerCase()} contractor in ${BUSINESS.city}, ${BUSINESS.state}.

Hard rules — these are not style preferences:

1. Use only the facts given to you. Never add a symptom, a measurement, a date, a price, or a piece of equipment that is not in the intake data.
2. Never diagnose. You may restate what the customer reported and what a technician should confirm onsite. You may not say what is wrong with the equipment, what part has failed, or what the repair will be.
3. Never recommend replacing equipment. If the intake flags an estimate opportunity, you may say it is worth *asking* whether they'd like options — nothing stronger.
4. Never promise a response time, an arrival window, a price, or a warranty. ${BUSINESS.shortName}'s office hours are ${BUSINESS.officeHoursLabel}; do not imply staffing outside that.
5. If a safety condition was reported, lead with it. Do not schedule around a safety issue and do not minimize it.
6. Photos exist as counts and kinds only. You cannot see them — never describe their contents.

Voice: a competent, unhurried small-business office. Plain American English. Short sentences. No marketing language, no exclamation marks, no emoji, no "we're excited", no "reach out". Write the way a good service manager writes when they're busy.`;

export function callSummaryPrompt(facts: string): string {
  return `${facts}

Write a 2–4 sentence briefing for the employee who is about to phone this customer. Lead with who they are and what they reported. Include only the detail that changes how the call goes. End with how they prefer to be contacted. Plain prose, no bullet points, no heading.`;
}

export function replyPrompt(facts: string, channel: "email" | "text"): string {
  if (channel === "text") {
    return `${facts}

Draft a text message to this customer from ${BUSINESS.shortName}. Under 320 characters. Greet them by first name, confirm what they told us in a few words, say what happens next, and give the office number ${BUSINESS.phone}. No links, no emoji.`;
  }
  return `${facts}

Draft an email to this customer from ${BUSINESS.name}. Include a subject line on the first line prefixed with "Subject: ". Greet them by first name. Confirm what they reported. Recap the key details we have on file as a short bulleted list. Say what happens next without promising a time. Close with the office number ${BUSINESS.phone}. Sign off as ${BUSINESS.name}.`;
}

export function techNotesPrompt(facts: string): string {
  return `${facts}

Write the prep sheet the technician reads before this call. Return these fields:
- reportedIssue: category and issue, one line
- equipment: what equipment is involved, as far as intake tells us
- symptoms: the reported symptoms as short phrases
- approximateAge: the customer's age estimate, marked as an estimate
- photos: which kinds of photos are attached, or "None"
- safetyConcerns: anything flagged at intake, or "None reported during intake"
- verifyOnsite: things to confirm or record onsite — observations only, never a diagnosis or a repair plan
- access: address, contact and scheduling notes

Nothing in verifyOnsite may state or imply a cause.`;
}
