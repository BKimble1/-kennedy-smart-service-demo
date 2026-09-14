import { PRIORITY_ORDER } from "@/lib/domain/triage";
import type { ServiceCategoryId, ServiceRequest } from "@/lib/domain/types";
import type { MetricKey } from "@/components/dashboard/stat-cards";

export type TradeFilter = "all" | "hvac" | "plumbing" | "install" | "maintenance";
export type SortKey = "priority" | "newest" | "waiting";
export type ViewFilter = MetricKey | "all";

const TRADE_MATCH: Record<Exclude<TradeFilter, "all">, ServiceCategoryId[]> = {
  hvac: ["cooling", "heating"],
  plumbing: ["plumbing"],
  install: ["install"],
  maintenance: ["maintenance"],
};

const OPEN = new Set(["new", "contacted", "scheduled", "assigned", "estimate-sent"]);

export function applyView(requests: ServiceRequest[], view: ViewFilter): ServiceRequest[] {
  switch (view) {
    case "new":
      return requests.filter((r) => r.status === "new");
    case "needs-response":
      return requests.filter((r) => r.status === "new" || r.status === "contacted");
    case "emergency":
      return requests.filter((r) => OPEN.has(r.status) && r.triage.priority === "emergency");
    case "scheduled":
      return requests.filter((r) => r.status === "scheduled" || r.status === "assigned");
    case "estimates":
      return requests.filter((r) => OPEN.has(r.status) && r.triage.estimateOpportunity.flagged);
    case "completed":
      return requests.filter((r) => r.status === "completed" || r.status === "closed");
    default:
      return requests;
  }
}

export function applyTrade(requests: ServiceRequest[], trade: TradeFilter): ServiceRequest[] {
  if (trade === "all") return requests;
  const categories = TRADE_MATCH[trade];
  return requests.filter((r) => categories.includes(r.category));
}

export function applySearch(requests: ServiceRequest[], query: string): ServiceRequest[] {
  const q = query.trim().toLowerCase();
  if (!q) return requests;
  return requests.filter((r) =>
    [
      r.customer.name,
      r.customer.city,
      r.customer.zip,
      r.customer.phone,
      r.reference,
      r.issueLabel,
      r.categoryLabel,
      r.assignedTech ?? "",
      r.notes ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function applySort(requests: ServiceRequest[], sort: SortKey): ServiceRequest[] {
  const copy = [...requests];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "waiting":
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    default:
      return copy.sort((a, b) => {
        const p = PRIORITY_ORDER[a.triage.priority] - PRIORITY_ORDER[b.triage.priority];
        if (p !== 0) return p;
        const s = b.triage.score - a.triage.score;
        if (s !== 0) return s;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }
}

export function filterAndSort(
  requests: ServiceRequest[],
  opts: { view: ViewFilter; trade: TradeFilter; query: string; sort: SortKey },
): ServiceRequest[] {
  return applySort(
    applySearch(applyTrade(applyView(requests, opts.view), opts.trade), opts.query),
    opts.sort,
  );
}
