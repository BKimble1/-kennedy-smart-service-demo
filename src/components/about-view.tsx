"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { BUILDER, BUSINESS, CONCEPT_NOTICE, PRODUCT, hasBuilderContact } from "@/lib/domain/business";
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
    title: "Drafts would still be drafts",
    body: "Nothing auto-sends to a customer in version one. A person reads it, edits it, and presses send.",
  },
];

export function AboutView() {
  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
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
        <p className="text-[11px] font-semibold tracking-[0.1em] text-brand-700 uppercase">
          About this demo
        </p>
        <h1 className="mt-3 text-[30px] leading-[1.12] font-semibold sm:text-[38px]">
          Read this before you judge it.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-600">
          {CONCEPT_NOTICE.long}
        </p>

        <section className="mt-9 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ok-200 bg-white p-5">
            <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-ok-800">
              <Check className="size-4" aria-hidden />
              What it is
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {IS.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-700">
                  <span aria-hidden className="mt-[8px] size-1 shrink-0 rounded-full bg-ok-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-danger-200 bg-white p-5">
            <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-danger-800">
              <Ban className="size-4" aria-hidden />
              What it is not
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {IS_NOT.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-700">
                  <span
                    aria-hidden
                    className="mt-[8px] size-1 shrink-0 rounded-full bg-danger-500"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink-950">
            <Database className="size-4 text-ink-400" aria-hidden />
            Where the information goes
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
            Nowhere. Everything you enter — including photos — is stored in{" "}
            <span className="font-medium text-ink-950">your own browser</span> and never leaves the
            device. There is no server holding it, no account, and no analytics on what you click.
          </p>
          <p className="mt-2.5 text-[14px] leading-relaxed text-ink-700">
            Two practical consequences while you are looking around: a request you submit on your
            phone will not appear on your laptop, and clearing your browser data resets the demo to
            its fifteen seeded examples. Every one of those examples is fictional — invented names,
            reserved <span className="font-mono text-[13px]">555</span> phone numbers and{" "}
            <span className="font-mono text-[13px]">example.com</span> addresses. Only the towns and
            ZIP codes are real, so the service area looks like the real one.
          </p>
        </section>

        <section className="mt-4 rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink-950">
            <ShieldCheck className="size-4 text-ink-400" aria-hidden />
            On safety
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
            If a customer reports a gas smell, a carbon monoxide alarm, smoke, sparking electrical
            equipment, flooding they cannot stop, or sewage backing up, the form stops. It shows
            emergency guidance and points them at 911 and the relevant utility instead of taking a
            service request. It does not try to work out what is wrong, and it does not promise
            anyone will arrive.
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-ink-500">
            That wording would be reviewed and signed off by the business before anything like this
            went live. Nothing here is safety, medical or legal advice.
          </p>
        </section>

        <section className="mt-4 rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink-950">
            <Wrench className="size-4 text-ink-400" aria-hidden />
            What making it real would involve
          </h2>
          <ol className="mt-4 space-y-3.5">
            {REAL_BUILD.map((item, i) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="tnum mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-ink-200 bg-ink-50 text-[12px] font-semibold text-ink-600">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink-900">{item.title}</p>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-600">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-ink-150 pt-3.5 text-[13px] leading-relaxed text-ink-500">
            That is a few weeks of work, not an afternoon, and it is quotable. Nothing on this site
            commits anyone to anything.
          </p>
        </section>

        {hasBuilderContact() ? (
          <section className="mt-4 rounded-xl border border-brand-200 bg-brand-50/50 p-5 sm:p-6">
            <h2 className="font-display text-[16px] font-semibold text-brand-950">Who built this</h2>
            {BUILDER.name ? (
              <p className="mt-2 text-[15px] font-medium text-ink-950">{BUILDER.name}</p>
            ) : null}
            <p className="mt-0.5 text-[13.5px] text-ink-600">{BUILDER.blurb}</p>
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

        <section className="mt-4 rounded-xl border border-ink-200 bg-ink-100/60 p-5 text-[13px] leading-relaxed text-ink-600 sm:p-6">
          <p>
            <span className="font-semibold text-ink-800">To reach {BUSINESS.name} for real</span>{" "}
            — service, questions, or anything about your equipment — call{" "}
            <a href={BUSINESS.phoneHref} className="font-medium text-brand-700 underline">
              {BUSINESS.phone}
            </a>{" "}
            or visit{" "}
            <a
              href={BUSINESS.websiteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-brand-700 underline"
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

        <p className="mt-10 border-t border-ink-200 pt-5 text-[11.5px] text-ink-400">
          {PRODUCT.fullName} · {CONCEPT_NOTICE.builtBy}
        </p>
      </main>
    </div>
  );
}
