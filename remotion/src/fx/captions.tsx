/**
 * Big word-by-word captions (owner, 2026-10-21: "almost every viral Short has them, and many people
 * watch muted"). Drawn over the scene, outside the camera, from the caption tokens Python already
 * times (`voice.captions`: words as written, a figure as it shows on screen). A few words at a
 * time, the word being spoken highlighted, each group popping in as it starts.
 *
 * Since 2026-11-02 (owner-approved, after The Curious Plot study): a small line in a dark box low on
 * the frame, every word still shown, the word being spoken and every figure in yellow, so the middle
 * of the frame belongs to the picture (the big captions sat across it). Clear of the bottom UI and,
 * in a Short, of the right-hand buttons.
 */
import React from "react";
import type { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";

interface Token { t: string; s: number; e: number; who?: string; board?: boolean }   // real seconds from the start of the video

const MAX_WORDS = 4;          // words in a group
const MAX_CHARS = 24;         // a group breaks early when it would get wider than this
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
    for (const c of toks) out.push({ t: c.t.replace(/ /g, " "), s: t0 + c.s, e: t0 + c.e, who: b.speaker ?? "narrator", board: b.scene === "board" });
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
    // a board video shows whole sentences, two lines at most (The Curious Plot's subtitle box)
    const sentence = !!tok.board && !!prev?.board;
    const brk = prev && (prev.who !== tok.who || (sentence ? (cur.length >= 11 || chars(cur) + tok.t.length > 52 || /[.!?]$/.test(prev.t))
      : (cur.length >= MAX_WORDS || chars(cur) + tok.t.length > MAX_CHARS || tok.s - prev.e > BREAK_GAP || /[.!?,:;]$/.test(prev.t))));
    if (brk) { groups.push(cur); cur = []; }
    cur.push(tok);
  }
  if (cur.length) groups.push(cur);
  return groups;
}

/** Where the captions band starts (road: below the walker's face). Scenes keep their own labels out
 * of [top, top + CAPTION_BAND] (QA, 2026-10-28: captions sat on the stack labels). */
export function captionTop(w: number, h: number, scene: string): number {
  // a Short's box is anchored by its bottom edge (SHORT_UI_BOTTOM) and grows upward
  return h > w ? h - SHORT_UI_BOTTOM - captionBand(w, h, scene) : h * (scene === "board" ? 0.87 : 0.84);
}
/** YouTube draws the channel row, the title and the sound row over the bottom of a Short. Seen on the
 * live channel on 2026-11-11: the caption box was cut off by the channel name and Subscribe button in
 * three of eight frames of one Short. The box now ends this far above the bottom edge (about 18%). */
export const SHORT_UI_BOTTOM = 340;
/** The tallest caption box: two lines (plus the speaker's name on a board). */
export const captionBand = (w: number, h: number, scene?: string): number => (h > w ? (scene === "board" ? 225 : 175) : 84);
void HIGH;

export const Captions: React.FC<{ tl: Timeline; frame: number; groups: Token[][]; scene: string }> = ({ tl, frame, groups, scene }) => {
  const t = frame / tl.fps;
  // the group on screen: from its first word until the next group starts (or shortly after its last word)
  let i = groups.findIndex((g, k) => t >= g[0]!.s && t < Math.min(groups[k + 1]?.[0]!.s ?? Infinity, g[g.length - 1]!.e + 0.45));
  // the hook's first words are on screen from frame 0: that frame is what the feed shows
  if (i < 0 && groups.length && t < groups[0]![0]!.s && groups[0]![0]!.s < 1) i = 0;
  if (i < 0) return null;
  const g = groups[i]!;
  const v = tl.height > tl.width;
  const size = v ? 60 : 40;
  const figures = new Set(Object.values(tl.figures ?? {}));
  const since = t < g[0]!.s ? 1 : t - g[0]!.s;          // already shown in full before it is spoken
  const k = Math.min(1, since / 0.12);
  const scale = 0.9 + 0.1 * (1 - (1 - k) ** 3);
  // Shorts: on the wall above the cast's heads in a `stage` beat; lower in the other scenes, whose
  // labels and figures sit in the top half
  const top = captionTop(tl.width, tl.height, scene);
  const left = v ? 60 : tl.width * 0.12, width = v ? tl.width - 60 - 150 : tl.width * 0.76;   // Shorts: clear of the right-hand buttons
  const who = g[0]!.who && g[0]!.board ? g[0]!.who : undefined;
  const tagColor: Record<string, string> = { rohan: "#2f7df6", priya: "#e0518f", sharma: "#f08c3a", sikka: "#d4a017", narrator: "#6b7385" };
  return (
    <div style={{ position: "absolute", left, ...(v ? { bottom: SHORT_UI_BOTTOM } : { top }), width, display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
      {who && <div style={{ alignSelf: "center", marginBottom: -6, zIndex: 1, fontFamily: FONT, fontWeight: 900, fontSize: v ? 44 : 30, color: "#fff", textTransform: "uppercase",
        background: tagColor[who] ?? "#6b7385", borderRadius: 10, padding: "0 14px", letterSpacing: 2 }}>{who}</div>}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.15, textAlign: "center", maxWidth: width,
        transform: `scale(${scale})`, transformOrigin: "50% 50%", background: "rgba(12,16,32,0.84)", color: "#fff",
        padding: v ? "14px 30px" : "8px 22px", borderRadius: v ? 22 : 14, border: "3px solid rgba(255,255,255,0.18)" }}>
        {g.map((w, j) => {
          const on = t >= w.s && (t < w.e || j === g.length - 1 || t < g[j + 1]!.s);
          const fig = figures.has(w.t.replace(/[.,!?;:]+$/, ""));
          return <span key={j} style={{ color: on || fig ? "#ffd84a" : "#ffffff" }}>{w.t}{j < g.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};
