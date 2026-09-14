"use client";

import { ConceptNotice } from "@/components/brand/concept-notice";
import { LogoDark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { BUSINESS, PRODUCT } from "@/lib/domain/business";
import { useRequests } from "@/lib/store/use-requests";
import { cn } from "@/lib/utils/cn";
import {
  ChartNoAxesColumn,
  Inbox,
  KanbanSquare,
  MonitorSmartphone,
  Play,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const NAV = [
  { href: "/dashboard", label: "Inbox", icon: Inbox, exact: true },
  { href: "/dashboard/board", label: "Pipeline", icon: KanbanSquare },
  { href: "/dashboard/impact", label: "Business impact", icon: ChartNoAxesColumn },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reset } = useRequests();
  const { push } = useToast();
  const [confirmReset, setConfirmReset] = React.useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-dvh bg-ink-100">
      {/* ---- Desktop rail ------------------------------------------------ */}
      <aside className="no-print texture-grid fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-ink-950 bg-ink-950 lg:flex">
        <div className="px-5 pt-5 pb-6">
          <Link href="/" className="inline-block rounded-md">
            <LogoDark />
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3" aria-label="Dashboard sections">
          {NAV.map((item) => {
            const active = isActive(item.href, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-white/[0.10] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}

          <div className="!mt-6 border-t border-white/8 pt-5">
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.1em] text-white/35 uppercase">
              Demo controls
            </p>
            <Link
              href="/demo"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/90"
            >
              <Play className="size-4 shrink-0" aria-hidden />
              Guided demo
            </Link>
            <Link
              href="/request"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/90"
            >
              <Smartphone className="size-4 shrink-0" aria-hidden />
              Customer view
            </Link>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/90"
            >
              <RotateCcw className="size-4 shrink-0" aria-hidden />
              Reset demo data
            </button>
          </div>
        </nav>

        <div className="space-y-3 border-t border-white/8 px-4 py-4">
          <div className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold text-white/80">{BUSINESS.name}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
              {BUSINESS.city}, {BUSINESS.state} · {BUSINESS.officeHoursLabel}
            </p>
          </div>
          <ConceptNotice variant="dark" />
        </div>
      </aside>

      {/* ---- Mobile / tablet top bar ------------------------------------- */}
      <header className="no-print sticky top-0 z-40 border-b border-ink-950/40 bg-ink-950 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="rounded-md">
            <LogoDark size="sm" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Button
              asChild
              size="icon-sm"
              variant="ghost"
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Link href="/request" aria-label="Open the customer view">
                <MonitorSmartphone aria-hidden />
              </Link>
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setConfirmReset(true)}
              aria-label="Reset demo data"
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw aria-hidden />
            </Button>
          </div>
        </div>
        <nav
          className="scrollarea flex gap-1 overflow-x-auto px-3 pb-2.5"
          aria-label="Dashboard sections"
        >
          {NAV.map((item) => {
            const active = isActive(item.href, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-white/12 text-white" : "text-white/55 hover:text-white/85",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="flex min-h-dvh flex-col lg:pl-[248px]">
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="no-print border-t border-ink-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-[11.5px] text-ink-400">
              {PRODUCT.fullName} · an independent concept build · {BUSINESS.phone}
            </p>
            <ConceptNotice />
          </div>
        </footer>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset the demo inbox?"
        description="This restores the 15 seeded requests and removes anything you created in this browser. Nothing else is affected."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                reset();
                setConfirmReset(false);
                push({ tone: "success", title: "Demo data reset", description: "15 requests restored." });
              }}
            >
              <RotateCcw aria-hidden />
              Reset
            </Button>
          </>
        }
      />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-ink-200 bg-white px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[21px] leading-tight font-semibold sm:text-[24px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
