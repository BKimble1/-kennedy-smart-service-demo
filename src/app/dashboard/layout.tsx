import { DashboardShell } from "@/components/dashboard/shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Office dashboard",
  description: "Incoming service requests, triaged and ready to work.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
