# Deploying the demo

The app builds two ways. Either produces the same product; pick by where you want it.

| Target          | Command                          | Result                                          |
| --------------- | -------------------------------- | ----------------------------------------------- |
| Any static host | `npm run build:static`           | A self-contained `out/` folder                  |
| Any Node host   | `npm run build` then `npm start` | A server build, plus the optional live-AI route |

Nothing in the demo needs a database, an API key, or an account.

---

## Option A — GitHub Pages (already wired up, one switch to flip)

`.github/workflows/deploy-pages.yml` builds the static export and publishes it on
every push. It is currently failing at one step, and it is not something the workflow
can fix for itself — Pages has to be turned on for the repository once, by the repo
owner:

1. Open **<https://github.com/BKimble1/-kennedy-smart-service-demo/settings/pages>**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Open the **Actions** tab, pick **Deploy demo to GitHub Pages**, and click **Run workflow**

That's it. About two minutes later the demo is live at:

```
https://bkimble1.github.io/-kennedy-smart-service-demo/
```

The workflow sets `NEXT_PUBLIC_BASE_PATH` from the Pages configuration, so the
sub-path is handled for you.

---

## Option B — Vercel (fastest if you want a tidier URL)

From the project root:

```bash
npx vercel --prod
```

Sign in when prompted and accept the detected defaults — Vercel recognises Next.js and
needs no configuration. This deploys the **server** build, so `/api/ai` exists and the
live-AI upgrade path is available later. You get a URL like
`kennedy-smart-service-desk.vercel.app`, and a custom domain is free to attach.

## Option C — Netlify

```bash
npm run build:static
npx netlify deploy --prod --dir=out
```

## Option D — Cloudflare Pages

```bash
npm run build:static
npx wrangler pages deploy out --project-name kennedys-service-desk
```

## Option E — Anywhere you can copy files

```bash
npm run build:static   # writes ./out
```

Upload `out/` to S3, a cPanel `public_html`, or any web root. If it is served from a
sub-path, build with that path set:

```bash
NEXT_PUBLIC_BASE_PATH=/demo npm run build:static
```

---

## Before you send the link

1. Fill in your contact details in `src/lib/domain/business.ts` (`BUILDER`). Leave them
   blank and the About page simply omits the contact block — it never invents a name.
2. Open the URL on a phone and walk the full intake once.
3. Open `/dashboard` and confirm the seeded inbox loads.
4. Put the URL into `sales/OUTREACH.md` wherever it says `[DEMO URL]`.

## Optional: turning on live AI

Not needed for the demo, and the demo does not degrade without it.

```bash
# .env.local — never committed
NEXT_PUBLIC_AI_MODE=live
ANTHROPIC_API_KEY=sk-ant-...      # or OPENAI_API_KEY
```

Requires the **server** build (Option B), because the key is read inside
`src/app/api/ai/route.node.ts` and never reaches the browser. If the call fails for any
reason, the app silently falls back to the deterministic engine.
