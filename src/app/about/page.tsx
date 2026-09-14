import { AboutView } from "@/components/about-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About this demo",
  description:
    "What this prototype is, what it is not, where the data goes, and what a real build would involve.",
};

export default function AboutPage() {
  return <AboutView />;
}
