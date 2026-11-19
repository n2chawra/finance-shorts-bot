/**
 * Business-docs Shorts captions (the channel's research, 2026-11-19): 1-3 words at a time in bold white
 * capitals, one key word per chunk in yellow (a figure, else the longest content word), no box, a soft
 * shadow, centred around 64% of the frame height and always ending at least SHORT_UI_BOTTOM px above
 * the bottom edge. Drawn only for `doc`-scene Shorts (fx/captions.tsx hands them over); every other
 * scene and format keeps its own captions.
 */
import React from "react";
import { DISPLAY_FAMILY } from "../doc/fonts";

export interface ChunkToken { t: string; s: number; e: number }

const MAX_WORDS = 3;
const MAX_CHARS = 15;        // a chunk breaks early when it would get wider than this
const BREAK_GAP = 0.25;      // a pause this long starts a new chunk
const SIZE = 118;            // px on a 1080-wide Short
const LINE = 1.04;
const UI_BOTTOM = 340;       // = SHORT_UI_BOTTOM in fx/captions.tsx (kept here to avoid an import cycle)
const STOP = new Set(["the", "and", "that", "this", "with", "from", "they", "them", "their", "there", "then", "than", "were", "was",
  "have", "has", "had", "into", "onto", "over", "just", "what", "when", "which", "while", "would", "could", "should", "about", "been",
  "being", "your", "yours", "it's", "its", "for", "but", "not", "you", "all", "one", "who", "how", "why", "did", "does", "also", "only", "very"]);

const bare = (w: string) => w.replace(/^[^\p{L}\p{N}$€£₹]+|[^\p{L}\p{N}%]+$/gu, "");
const isFigure = (w: string, figures: Set<string>) => figures.has(w.replace(/[.,!?;:]+$/, "")) || /\d/.test(w);

/** Tokens in chunks of 1-3 words, broken at punctuation, pauses and width. */
export function chunkTokens(tokens: ChunkToken[]): ChunkToken[][] {
  const out: ChunkToken[][] = [];
  let cur: ChunkToken[] = [];
  const chars = (g: ChunkToken[]) => g.reduce((n, x) => n + x.t.length + 1, 0);
  for (const tok of tokens) {
    const prev = cur[cur.length - 1];
    if (prev && (cur.length >= MAX_WORDS || chars(cur) + tok.t.length > MAX_CHARS || tok.s - prev.e > BREAK_GAP || /[.!?,:;]$/.test(prev.t))) {
      out.push(cur); cur = [];
    }
    cur.push(tok);
  }
  if (cur.length) out.push(cur);
  return out;
}

/** The chunk's one yellow word: a figure first, else the longest content word (none for "AND THE"). */
export function keyWord(chunk: ChunkToken[], figures: Set<string>): number {
  const fig = chunk.findIndex((w) => isFigure(w.t, figures));
  if (fig >= 0) return fig;
  let best = -1, len = 3;
  chunk.forEach((w, i) => {
    const b = bare(w.t);
    if (b.length > len && !STOP.has(b.toLowerCase())) { best = i; len = b.length; }
  });
  return best;
}

export const ChunkCaptions: React.FC<{ chunks: ChunkToken[][]; t: number; width: number; height: number; figures: Set<string> }> = ({ chunks, t, width, height, figures }) => {
  let i = chunks.findIndex((g, k) => t >= g[0]!.s && t < Math.min(chunks[k + 1]?.[0]!.s ?? Infinity, g[g.length - 1]!.e + 0.3));
  // the first words are on screen from frame 0: that frame is what the feed shows
  if (i < 0 && chunks.length && t < chunks[0]![0]!.s && chunks[0]![0]!.s < 1) i = 0;
  if (i < 0) return null;
  const g = chunks[i]!;
  const u = width / 1080;
  const size = SIZE * u;
  const since = t < g[0]!.s ? 1 : t - g[0]!.s;
  const k = Math.min(1, since / 0.11);
  const scale = 0.86 + 0.14 * (1 - (1 - k) ** 3) + 0.04 * Math.sin(Math.PI * k);   // a quick pop with a little overshoot
  // centred at 64% of the height; two lines at most, so the block's bottom stays clear of the Shorts UI
  const block = 2 * size * LINE;
  const centre = Math.min(height * 0.64, height - UI_BOTTOM * u - block / 2);
  const left = 80 * u, right = 160 * u;   // clear of the right-hand buttons
  const key = keyWord(g, figures);
  return (
    <div style={{ position: "absolute", left, width: width - left - right, top: centre - block / 2, height: block,
      display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ fontFamily: `${DISPLAY_FAMILY}, sans-serif`, fontWeight: 400, fontSize: size, lineHeight: LINE, textAlign: "center",
        textTransform: "uppercase", letterSpacing: 1.5 * u, color: "#ffffff", transform: `scale(${scale})`, transformOrigin: "50% 50%",
        textShadow: `0 ${4 * u}px ${18 * u}px rgba(0,0,0,0.6), 0 ${2 * u}px ${5 * u}px rgba(0,0,0,0.55)` }}>
        {/* a chunk is one breath: its trailing comma adds nothing at this size */}
        {g.map((w, j) => (
          <span key={j} style={{ color: j === key ? "#ffd23f" : "#ffffff" }}>{w.t.replace(/[,;:]+$/, "")}{j < g.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
};
