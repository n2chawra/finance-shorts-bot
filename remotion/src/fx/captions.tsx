/**
 * Big word-by-word captions (owner, 2026-10-21: "almost every viral Short has them, and many people
 * watch muted"). Drawn over the scene, outside the camera, from the caption tokens Python already
 * times (`voice.captions`: words as written, a figure as it shows on screen). A few words at a
 * time, the word being spoken highlighted, each group popping in as it starts.
 *
 * Shorts: big, over the wall above the cast's heads in a `stage` beat and in the lower third
 * elsewhere, clear of the bottom UI and the right-hand buttons.
 * Long videos: a smaller line in the lower third.
 */
import React from "react";
import type { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";

interface Token { t: string; s: number; e: number }   // real seconds from the start of the video

const MAX_WORDS = 3;          // words in a group
const MAX_CHARS = 18;         // a group breaks early when it would get wider than this
const BREAK_GAP = 0.32;       // a pause this long starts a new group
const HIGH = new Set(["stage"]);   // scenes with an empty wall above the cast

/** Every caption token of the video on the real clock. */
export function captionTokens(tl: Timeline): Token[] {
  const out: Token[] = [];
  for (const b of tl.beats) {
    const v = b.voice;
    if (!v) continue;
    const t0 = (b.from + v.start) / tl.fps;
    const toks = v.captions?.length ? v.captions : v.words.map((w) => ({ t: w.w, s: w.s, e: w.e }));
    // a figure ("₹46.5 L", "$2.2M") never breaks across lines
    for (const c of toks) out.push({ t: c.t.replace(/ /g, " "), s: t0 + c.s, e: t0 + c.e });
  }
  return out;
}

/** Tokens in groups of a few words, broken at punctuation and pauses. */
export function captionGroups(tokens: Token[]): Token[][] {
  const groups: Token[][] = [];
  let cur: Token[] = [];
  const chars = (g: Token[]) => g.reduce((n, x) => n + x.t.length + 1, 0);
  for (const tok of tokens) {
    const prev = cur[cur.length - 1];
    const brk = prev && (cur.length >= MAX_WORDS || chars(cur) + tok.t.length > MAX_CHARS
      || tok.s - prev.e > BREAK_GAP || /[.!?,:;]$/.test(prev.t));
    if (brk) { groups.push(cur); cur = []; }
    cur.push(tok);
  }
  if (cur.length) groups.push(cur);
  return groups;
}

export const Captions: React.FC<{ tl: Timeline; frame: number; groups: Token[][]; scene: string }> = ({ tl, frame, groups, scene }) => {
  const t = frame / tl.fps;
  // the group on screen: from its first word until the next group starts (or shortly after its last word)
  let i = groups.findIndex((g, k) => t >= g[0]!.s && t < Math.min(groups[k + 1]?.[0]!.s ?? Infinity, g[g.length - 1]!.e + 0.45));
  // the hook's first words are on screen from frame 0: that frame is what the feed shows
  if (i < 0 && groups.length && t < groups[0]![0]!.s && groups[0]![0]!.s < 1) i = 0;
  if (i < 0) return null;
  const g = groups[i]!;
  const v = tl.height > tl.width;
  const size = v ? 96 : 58;
  const since = t < g[0]!.s ? 1 : t - g[0]!.s;          // already shown in full before it is spoken
  const k = Math.min(1, since / 0.12);
  const scale = 0.82 + 0.18 * (1 - (1 - k) ** 3) + (k >= 1 ? 0 : 0.04 * Math.sin(k * Math.PI));
  // Shorts: on the wall above the cast's heads in a `stage` beat; lower in the other scenes, whose
  // labels and figures sit in the top half
  const top = v ? tl.height * (HIGH.has(scene) ? 0.4 : scene === "road" || scene === "shot" ? 0.72 : 0.66) : tl.height * 0.8;   // road: below the walker's face
  const left = v ? 60 : tl.width * 0.12, width = v ? tl.width - 60 - 150 : tl.width * 0.76;   // Shorts: clear of the right-hand buttons
  return (
    <div style={{ position: "absolute", left, top, width, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.12, textAlign: "center", textTransform: "uppercase",
        transform: `scale(${scale})`, transformOrigin: "50% 50%", letterSpacing: v ? 1 : 0.5,
        WebkitTextStroke: `${v ? 14 : 9}px #000`, paintOrder: "stroke fill", filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.55))" }}>
        {g.map((w, j) => {
          const on = t >= w.s && (t < w.e || j === g.length - 1 || t < g[j + 1]!.s);
          return <span key={j} style={{ color: on ? "#ffd84a" : "#ffffff" }}>{w.t}{j < g.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};
