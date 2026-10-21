import { type Page, expect, test } from "@playwright/test";

import { SMOKE_PASSWORD } from "../playwright.config";

/** Every page loads on sample data without console errors, plus the flows the owner uses daily. */
const PAGES: [string, RegExp][] = [
  ["/", /Overview/], ["/queue", /Queue/], ["/calendar", /Calendar/], ["/videos", /Videos/], ["/videos/v030", /.+/],
  ["/analytics", /Analytics/], ["/runs", /Runs/], ["/agents", /Agents/], ["/notifications", /Notifications/],
  ["/templates", /Templates/], ["/settings", /Settings/],
];

const IGNORED = [/Download the React DevTools/, /ToggleGroup is changing from uncontrolled/];

async function signIn(page: Page) {
  const res = await page.request.post("/api/login", { data: { password: SMOKE_PASSWORD } });
  expect(res.ok()).toBeTruthy();
}

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error" && !IGNORED.some((r) => r.test(m.text()))) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("sign-in page renders and guards the app", async ({ page }) => {
  await page.goto("/queue");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /Sign in/ })).toBeVisible();
});

for (const [path, heading] of PAGES) {
  test(`page ${path} loads cleanly`, async ({ page }, info) => {
    const errors = watchConsole(page);
    await signIn(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(heading, { timeout: 30_000 });
    await page.waitForTimeout(1200);   // let entrance animations finish before the screenshot
    await page.screenshot({ path: info.outputPath(`${path === "/" ? "overview" : path.slice(1).replace(/\//g, "-")}.png`), fullPage: true });
    expect(errors, `console errors on ${path}`).toEqual([]);
  });
}

test("command palette jumps to a page", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is a desktop feature");
  await signIn(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Overview/, { timeout: 30_000 });
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.type("Queue");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/queue$/);
});

test("mark-as-uploaded dialog opens and validates the link", async ({ page }) => {
  await signIn(page);
  await page.goto("/videos/v031");
  await page.getByRole("button", { name: /Mark as uploaded/ }).click();
  const link = page.getByPlaceholder(/youtube\.com\/shorts/);
  await link.fill("not a link");
  await expect(page.getByText(/doesn't look like a YouTube video link/)).toBeVisible();
  await link.fill("https://youtube.com/shorts/AbCdEfGhIjK");
  await expect(page.getByText(/Video id AbCdEfGhIjK/)).toBeVisible();
});

test("settings show an unsaved-changes bar that can be discarded", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");
  await page.getByRole("switch", { name: "Pause generation" }).click();
  await expect(page.getByText("Unsaved changes")).toBeVisible();
  await page.getByRole("button", { name: "Discard" }).click();
  await expect(page.getByText("Unsaved changes")).toBeHidden();
});

test("notifications explain how to fix each problem", async ({ page }) => {
  await signIn(page);
  await page.goto("/notifications");
  await expect(page.getByText("How to fix").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark resolved" }).first()).toBeVisible();
});

test("queue rows never clip their text sideways", async ({ page }) => {
  await signIn(page);
  await page.goto("/queue");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Queue/, { timeout: 30_000 });
  const clipped = await page.locator("ol li").evaluateAll((rows) =>
    rows.filter((r) => [...r.querySelectorAll("div")].some((d) => d.scrollWidth > d.clientWidth + 1 && getComputedStyle(d).overflow !== "visible" && d.clientWidth > 0 && d.children.length > 1)).length);
  expect(clipped).toBe(0);
});

test("thumbnails on the daily pages all load", async ({ page }) => {
  await signIn(page);
  for (const path of ["/", "/queue", "/videos", "/templates"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 30_000 });
    await page.waitForLoadState("networkidle");
    const broken = await page.locator("img").evaluateAll((imgs) =>
      (imgs as HTMLImageElement[]).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")));
    expect(broken, `broken images on ${path}`).toEqual([]);
  }
});

test("video page names the narrator's accent and gender", async ({ page }) => {
  await signIn(page);
  for (const [id, label] of [["v031", "On · Bella (American, female)"], ["v033", "On · Alpha (Indian English, female)"]]) {
    await page.goto(`/videos/${id}`);
    await expect(page.locator("dt", { hasText: "Voiceover" }).locator("+ dd")).toHaveText(label!, { timeout: 30_000 });
  }
});

test("calendar plans long videos on their own days and time", async ({ page }) => {
  await signIn(page);
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Calendar/, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  // the sample queue holds two long videos; they post at 20:07 IST (Tue/Thu/Sat), never in a Short's slot
  const cells = page.locator("button[aria-pressed]");
  let text = (await cells.allTextContents()).join(" ");
  if (!text.includes("20:07")) {
    await page.getByRole("button", { name: "Next month" }).click();
    text += (await cells.allTextContents()).join(" ");
  }
  expect(text).toContain("20:07");
});
