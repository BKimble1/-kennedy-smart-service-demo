import { describe, expect, it } from "vitest";
import {
  QUESTION_BANK,
  SAFETY_QUESTION,
  SERVICE_CATEGORIES,
  URGENCY_OPTIONS,
  questionsFor,
} from "@/lib/domain/catalog";
import { SAFETY_PROTOCOLS } from "@/lib/domain/safety";

describe("service catalog", () => {
  it("covers the six advertised trades", () => {
    expect(SERVICE_CATEGORIES.map((c) => c.id)).toEqual([
      "cooling",
      "heating",
      "plumbing",
      "maintenance",
      "install",
      "other",
    ]);
  });

  it("gives every issue between two and four follow-up questions", () => {
    for (const category of SERVICE_CATEGORIES) {
      for (const issue of category.issues) {
        expect(
          issue.questions.length,
          `${category.id}/${issue.id} asks ${issue.questions.length} questions`,
        ).toBeGreaterThanOrEqual(2);
        expect(issue.questions.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it("only references questions that exist", () => {
    for (const category of SERVICE_CATEGORIES) {
      for (const issue of category.issues) {
        for (const id of issue.questions) {
          expect(QUESTION_BANK[id], `${category.id}/${issue.id} → ${id}`).toBeDefined();
        }
      }
    }
  });

  it("never repeats a question inside one issue", () => {
    for (const category of SERVICE_CATEGORIES) {
      for (const issue of category.issues) {
        expect(new Set(issue.questions).size).toBe(issue.questions.length);
      }
    }
  });

  it("gives every choice question at least two options with unique ids", () => {
    for (const question of Object.values(QUESTION_BANK)) {
      if (question.type === "text") continue;
      expect(question.options?.length ?? 0).toBeGreaterThanOrEqual(2);
      const ids = question.options!.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("maps every safety option to a real protocol", () => {
    const all = [...Object.values(QUESTION_BANK), SAFETY_QUESTION];
    const seen = new Set<string>();
    for (const question of all) {
      for (const option of question.options ?? []) {
        if (option.safety) {
          expect(SAFETY_PROTOCOLS[option.safety]).toBeDefined();
          seen.add(option.safety);
        }
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });

  it("gives the safety checklist an exclusive opt-out", () => {
    const none = SAFETY_QUESTION.options?.find((o) => o.id === "none");
    expect(none?.exclusive).toBe(true);
  });

  it("resolves the questions for a known issue", () => {
    const questions = questionsFor("cooling", "warm-air");
    expect(questions.map((q) => q.id)).toEqual([
      "cooling-state",
      "outdoor-unit",
      "started-when",
      "equipment-age",
    ]);
  });

  it("offers exactly the four urgency levels", () => {
    expect(URGENCY_OPTIONS.map((u) => u.id)).toEqual([
      "emergency",
      "today",
      "next-available",
      "planning",
    ]);
  });

  it("gives every safety protocol steps and a contact", () => {
    for (const protocol of Object.values(SAFETY_PROTOCOLS)) {
      expect(protocol.steps.length).toBeGreaterThanOrEqual(3);
      expect(protocol.contacts.length).toBeGreaterThanOrEqual(1);
      expect(protocol.contacts.some((c) => c.primary)).toBe(true);
    }
  });
});
