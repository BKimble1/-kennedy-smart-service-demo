import { describe, expect, it } from "vitest";
import { demoProvider } from "@/lib/ai/demo-provider";
import { buildSeedRequests } from "@/lib/store/seed";
import type { ServiceRequest } from "@/lib/domain/types";

const AT = new Date(2026, 8, 15, 10, 0, 0);
const seeds = buildSeedRequests(AT);

function byRef(ref: string): ServiceRequest {
  const found = seeds.find((s) => s.reference === ref);
  if (!found) throw new Error(`seed ${ref} missing`);
  return found;
}

/** Phrases the product must never produce — a form cannot diagnose equipment. */
const DIAGNOSIS_PHRASES = [
  /\bthe (problem|issue|cause) is\b/i,
  /\byou need a new\b/i,
  /\bneeds? to be replaced\b/i,
  /\bwe recommend replacing\b/i,
  /\bis (definitely|certainly) (broken|failed|faulty)\b/i,
  /\bwill (arrive|be there) (within|in) \d/i,
  /\bwe guarantee\b/i,
];

describe("demo AI provider", () => {
  it("summarizes every seeded request without throwing", async () => {
    for (const request of seeds) {
      const summary = await demoProvider.summarize(request);
      expect(summary.headline.length).toBeGreaterThan(3);
      expect(summary.sections.length).toBeGreaterThanOrEqual(5);
      expect(summary.oneLine.length).toBeGreaterThan(3);
    }
  });

  it("always includes the core summary sections", async () => {
    const summary = await demoProvider.summarize(byRef("KSD-4206"));
    const labels = summary.sections.map((s) => s.label);
    for (const label of [
      "Service",
      "Issue",
      "Urgency",
      "Detail",
      "Photos",
      "Customer availability",
      "Location",
    ]) {
      expect(labels).toContain(label);
    }
  });

  it("reads the AC example the way a person would write it", async () => {
    const summary = await demoProvider.summarize(byRef("KSD-4206"));
    expect(summary.headline).toMatch(/air coming out isn't cold/i);
    const detail = summary.sections.find((s) => s.label === "Detail");
    expect(detail?.items?.join(" ")).toMatch(/outdoor fan is spinning/i);
    expect(detail?.items?.join(" ")).toMatch(/started yesterday/i);
    expect(detail?.items?.join(" ")).toMatch(/10 to 15 years old/i);
  });

  it("leads the safety-flagged record with the safety section", async () => {
    const summary = await demoProvider.summarize(byRef("KSD-4200"));
    const safety = summary.sections.find((s) => s.label === "Safety");
    expect(safety).toBeDefined();
    expect(safety?.tone).toBe("alert");
  });

  it("writes a call summary that names the customer, the town and the contact preference", async () => {
    const request = byRef("KSD-4206");
    const text = await demoProvider.callSummary(request);
    expect(text).toContain("Sarah Whitcomb");
    expect(text).toContain("Marion");
    expect(text).toMatch(/prefers a phone call/i);
    expect(text.split(/(?<=[.!?])\s+/).filter(Boolean).length).toBeLessThanOrEqual(6);
  });

  it("leads the safety record's call summary with the safety condition", async () => {
    const text = await demoProvider.callSummary(byRef("KSD-4200"));
    expect(text).toMatch(/gas odor reported/i);
    expect(text).toMatch(/emergency/i);
  });

  it("keeps the text draft short enough to actually send", async () => {
    for (const request of seeds) {
      const reply = await demoProvider.reply(request, "text");
      expect(reply.body.length, `${request.reference} text draft`).toBeLessThanOrEqual(480);
      expect(reply.subject).toBeUndefined();
    }
  });

  it("gives the email draft a subject carrying the reference", async () => {
    const request = byRef("KSD-4206");
    const reply = await demoProvider.reply(request, "email");
    expect(reply.subject).toContain(request.reference);
    expect(reply.body).toMatch(/^Hi Sarah,/);
    expect(reply.body).toContain("(765) 664-5578");
  });

  it("never promises a response time or a price in any draft", async () => {
    for (const request of seeds) {
      for (const channel of ["email", "text"] as const) {
        const reply = await demoProvider.reply(request, channel);
        const text = `${reply.subject ?? ""} ${reply.body}`;
        for (const pattern of DIAGNOSIS_PHRASES) {
          expect(pattern.test(text), `${request.reference}/${channel} matched ${pattern}`).toBe(
            false,
          );
        }
        expect(text).not.toMatch(/within (24|48) hours/i);
        expect(text).not.toMatch(/\$\d/);
      }
    }
  });

  it("never diagnoses in the technician prep sheet", async () => {
    for (const request of seeds) {
      const notes = await demoProvider.techNotes(request);
      const text = [
        notes.reportedIssue,
        notes.equipment,
        notes.symptoms.join(" "),
        notes.verifyOnsite.join(" "),
        notes.safetyConcerns.join(" "),
      ].join(" ");
      for (const pattern of DIAGNOSIS_PHRASES) {
        expect(pattern.test(text), `${request.reference} matched ${pattern}`).toBe(false);
      }
      expect(notes.verifyOnsite.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("records no safety concerns when none were reported", async () => {
    const notes = await demoProvider.techNotes(byRef("KSD-4195"));
    expect(notes.safetyConcerns).toEqual(["None reported during intake"]);
  });

  it("carries the reported safety condition into the prep sheet", async () => {
    const notes = await demoProvider.techNotes(byRef("KSD-4200"));
    expect(notes.safetyConcerns.join(" ")).toMatch(/gas odor/i);
    expect(notes.safetyConcerns.join(" ")).toMatch(/emergency guidance shown/i);
  });

  it("gets the article right in front of a vowel", async () => {
    const text = await demoProvider.callSummary(byRef("KSD-4206"));
    expect(text).toContain("submitted an air conditioning request");
    expect(text).not.toContain("submitted a air");
  });

  it("keeps weekday names capitalized inside the call summary", async () => {
    for (const request of seeds) {
      const text = await demoProvider.callSummary(request);
      for (const day of [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]) {
        expect(text.includes(` ${day}`), `${request.reference} lower-cased ${day}`).toBe(false);
      }
    }
  });

  it("produces the whole assist bundle in one call", async () => {
    const bundle = await demoProvider.assist(byRef("KSD-4203"), "email");
    expect(bundle.callSummary).toBeTruthy();
    expect(bundle.reply.body).toBeTruthy();
    expect(bundle.techNotes.reportedIssue).toBeTruthy();
  });

  it("mentions the estimate conversation only when it is flagged", async () => {
    const flagged = byRef("KSD-4194");
    const notFlagged = byRef("KSD-4193");
    expect(flagged.triage.estimateOpportunity.flagged).toBe(true);
    expect(notFlagged.triage.estimateOpportunity.flagged).toBe(false);
    expect(await demoProvider.callSummary(flagged)).toMatch(/estimate|replacement/i);
    expect(await demoProvider.callSummary(notFlagged)).not.toMatch(/replacement estimate/i);
  });
});
