import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests for the dashboard on sample data (no database). Used by the dashboard agent every
 * night and by the Agent merge workflow before any dashboard change is merged.
 *   npx playwright test                 # against `next start` (run `next build` first)
 *   PW_DEV=1 npx playwright test        # against `next dev`
 *   PW_CHANNEL=chrome ...               # use the installed Chrome instead of a downloaded Chromium
 */
const PORT = 3200;
export const SMOKE_PASSWORD = "smoke-test-password";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  outputDir: "test-results",
  use: { baseURL: `http://localhost:${PORT}`, channel: process.env.PW_CHANNEL || undefined, trace: "retain-on-failure" },
  projects: [
    { name: "desktop-light", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, colorScheme: "light", channel: process.env.PW_CHANNEL || undefined } },
    { name: "phone-dark", use: { ...devices["Pixel 7"], colorScheme: "dark", channel: process.env.PW_CHANNEL || undefined } },
  ],
  webServer: {
    command: `npx next ${process.env.PW_DEV ? "dev" : "start"} -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { DATABASE_URL: "", DASHBOARD_PASSWORD: SMOKE_PASSWORD, SESSION_SECRET: "smoke-test-session-secret-0123456789", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
