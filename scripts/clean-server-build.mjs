/**
 * `next build` writes `.next/required-server-files.json` even when the static
 * export is configured with its own `distDir`, and the static config (notably
 * `trailingSlash: true`) ends up in it. A later `next start` then serves the
 * server build with static routing — every URL gains a trailing slash and the
 * client-side RSC prefetches 404. It is a genuinely confusing failure.
 *
 * So after a static export we remove the server build outright. `next start`
 * then fails loudly with "could not find a production build", which is
 * self-correcting: you run `npm run build` and move on.
 */
import { rm } from "node:fs/promises";

await rm(".next", { recursive: true, force: true });
console.log("Removed .next — run `npm run build` before `npm start`.");
