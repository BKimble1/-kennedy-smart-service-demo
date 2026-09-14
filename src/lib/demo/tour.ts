export interface TourStep {
  id: string;
  title: string;
  body: string;
  /** Navigate here when the step opens. Omit to stay wherever the user is. */
  route?: string;
  /** `data-tour` value to scroll to and outline. */
  highlight?: string;
  /** Shown as the affordance the viewer is meant to use. */
  action?: string;
}

/**
 * The 90-second walkthrough. Each step is one idea and one thing to click; the
 * whole point is that a prospective owner can follow it without narration.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "intake-start",
    title: "Start where the customer starts",
    body: "Pick Air Conditioning, then “Blowing warm air”. Watch the follow-up questions change — a leak and a furnace noise are never asked the same things.",
    route: "/request",
    action: "Work through the questions",
  },
  {
    id: "intake-send",
    title: "Check it, then send it",
    body: "The last screen is a clean summary of everything collected. About a minute on a phone, and no blank “message” box to stare at.",
    action: "Send the request",
  },
  {
    id: "inbox",
    title: "It's already in the office inbox",
    body: "Top of the list, ranked, with the reasons shown in plain English. Nobody in the office typed any of this.",
    route: "/dashboard",
    highlight: "inbox",
    action: "Open the newest request",
  },
  {
    id: "assist",
    title: "The call is already prepared",
    body: "A two-to-four sentence briefing to read before dialing, and a reply draft to copy. Nothing is ever sent automatically.",
    highlight: "assist",
    action: "Switch between Call summary and Reply draft",
  },
  {
    id: "tech",
    title: "And so is the truck",
    body: "The Tech notes tab is the prep sheet: reported symptoms, approximate age, photos, and what to confirm onsite. Observations only — it never guesses a diagnosis.",
    highlight: "assist",
    action: "Open the Tech notes tab",
  },
  {
    id: "status",
    title: "Move it along",
    body: "Set the status here, or drag the card across the pipeline board. Every move is written into the request history.",
    highlight: "status",
    action: "Mark it Scheduled",
  },
  {
    id: "board",
    title: "The whole week at a glance",
    body: "Drag a card between stages. Inside each column the most urgent work sits at the top automatically.",
    route: "/dashboard/board",
    action: "Drag a card",
  },
  {
    id: "impact",
    title: "What it's worth, in your numbers",
    body: "Change the inputs to match the business. It estimates administrative time only — there are no revenue claims anywhere in this product.",
    route: "/dashboard/impact",
    action: "Adjust the inputs",
  },
];

export const TOUR_KEY = "ksd.tour.v1";

export interface TourState {
  active: boolean;
  index: number;
}

const IDLE: TourState = { active: false, index: 0 };

/*
 * A tiny external store so React can read tour state with `useSyncExternalStore`
 * instead of syncing it into component state from an effect. The snapshot is
 * cached because `useSyncExternalStore` compares by reference.
 */
let snapshot: TourState = IDLE;
const listeners = new Set<() => void>();

function load(): TourState {
  try {
    const raw = sessionStorage.getItem(TOUR_KEY);
    if (!raw) return IDLE;
    const parsed = JSON.parse(raw) as TourState;
    return { active: Boolean(parsed.active), index: parsed.index ?? 0 };
  } catch {
    return IDLE;
  }
}

function refresh() {
  const next = load();
  if (next.active !== snapshot.active || next.index !== snapshot.index) {
    snapshot = next;
  }
  for (const l of listeners) l();
}

export function subscribeTour(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== "undefined") {
    snapshot = load();
    window.addEventListener("storage", refresh);
    window.addEventListener("ksd:tour", refresh);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ksd:tour", refresh);
    }
  };
}

export function getTourSnapshot(): TourState {
  return snapshot;
}

export function getTourServerSnapshot(): TourState {
  return IDLE;
}

export function writeTour(state: TourState) {
  snapshot = state;
  try {
    sessionStorage.setItem(TOUR_KEY, JSON.stringify(state));
  } catch {
    /* sessionStorage unavailable — the tour still works for this page view */
  }
  for (const l of listeners) l();
}
