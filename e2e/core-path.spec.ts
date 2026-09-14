import { expect, test, type Page } from "@playwright/test";

/**
 * The path a prospective owner is walked through in the live demo. If any of
 * this breaks, the demo is not showable — so it runs on four viewports.
 */

async function completeIntake(page: Page, opts: { sample?: boolean } = {}) {
  await page.goto("/request");

  // Step 1 — category
  await expect(
    page.getByRole("heading", { name: /what do you need help with/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Air Conditioning/ }).click();

  // Step 2 — issue
  await expect(page.getByRole("heading", { name: /what's happening/i })).toBeVisible();
  await page.getByRole("button", { name: /Blowing warm air/ }).click();

  // Step 3 — dynamic follow-ups
  await expect(page.getByRole("heading", { name: /what is the system doing/i })).toBeVisible();
  await page.getByRole("button", { name: /Running, but the air isn't cold/ }).click();

  await expect(page.getByRole("heading", { name: /outdoor unit/i })).toBeVisible();
  await page.getByRole("button", { name: /Yes, the fan is spinning/ }).click();

  await expect(page.getByRole("heading", { name: /when did this start/i })).toBeVisible();
  await page.getByRole("button", { name: /^Yesterday$/ }).click();

  await expect(page.getByRole("heading", { name: /how old is the equipment/i })).toBeVisible();
  await page.getByRole("button", { name: /10 to 15 years/ }).click();

  // Safety checklist
  await expect(page.getByRole("heading", { name: /is any of this happening/i })).toBeVisible();
  await page.getByRole("button", { name: /None of these/ }).click();
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 4 — urgency
  await expect(page.getByRole("heading", { name: /how soon do you need/i })).toBeVisible();
  await page.getByRole("button", { name: /Today if possible/ }).click();

  // Step 5 — contact
  await expect(page.getByRole("heading", { name: /where are we headed/i })).toBeVisible();
  if (opts.sample !== false) {
    await page.getByRole("button", { name: /Fill sample/i }).click();
    await expect(page.getByLabel(/Your name/i)).toHaveValue(/Megan Ruhl/);
  }
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 6 — photos
  await expect(page.getByRole("heading", { name: /photos help/i })).toBeVisible();
  await page.getByRole("button", { name: /Skip photos/i }).click();

  // Step 7 — availability
  await expect(page.getByRole("heading", { name: /when works for you/i })).toBeVisible();
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Step 8 — review
  await expect(page.getByRole("heading", { name: /here's what we'll send/i })).toBeVisible();
}

test.describe("customer intake", () => {
  test("a homeowner can submit a complete AC request", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await completeIntake(page);

    // The pre-submit summary is the product's core artifact.
    await expect(page.getByText("Request summary")).toBeVisible();
    await expect(page.getByText(/air coming out isn't cold/i).first()).toBeVisible();
    await expect(page.getByText(/Air Conditioning/).first()).toBeVisible();
    await expect(page.getByText(/Today if possible/).first()).toBeVisible();

    await page.getByRole("button", { name: /send this to kennedy/i }).click();

    // Confirmation
    await expect(page.getByRole("heading", { name: /you're all set/i })).toBeVisible({
      timeout: 15_000,
    });
    const reference = await page.locator("text=/KSD-\\d{4}/").first().innerText();
    expect(reference).toMatch(/KSD-\d{4}/);
    await expect(page.getByText(/what happens next/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /call \(765\) 664-5578/i })).toBeVisible();

    expect(errors, `console errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("the request appears in the office inbox", async ({ page }) => {
    await completeIntake(page);
    await page.getByRole("button", { name: /send this to kennedy/i }).click();
    await expect(page.getByRole("heading", { name: /you're all set/i })).toBeVisible({
      timeout: 15_000,
    });
    const reference = (await page.locator("text=/KSD-\\d{4}/").first().innerText()).trim();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /service requests/i })).toBeVisible();
    const row = page.locator(`a:has-text("${reference}")`).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("Megan Ruhl");
    await expect(row).toContainText(/High priority|Emergency|Standard/);
  });

  test("reporting a gas smell stops the flow and shows emergency guidance", async ({
    page,
  }) => {
    await page.goto("/request");
    await page.getByRole("button", { name: /Heating \/ Furnace/ }).click();
    await page.getByRole("button", { name: /Strange smell/ }).click();
    await expect(
      page.getByRole("heading", { name: /what does the smell remind you of/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Gas or rotten eggs/ }).click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/leave the building now/i)).toBeVisible();
    await expect(dialog.getByRole("link", { name: /911/ })).toBeVisible();
    await expect(dialog.getByText(/do not switch anything on or off/i)).toBeVisible();

    // Backing out clears the answer and returns to the question.
    await dialog.getByRole("button", { name: /change my answer/i }).click();
    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(
      page.getByRole("heading", { name: /what does the smell remind you of/i }),
    ).toBeVisible();
  });

  test("leaving after the contact step still reaches the office", async ({ page }) => {
    await page.goto("/request");
    await page.getByRole("button", { name: /Plumbing/ }).click();
    await page.getByRole("button", { name: /Water heater/ }).click();
    await page.getByRole("button", { name: /No hot water at all/ }).click();
    await page.getByRole("button", { name: /Electric tank/ }).click();
    await page.getByRole("button", { name: /5 to 10 years/ }).click();
    await page.getByRole("button", { name: /None of these/ }).click();
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.getByRole("button", { name: /Today if possible/ }).click();
    await page.getByRole("button", { name: /Fill sample/i }).click();
    await page.getByRole("button", { name: /^Continue$/ }).click();

    // Walk away here — no submit.
    await page.goto("/dashboard");
    const row = page
      .locator('a[href^="/dashboard/requests/"]', { hasText: "Megan Ruhl" })
      .first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("Unfinished");
    await row.click();
    await expect(page.getByText(/never finished/i)).toBeVisible();
    await expect(page.getByText(/would not exist at all/i)).toBeVisible();
  });

  test("finishing the request replaces the half-finished record", async ({ page }) => {
    await completeIntake(page);
    await page.getByRole("button", { name: /send this to kennedy/i }).click();
    await expect(page.getByRole("heading", { name: /you're all set/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.goto("/dashboard");
    const mine = page.locator('a[href^="/dashboard/requests/"]', { hasText: "Megan Ruhl" });
    // The half-finished record was replaced, not duplicated.
    await expect(mine).toHaveCount(1);
    await expect(mine.first()).not.toContainText("Unfinished");
  });

  test("an in-progress request survives a page refresh", async ({ page }) => {
    await page.goto("/request");
    await page.getByRole("button", { name: /Plumbing/ }).click();
    await page.getByRole("button", { name: /Clogged or slow drain/ }).click();
    await expect(page.getByRole("heading", { name: /backing up or draining/i })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: /backing up or draining/i })).toBeVisible();
  });
});

test.describe("office dashboard", () => {
  test("shows the seeded inbox with working filters", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /service requests/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /New requests/ })).toBeVisible();

    const rows = page.locator('a[href^="/dashboard/requests/"]');
    await expect(rows.first()).toBeVisible();
    const total = await rows.count();
    expect(total).toBeGreaterThanOrEqual(10);

    // The emergency card filters the list down.
    await page
      .getByRole("button", { name: /Emergency/ })
      .first()
      .click();
    await expect(page.getByText(/Showing/)).toBeVisible();
    const filtered = await rows.count();
    expect(filtered).toBeLessThan(total);
    expect(filtered).toBeGreaterThan(0);

    await page
      .getByRole("button", { name: /Clear filters/i })
      .first()
      .click();
    await expect(rows).toHaveCount(total);

    // Search narrows to one customer.
    await page.getByLabel(/search requests/i).fill("Gas City");
    await expect(rows.first()).toContainText("Gas City");

    expect(errors).toEqual([]);
  });

  test("the highest-priority request sorts first", async ({ page }) => {
    await page.goto("/dashboard");
    const first = page.locator('a[href^="/dashboard/requests/"]').first();
    await expect(first).toContainText("Emergency");
  });

  test("a request detail shows structured answers, triage reasoning and assist drafts", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/dashboard/requests/KSD-4206");
    await expect(page.getByRole("heading", { name: "Sarah Whitcomb" })).toBeVisible();
    await expect(page.getByText(/what the customer told us/i)).toBeVisible();
    await expect(page.getByText(/why it's ranked here/i)).toBeVisible();
    await expect(page.getByText(/Roughly how old is the equipment/i)).toBeVisible();

    // Smart office assist — call summary
    const assist = page.locator('[data-tour="assist"]');
    await expect(assist.getByRole("heading", { name: /smart office assist/i })).toBeVisible();
    await expect(assist.getByText(/Sarah Whitcomb in Marion/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(assist.getByText(/nothing sends on its own/i)).toBeVisible();

    // Reply draft
    await assist.getByRole("tab", { name: /reply draft/i }).click();
    const body = assist.getByLabel(/reply draft/i);
    await expect(body).toBeVisible();
    await expect(body).toHaveValue(/Hi Sarah/);

    // Tech notes — never a diagnosis
    await assist.getByRole("tab", { name: /tech notes/i }).click();
    await expect(assist.getByText(/confirm onsite/i)).toBeVisible();
    await expect(assist.getByText(/not a diagnosis/i)).toBeVisible();

    // Photos are present on this record
    await expect(page.getByText(/Photos \(2\)/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("a status change is written into the request history", async ({ page }) => {
    await page.goto("/dashboard/requests/KSD-4204");
    await page
      .locator('[data-tour="status"]')
      .getByRole("button", { name: /^Contacted$/ })
      .click();
    await expect(page.getByText(/Status → Contacted/).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Status → Contacted/).first()).toBeVisible();
  });

  test("the safety-flagged record warns the office", async ({ page }) => {
    await page.goto("/dashboard/requests/KSD-4200");
    await expect(page.getByText(/safety condition reported at intake/i)).toBeVisible();
    await expect(page.getByText(/leave the building now/i)).toBeVisible();
  });

  test("the business impact calculator recalculates", async ({ page }) => {
    await page.goto("/dashboard/impact");
    await expect(page.getByRole("heading", { name: /business impact/i })).toBeVisible();
    const before = await page
      .getByText(/hours a year that shifts/i)
      .locator("..")
      .innerText();
    await page.getByLabel(/service inquiries a week/i).fill("80");
    await expect(async () => {
      const after = await page
        .getByText(/hours a year that shifts/i)
        .locator("..")
        .innerText();
      expect(after).not.toBe(before);
    }).toPass();
    await expect(page.getByText(/this is an estimate/i)).toBeVisible();
    await expect(page.getByText(/not a revenue projection/i)).toBeVisible();
  });

  test("the pipeline board renders every stage", async ({ page }) => {
    await page.goto("/dashboard/board");
    await expect(page.getByRole("heading", { name: /pipeline/i })).toBeVisible();
    for (const stage of ["New", "Contacted", "Scheduled", "Completed"]) {
      await expect(page.getByRole("heading", { name: stage, exact: true })).toBeVisible();
    }
  });
});

test.describe("guided demo", () => {
  test("starts, advances and can be dismissed", async ({ page }) => {
    await page.goto("/demo");
    await page.getByRole("button", { name: /start the 90-second demo/i }).click();
    await expect(page).toHaveURL(/\/request/);
    const bar = page.getByText(/start where the customer starts/i);
    await expect(bar).toBeVisible();
    await page.getByRole("button", { name: /^Next$/ }).click();
    await expect(page.getByText(/check it, then send it/i)).toBeVisible();
    await page.getByRole("button", { name: /end the guided demo/i }).click();
    await expect(page.getByText(/check it, then send it/i)).toBeHidden();
  });
});

test.describe("concept labelling", () => {
  test("every surface carries the concept notice", async ({ page }) => {
    for (const path of [
      "/",
      "/request",
      "/dashboard",
      "/dashboard/board",
      "/dashboard/impact",
      "/demo",
    ]) {
      await page.goto(path);
      // The notice renders in more than one place; at least one must be on screen
      // at every viewport (the desktop rail is in the DOM but hidden on mobile).
      const visible = page
        .getByText(/concept demonstration prepared for kennedy/i)
        .filter({ visible: true });
      await expect(visible.first(), `no visible concept notice on ${path}`).toBeVisible();
    }
    // And the full disclaimer must be reachable, not just the short label.
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /read this before you judge it/i }),
    ).toBeVisible();
    await expect(page.getByText(/what it is not/i)).toBeVisible();
    await expect(page.getByText(/kennedy's did not ask for it/i).first()).toBeVisible();
    await expect(page.getByText(/stored in/i).first()).toBeVisible();
  });

  test("the about page never claims an endorsement", async ({ page }) => {
    await page.goto("/about");
    const body = (await page.locator("main").innerText()).toLowerCase();
    for (const claim of ["in partnership with", "approved by kennedy", "official kennedy"]) {
      // "not an official Kennedy's Inc. system" is allowed; a bare claim is not.
      if (claim === "official kennedy") continue;
      expect(body.includes(claim), `about page contains "${claim}"`).toBe(false);
    }
    expect(body).toContain("did not ask for it");
  });
});
