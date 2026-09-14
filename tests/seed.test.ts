import { describe, expect, it } from "vitest";
import { QUESTION_BANK, getIssue } from "@/lib/domain/catalog";
import { SERVICE_AREA_TOWNS } from "@/lib/domain/business";
import { buildSeedRequests } from "@/lib/store/seed";

const AT = new Date(2026, 8, 15, 10, 0, 0);
const seeds = buildSeedRequests(AT);

describe("seeded inbox", () => {
  it("seeds a realistic volume", () => {
    expect(seeds.length).toBeGreaterThanOrEqual(10);
    expect(seeds.length).toBeLessThanOrEqual(20);
  });

  it("gives every request a unique id and reference", () => {
    expect(new Set(seeds.map((s) => s.id)).size).toBe(seeds.length);
    expect(new Set(seeds.map((s) => s.reference)).size).toBe(seeds.length);
  });

  it("only uses towns inside the stated service area", () => {
    const towns = new Set(SERVICE_AREA_TOWNS.map((t) => t.city));
    for (const s of seeds) {
      expect(towns, `${s.reference} is in ${s.customer.city}`).toContain(s.customer.city);
      expect(s.customer.state).toBe("IN");
      expect(s.customer.zip).toMatch(/^\d{5}$/);
    }
  });

  it("only uses reserved example.com addresses and 555 phone numbers", () => {
    for (const s of seeds) {
      expect(s.customer.email).toMatch(/@example\.com$/);
      expect(s.customer.phone).toMatch(/^765555\d{4}$/);
    }
  });

  it("resolves every answer against the question bank", () => {
    for (const s of seeds) {
      for (const answer of s.answers) {
        const question = QUESTION_BANK[answer.questionId];
        expect(question, `${s.reference} → ${answer.questionId}`).toBeDefined();
        for (const id of answer.valueIds) {
          expect(question!.options?.some((o) => o.id === id)).toBe(true);
        }
      }
      expect(getIssue(s.category, s.issueId)).toBeDefined();
    }
  });

  it("includes at least one live emergency", () => {
    const emergencies = seeds.filter(
      (s) => s.triage.priority === "emergency" && s.status !== "completed",
    );
    expect(emergencies.length).toBeGreaterThanOrEqual(1);
  });

  it("includes a safety-flagged record so the office view can be shown", () => {
    expect(seeds.some((s) => s.safetyFlags.length > 0)).toBe(true);
  });

  it("includes requests with photos", () => {
    const withPhotos = seeds.filter((s) => s.photos.length > 0);
    expect(withPhotos.length).toBeGreaterThanOrEqual(3);
    for (const s of withPhotos) {
      for (const p of s.photos) {
        expect(p.dataUrl.startsWith("data:image/svg+xml")).toBe(true);
        expect(p.placeholder).toBe(true);
      }
    }
  });

  it("includes at least one after-hours arrival", () => {
    expect(seeds.some((s) => s.triage.afterHours)).toBe(true);
  });

  it("includes estimate opportunities", () => {
    expect(seeds.filter((s) => s.triage.estimateOpportunity.flagged).length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("fills every pipeline column that the board shows", () => {
    const statuses = new Set(seeds.map((s) => s.status));
    for (const expected of ["new", "contacted", "scheduled", "assigned", "estimate-sent", "completed"]) {
      expect(statuses, `no seed in "${expected}"`).toContain(expected);
    }
  });

  it("includes a commercial property", () => {
    expect(seeds.some((s) => s.propertyType === "business")).toBe(true);
  });

  it("orders activity chronologically and never after 'now'", () => {
    for (const s of seeds) {
      const times = s.activity.map((a) => new Date(a.at).getTime());
      expect(times).toEqual([...times].sort((a, b) => a - b));
      for (const t of times) expect(t).toBeLessThanOrEqual(AT.getTime());
      expect(new Date(s.createdAt).getTime()).toBeLessThanOrEqual(AT.getTime());
    }
  });

  it("is stable for the same clock", () => {
    const a = buildSeedRequests(AT);
    const b = buildSeedRequests(AT);
    expect(a.map((r) => `${r.reference}:${r.triage.score}`)).toEqual(
      b.map((r) => `${r.reference}:${r.triage.score}`),
    );
  });
});
