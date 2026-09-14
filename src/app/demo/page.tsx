import { DemoLauncher } from "@/components/demo/demo-launcher";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guided demo",
  description: "A 90-second walkthrough of the Smart Service Desk concept.",
};

export default function DemoPage() {
  return <DemoLauncher />;
}
