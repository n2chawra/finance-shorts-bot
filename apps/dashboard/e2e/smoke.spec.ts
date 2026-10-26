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

test("template cards keep a readable text column", async ({ page }) => {
  await signIn(page);
  await page.goto("/templates");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Templates/, { timeout: 30_000 });
  // the long story's 16:9 player once left its description a ~150 px column on phones
  for (const name of ["Short story", "Long story"]) {
    const column = page.getByRole("heading", { level: 2, name }).locator("xpath=ancestor::div[contains(@class,'flex-1')][1]");
    const box = await column.boundingBox();
    expect(box?.width ?? 0, `${name} text column`).toBeGreaterThanOrEqual(220);
  }
});

test("video page calls a due slot due, not minutes ago", async ({ page }) => {
  // tomorrow 07:20 IST: the 07:07 Shorts slot is due, and the queue's first Short is the one to post
  const tomorrow = new Date(Date.now() + 330 * 60_000 + 86_400_000).toISOString().slice(0, 10);
  await page.clock.setFixedTime(new Date(`${tomorrow}T07:20:00+05:30`));
  await signIn(page);
  await page.goto("/queue");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Queue/, { timeout: 30_000 });
  const first = page.locator("ol li").first();
  await expect(first.locator("text=Uploading now >> visible=true").first()).toBeVisible();
  await first.locator("a[href^='/videos/'] >> visible=true").first().click();
  const publish = page.locator("dt", { hasText: "Publish at" }).locator("+ dd");
  await expect(publish).toContainText("Due now", { timeout: 30_000 });
  await expect(publish).not.toContainText("ago");
});

test("overview stat cards leave no half-empty row", async ({ page }) => {
  await signIn(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Overview/, { timeout: 30_000 });
  // on phones five cards wrap 2-2-1; the last one once sat alone beside an empty half row
  const grid = page.getByTestId("overview-stats");
  const edges = await grid.evaluate((g) => ({ right: g.getBoundingClientRect().right, last: g.lastElementChild!.getBoundingClientRect().right }));
  expect(Math.abs(edges.right - edges.last)).toBeLessThanOrEqual(2);
});

test("section tabs keep their labels on one line", async ({ page }) => {
  await signIn(page);
  // on phones the Agents tabs wrapped to two lines inside a fixed-height bar and clipped "(1)" and "log"
  for (const [path, heading] of [["/agents", /Agents/], ["/videos/v030", /.+/]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(heading, { timeout: 30_000 });
    const tabs = page.getByRole("tab");
    await expect(tabs.first()).toBeVisible();
    const clipped = await tabs.evaluateAll((els) => els.filter((e) => e.scrollHeight > e.clientHeight + 1).map((e) => e.textContent));
    expect(clipped, `clipped tabs on ${path}`).toEqual([]);
  }
});

test("data audit badge counts in the right number", async ({ page }) => {
  await signIn(page);
  await page.goto("/agents");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Agents/, { timeout: 30_000 });
  // sample data has 0 errors and 1 warning; the badge once read "0 errors · 1 warnings"
  await expect(page.getByText("0 errors · 1 warning", { exact: true })).toBeVisible();
});

test("resolve all leaves setting proposals for a decision", async ({ page }) => {
  await signIn(page);
  let sent: { ids: string[]; action: string } | null = null;
  // answer the PATCH here so the shared sample data stays as it is for the other tests
  await page.route("**/api/notifications", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    const body = route.request().postDataJSON() as { ids: string[]; action: string };
    if (body.action === "resolve") sent = body;
    const res = await route.fetch({ method: "GET" });
    await route.fulfill({ response: res });
  });
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Notifications/, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await page.getByRole("button", { name: "Resolve all" }).click();
  await expect.poll(() => sent?.ids.length ?? 0).toBeGreaterThan(0);
  expect(sent!.ids, "the open proposal must not be resolved").not.toContain("n0");
});

test("stat cards in a row share one height", async ({ page }) => {
  await signIn(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Overview/, { timeout: 30_000 });
  await page.waitForTimeout(1200);   // entrance animations move the cards
  // a card with a wrapped label or a longer line once stood taller than its neighbours, leaving a ragged row
  const ragged = await page.getByTestId("overview-stats").evaluate((g) => {
    const rows = new Map<number, number[]>();
    for (const cell of Array.from(g.children)) {
      const card = cell.firstElementChild!.getBoundingClientRect();
      const top = Math.round(cell.getBoundingClientRect().top);
      rows.set(top, [...(rows.get(top) ?? []), Math.round(card.height)]);
    }
    return [...rows.values()].filter((hs) => Math.max(...hs) - Math.min(...hs) > 1);
  });
  expect(ragged).toEqual([]);
});

test("videos topic filter offers every category it is given", async ({ page }) => {
  await signIn(page);
  // the topic list was fixed in code and missed newer categories: a link to one showed an empty filter
  await page.goto("/videos?category=net_worth");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(/Videos/, { timeout: 30_000 });
  await expect(page.getByRole("combobox", { name: "Topic" })).toHaveText(/Net worth/);
  await page.goto("/videos");
  await page.getByRole("combobox", { name: "Topic" }).click();
  await expect(page.getByRole("option", { name: "Credit card" })).toBeVisible();
});
