// The word-timed camera: a beat's moments (its `events`: spoken words → frames, from timeline.json)
// turn into named camera moves. A director writes a shot list in words, not frames:
//
//   direct(p.beat.events, [
//     { at: 0, move: "hold", pos: [0, 2, 9], look: [0, 1, 0] },
//     { at: "chip", move: "push", look: [0, 0.5, 0], dir: [0, 0.6, 1], from: 9, to: 4 },
//     { at: "inside", move: "dive", look: [0, 0.2, 0], dir: [0, 1, 0.3], from: 4, to: 0.6 },
//     { at: ["one", "two", "three"], move: "cuts", poses: [{ pos, look }, { pos, look }, { pos, look }] },
//   ])
//
// Each move starts on its word. A move with `from: "prev"`/no start pose continues from where the
// previous one ended. Motion blur follows the camera's speed by itself (Camera3D).
import { Easing } from "remotion";
import { moves, type CamKey } from "./Camera3D";
import type { V3 } from "./core";

export type When = number | string;

type Base = { at: When; dur?: number; fov?: number; ease?: (t: number) => number };

export type Shot =
  | (Base & { move: "hold" | "cut"; pos: V3; look: V3 })
  /** along the line of sight toward `look`: from distance `from` to `to` (push in: to < from; pull back: to > from) */
  | (Base & { move: "push" | "pullback"; look: V3; dir: V3; from?: number; to: number })
  /** a fast push (3–10× closer in ~1 s), eased hard in and out: the blur makes it feel like a dive */
  | (Base & { move: "dive"; look: V3; dir: V3; from?: number; to: number })
  | (Base & { move: "orbit"; center: V3; radius: number; height: number; from: number; to: number })
  | (Base & { move: "crane"; look: V3; base: V3; from?: number; to: number })
  | (Base & { move: "fly"; path: V3[]; look?: V3 })
  /** one hard cut per word: at[i] → poses[i] (a list read out: a new picture on each item) */
  | (Omit<Base, "at"> & { at: When[]; move: "cuts"; poses: { pos: V3; look: V3; fov?: number }[] });

const DIVE = Easing.bezier(0.7, 0, 0.2, 1);

/** The frame a word happens (events from the timeline); a number is used as it is. */
export function when(events: Record<string, number>, w: When): number {
  if (typeof w === "number") return w;
  const f = events[w];
  if (f === undefined) throw new Error(`camera: no event "${w}" in this beat (have: ${Object.keys(events).join(", ")})`);
  return f;
}

/** Shot list → camera keys for <Camera3D keys={...}/>. Pure; tested. */
export function direct(events: Record<string, number>, shots: Shot[], fps = 30): CamKey[] {
  const keys: CamKey[] = [];
  const last = () => keys[keys.length - 1];
  const along = (look: V3, dir: V3, d: number): V3 => {
    const l = Math.hypot(dir[0], dir[1], dir[2]) || 1;
    return [look[0] + (dir[0] / l) * d, look[1] + (dir[1] / l) * d, look[2] + (dir[2] / l) * d];
  };
  const distFrom = (look: V3): number | undefined => {
    const k = last();
    return k ? Math.hypot(k.pos[0] - look[0], k.pos[1] - look[1], k.pos[2] - look[2]) : undefined;
  };
  for (const s of shots) {
    if (s.move === "cuts") {
      s.at.forEach((w, i) => {
        const p = s.poses[Math.min(i, s.poses.length - 1)]!;
        keys.push(...moves.cut(when(events, w), p.pos, p.look, p.fov ?? s.fov ?? last()?.fov ?? 35));
      });
      continue;
    }
    const f0 = when(events, s.at);
    const fov = s.fov ?? last()?.fov ?? 35;
    switch (s.move) {
      case "hold":
        keys.push({ f: f0, pos: s.pos, look: s.look, fov, cut: keys.length > 0 && !samePose(last(), s.pos, s.look) });
        break;
      case "cut":
        keys.push(...moves.cut(f0, s.pos, s.look, fov));
        break;
      case "push":
      case "pullback":
      case "dive": {
        const dur = s.dur ?? (s.move === "dive" ? Math.round(fps * 0.9) : Math.round(fps * 1.6));
        const from = s.from ?? distFrom(s.look) ?? s.to * 2;
        const ease = s.ease ?? (s.move === "dive" ? DIVE : Easing.inOut(Easing.cubic));
        const prev = last();
        if (s.from === undefined && prev) {
          // continue from wherever the camera is: hold it until the word, then move
          keys.push({ f: f0, pos: prev.pos, look: prev.look, fov: prev.fov });
        } else {
          keys.push({ f: f0, pos: along(s.look, s.dir, from), look: s.look, fov, cut: !!prev && !nearPose(prev, along(s.look, s.dir, from)) });
        }
        keys.push({ f: f0 + dur, pos: along(s.look, s.dir, s.to), look: s.look, fov, ease });
        break;
      }
      case "orbit": {
        const dur = s.dur ?? Math.round(fps * 3);
        keys.push(...moves.orbit(f0, f0 + dur, s.center, s.radius, s.height, s.from, s.to, fov, s.ease));
        break;
      }
      case "crane": {
        const dur = s.dur ?? Math.round(fps * 2);
        const y0 = s.from ?? last()?.pos[1] ?? s.base[1];
        keys.push(...moves.crane(f0, f0 + dur, s.look, s.base, y0, s.to, fov, s.ease));
        break;
      }
      case "fly": {
        const dur = s.dur ?? Math.round(fps * 3);
        keys.push(...moves.fly(f0, f0 + dur, s.path, { look: s.look, fov }));
        break;
      }
    }
  }
  return keys;
}

function samePose(k: CamKey | undefined, pos: V3, look: V3): boolean {
  if (!k) return false;
  return nearPose(k, pos) && Math.hypot(k.look[0] - look[0], k.look[1] - look[1], k.look[2] - look[2]) < 1e-3;
}
function nearPose(k: CamKey | undefined, pos: V3): boolean {
  if (!k) return false;
  return Math.hypot(k.pos[0] - pos[0], k.pos[1] - pos[1], k.pos[2] - pos[2]) < 1e-3;
}
