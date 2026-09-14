import { IntakeWizardClient } from "@/components/intake/wizard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request service",
  description: "Tell us what's going on and the office will call you back to confirm a time.",
};

export default function RequestPage() {
  return <IntakeWizardClient />;
}
