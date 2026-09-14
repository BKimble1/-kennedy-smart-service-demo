import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/** Present in this dev container, absent on CI runners (where Playwright manages it). */
const DEFAULT_CHROMIUM = process.env.CI ? undefined : "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      // Local containers ship a prebuilt Chromium; CI installs its own.
      executablePath: process.env.PW_CHROMIUM || DEFAULT_CHROMIUM,
      // The demo container runs as root; Chromium's zygote sandbox is unavailable there.
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "laptop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
    },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1112 } },
    },
    {
      name: "mobile",
      // iPhone 13's descriptor defaults to WebKit; pin Chromium so it uses the
      // browser this image actually ships.
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
});
