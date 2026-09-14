import type { ServiceRequest } from "@/lib/domain/types";

export interface SummarySection {
  label: string;
  value: string;
  /** Rendered as a list rather than a paragraph. */
  items?: string[];
  tone?: "default" | "alert" | "accent";
}

export interface IntakeSummary {
  /** One line the office reads first, e.g. "AC running but not cooling — 12-yr system". */
  headline: string;
  /** Ordered sections for the structured card. */
  sections: SummarySection[];
  /** A single sentence version used in list rows and notifications. */
  oneLine: string;
}

export interface TechNotes {
  reportedIssue: string;
  equipment: string;
  symptoms: string[];
  approximateAge: string;
  photos: string;
  safetyConcerns: string[];
  verifyOnsite: string[];
  access: string;
}

export type ReplyChannel = "email" | "text";

export interface CustomerReply {
  channel: ReplyChannel;
  subject?: string;
  body: string;
}

export interface AssistBundle {
  callSummary: string;
  reply: CustomerReply;
  techNotes: TechNotes;
}

export type ProviderId = "demo" | "live";

export interface AIProvider {
  readonly id: ProviderId;
  readonly label: string;
  /** Shown in the UI so nobody is misled about what generated the text. */
  readonly description: string;
  summarize(request: ServiceRequest): Promise<IntakeSummary>;
  callSummary(request: ServiceRequest): Promise<string>;
  reply(request: ServiceRequest, channel: ReplyChannel): Promise<CustomerReply>;
  techNotes(request: ServiceRequest): Promise<TechNotes>;
  assist(request: ServiceRequest, channel: ReplyChannel): Promise<AssistBundle>;
}
