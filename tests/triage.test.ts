import { describe, expect, it } from "vitest";
import { QUESTION_BANK } from "@/lib/domain/catalog";
import { PRIORITY_ORDER, isAfterHours, runTriage } from "@/lib/domain/triage";
import type { IntakeAnswer, ServiceCategoryId, UrgencyId } from "@/lib/domain/types";

function answer(questionId: string, ...optionIds: string[]): IntakeAnswer {
  const q = QUESTION_BANK[questionId];
  if (!q) throw new Error(`no such question ${questionId}`);
  return {
    questionId,
    prompt: q.prompt,
    valueIds: optionIds,
    labels: optionIds.map((id) => q.options!.find((o) => o.id === id)!.label),
  };
}

/** A Tuesday at 10:00am local — inside office hours. */
const OFFICE_HOURS = new Date(2026, 8, 15, 10, 0, 0);
/** The same Tuesday at 11:40pm. */
const LATE_NIGHT = new Date(2026, 8, 15, 23, 40, 0);
/** A Saturday at noon. */
const WEEKEND = new Date(2026, 8, 19, 12, 0, 0);

function triage(
  category: ServiceCategoryId,
  issueId: string,
  urgency: UrgencyId,
  answers: IntakeAnswer[],
  extra: { safetyFlags?: string[]; propertyType?: "home" | "business"; at?: Date } = {},
) {
  return runTriage({
    category,
    issueId,
    urgency,
    answers,
    safetyFlags: extra.safetyFlags ?? [],
    propertyType: extra.propertyType ?? "home",
    submittedAt: extra.at ?? OFFICE_HOURS,
  });
}

describe("office hours", () => {
  it("recognizes weekday business hours", () => {
    expect(isAfterHours(OFFICE_HOURS)).toBe(false);
  });
  it("treats late evening as after hours", () => {
    expect(isAfterHours(LATE_NIGHT)).toBe(true);
  });
  it("treats the weekend as after hours", () => {
    expect(isAfterHours(WEEKEND)).toBe(true);
  });
});

describe("triage", () => {
  it("short-circuits to emergency on any safety flag", () => {
    const result = triage("heating", "smell", "planning", [answer("smell-type", "gas")], {
      safetyFlags: ["gas-odor"],
    });
    expect(result.priority).toBe("emergency");
    expect(result.score).toBe(100);
    expect(result.reasons[0]).toMatch(/safety condition/i);
    expect(result.estimateOpportunity.flagged).toBe(false);
  });

  it("ranks an uncontrolled active leak as an emergency", () => {
    const result = triage("plumbing", "leak", "emergency", [
      answer("water-active", "running"),
      answer("water-shutoff", "cant-find"),
      answer("leak-location", "ceiling-wall"),
      answer("started-when", "today"),
    ]);
    expect(result.priority).toBe("emergency");
    expect(result.waterRisk).toBe(true);
  });

  it("keeps a planned tune-up out of the urgent queue", () => {
    const result = triage("maintenance", "seasonal", "planning", [
      answer("maintenance-scope", "furnace-tuneup"),
      answer("maintenance-last", "year"),
      answer("equipment-age", "under-5"),
    ]);
    expect(result.priority).toBe("planned");
    expect(result.comfortRisk).toBe(false);
  });

  it("never lets a planning-ahead request outrank an emergency", () => {
    const planning = triage("cooling", "replacement", "planning", [
      answer("replace-reason", "failed", "repairs", "age"),
      answer("replace-scope", "both"),
      answer("replace-timing", "now"),
    ]);
    const urgent = triage("heating", "no-heat", "today", [
      answer("heating-state", "dead"),
      answer("started-when", "today"),
    ]);
    expect(["planned", "standard"]).toContain(planning.priority);
    expect(PRIORITY_ORDER[urgent.priority]).toBeLessThan(PRIORITY_ORDER[planning.priority]);
  });

  it("gives no heat with a dead furnace a high ranking", () => {
    const result = triage("heating", "no-heat", "today", [
      answer("heating-state", "dead"),
      answer("thermostat", "blank"),
      answer("started-when", "today"),
      answer("equipment-age", "10-15"),
    ]);
    expect(["emergency", "high"]).toContain(result.priority);
    expect(result.comfortRisk).toBe(true);
  });

  it("adds weight for a commercial property", () => {
    const home = triage("cooling", "not-cooling", "today", [answer("cooling-state", "dead")]);
    const shop = triage("cooling", "not-cooling", "today", [answer("cooling-state", "dead")], {
      propertyType: "business",
    });
    expect(shop.score).toBeGreaterThan(home.score);
    expect(shop.reasons.join(" ")).toMatch(/commercial/i);
  });

  it("is deterministic", () => {
    const answers = [
      answer("cooling-state", "runs-no-cool"),
      answer("equipment-age", "15-plus"),
    ];
    const a = triage("cooling", "warm-air", "today", answers);
    const b = triage("cooling", "warm-air", "today", answers);
    expect(a).toEqual(b);
  });

  it("caps the score at 100 and never goes negative", () => {
    const result = triage("plumbing", "no-water", "emergency", [
      answer("no-water-scope", "whole"),
      answer("neighbors", "yes"),
      answer("started-when", "today"),
    ]);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("surfaces at most four reasons, most significant first", () => {
    const result = triage("plumbing", "leak", "emergency", [
      answer("water-active", "running"),
      answer("water-shutoff", "cant-find"),
      answer("leak-location", "ceiling-wall"),
      answer("started-when", "today"),
    ]);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.length).toBeLessThanOrEqual(4);
  });

  it("keeps 'Emergency' rare — a 'today' request needs overwhelming answers", () => {
    const today = triage("cooling", "warm-air", "today", [
      answer("cooling-state", "runs-no-cool"),
      answer("outdoor-unit", "yes"),
      answer("started-when", "yesterday"),
      answer("equipment-age", "10-15"),
    ]);
    expect(today.priority).toBe("high");
  });

  it("never promotes a 'next available' request past high", () => {
    const result = triage("plumbing", "no-water", "next-available", [
      answer("no-water-scope", "whole"),
      answer("neighbors", "yes"),
      answer("started-when", "today"),
    ]);
    expect(result.priority).not.toBe("emergency");
  });

  it("leaves no more than a quarter of a realistic inbox on Emergency", async () => {
    const { buildSeedRequests } = await import("@/lib/store/seed");
    const seeds = buildSeedRequests(OFFICE_HOURS);
    const emergencies = seeds.filter((s) => s.triage.priority === "emergency");
    expect(emergencies.length).toBeGreaterThanOrEqual(1);
    expect(emergencies.length / seeds.length).toBeLessThanOrEqual(0.25);
  });

  it("marks an overnight submission as after hours", () => {
    const result = triage("heating", "wont-start", "today", [answer("thermostat", "blank")], {
      at: LATE_NIGHT,
    });
    expect(result.afterHours).toBe(true);
  });
});

describe("estimate opportunity", () => {
  it("flags a direct replacement request as asked", () => {
    const result = triage("install", "furnace", "planning", [
      answer("replace-timing", "weeks"),
    ]);
    expect(result.estimateOpportunity.flagged).toBe(true);
    expect(result.estimateOpportunity.kind).toBe("asked");
  });

  it("flags a repair on 15-year-old equipment as a signal", () => {
    const result = triage("cooling", "warm-air", "today", [
      answer("cooling-state", "runs-no-cool"),
      answer("equipment-age", "15-plus"),
    ]);
    expect(result.estimateOpportunity.flagged).toBe(true);
    expect(result.estimateOpportunity.kind).toBe("signal");
    expect(result.estimateOpportunity.reason).toMatch(/15 years or more/i);
  });

  it("does not flag a single weak signal on its own", () => {
    const result = triage("cooling", "noise", "next-available", [
      answer("noise-type", "rattle"),
      answer("equipment-age", "10-15"),
    ]);
    expect(result.estimateOpportunity.flagged).toBe(false);
  });

  it("never words the flag as a recommendation", () => {
    const result = triage("cooling", "warm-air", "today", [
      answer("cooling-state", "runs-no-cool"),
      answer("equipment-age", "15-plus"),
    ]);
    const reason = result.estimateOpportunity.reason ?? "";
    expect(reason).not.toMatch(/should (be )?replace/i);
    expect(reason).not.toMatch(/needs? (a )?(new|replacement)/i);
  });
});
