/**
 * Captures the sales screenshots under sales/screenshots/.
 * Usage: node scripts/screenshots.mjs [baseURL]
 */
import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] ?? "http://127.0.0.1:3100";
const OUT = "sales/screenshots";
const EXEC = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shot(page, name, opts = {}) {
  await page.waitForTimeout(opts.settle ?? 700);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.full ?? false });
  console.log("captured", name);
}

async function desktopContext(width = 1600, height = 1000) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    try {
      window.sessionStorage.clear();
      window.localStorage.clear();
    } catch {}
  });
  return { ctx, page };
}

/* ---- Desktop ------------------------------------------------------------ */
{
  const { ctx, page } = await desktopContext();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, "01-landing");
  await page.screenshot({ path: `${OUT}/01-landing-full.png`, fullPage: true });

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await shot(page, "02-dashboard-inbox", { settle: 1200 });

  await page.goto(`${BASE}/dashboard/requests/KSD-4206`, { waitUntil: "networkidle" });
  await shot(page, "03-request-detail", { settle: 1400 });
  await page.screenshot({ path: `${OUT}/03-request-detail-full.png`, fullPage: true });

  // Smart office assist, reply-draft tab
  await page.getByRole("tab", { name: /reply draft/i }).click();
  await page.waitForTimeout(600);
  const assist = page.locator('[data-tour="assist"]');
  await assist.screenshot({ path: `${OUT}/04-smart-office-assist.png` });
  console.log("captured 04-smart-office-assist");

  await page.getByRole("tab", { name: /tech notes/i }).click();
  await page.waitForTimeout(600);
  await assist.screenshot({ path: `${OUT}/05-technician-notes.png` });
  console.log("captured 05-technician-notes");

  await page.goto(`${BASE}/dashboard/impact`, { waitUntil: "networkidle" });
  await shot(page, "06-business-impact", { settle: 1200 });
  await page.screenshot({ path: `${OUT}/06-business-impact-full.png`, fullPage: true });

  await page.goto(`${BASE}/dashboard/board`, { waitUntil: "networkidle" });
  await shot(page, "07-pipeline-board", { settle: 1000 });

  await ctx.close();
}

/* ---- Laptop 1366x768 ---------------------------------------------------- */
{
  const { ctx, page } = await desktopContext(1366, 768);
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await shot(page, "08-dashboard-1366", { settle: 1200 });
  await page.goto(`${BASE}/dashboard/requests/KSD-4198`, { waitUntil: "networkidle" });
  await shot(page, "09-request-detail-1366", { settle: 1400 });
  await ctx.close();
}

/* ---- Mobile intake ------------------------------------------------------ */
{
  const ctx = await browser.newContext({
    ...devices["iPhone 13"],
    browserName: "chromium",
    deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/request`, { waitUntil: "networkidle" });
  await shot(page, "10-mobile-intake-category", { settle: 900 });

  await page.getByRole("button", { name: /Air Conditioning/ }).click();
  await shot(page, "11-mobile-intake-issue");

  await page.getByRole("button", { name: /Blowing warm air/ }).click();
  await shot(page, "12-mobile-intake-followup");

  await page.getByRole("button", { name: /Running, but the air isn't cold/ }).click();
  await page.getByRole("button", { name: /Yes, the fan is spinning/ }).click();
  await page.getByRole("button", { name: /^Yesterday$/ }).click();
  await shot(page, "13-mobile-intake-age");
  await page.getByRole("button", { name: /10 to 15 years/ }).click();
  await shot(page, "14-mobile-safety-check");

  await page.getByRole("button", { name: /None of these/ }).click();
  await page.getByRole("button", { name: /^Continue$/ }).click();
  await shot(page, "15-mobile-urgency");

  await page.getByRole("button", { name: /Today if possible/ }).click();
  await page.getByRole("button", { name: /Fill sample/i }).click();
  await shot(page, "16-mobile-contact", { settle: 500 });

  await page.getByRole("button", { name: /^Continue$/ }).click();
  await shot(page, "17-mobile-photos");
  await page.getByRole("button", { name: /Skip photos/i }).click();
  await shot(page, "18-mobile-availability");
  await page.getByRole("button", { name: /^Continue$/ }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/19-mobile-review.png`, fullPage: true });
  console.log("captured 19-mobile-review");

  await page.getByRole("button", { name: /send this to kennedy/i }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/20-mobile-confirmation.png`, fullPage: true });
  console.log("captured 20-mobile-confirmation");
  await shot(page, "20-mobile-confirmation-top", { settle: 200 });
  await ctx.close();
}

/* ---- Safety interstitial ------------------------------------------------ */
{
  const ctx = await browser.newContext({
    ...devices["iPhone 13"],
    browserName: "chromium",
    deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/request`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Heating \/ Furnace/ }).click();
  await page.getByRole("button", { name: /Strange smell/ }).click();
  await page.getByRole("button", { name: /Gas or rotten eggs/ }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/21-safety-interstitial.png`, fullPage: true });
  console.log("captured 21-safety-interstitial");
  await shot(page, "21-safety-interstitial-top", { settle: 200 });
  await ctx.close();
}

/* ---- Mobile dashboard --------------------------------------------------- */
{
  const ctx = await browser.newContext({
    ...devices["iPhone 13"],
    browserName: "chromium",
    deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await shot(page, "22-mobile-dashboard", { settle: 1200 });
  await ctx.close();
}

/* ---- Guided demo -------------------------------------------------------- */
{
  const { ctx, page } = await desktopContext(1440, 900);
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  await shot(page, "23-guided-demo-launcher", { settle: 700 });
  await page.getByRole("button", { name: /start the 90-second demo/i }).click();
  await page.waitForTimeout(1600);
  await shot(page, "24-guided-demo-bar", { settle: 400 });
  await ctx.close();
}

await browser.close();
console.log("done");
