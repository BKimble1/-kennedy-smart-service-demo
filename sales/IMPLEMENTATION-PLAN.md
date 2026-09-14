# Implementation Plan
### Turning the Smart Service Desk concept into a system Kennedy's actually runs

**Demo:** [DEMO URL]
**Prepared by:** [YOUR NAME] · [YOUR PHONE] · [YOUR EMAIL]

---

## Read this first

This is an unsolicited concept. Kennedy's Inc. did not commission it, has not reviewed it, and has not approved it. I built it on my own so there would be something concrete to talk about instead of a sales sheet. There is no existing relationship between us.

The demo at [DEMO URL] is a working front end. The screens work. The storage behind them is temporary — it lives in your own browser, which is why every visitor to the link gets a clean copy. This document accounts for the gap between that and a system your office depends on.

Three things before anything else.

**What I am proposing is a two-week parallel run, not a switchover.** Your existing contact form stays live and unchanged the entire time. Both paths reach your office. At the end we look at what actually came in and you decide. Section 3.

**The price is section 2.** My fee, then the monthly running cost. Both before the technical detail, so you can stop reading early if the number is wrong.

**I will not write your response-time promise.** The confirmation email will say a person will follow up. It will not say how fast unless you give me the exact words, because that sentence is a commitment and it is yours to make.

I built this from public information and my own assumptions about how your office works. Some of those assumptions are wrong. Tell me which and I will change them.

### What already exists vs. what has to be built

| Piece | State today |
|---|---|
| 8-step customer intake, mobile-first | Built and working |
| Safety interlock and protocols | Built and working |
| Deterministic triage rules and reasons | Built and working |
| Office dashboard, inbox, detail view, status pipeline | Built and working |
| Smart Office Assist drafts (call summary, reply draft, tech prep sheet) | Built and working, deterministic |
| Persistence | Browser-local only. Has to be replaced. |
| Staff login | Does not exist |
| Email and SMS | Does not exist |
| Photo storage | Browser-local only |
| Calendar | Does not exist |
| Backups, monitoring, hosting | Does not exist |

Seven of those rows are unbuilt. That is the work in this document.

---

## 1. Who you would be working with, and what happens if I am not around

I am one person. [YOUR NAME], independent developer, [YOUR LOCATION]. [YEARS] building software; most recently [PRIOR WORK — one line]. References you can call: [REFERENCE 1], [REFERENCE 2]. Call them before you call me.

You would be giving a stranger a DNS record on your domain, accounts in your name, and a database holding your customers' home addresses and photographs of the inside of their houses. That is a real thing to hand over. Here is how it is structured so it stays yours.

**Every account is created under a Kennedy's email address with you as the owner. I get added as a collaborator.** Not the other way around.

| Account | Owner | I get |
|---|---|---|
| Domain DNS / registrar | Kennedy's (you already have it) | Nothing. Your web person adds the records. |
| Application hosting | Kennedy's | Collaborator access |
| Database and object storage | Kennedy's | Collaborator access |
| Code repository | Kennedy's | Collaborator access |
| Email and SMS providers | Kennedy's | Collaborator access |

Removing me is four collaborator removals and four password changes — not one, and I will not pretend it is one. It is a numbered checklist in the runbook, and you should have someone walk it once during handover so you know it works.

**If I get sick, take a job, or go quiet:**

- The code is in your repository from week 1, not delivered at the end.
- The stack is deliberately ordinary — Next.js, TypeScript, Postgres. No proprietary framework, no custom infrastructure, nothing that requires me specifically. Any competent web developer can read it.
- A written runbook is built during the project, not at the end: how to deploy, how to roll back, how to restore a backup, how to rotate a key, how to add a staff member.
- **Adding and removing staff is a screen you use, not a request you send me.** Owner-only, in the dashboard. Your office never waits on me to hire somebody.
- I will name two developers who could take this over, in the agreement, with their contact details. Names are worth more than my assurance.

---

## 2. What this costs

### My fee

Fixed price, not hourly, so a slow week of mine is not your problem.

| | |
|---|---|
| Week 0 discovery — 60–90 minutes with you, plus a look inside your scheduling system if you have one | **$[DISCOVERY FEE]**, credited against the build if you go ahead |
| Base build — database, staff login, email, photo storage, security, backups, testing, staging and production hosting, launch and handover (sections 4–13) | **$[FIXED FEE]** |
| After-hours SMS alerts, if you want them (section 6) | **+$[SMS ADD-ON]** |
| Google Calendar write, if you do not run a scheduling platform (section 8) | **+$[CALENDAR ADD-ON]** |
| Integration with an existing field-service platform | Not quoted until week 0. See section 8. |

Half at the start of week 1, half at handover. What is in the fixed price is the scope written down at the end of week 0. New features after that get priced separately before I build them — no surprise invoices, and no free scope creep either.

### Support after handover

You pick one of these. I am not asking you to invent my business model.

- **Nothing.** The system is yours and it runs. This is a legitimate choice.
- **Hourly as needed** — $[HOURLY RATE]/hr, no minimum, no retainer.
- **Monthly** — $[RETAINER]/mo: dependency and security updates, uptime monitoring I actually watch, backup restore tested quarterly, and up to [N] hours of small changes. Cancel any month.

### Monthly running cost

These are accounts in your name, billed to your card, and they are yours whether or not I am still involved. List prices at time of writing; confirm at signup.

| Item | Provider | Monthly |
|---|---|---|
| Application hosting | Render or Fly.io, $7–$19; Vercel Pro is $20 per user | $7 – $20 |
| Postgres, with point-in-time backups | Neon, Supabase, or Render | $7 – $25 |
| Object storage (photos) | Cloudflare R2 | under $1 |
| Transactional email | Postmark 10k/mo, or Resend | $0 – $15 |
| SMS number + messages | Twilio | $1.15 number, ~$0.0079/message |
| A2P 10DLC registration (SMS only) | Twilio / carriers | $4 one-time brand, $15 one-time campaign vetting, ~$2/mo |
| Error monitoring | Sentry free tier | $0 |
| Uptime checks | UptimeRobot free tier | $0 |
| Domain and TLS | You own the domain. Subdomain free, certificates automatic. | $0 |
| **Realistic total** | | **$40 – $80** |

Budget $60 a month. Drop SMS from v1 and take roughly $18 off, plus the carrier registration step.

The free tiers would technically run this. I would not use them: the commercial-use terms are murky and there is no support channel when your office is down on a Monday. The paid tier is worth the twenty dollars.

I do not know your request volume yet — that is question 2 in section 15 — and volume is what would move these numbers. If you run far more than I expect, the database line goes up and the rest does not.

---

## 3. The two-week parallel run

This is the part that makes the rest of the document low-risk, so it gets its own section.

For two weeks after soft launch, **your existing contact form stays live, unchanged, in the same place.** Both it and the new request form deliver to your office. Nothing is retired. Nothing is redirected. Customers who like the old form keep using it.

At the end of the two weeks we sit down with what actually came in:

- How many requests arrived through each path.
- How complete each one was.
- How many callbacks your office needed before a technician could be scheduled.
- Whether anything got missed.

Then you decide: keep both, retire the old one, or stop.

**If you stop:** the code is in your repository, the accounts are in your name, and the system keeps running as long as you pay the hosting. You owe nothing further. There is no refund of work already done, and I am not going to dress that up as a guarantee — if you want money-back terms, say so before week 1 and we write them into the agreement.

The old form staying live is also the deployment safety net. Worst case on any bad day is that people use the form they have been using.

---

## 4. Website integration

**The decision for you:** how customers get to the new form, and how much of your current site changes.

**Start with a link. Move to a subdomain once the office is comfortable.** That is my recommendation, in that order.

**Step one — link only.** Your contact page keeps its Name / Email / Subject / Message form exactly as it is, and gains a link: "Requesting service? Use the service request form — it asks a few specifics up front so the office has what it needs before they call you back." One link. Nothing else on your site changes. This is what runs during the parallel run.

**Step two — subdomain.** The form lives at its own address, something like `request.kennedyheatingandair.com`. Separate application, separate hosting, its own deploys. If it has a problem, your website stays up. If your website is rebuilt later, the form carries over untouched. At that point you add a button in the main navigation, one on the contact page, one on the home page, and optionally a link in your Google Business Profile.

What it takes on your side: one DNS record added by whoever manages your domain.

**The option I would not take:** embedding the form inside a page on your existing site in an iframe. It looks more integrated and the URL stays on your domain, but iframes complicate photo uploads on some mobile browsers and the page height has to be managed with scripts. Only worth it if branding continuity matters more to you than the simpler failure mode.

Your existing contact form does a different job — general questions, vendors, billing — and it should keep doing it regardless of what you decide.

---

## 5. Data and persistence

**The decision for you:** none. This one is not optional.

The demo stores requests in the visitor's own browser. A real system needs a real database. The application was written for this swap: there is a single storage interface with six methods. The demo implements it against browser storage. Production implements the same six against Postgres. No screen, no triage rule and no dashboard component changes.

Tables: requests, photos, activity history, staff users, sessions, and a notification log that records what was sent to whom and when. Triage priority is computed once when a request is written and stored with it — never recomputed on read — so the reasons your office saw yesterday are still the reasons in the record today. Migrations are forward-only and additive so an application rollback never leaves the database ahead of the code.

The full schema is drafted and it is about a page and a half. Say the word and I will send it, or hand it to whoever reviews technical work for you. It does not belong in this document.

### Retention

Proposed defaults. Yours to change, and you should change them if your insurer or attorney says so.

- **Open and recent requests:** kept indefinitely. They are business records.
- **Photos:** 24 months after the job closes, then deleted automatically. Longer if you want them for warranty history — that is a config value.
- **Abandoned intakes** (started, never submitted): 30 days.
- **Server and access logs:** 90 days.
- **Notification log:** 24 months. It is your proof of what went out.
- **Deletion on request:** a customer asks, you delete. One button, owner only, logged.

---

## 6. Email and SMS

**The decision for you:** whether you want texting at all in v1, and what your after-hours alert should do.

### Transactional email

Two messages to start.

1. **Customer confirmation**, sent on submission: their reference number, a plain summary of what they told us, your phone number, and a line saying a person will follow up. The wording about timing is yours (see Read this first).
2. **Office notification**, sent to the office address on every submission, with the priority and the triage reasons in the subject line so your inbox sorts without opening anything.

Provider: Postmark or SendGrid. Postmark is better at transactional deliverability and simpler to configure. Either needs SPF and DKIM records on your domain so confirmations land in inboxes instead of junk — two or three DNS records, added once, no effect on your existing email. Automated mail sends from a subdomain so a deliverability problem with it can never touch the reputation of the address you send real mail from.

### SMS for after-hours alerts

Narrow and specific: when a request arrives outside office hours and the triage rules score it Emergency or High, text the on-call phone. One message, to one Kennedy's number, containing the priority, the town and the reference number. No customer name, no address, no phone number in the body — text messages sit visible on lock screens.

Provider: Twilio. Requires A2P 10DLC registration with the carriers before the first message sends. A few business days, and it needs your legal business name, EIN and address.

### If you ever text customers

That is a different thing from alerting your own on-call phone, and it carries a real consent and opt-out obligation under the TCPA — recorded consent, automatic STOP and HELP handling, quiet hours, business identification on every message. I will walk you through the specifics before we build any of it, and your attorney or insurer should see it before the first customer text goes out. If you skip customer texting in v1, email plus your existing phone calls cover the job and the compliance burden disappears.

### Why nothing auto-sends in v1

The Smart Office Assist panel writes the reply. It does not send it. Copy buttons and nothing else.

That is deliberate. Before any message goes out under your name without a person reading it, your office needs to read a few hundred drafts and tell me which ones are good enough. Then we automate that narrow set and only that set. If the answer after six months is "none of them," the product still works.

---

## 7. Staff access

**The decision for you:** who gets in, and at what level.

Deliberately small. No self-registration, no public sign-up, no password reset anyone can trigger from outside.

- **Fixed staff list.** You give me the names, emails and roles to start. After that, **adding and removing people is an owner-only screen in the dashboard.** It is in the base price. Your hiring does not route through me.
- **Magic link sign-in.** Staff enter their work email, get a link, click it, they are in. Single-use, expires in 15 minutes. No passwords for office and technicians, so no shared password taped to a monitor.
- **Owner account gets a password plus an authenticator app** as a second route in, so there is a way to sign in that does not depend on email working.
- **Three roles.**
  - *Owner* — everything, including data export, deletion, staff management, Business Impact page.
  - *Office* — inbox, request detail, status changes, scheduling, Office Assist, notes. No export, no delete.
  - *Technician* — assigned requests only. Detail view, prep sheet, mark complete.
- **Sessions.** Signed, httpOnly, Secure cookies. 30 days rolling on the shop computer, 7 days on technician phones. Export, delete and staff changes require a sign-in within the last hour. Removing someone revokes their sessions immediately.

Not building: SSO, an org chart, per-field permissions, or an audit console. Tell me in week 0 if you need any of it and I will price it; otherwise it is scope that can break without earning its keep.

---

## 8. Calendar and scheduling

**The decision for you:** this branches on one question, and it is the single biggest variable in the price. It gets answered in week 0, before I quote — not discovered later.

> **Do you run a field-service platform — ServiceTitan, Housecall Pro, FieldEdge, Jobber, ServiceFusion or similar — and is it the system of record for your dispatch schedule?**

**If no, or "a whiteboard and a shared calendar":**
One-way and simple. When the office marks a request Scheduled, the app writes an event to a dedicated Google Calendar shared with the office and the technicians — customer name, address, window, trade, priority, and a link back to the full request. Changes in the app update the event; deleting cancels it. The app is the system of record, the calendar is the readable view of it on everyone's phone. Setup is a one-time authorization from a Kennedy's Google account. Low risk, priced as an add-on in section 2.

**If yes:**
Your platform is the system of record and this app feeds it. What is possible depends entirely on that vendor's API. Generally: ServiceTitan's is gated behind a developer program and higher plan tiers; Housecall Pro and Jobber have workable APIs on some plans; several platforms offer nothing usable and the realistic answer is a copy-paste or CSV workflow.

I will not quote this before I have seen inside your account. That is what the week 0 discovery fee buys — I sit with you, we log in, and we find out what it can actually do. Any number I gave you before that would be padding.

**What I will not promise in v1:** two-way sync. Two-way sync means conflict resolution, and conflict resolution means deciding what happens when a dispatcher moves a job in one system while the office moves it in the other. That is its own project.

---

## 9. Photos and file storage

**The decision for you:** how long you keep customer photos. Default is 24 months after the job closes.

- **Object storage:** Cloudflare R2 or Amazon S3. R2 has no egress charges, which keeps a surprise bill off the table. Private bucket, no public URLs, ever.
- **Upload path:** the browser downscales first — longest edge 1600px, tuned to land under roughly 800KB — then uploads straight to storage with a short-lived signed URL. The app server never handles the file bytes.
- **Limits:** up to 5 photos per request, 10MB each before downscaling. JPEG, PNG, HEIC. The server re-validates type and size; it does not trust the browser.
- **EXIF:** GPS coordinates and device serial data stripped on upload. Orientation preserved so pictures are not sideways.
- **Access:** staff view photos through 5-minute signed URLs. A link copied out of the dashboard stops working before it can be shared anywhere useful.
- **Lifecycle:** soft-delete on the record, hard-delete from storage 30 days later so an accidental deletion is recoverable. Automatic purge 24 months after close.

---

## 10. Security, privacy and backups

People will type their home address into this form and attach a picture of their basement, some of them at 2am with water coming through the ceiling. Everything in this section exists so that keeping that information safe is something you can verify rather than hope.

### What the system collects

Name, phone, email, service address, city, ZIP, home or business, preferred contact method, the structured answers to the intake questions, optional photos, and preferred appointment days and windows.

### What it does not collect, and will not

No card data. No bank details. No Social Security numbers. No dates of birth. If you later want deposits or card-on-file, that runs through a payment processor's hosted fields so the card number never touches this application or its database. That is a v2 conversation and it changes the compliance picture significantly.

### Protections

- **In transit:** HTTPS everywhere, TLS 1.2 minimum, HSTS on. The form will not load over plain HTTP.
- **At rest:** database and object storage both on provider-managed AES-256 encryption. Backups encrypted the same.
- **Secrets:** API keys in the host's environment variables, none in the repository, repository private. Any key ever pasted into a chat, email or text gets rotated.
- **Access:** role-based (section 7). Database credentials held by the application and the owner, not distributed to staff.
- **Spam:** rate limiting and a honeypot field on the public submit endpoint, so your inbox stays clean without putting a CAPTCHA in front of a customer at midnight.
- **Error monitoring** with customer data scrubbed before reports leave the server.

### Backups and restore

- Managed Postgres point-in-time recovery, 7-day window.
- A nightly dump to a separate storage bucket in a different account, 30-day retention. Two providers would both have to fail.
- Photo storage has versioning on, so an overwrite or delete is recoverable.
- **A restore is tested before launch and again 90 days after.** I restore into a scratch database, confirm row counts, spot-check records, and write down how long it took. It is a line item in the schedule, not an intention.
- **Export:** owner only. Full CSV of requests plus a zip of photos, on demand, logged each time. Opens in Excel.

I am not your lawyer. Indiana has a data breach notification law and your attorney can tell you what it requires of a business your size; it is worth twenty minutes of their time before launch.

---

## 11. Hosting, staging and rollback

Two environments, separate databases, separate storage buckets, separate email sending. Staging sends only to a test inbox, so a mistake there can never reach a customer. Staging is internal and password-protected at the edge; production is the public subdomain.

Every change goes to staging first. Your office signs off on staging. Then production.

**Rollback:** deploys are immutable builds, so rolling back is promoting the previous build — under a minute, no rebuild. Database migrations add columns and do not drop them in the same release, so rolling the application back never strands the schema. And through the parallel run the old contact form is still live, which is the real safety net.

---

## 12. Testing

A furnace call that gets lost is worse than no online form at all. The testing is sized to that.

**Unit tests.** Every triage scoring path, every reason string, the after-hours boundaries at 8:00am and 5:00pm, weekends, and the safety short-circuit that has to beat every other rule. Question routing for all six categories and every issue. Signal collection, including that an unrecognized answer cannot silently score.

**Golden-file tests.** About 40 representative intakes with their expected priority, score and reasons committed as fixtures. If someone edits a rule weight, the diff shows exactly which calls change position in your inbox. This is the test that protects your office from a well-meaning change.

**End-to-end tests.** Full 8-step intake through to the confirmation screen and reference number. Every safety option from every issue halts the flow and shows the protocol — that one runs on every deploy and a failure blocks the release. Back-navigation and editing from the summary without losing answers. Photo attach, preview, remove. Office side: sign in, filter, sort, open detail, generate all three Office Assist drafts, move a request through the full status pipeline, assign a technician.

**Accessibility.** The intake and the dashboard get a keyboard pass, a screen-reader pass and a contrast check before launch. The safety screen gets its own review.

**Real devices, not emulators.** A mid-range Android and an iPhone two or three generations old, on cellular data rather than office wifi. Photo upload from a phone camera is the step most likely to break in the real world and the one nobody tests properly.

**Then the parallel run** (section 3), which is the only test that counts.

---

## 13. Rollout plan

Part-time work on my side, a few short calls on yours. Weeks can slip; dependencies are what cause slippage, so each week names yours.

| Week | What I build | What I need from Kennedy's |
|---|---|---|
| 0 | Discovery. The questions in section 15. **If you run a scheduling platform, we log into it together and settle the integration.** Scope and price agreed in writing. | 60–90 minutes with you and one office person. Platform login. |
| 1 | Postgres behind the storage interface, migrations, staging environment. Hosting and storage accounts created in your name. Code repository is yours from day one. | Someone to create the accounts with a Kennedy's email and add me. |
| 2 | Staff sign-in, three roles, session handling, owner-only staff management screen. | Names, emails and roles to start. |
| 3 | Customer confirmation and office notification email. Photo upload to object storage. | SPF/DKIM records. **Your exact wording for the confirmation email**, including anything about response times. |
| 4 | Office acceptance testing on staging. Question wording and labels corrected to how you actually talk to customers. | 90 minutes with whoever answers the phone. They will find more than I will. |
| 5 | Fixes from week 4. Calendar or platform integration, as settled in week 0. Accessibility and real-device passes. Restore test performed and documented. | A decision: link or subdomain (section 4). |
| 6 | Production deployed and running, not yet linked from your site. Soft launch — link added to the contact page. Parallel run begins, old form stays live. | Your web person adds the link. |
| 7 | After-hours SMS alert, if you want it. | Legal business name, EIN and address for carrier registration. The on-call number. |
| 8 | Parallel-run review. Triage weights adjusted against real requests. Handover: documentation, credentials, runbook, and a walk through removing my access. | 60 minutes to review what came in and decide about the old form. |

Weeks 4 and 8 determine whether this is any good, and both are mostly your people talking and me listening.

One note on the Business Impact page: the time-savings calculator runs on numbers you type in about your own office. It is a way to think about the trade, using your inputs. It is not a forecast and it is not a claim I am making about your business.

---

## 14. Out of scope for v1

Naming these now so nobody is surprised in week 6. Any of them can be a later phase.

- Payments, deposits, card-on-file, invoicing, parts, inventory, and anything touching an accounting system.
- Dispatch optimization, routing, GPS tracking, time clocks, a technician mobile app, offline mode, or anything from an app store.
- Two-way sync with a field-service platform (section 8).
- A customer login portal with service history, maintenance agreements or equipment records.
- Anything that sends without a person pressing send (section 6), and anything promotional — marketing email, review requests, seasonal campaigns.
- Live chat, phone-system integration, call recording or transcription; a second language; custom report building beyond the dashboard's summary cards.
- **Any attempt to diagnose equipment.** The app collects what the customer observes and hands it to a NATE-certified technician. It does not guess at causes, suggest repairs, or recommend replacing anything. That line does not move in v2 either.

---

## 15. Questions I need answered before I can quote

Each of these moves the price, the schedule, or the shape of the build.

1. **Do you run a field-service or dispatch platform, and is it the system of record for scheduling?** The largest variable. Drives all of section 8.
2. **Roughly how many service requests come in per week, and what share arrive by phone versus the website today?** Sizes the database line and tells us what "better" would look like after the parallel run.
3. **Who manages kennedyheatingandair.com and the DNS, and how fast can they add records?** The subdomain and the email authentication both wait on this. It is frequently the slowest step in the whole project.
4. **Who answers the phone day to day, and can I have 90 minutes with that person in week 4?** They know which questions the form asks wrong.
5. **Do you want to text customers at all, or is email plus your phones enough for v1?** Texting adds carrier registration, consent capture, opt-out handling and an ongoing obligation.
6. **What should the confirmation email say about when someone will hear back?** Your words.
7. **How do you handle after-hours emergencies now — on-call rotation, answering service, or voicemail until 8am?** Determines whether the after-hours alert has anywhere useful to go.
8. **How many staff need access, and does anyone need a technician-only view?** Changes role setup and testing.
9. **How long do you want to keep customer photos, and does your insurer or attorney have a view on retention?**
10. **How should requests route, and what happens to the old form?** Three parts: do commercial requests need to be weighted differently from residential; does your financing offer belong anywhere in this flow — my instinct is on the estimate path and nowhere near an emergency, but it is your call; and do you keep the existing contact form permanently or retire it after the parallel run. Two intake paths forever is a legitimate choice, but it is a choice.

---

*[YOUR NAME] · [YOUR PHONE] · [YOUR EMAIL] · Demo: [DEMO URL]*
