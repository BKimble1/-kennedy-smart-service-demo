import { beforeEach, describe, expect, it } from "vitest";
import { LocalRequestStore } from "@/lib/store/local-store";
import { previewRequest } from "@/lib/store/compose";
import type { IntakeDraft } from "@/lib/domain/types";

const DRAFT: IntakeDraft = {
  propertyType: "home",
  category: "cooling",
  issueId: "warm-air",
  urgency: "today",
  answers: [
    {
      questionId: "cooling-state",
      prompt: "What is the system doing right now?",
      valueIds: ["runs-no-cool"],
      labels: ["Running, but the air isn't cold"],
    },
    {
      questionId: "equipment-age",
      prompt: "Roughly how old is the equipment?",
      valueIds: ["10-15"],
      labels: ["10 to 15 years"],
    },
  ],
  safetyFlags: [],
  photos: [],
  availability: [{ date: "2026-09-16", windows: ["afternoon"] }],
  customer: {
    name: "Jamie Tester",
    phone: "7655550100",
    email: "jamie@example.com",
    address1: "12 Test St",
    city: "Marion",
    state: "IN",
    zip: "46952",
    contactMethod: "phone",
  },
};

describe("local request store", () => {
  let store: LocalRequestStore;

  beforeEach(() => {
    localStorage.clear();
    store = new LocalRequestStore();
  });

  it("hydrates from the seed on first read", () => {
    expect(store.list().length).toBeGreaterThanOrEqual(10);
  });

  it("persists across instances", () => {
    const before = store.list().length;
    store.create(DRAFT);
    const reopened = new LocalRequestStore();
    expect(reopened.list().length).toBe(before + 1);
  });

  it("puts a new request at the top with a fresh reference", () => {
    const created = store.create(DRAFT);
    expect(store.list()[0].id).toBe(created.id);
    expect(created.reference).toMatch(/^KSD-\d{4}$/);
    expect(created.status).toBe("new");
    expect(created.demoCreated).toBe(true);
    expect(created.triage.score).toBeGreaterThan(0);
  });

  it("issues sequential references", () => {
    const a = store.create(DRAFT);
    const b = store.create(DRAFT);
    expect(Number(b.reference.slice(4))).toBe(Number(a.reference.slice(4)) + 1);
  });

  it("finds a request by id or by reference", () => {
    const created = store.create(DRAFT);
    expect(store.get(created.id)?.id).toBe(created.id);
    expect(store.get(created.reference)?.id).toBe(created.id);
    expect(store.get("nope")).toBeUndefined();
  });

  it("logs a status change into the history", () => {
    const created = store.create(DRAFT);
    const updated = store.update(created.id, { status: "contacted" });
    expect(updated?.status).toBe("contacted");
    expect(updated?.activity.at(-1)?.summary).toMatch(/Contacted/);
  });

  it("logs an assignment", () => {
    const created = store.create(DRAFT);
    const updated = store.update(created.id, { assignedTech: "Dale R." });
    expect(updated?.activity.at(-1)?.summary).toMatch(/Dale R\./);
  });

  it("appends free-form activity", () => {
    const created = store.create(DRAFT);
    const updated = store.addActivity(created.id, {
      kind: "note",
      actor: "Office",
      summary: "Called, no answer",
    });
    expect(updated?.activity.at(-1)?.summary).toBe("Called, no answer");
  });

  it("notifies subscribers on every mutation", () => {
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    store.create(DRAFT);
    expect(calls).toBe(1);
    unsubscribe();
    store.create(DRAFT);
    expect(calls).toBe(1);
  });

  it("restores the seed on reset", () => {
    store.create(DRAFT);
    store.reset();
    expect(store.list().some((r) => r.demoCreated)).toBe(false);
  });

  it("survives corrupt stored data", () => {
    localStorage.setItem("ksd.requests.v1", "{not json");
    const recovered = new LocalRequestStore();
    expect(recovered.list().length).toBeGreaterThanOrEqual(10);
  });

  it("returns a stable snapshot reference between mutations", () => {
    const a = store.list();
    const b = store.list();
    expect(a).toBe(b);
    store.create(DRAFT);
    expect(store.list()).not.toBe(a);
  });
});

describe("preview", () => {
  it("matches what the store will create", () => {
    const preview = previewRequest(DRAFT, new Date(2026, 8, 15, 10, 0, 0));
    localStorage.clear();
    const created = new LocalRequestStore().create(DRAFT, new Date(2026, 8, 15, 10, 0, 0));
    expect(preview.triage).toEqual(created.triage);
    expect(preview.signals).toEqual(created.signals);
    expect(preview.categoryLabel).toBe(created.categoryLabel);
    expect(preview.issueLabel).toBe(created.issueLabel);
  });
});
