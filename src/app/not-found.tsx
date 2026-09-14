import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-ink-50 grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-md text-center">
        <Logo className="mb-8 justify-center" size="lg" />
        <p className="text-ink-400 font-mono text-[12px] tracking-[0.1em] uppercase">
          Page not found
        </p>
        <h1 className="font-display mt-3 text-[28px] leading-tight font-semibold">
          There&apos;s nothing at this address.
        </h1>
        <p className="text-ink-600 mt-3 text-[14.5px] leading-relaxed">
          Service requests in this demo live in your own browser, so a link from another device
          or after a demo reset won&apos;t resolve.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Back to the overview</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Open the dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
