# Pitch package — Kennedy's Smart Service Desk

Everything needed to show this to Kennedy's Inc. and quote it. Read them in this order.

| File                                                   | When you use it                                                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[OUTREACH.md](./OUTREACH.md)**                       | Tomorrow morning. The cold email, the short version, the voicemail script, the follow-ups, and what to send back to each likely reply.                       |
| **[DEMO-SCRIPT.md](./DEMO-SCRIPT.md)**                 | When you get the meeting. Beat by beat, what you click and what you say, plus answers to the questions an owner interrupts with.                             |
| **[ONE-PAGE-PROPOSAL.md](./ONE-PAGE-PROPOSAL.md)**     | After they show interest. One page, fits on one page.                                                                                                        |
| **[PRICING.md](./PRICING.md)**                         | Internal. Three packages, the hours behind each number, the opening quote, the floor, and what to say when they push back.                                   |
| **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** | Internal, and shareable if they ask "what would this actually take?". Build order, integrations, security, rollout, and the questions to ask before quoting. |
| **[screenshots/](./screenshots)**                      | Captured from the running app at desktop, 1366×768, tablet and iPhone widths. Regenerate with `npm run screenshots`.                                         |

## Placeholders to fill in before you send anything

- `[DEMO URL]` — the deployed link. See [../DEPLOY.md](../DEPLOY.md).
- `[YOUR NAME]`, `[YOUR PHONE]`, `[YOUR EMAIL]`, `[YOUR TOWN]`
- Your contact details also go in `src/lib/domain/business.ts` (`BUILDER`), which populates the app's About page.

## Two things these documents will not do

They will not claim Kennedy's asked for this, and they will not put a number on money the business would make. Every claim in here is either a fact about the software or an estimate the owner supplies the inputs for. Keep it that way — it is the only reason a cold pitch like this gets a reply.

## Screenshot index

| File                                            | What it shows                                        |
| ----------------------------------------------- | ---------------------------------------------------- |
| `01-landing`                                    | The page the link opens on                           |
| `02-dashboard-inbox`                            | The triaged office inbox                             |
| `03-request-detail`                             | A full request as the office sees it                 |
| `04-smart-office-assist`                        | The reply draft                                      |
| `05-technician-notes`                           | The technician prep sheet                            |
| `06-business-impact`                            | The admin-time calculator                            |
| `07-pipeline-board`                             | Drag-and-drop status pipeline                        |
| `08-dashboard-1366`, `09-request-detail-1366`   | The same at laptop width                             |
| `10`–`20`                                       | The whole customer intake on an iPhone, step by step |
| `21-safety-interstitial`                        | What a reported gas smell does                       |
| `22-mobile-dashboard`                           | The office side on a phone                           |
| `23-guided-demo-launcher`, `24-guided-demo-bar` | The self-guided walkthrough                          |
| `25-unfinished-request`                         | A request the customer never finished                |
| `26-about`                                      | The page explaining what this is and is not          |
