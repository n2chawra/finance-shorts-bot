// Which Chrome renders the frames. Remotion downloads its own headless shell from remotion.media,
// but the cloud routines' network blocks that host (spike, 2026-10-17); the cloud image ships
// Playwright's headless shell instead, so use it when it is there. Locally Remotion's own download
// works and nothing needs setting. REMOTION_BROWSER_EXECUTABLE overrides both.
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

export function findBrowser(): string | null {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) return process.env.REMOTION_BROWSER_EXECUTABLE;
  const root = "/opt/pw-browsers";
  if (!existsSync(root)) return null;
  const shells = readdirSync(root).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse();
  for (const d of shells) {
    // the layout changed in newer Playwright builds (2026-10-26): accept both
    for (const exe of [path.join(root, d, "chrome-linux", "headless_shell"),
      path.join(root, d, "chrome-headless-shell-linux64", "chrome-headless-shell")]) {
      if (existsSync(exe)) return exe;
    }
  }
  return null;
}
