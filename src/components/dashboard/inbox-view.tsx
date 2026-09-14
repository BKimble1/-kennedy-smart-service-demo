"use client";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCards, type MetricKey } from "@/components/dashboard/stat-cards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { SkeletonRows } from "@/components/ui/skeleton";
import { computeMetrics } from "@/lib/dashboard/metrics";
import {
  filterAndSort,
  type SortKey,
  type TradeFilter,
  type ViewFilter,
} from "@/lib/dashboard/filters";
import { useRequests } from "@/lib/store/use-requests";
import { relativeTime } from "@/lib/utils/format";
import { Inbox, Search, SearchX, Smartphone, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { RequestRow } from "./request-row";

const TRADES: { value: TradeFilter; label: string }[] = [
  { value: "all", label: "All trades" },
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "install", label: "Installs" },
  { value: "maintenance", label: "Maintenance" },
];

const VIEW_LABEL: Record<ViewFilter, string> = {
  all: "All requests",
  new: "New requests",
  "needs-response": "Needs response",
  emergency: "Emergency",
  scheduled: "Scheduled",
  estimates: "Estimate opportunities",
  completed: "Completed & closed",
};

export function InboxView() {
  const { requests, hydrated } = useRequests();
  const [view, setView] = React.useState<ViewFilter>("all");
  const [trade, setTrade] = React.useState<TradeFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("priority");
  const [query, setQuery] = React.useState("");

  const metrics = React.useMemo(() => computeMetrics(requests), [requests]);
  const visible = React.useMemo(
    () => filterAndSort(requests, { view, trade, query, sort }),
    [requests, view, trade, query, sort],
  );

  const latest = requests.reduce<string | null>(
    (acc, r) => (acc === null || r.createdAt > acc ? r.createdAt : acc),
    null,
  );
  const newestId = requests.find((r) => r.demoCreated && r.createdAt === latest)?.id;

  const filtersActive = view !== "all" || trade !== "all" || query.trim() !== "";

  return (
    <>
      <PageHeader
        title="Service requests"
        description={
          hydrated
            ? `${metrics.openTotal} open · ${metrics.newCount} waiting on a first call${
                latest ? ` · newest ${relativeTime(latest).toLowerCase()}` : ""
              }`
            : "Loading the inbox…"
        }
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/request">
              <Smartphone aria-hidden />
              Open customer view
            </Link>
          </Button>
        }
      />

      <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        {hydrated ? (
          <StatCards
            metrics={metrics}
            active={view}
            onSelect={(key: MetricKey) => setView((v) => (v === key ? "all" : key))}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[118px] rounded-xl" />
            ))}
          </div>
        )}

        <div className="border-ink-200 flex flex-col gap-3 rounded-xl border bg-white p-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="text-ink-400 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, town, ZIP, reference…"
              aria-label="Search requests"
              className="pl-9"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-ink-400 hover:bg-ink-100 hover:text-ink-700 absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 transition-colors"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Segmented
              ariaLabel="Filter by trade"
              size="sm"
              options={TRADES}
              value={trade}
              onChange={setTrade}
              className="hidden xl:inline-flex"
            />
            <Select
              value={trade}
              onChange={(e) => setTrade(e.target.value as TradeFilter)}
              aria-label="Filter by trade"
              className="h-9 w-auto py-0 text-[13px] xl:hidden"
            >
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort requests"
              className="h-9 w-auto py-0 text-[13px]"
            >
              <option value="priority">Sort: Priority</option>
              <option value="newest">Sort: Newest first</option>
              <option value="waiting">Sort: Longest waiting</option>
            </Select>
          </div>
        </div>

        {filtersActive ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-ink-500">
              Showing <span className="tnum text-ink-900 font-semibold">{visible.length}</span>{" "}
              {VIEW_LABEL[view].toLowerCase()}
              {trade !== "all" ? ` in ${TRADES.find((t) => t.value === trade)?.label}` : ""}
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setView("all");
                setTrade("all");
                setQuery("");
              }}
            >
              <X aria-hidden />
              Clear filters
            </Button>
          </div>
        ) : null}

        {!hydrated ? (
          <SkeletonRows rows={5} />
        ) : visible.length === 0 ? (
          requests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="The inbox is empty"
              description="Reset the demo data to bring back the seeded requests, or submit one from the customer view."
              action={
                <Button asChild>
                  <Link href="/request">Submit a request</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nothing matches those filters"
              description="Try widening the trade filter or clearing the search."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setView("all");
                    setTrade("all");
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )
        ) : (
          <div className="space-y-2.5 pb-8" data-tour="inbox">
            {visible.map((r, i) => (
              <RequestRow key={r.id} request={r} index={i} highlight={r.id === newestId} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
