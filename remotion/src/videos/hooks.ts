/**
 * A video's own code (owner, 2026-10-21 and 2026-10-26): its custom beats and its props.
 *
 *   remotion/src/videos/<video id>/Hook.tsx     the first seconds (scene "hook")
 *   remotion/src/videos/<video id>/<Name>.tsx   any other custom beat (scene "custom", params.component: "<Name>"),
 *                                               e.g. Turn.tsx and Payoff.tsx
 *   remotion/src/videos/<video id>/props.tsx    default-exports { name: PropFC }: the story's own things, drawn
 *                                               with studio/draw, used by "build" beats
 *
 * Each component default-exports a React.FC<SceneProps>. Webpack (the Remotion bundler) finds them
 * all; elsewhere (unit tests) there are none, and those beats fall back to a plain shot or build.
 */
import type React from "react";
import type { SceneProps } from "../scenes/kit";
import type { PropSet } from "../studio/draw";

type Mod = { default?: unknown };
type Ctx = { keys(): string[]; (key: string): Mod };
type WebpackRequire = { context?: (dir: string, deep: boolean, re: RegExp) => Ctx };

export interface VideoCode { components: Record<string, React.FC<SceneProps>>; props: PropSet }

function load(): Record<string, VideoCode> {
  let ctx: Ctx;
  try {
    // must stay a literal require.context call: webpack resolves it at build time
    ctx = (require as unknown as Required<WebpackRequire>).context("./", true, /\/[A-Za-z]+\.tsx$/);
  } catch {
    return {};          // not bundled by webpack (unit tests): no custom code
  }
  const out: Record<string, VideoCode> = {};
  for (const key of ctx.keys()) {
    const parts = key.split("/");
    const id = parts.at(-2), file = parts.at(-1)?.replace(/\.tsx$/, "");
    if (!id || !file || id === ".") continue;
    const mod = ctx(key);
    const v = (out[id] ??= { components: {}, props: {} });
    if (file === "props") {
      if (mod.default && typeof mod.default === "object") v.props = mod.default as PropSet;
    } else if (typeof mod.default === "function") {
      v.components[file] = mod.default as React.FC<SceneProps>;
    }
  }
  return out;
}

export const VIDEOS: Record<string, VideoCode> = load();
export const HOOKS: Record<string, React.FC<SceneProps>> = Object.fromEntries(
  Object.entries(VIDEOS).flatMap(([id, v]) => (v.components.Hook ? [[id, v.components.Hook]] : [])));
