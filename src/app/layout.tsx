import { TourBar } from "@/components/demo/tour-bar";
import { ToastProvider } from "@/components/ui/toast";
import { BUSINESS, CONCEPT_NOTICE, PRODUCT } from "@/lib/domain/business";
import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT.fullName} — Concept Demo`,
    template: `%s · ${PRODUCT.name}`,
  },
  description: `${CONCEPT_NOTICE.short} A working prototype of an intelligent service-request intake and office dashboard for a ${BUSINESS.trade.toLowerCase()} contractor.`,
  robots: { index: false, follow: false },
  applicationName: PRODUCT.fullName,
  authors: [{ name: "Independent concept build" }],
};

export const viewport: Viewport = {
  themeColor: "#0f1722",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ToastProvider>
          {children}
          <TourBar />
        </ToastProvider>
      </body>
    </html>
  );
}
