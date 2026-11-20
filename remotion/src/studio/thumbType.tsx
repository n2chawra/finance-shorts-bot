/**
 * Thumbnail type (2026-11-20, the tech channel's thumbnail playbook, gap #6): the words the hits use.
 * A heavy condensed face (Anton, already in public/fonts for the documentary kit), stacked 2–3 lines
 * on the left, white with ONE *starred* word in yellow, a soft dark shadow and no thick black stroke,
 * and big: the capital height is at least 11% of the frame height (CAP_MIN), whatever the box.
 *
 *   <StackWords text="INSIDE ONE *CHIP*" w={1280} h={720} />          one word a line (≤3 words)
 *   <StackWords text="WHY SO / *HARD* TO COPY" w={w} h={h} />          "/" breaks the lines yourself
 *
 * Used by the 3D thumbnail path (compositions/LongThumb3D.tsx) and by any 2D thumbnail with
 * `"type": "stack"` in its spec (the documentary channel's scene covers, Craze & Crash).
 */
import React from "react";
import { DISPLAY_FAMILY } from "../doc/fonts";

/** Anton's capital height as a share of the font size (measured on the TTF: H is 0.86 em tall). */
export const ANTON_CAP = 0.86;
/** The floor from the playbook: capitals at least 11% of the frame height (≥ 80 px at 720). */
export const CAP_MIN = 0.11;
export const THUMB_YELLOW = "#ffd23f";

/** Anton's advance widths (em), upper case, on the generous side. */
export function antonWidth(text: string, size: number, spacing = 0): number {
  let em = 0;
  for (const ch of text.toUpperCase()) {
    if (ch === " ") em += 0.2;
    else if (/[MW]/.test(ch)) em += 0.72;
    else if (/[I1!.,:;'|]/.test(ch)) em += 0.26;
    else if (/[?JL]/.test(ch)) em += 0.42;
    else em += 0.5;
  }
  return em * size + spacing * [...text].length;
}

/** The lines: "/" splits where you say; else one word a line up to three words, else two balanced lines (three past six words). */
export function stackLines(text: string): string[] {
  if (text.includes("/")) return text.split("/").map((s) => s.trim()).filter(Boolean);
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 3) return words;
  const n = words.length > 6 ? 3 : 2;
  const total = antonWidth(words.join(" "), 1);
  const out: string[] = [];
  let cur: string[] = [];
  for (const wd of words) {
    if (cur.length && out.length < n - 1 && antonWidth([...cur, wd].join(" "), 1) > total / n + 0.15) { out.push(cur.join(" ")); cur = []; }
    cur.push(wd);
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}

/** The font size: `cap` of the frame height in capitals (default 15%), shrunk to fit `maxW` and the
 * frame's height, never below the 11% floor (a word that still doesn't fit is a word too long: cut it). */
export function stackSize(lines: string[], h: number, maxW: number, cap = 0.15, lineHeight = 0.98): number {
  const floor = Math.ceil((CAP_MIN * h) / ANTON_CAP);
  const want = (cap * h) / ANTON_CAP;
  const widest = Math.max(...lines.map((l) => antonWidth(l.replace(/\*/g, ""), 1)), 0.1);
  const byWidth = maxW / widest;
  const byHeight = (h * 0.84) / (lines.length * lineHeight);
  return Math.max(floor, Math.floor(Math.min(want, byWidth, byHeight)));
}

export type StackWordsProps = {
  text: string;
  w: number;
  h: number;
  /** the box: left edge and top (px; default 4.5% in from the edges), and the widest a line may be (default 52% of the width) */
  x?: number;
  y?: number;
  maxW?: number;
  /** "top" (default) or "center" (vertically centred on the frame) */
  valign?: "top" | "center";
  align?: "left" | "right";
  cap?: number;
  color?: string;
  hi?: string;
};

/** Stacked heavy condensed words with one yellow word and a soft shadow. */
export const StackWords: React.FC<StackWordsProps> = ({ text, w, h, x, y, maxW, valign = "top", align = "left", cap, color = "#ffffff", hi = THUMB_YELLOW }) => {
  const lines = stackLines(text);
  const lh = 0.98;
  const fs = stackSize(lines, h, maxW ?? w * 0.52, cap, lh);
  const pad = Math.round(Math.min(w, h) * 0.045);
  const top = y ?? (valign === "center" ? Math.max(pad, (h - lines.length * fs * lh) / 2) : pad);
  const shadow = `0 ${Math.round(fs * 0.04)}px ${Math.round(fs * 0.1)}px rgba(0,0,0,0.85), 0 0 ${Math.round(fs * 0.35)}px rgba(0,0,0,0.55)`;
  return (
    <div style={{ position: "absolute", top, ...(align === "left" ? { left: x ?? pad } : { right: x ?? pad }), textAlign: align,
      fontFamily: DISPLAY_FAMILY, fontWeight: 400, fontSize: fs, lineHeight: lh, color, textTransform: "uppercase", letterSpacing: fs * 0.005,
      textShadow: shadow, whiteSpace: "nowrap" }}>
      {lines.map((line, i) => (
        <div key={i}>
          {line.split(/(\*[^*]+\*)/).filter(Boolean).map((part, j) =>
            part.startsWith("*") ? <span key={j} style={{ color: hi }}>{part.slice(1, -1)}</span> : <span key={j}>{part}</span>)}
        </div>
      ))}
    </div>
  );
};
