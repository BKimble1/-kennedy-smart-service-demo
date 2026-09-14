import type {
  ActivityEntry,
  AvailabilityWindow,
  IntakeDraft,
  PartialIntake,
  RequestStatus,
  ServiceRequest,
} from "@/lib/domain/types";

export interface RequestPatch {
  status?: RequestStatus;
  photos?: ServiceRequest["photos"];
  assignedTech?: string;
  scheduledFor?: { date: string; window: AvailabilityWindow };
  officeNotes?: string;
}

/**
 * Persistence boundary.
 *
 * The demo ships a localStorage implementation so a shared link gives every
 * visitor their own clean copy with no backend to stand up. A production build
 * swaps in a Postgres-backed implementation of this exact interface — nothing
 * above this line changes.
 */
export interface RequestStore {
  list(): ServiceRequest[];
  get(id: string): ServiceRequest | undefined;
  create(draft: IntakeDraft, now?: Date, replaceId?: string): ServiceRequest;
  /** Capture a half-finished request so an abandoned form still reaches the office. */
  savePartial(partial: PartialIntake, existingId?: string, now?: Date): ServiceRequest;
  update(id: string, patch: RequestPatch, actor?: string): ServiceRequest | undefined;
  addActivity(id: string, entry: Omit<ActivityEntry, "id" | "at">): ServiceRequest | undefined;
  reset(): void;
  /** Fired on any local mutation *and* on changes made in another tab. */
  subscribe(listener: () => void): () => void;
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  assigned: "Technician assigned",
  "estimate-sent": "Estimate sent",
  completed: "Completed",
  closed: "Lost / cancelled",
};

export const STATUS_ORDER: RequestStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "assigned",
  "estimate-sent",
  "completed",
  "closed",
];

/** Statuses that still need someone to do something. */
export const OPEN_STATUSES: RequestStatus[] = ["new", "contacted", "scheduled", "assigned"];

export const TECHNICIANS = ["Dale R.", "Marcus T.", "Wes K.", "Tony P.", "Brandi L."] as const;
