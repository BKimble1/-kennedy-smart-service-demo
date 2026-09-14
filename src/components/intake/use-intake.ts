"use client";

import { SAFETY_QUESTION, getCategory, questionsFor } from "@/lib/domain/catalog";
import type {
  AvailabilitySelection,
  ContactMethod,
  FollowUpQuestion,
  IntakeAnswer,
  IntakeDraft,
  IntakePhoto,
  PropertyType,
  SafetyFlagId,
  ServiceCategoryId,
  UrgencyId,
} from "@/lib/domain/types";
import * as React from "react";

export type StepId =
  | "category"
  | "issue"
  | "urgency"
  | "contact"
  | "photos"
  | "availability"
  | "review"
  | `q:${string}`;

export interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address1: string;
  city: string;
  zip: string;
  contactMethod: ContactMethod;
  returning: boolean;
}

export interface IntakeState {
  propertyType: PropertyType;
  category?: ServiceCategoryId;
  issueId?: string;
  answers: Record<string, { valueIds: string[]; freeText?: string }>;
  urgency?: UrgencyId;
  customer: CustomerForm;
  photos: IntakePhoto[];
  availability: AvailabilitySelection[];
  notes: string;
  /** Safety flags the customer has seen the protocol for. */
  acknowledgedSafety: SafetyFlagId[];
}

const EMPTY_CUSTOMER: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address1: "",
  city: "",
  zip: "",
  contactMethod: "phone",
  returning: false,
};

export const INITIAL_STATE: IntakeState = {
  propertyType: "home",
  answers: {},
  customer: EMPTY_CUSTOMER,
  photos: [],
  availability: [],
  notes: "",
  acknowledgedSafety: [],
};

const DRAFT_KEY = "ksd.intake-draft.v1";

/** Issue families where the safety checklist is worth asking. */
const SAFETY_RELEVANT_CATEGORIES: ServiceCategoryId[] = [
  "cooling",
  "heating",
  "plumbing",
  "other",
];

function isSafetyRelevant(
  category: ServiceCategoryId | undefined,
  issueId: string | undefined,
): boolean {
  if (!category || !issueId) return false;
  if (!SAFETY_RELEVANT_CATEGORIES.includes(category)) return false;
  return !["maintenance", "replacement"].includes(issueId);
}

interface SavedDraft {
  state: IntakeState;
  index: number;
}

function readDraft(): SavedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedDraft;
    return saved?.state?.category ? saved : null;
  } catch {
    return null;
  }
}

/**
 * The wizard is mounted client-only (see `wizard-client.tsx`), so an in-progress
 * request can be restored straight into the initial state. No mount effect, no
 * hydration mismatch, and an accidental refresh doesn't cost the customer their
 * answers.
 */
export function useIntake() {
  const [restored] = React.useState(readDraft);
  const [state, setState] = React.useState<IntakeState>(() => ({
    ...INITIAL_STATE,
    ...(restored?.state ?? {}),
  }));
  const [index, setIndex] = React.useState(() => restored?.index ?? 0);
  const [direction, setDirection] = React.useState<1 | -1>(1);

  React.useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ state, index }));
    } catch {
      /* storage full or blocked — the wizard still works in memory */
    }
  }, [state, index]);

  const followUps: FollowUpQuestion[] = React.useMemo(() => {
    if (!state.category || !state.issueId) return [];
    const questions = questionsFor(state.category, state.issueId);
    return isSafetyRelevant(state.category, state.issueId)
      ? [...questions, SAFETY_QUESTION]
      : questions;
  }, [state.category, state.issueId]);

  const steps: StepId[] = React.useMemo(() => {
    const base: StepId[] = ["category", "issue"];
    for (const q of followUps) base.push(`q:${q.id}`);
    base.push("urgency", "contact", "photos", "availability", "review");
    return base;
  }, [followUps]);

  const step = steps[Math.min(index, steps.length - 1)];

  const safetyFlags: SafetyFlagId[] = React.useMemo(() => {
    const flags = new Set<SafetyFlagId>();
    for (const question of [...followUps, SAFETY_QUESTION]) {
      const answer = state.answers[question.id];
      if (!answer) continue;
      for (const id of answer.valueIds) {
        const flag = question.options?.find((o) => o.id === id)?.safety;
        if (flag) flags.add(flag);
      }
    }
    return [...flags];
  }, [followUps, state.answers]);

  const go = React.useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setIndex((i) => Math.max(0, Math.min(steps.length - 1, i + delta)));
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
      }
    },
    [steps.length],
  );

  const jumpTo = React.useCallback(
    (target: StepId) => {
      const i = steps.indexOf(target);
      if (i >= 0) {
        setDirection(i > index ? 1 : -1);
        setIndex(i);
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [steps, index],
  );

  const update = React.useCallback((patch: Partial<IntakeState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const setAnswer = React.useCallback(
    (questionId: string, valueIds: string[], freeText?: string) => {
      setState((s) => ({
        ...s,
        answers: { ...s.answers, [questionId]: { valueIds, freeText } },
      }));
    },
    [],
  );

  const selectCategory = React.useCallback((category: ServiceCategoryId) => {
    setState((s) =>
      s.category === category ? s : { ...s, category, issueId: undefined, answers: {} },
    );
  }, []);

  const selectIssue = React.useCallback((issueId: string) => {
    setState((s) => (s.issueId === issueId ? s : { ...s, issueId, answers: {} }));
  }, []);

  const reset = React.useCallback(() => {
    setState(INITIAL_STATE);
    setIndex(0);
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const clearDraft = React.useCallback(() => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const answers: IntakeAnswer[] = React.useMemo(
    () =>
      followUps
        .map((q): IntakeAnswer | null => {
          const value = state.answers[q.id];
          if (!value) return null;
          if (q.type === "text") {
            if (!value.freeText?.trim()) return null;
            return {
              questionId: q.id,
              prompt: q.prompt,
              valueIds: [],
              labels: [],
              freeText: value.freeText.trim(),
            };
          }
          const ids = value.valueIds.filter((id) => id !== "none");
          if (ids.length === 0) return null;
          return {
            questionId: q.id,
            prompt: q.prompt,
            valueIds: ids,
            labels: ids.map((id) => q.options?.find((o) => o.id === id)?.label ?? id),
          };
        })
        .filter((a): a is IntakeAnswer => a !== null),
    [followUps, state.answers],
  );

  const draft: IntakeDraft | null = React.useMemo(() => {
    if (!state.category || !state.issueId || !state.urgency) return null;
    return {
      propertyType: state.propertyType,
      category: state.category,
      issueId: state.issueId,
      urgency: state.urgency,
      answers,
      safetyFlags,
      photos: state.photos,
      availability: state.availability.filter((a) => a.windows.length > 0),
      notes: state.notes.trim() || undefined,
      customer: {
        name: state.customer.name.trim(),
        phone: state.customer.phone.trim(),
        email: state.customer.email.trim(),
        address1: state.customer.address1.trim(),
        city: state.customer.city.trim(),
        state: "IN",
        zip: state.customer.zip.trim(),
        contactMethod: state.customer.contactMethod,
        returning: state.customer.returning || undefined,
      },
    };
  }, [state, answers, safetyFlags]);

  return {
    state,
    setState,
    update,
    steps,
    step,
    index,
    direction,
    followUps,
    safetyFlags,
    answers,
    draft,
    go,
    jumpTo,
    setAnswer,
    selectCategory,
    selectIssue,
    reset,
    clearDraft,
    category: state.category ? getCategory(state.category) : undefined,
  };
}

export type IntakeController = ReturnType<typeof useIntake>;
