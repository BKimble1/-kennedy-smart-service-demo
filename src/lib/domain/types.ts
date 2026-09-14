/**
 * Core domain model for Kennedy's Smart Service Desk.
 *
 * Everything the customer tells us is captured as structured data — never as a
 * blob of free text. That is the whole point of the product: structured intake
 * is what makes triage, prep and follow-up possible without a phone call.
 */

export type ServiceCategoryId =
  "cooling" | "heating" | "plumbing" | "maintenance" | "install" | "other";

export type UrgencyId = "emergency" | "today" | "next-available" | "planning";

export type ContactMethod = "phone" | "text" | "email";

export type PropertyType = "home" | "business";

export type RequestStatus =
  "new" | "contacted" | "scheduled" | "assigned" | "estimate-sent" | "completed" | "closed";

/** Conditions we never try to diagnose — we hand the customer off to emergency help. */
export type SafetyFlagId =
  "gas-odor" | "carbon-monoxide" | "smoke-fire" | "electrical" | "flooding" | "sewage";

export type QuestionType = "single" | "multi" | "text";

export interface AnswerOption {
  id: string;
  label: string;
  /** Short clarifier shown under the label on wider screens. */
  hint?: string;
  /** Selecting this raises a safety interstitial and halts normal triage. */
  safety?: SafetyFlagId;
  /** Contribution to the triage score (0 when neutral). */
  weight?: number;
  /** Signals used by triage + office assist. */
  signals?: RequestSignal[];
  /** Mutually exclusive with all other options in a `multi` question. */
  exclusive?: boolean;
}

export interface FollowUpQuestion {
  id: string;
  prompt: string;
  helper?: string;
  type: QuestionType;
  options?: AnswerOption[];
  placeholder?: string;
  /** `single`/`multi` questions may be skipped; free text always may be. */
  optional?: boolean;
}

/**
 * Machine-readable facts derived from answers. These drive triage, the estimate
 * flag and the office-assist copy — so the logic stays auditable instead of
 * hidden inside prose templates.
 */
export type RequestSignal =
  | "no-conditioning"
  | "partial-conditioning"
  | "system-dead"
  | "system-short-cycling"
  | "active-water"
  | "water-contained"
  | "water-stopped"
  | "whole-home"
  | "single-room"
  | "aging-equipment"
  | "very-old-equipment"
  | "new-equipment"
  | "replacement-intent"
  | "estimate-request"
  | "no-hot-water"
  | "no-water"
  | "recent-onset"
  | "long-standing"
  | "intermittent"
  | "business-property"
  | "repeat-repair"
  | "unknown";

export interface IssueOption {
  id: string;
  label: string;
  hint?: string;
  /** Ordered ids from the shared question bank. Kept to 2–4 on purpose. */
  questions: string[];
  signals?: RequestSignal[];
  /** Base triage weight before answers are considered. */
  weight?: number;
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  label: string;
  /** One line the homeowner reads to know they picked right. */
  blurb: string;
  icon: string;
  issues: IssueOption[];
}

export interface IntakeAnswer {
  questionId: string;
  prompt: string;
  /** Selected option ids (empty for free-text answers). */
  valueIds: string[];
  /** Human-readable labels, in the order presented. */
  labels: string[];
  freeText?: string;
}

export type PhotoKind = "equipment" | "problem" | "dataplate";

export interface IntakePhoto {
  id: string;
  kind: PhotoKind;
  name: string;
  /** Data URL — demo mode keeps photos entirely on the visitor's device. */
  dataUrl: string;
  sizeBytes: number;
  /** True for the seeded illustrative placeholders. */
  placeholder?: boolean;
}

export type AvailabilityWindow = "morning" | "afternoon" | "evening";

export interface AvailabilitySelection {
  /** ISO `yyyy-mm-dd`. */
  date: string;
  windows: AvailabilityWindow[];
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  contactMethod: ContactMethod;
  /** Set when the homeowner says they've used Kennedy's before. */
  returning?: boolean;
}

export type TriagePriority = "emergency" | "high" | "standard" | "planned";

export interface TriageResult {
  priority: TriagePriority;
  /** 0–100. Deterministic; see `triage.ts`. */
  score: number;
  /** Plain-language reasons the office can read and trust. */
  reasons: string[];
  estimateOpportunity: EstimateOpportunity;
  /** Home is without heating/cooling. */
  comfortRisk: boolean;
  /** Water is or was recently escaping. */
  waterRisk: boolean;
  /** Outside normal office hours when it arrived. */
  afterHours: boolean;
}

export interface EstimateOpportunity {
  flagged: boolean;
  /** Why the flag fired — never a recommendation to replace anything. */
  reason?: string;
  /** "asked" = customer explicitly requested; "signal" = inferred from intake. */
  kind?: "asked" | "signal";
}

export type ActivityKind =
  "submitted" | "status" | "note" | "contact" | "assign" | "schedule" | "estimate";

export interface ActivityEntry {
  id: string;
  at: string;
  kind: ActivityKind;
  actor: string;
  summary: string;
  detail?: string;
}

export interface ServiceRequest {
  id: string;
  /** Customer-facing reference, e.g. `KSD-4192`. */
  reference: string;
  createdAt: string;
  updatedAt: string;
  /** How it arrived. The demo only produces `web`; seeds show a realistic mix. */
  channel: "web" | "phone" | "text";
  propertyType: PropertyType;
  category: ServiceCategoryId;
  categoryLabel: string;
  issueId: string;
  issueLabel: string;
  urgency: UrgencyId;
  answers: IntakeAnswer[];
  signals: RequestSignal[];
  safetyFlags: SafetyFlagId[];
  photos: IntakePhoto[];
  availability: AvailabilitySelection[];
  notes?: string;
  customer: Customer;
  status: RequestStatus;
  assignedTech?: string;
  scheduledFor?: { date: string; window: AvailabilityWindow };
  triage: TriageResult;
  activity: ActivityEntry[];
  officeNotes?: string;
  /** Marks records created during this browser session. */
  demoCreated?: boolean;
  /**
   * `partial` means the customer gave contact details and then left without
   * finishing. The office still gets a name, a number and what was reported so
   * far, instead of the request evaporating.
   */
  completion?: "complete" | "partial";
  /** Which wizard step the customer reached before leaving. */
  abandonedAt?: string;
}

/** What we know at the point contact details are captured, mid-flow. */
export interface PartialIntake {
  propertyType: PropertyType;
  category: ServiceCategoryId;
  issueId: string;
  urgency: UrgencyId;
  answers: IntakeAnswer[];
  safetyFlags: SafetyFlagId[];
  customer: Customer;
  notes?: string;
  reachedStep: string;
}

/** The payload the intake wizard hands to the store. */
export interface IntakeDraft {
  propertyType: PropertyType;
  category: ServiceCategoryId;
  issueId: string;
  urgency: UrgencyId;
  answers: IntakeAnswer[];
  safetyFlags: SafetyFlagId[];
  photos: IntakePhoto[];
  availability: AvailabilitySelection[];
  notes?: string;
  customer: Customer;
}
