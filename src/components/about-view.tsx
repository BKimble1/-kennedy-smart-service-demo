"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  BUILDER,
  BUSINESS,
  CONCEPT_NOTICE,
  PRODUCT,
  hasBuilderContact,
} from "@/lib/domain/business";
import {
  ArrowLeft,
  Ban,
  Check,
  Database,
  Mail,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const IS: string[] = [
  "A working application. Every screen is clickable and the office side reacts to what you submit on the customer side.",
  "Built from public information about Kennedy's Inc. — the business name, phone number, address, office hours, service area and service categories.",
  "A demonstration of one workflow: how a service request gets from a customer's phone to a technician's truck.",
];

const IS_NOT: string[] = [
  "An official Kennedy's Inc. system. Kennedy's did not ask for it, has not reviewed it and has not approved it.",
  "Connected to anything. It cannot reach Kennedy's phones, email, scheduling or billing. Nothing you type here is sent to the business.",
  "A diagnostic tool. It records what a customer can see and hands it to a technician. It never says what is wrong with equipment.",
  "Finished software. It is a concept built to show a workflow, not a product with accounts, backups or support behind it.",
];

const REAL_BUILD = [
  {
    title: "It would live on the business's own domain",
    body: "A page like request.kennedyheatingandair.com, linked from the existing contact page. The current contact form stays live throughout.",
  },
  {
    title: "Requests would go to a real database",
    body: "Not a browser. A hosted database with daily backups, a tested restore, and an export the business owns.",
  },
  {
    title: "The office would get notified",
    body: "Email to the office on every request, and a text for anything marked emergency or arriving after hours.",
  },
  {
    title: "Staff would sign in",
    body: "A short list of named accounts — owner, office, technicians — rather than a public link.",
  },
  {
    title: "Half-finished requests would still count",
    body: "A request is captured the moment a name and number are entered, so someone who closes the tab at the photo step still reaches the office. That is in the demo — try leaving part-way through and then open the dashboard.",
  },
  {
    title: "Drafts would still be drafts",
    body: "Nothing auto-sends to a customer in version one. A person reads it, edits it, and presses send.",
  },
];

export function AboutView() {
  return (
    <div className="bg-ink-50 min-h-dvh">
      <header className="border-ink-200 border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="rounded-md">
            <Logo />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft aria-hidden />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-brand-700 text-[11px] font-semibold tracking-[0.1em] uppercase">
          About this demo
        </p>
        <h1 className="mt-3 text-[30px] leading-[1.12] font-semibold sm:text-[38px]">
          Read this before you judge it.
        </h1>
        <p className="text-ink-600 mt-4 text-[16px] leading-relaxed">{CONCEPT_NOTICE.long}</p>

        <section className="mt-9 grid gap-3 sm:grid-cols-2">
          <div className="border-ok-200 rounded-xl border bg-white p-5">
            <p className="font-display text-ok-800 flex items-center gap-2 text-[15px] font-semibold">
              <Check className="size-4" aria-hidden />
              What it is
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {IS.map((t) => (
                <li key={t} className="text-ink-700 flex gap-2.5 text-[13.5px] leading-relaxed">
                  <span
                    aria-hidden
                    className="bg-ok-500 mt-[8px] size-1 shrink-0 rounded-full"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-danger-200 rounded-xl border bg-white p-5">
            <p className="font-display text-danger-800 flex items-center gap-2 text-[15px] font-semibold">
              <Ban className="size-4" aria-hidden />
              What it is not
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {IS_NOT.map((t) => (
                <li key={t} className="text-ink-700 flex gap-2.5 text-[13.5px] leading-relaxed">
                  <span
                    aria-hidden
                    className="bg-danger-500 mt-[8px] size-1 shrink-0 rounded-full"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-ink-200 mt-4 rounded-xl border bg-white p-5 sm:p-6">
          <h2 className="font-display text-ink-950 flex items-center gap-2 text-[16px] font-semibold">
            <Database className="text-ink-400 size-4" aria-hidden />
            Where the information goes
          </h2>
          <p className="text-ink-700 mt-3 text-[14px] leading-relaxed">
            Nowhere. Everything you enter — including photos — is stored in{" "}
            <span className="text-ink-950 font-medium">your own browser</span> and never leaves
            the device. There is no server holding it, no account, and no analytics on what you
            click.
          </p>
          <p className="text-ink-700 mt-2.5 text-[14px] leading-relaxed">
            Two practical consequences while you are looking around: a request you submit on
            your phone will not appear on your laptop, and clearing your browser data resets the
            demo to its fifteen seeded examples. Every one of those examples is fictional —
            invented names, reserved <span className="font-mono text-[13px]">555</span> phone
            numbers and <span className="font-mono text-[13px]">example.com</span> addresses.
            Only the towns and ZIP codes are real, so the service area looks like the real one.
          </p>
        </section>

        <section className="border-ink-200 mt-4 rounded-xl border bg-white p-5 sm:p-6">
          <h2 className="font-display text-ink-950 flex items-center gap-2 text-[16px] font-semibold">
            <ShieldCheck className="text-ink-400 size-4" aria-hidden />
            On safety
          </h2>
          <p className="text-ink-700 mt-3 text-[14px] leading-relaxed">
            If a customer reports a gas smell, a carbon monoxide alarm, smoke, sparking
            electrical equipment, flooding they cannot stop, or sewage backing up, the form
            stops. It shows emergency guidance and points them at 911 and the relevant utility
            instead of taking a service request. It does not try to work out what is wrong, and
            it does not promise anyone will arrive.
          </p>
          <p className="text-ink-500 mt-2.5 text-[13px] leading-relaxed">
            That wording would be reviewed and signed off by the business before anything like
            this went live. Nothing here is safety, medical or legal advice.
          </p>
        </section>

        <section className="border-ink-200 mt-4 rounded-xl border bg-white p-5 sm:p-6">
          <h2 className="font-display text-ink-950 flex items-center gap-2 text-[16px] font-semibold">
            <Wrench className="text-ink-400 size-4" aria-hidden />
            What making it real would involve
          </h2>
          <ol className="mt-4 space-y-3.5">
            {REAL_BUILD.map((item, i) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="tnum border-ink-200 bg-ink-50 text-ink-600 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[12px] font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-ink-900 text-[14px] font-medium">{item.title}</p>
                  <p className="text-ink-600 mt-0.5 text-[13.5px] leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="border-ink-150 text-ink-500 mt-4 border-t pt-3.5 text-[13px] leading-relaxed">
            That is a few weeks of work, not an afternoon, and it is quotable. Nothing on this
            site commits anyone to anything.
          </p>
        </section>

        {hasBuilderContact() ? (
          <section className="border-brand-200 bg-brand-50/50 mt-4 rounded-xl border p-5 sm:p-6">
            <h2 className="font-display text-brand-950 text-[16px] font-semibold">
              Who built this
            </h2>
            {BUILDER.name ? (
              <p className="text-ink-950 mt-2 text-[15px] font-medium">{BUILDER.name}</p>
            ) : null}
            <p className="text-ink-600 mt-0.5 text-[13.5px]">{BUILDER.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {BUILDER.email ? (
                <Button asChild size="sm" variant="secondary" className="bg-white">
                  <a href={`mailto:${BUILDER.email}`}>
                    <Mail aria-hidden />
                    {BUILDER.email}
                  </a>
                </Button>
              ) : null}
              {BUILDER.phone ? (
                <Button asChild size="sm" variant="secondary" className="bg-white">
                  <a href={`tel:${BUILDER.phone.replace(/\D/g, "")}`}>
                    <Phone aria-hidden />
                    {BUILDER.phone}
                  </a>
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="border-ink-200 bg-ink-100/60 text-ink-600 mt-4 rounded-xl border p-5 text-[13px] leading-relaxed sm:p-6">
          <p>
            <span className="text-ink-800 font-semibold">
              To reach {BUSINESS.name} for real
            </span>{" "}
            — service, questions, or anything about your equipment — call{" "}
            <a href={BUSINESS.phoneHref} className="text-brand-700 font-medium underline">
              {BUSINESS.phone}
            </a>{" "}
            or visit{" "}
            <a
              href={BUSINESS.websiteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-brand-700 font-medium underline"
            >
              {BUSINESS.website}
            </a>
            . They are at {BUSINESS.address}, {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip},
            open {BUSINESS.officeHoursLabel}. This prototype is not a way to contact them.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Button asChild>
            <Link href="/request">Try the customer side</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Open the office dashboard</Link>
          </Button>
        </div>

        <p className="border-ink-200 text-ink-400 mt-10 border-t pt-5 text-[11.5px]">
          {PRODUCT.fullName} · {CONCEPT_NOTICE.builtBy}
        </p>
      </main>
    </div>
  );
}
