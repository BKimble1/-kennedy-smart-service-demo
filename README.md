# Kennedy's Smart Service Desk — concept demonstration

An independent working prototype of an intelligent service-request intake and office
dashboard, built around the public service model of **Kennedy's Inc.** (HVAC + plumbing,
Marion, Indiana).

> **This is not an official Kennedy's Inc. system.** Kennedy's did not commission, review
> or approve it. It is not connected to their scheduling, billing or phone system, and
> nothing submitted through it reaches the business. Business name, phone number, address
> and service categories are public information, used here to make the concept concrete.

---

## What it is

A replacement for the generic _Name / Email / Subject / Message_ contact form, in two halves:

**The customer side** (`/request`) — a mobile-first, eight-step intake. Pick a trade, pick
what's happening, answer two to four follow-up questions that change based on the answer,
set urgency, leave contact and address details, optionally attach photos, choose preferred
appointment windows, and review a clean structured summary before sending.

**The office side** (`/dashboard`) — an inbox where every request arrives triaged, with the
reasoning shown. Open one and the call briefing, the customer reply draft and the
technician prep sheet are already written from the structured answers. Statuses move
through a drag-and-drop pipeline.

### Safety comes before triage

Six reported conditions — natural gas odor, a carbon monoxide alarm, smoke or burning,
sparking or scorched electrical equipment, uncontrolled flooding, and sewage backing up —
stop the intake flow and show an emergency protocol directing the customer to 911 and the
relevant utility. **The product never attempts to diagnose equipment.** Technician notes
list observations to confirm onsite, never a cause or a repair.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3100
```

| Script                        | What it does                                                  |
| ----------------------------- | ------------------------------------------------------------- |
| `npm run dev`                 | Development server                                            |
| `npm run build` / `npm start` | Production server build (supports the optional live-AI route) |
| `npm run build:static`        | Fully static export into `out/` — any static host             |
| `npm run verify`              | Format check, lint, typecheck, unit tests, production build   |
| `npm run test`                | Unit tests (Vitest)                                           |
| `npm run e2e`                 | End-to-end tests (Playwright, four viewports)                 |
| `npm run screenshots`         | Regenerate `sales/screenshots/`                               |

Requires Node 22+.

---

## Architecture

```
src/
  app/                      routes (App Router)
    api/ai/route.node.ts    optional live-model endpoint; excluded from static export
  components/
    intake/                 the customer wizard
    dashboard/              inbox, detail, pipeline, business impact
    ui/                     design-system primitives
  lib/
    domain/                 types, service catalog, question bank, safety protocols, triage
    ai/                     AIProvider interface + demo and live implementations
    store/                  RequestStore interface + localStorage implementation + seed data
```

### Triage is rules, not a model

`lib/domain/triage.ts` is a deterministic scoring engine. Every point it adds also produces
a plain-English reason, which the dashboard shows. An office has to be able to trust the
order of its own inbox, and "the model decided" is not a defensible answer when a no-heat
call gets buried.

### The AI layer works without an API key

`AIProvider` has two implementations:

- **`DemoAIProvider`** (default) composes the call summary, reply draft and prep sheet from
  the structured intake answers using a deterministic clause map. No network, no key, no
  per-request cost, and it cannot invent a fact that wasn't collected.
- **`LiveAIProvider`** posts to `/api/ai`, which holds an `ANTHROPIC_API_KEY` or
  `OPENAI_API_KEY` **server-side only** and is given exactly the same facts as grounding.
  It falls back to the demo engine on any failure.

Set `NEXT_PUBLIC_AI_MODE=live` to opt in. See `.env.example`. The demo never breaks because
a key is missing.

### Persistence

`RequestStore` is the boundary. The demo ships `LocalRequestStore` (versioned
`localStorage` + `BroadcastChannel`), so a single shared URL gives every visitor their own
clean copy of the inbox, two people can open it at once without colliding, and a write in
one tab updates every other open tab — which is what makes "submit on a phone, watch it
land on the office screen" work live. A production build swaps in a Postgres-backed
implementation of the same interface; nothing above that line changes.

---

## Two build modes

| Mode   | Command                | Notes                                                                                                    |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Server | `npm run build`        | Node host (Vercel, Render, Fly, self-hosted). Live-AI route available.                                   |
| Static | `npm run build:static` | Emits `out/`. No server, no API route. Deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`. |

`next.config.ts` drops the `node.ts` page extension in static mode, so the server-only AI
route is simply not part of that build.

Set `NEXT_PUBLIC_BASE_PATH` when hosting under a sub-path.

---

## Deploying

See **[DEPLOY.md](./DEPLOY.md)**. Short version: `npm run build:static` produces a
self-contained `out/` folder for any static host, and a GitHub Pages workflow is already
wired up — it needs Pages switched on for the repository once.

## The pitch package

`sales/` holds the material for showing this to a business:

| File                     | What it is                                               |
| ------------------------ | -------------------------------------------------------- |
| `DEMO-SCRIPT.md`         | The live walkthrough, beat by beat                       |
| `IMPLEMENTATION-PLAN.md` | What turning this into a real system takes               |
| `PRICING.md`             | Three packages, the reasoning, and the negotiation floor |
| `OUTREACH.md`            | The email, the short version, and the follow-ups         |
| `ONE-PAGE-PROPOSAL.md`   | The one-pager to send after interest                     |
| `screenshots/`           | Captured from the running app                            |

---

## Demo data

Fifteen seeded requests across Marion, Gas City, Jonesboro, Upland, Fairmount, Sweetser,
Van Buren and Converse. Every customer name, phone number, email address and street number
is invented; phone numbers use the reserved `555` range and emails use `example.com`. The
towns and ZIP codes are real places inside the stated service area so the map of the
business is recognizable — nothing else is.

"Reset demo data" in the dashboard restores them.
