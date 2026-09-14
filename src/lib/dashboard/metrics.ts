import type { ServiceRequest } from "@/lib/domain/types";

export interface DashboardMetrics {
  newCount: number;
  needsResponse: number;
  emergency: number;
  scheduled: number;
  estimates: number;
  completed: number;
  afterHours: number;
  withPhotos: number;
  openTotal: number;
  /** Oldest `new` request still waiting, in minutes. */
  oldestWaitingMinutes: number | null;
}

const OPEN = new Set(["new", "contacted", "scheduled", "assigned", "estimate-sent"]);

export function computeMetrics(requests: ServiceRequest[], now = new Date()): DashboardMetrics {
  const open = requests.filter((r) => OPEN.has(r.status));
  const waiting = requests.filter((r) => r.status === "new");
  const oldest = waiting.reduce<number | null>((acc, r) => {
    const mins = Math.round((now.getTime() - new Date(r.createdAt).getTime()) / 60000);
    return acc === null || mins > acc ? mins : acc;
  }, null);

  return {
    newCount: waiting.length,
    needsResponse: requests.filter((r) => r.status === "new" || r.status === "contacted").length,
    emergency: open.filter((r) => r.triage.priority === "emergency").length,
    scheduled: requests.filter((r) => r.status === "scheduled" || r.status === "assigned").length,
    estimates: open.filter((r) => r.triage.estimateOpportunity.flagged).length,
    completed: requests.filter((r) => r.status === "completed").length,
    afterHours: requests.filter((r) => r.triage.afterHours).length,
    withPhotos: requests.filter((r) => r.photos.length > 0).length,
    openTotal: open.length,
    oldestWaitingMinutes: oldest,
  };
}

export function formatWait(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
