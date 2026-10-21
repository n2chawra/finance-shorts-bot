/**
 * Custom hooks: one bespoke component per video for its first seconds (owner, 2026-10-21: a shot
 * system for the body, the hook written for each video). A routine writes
 * remotion/src/videos/<video id>/Hook.tsx, default-exporting a React.FC<SceneProps>, built from the
 * studio kit; a beat with scene "hook" draws it. Webpack (the Remotion bundler) finds every
 * Hook.tsx below this folder; elsewhere (unit tests) there are none, and "hook" beats fall back to
 * a plain shot with the same params.
 */
import type React from "react";
import type { SceneProps } from "../scenes/kit";

type Ctx = { keys(): string[]; (key: string): { default?: React.FC<SceneProps> } };
type WebpackRequire = { context?: (dir: string, deep: boolean, re: RegExp) => Ctx };

function load(): Record<string, React.FC<SceneProps>> {
  let ctx: Ctx;
  try {
    // must stay a literal require.context call: webpack resolves it at build time
    ctx = (require as unknown as Required<WebpackRequire>).context("./", true, /\/Hook\.tsx$/);
  } catch {
    return {};          // not bundled by webpack (unit tests): no custom hooks
  }
  const out: Record<string, React.FC<SceneProps>> = {};
  for (const key of ctx.keys()) {
    const id = key.split("/").slice(-2, -1)[0];
    const mod = ctx(key);
    if (id && mod.default) out[id] = mod.default;
  }
  return out;
}

export const HOOKS: Record<string, React.FC<SceneProps>> = load();
