/**
 * The documentary editor's look (business-documentaries-rise-and-fall-of, 2026-11-19): a hybrid
 * documentary of licensed stock footage, real photos and company assets, documents and headlines as
 * evidence, and our own motion graphics. Near-black navy base, warm paper for evidence, one gold accent
 * for figures, one red for losses and the marker pen. Words in Poppins (our sans), headlines and pages in
 * a serif, filings in a typewriter face.
 *
 * Fonts: only Poppins is bundled (OFL, public/fonts). The serif and mono stacks below fall back to the
 * render machine's faces until an OFL serif (Source Serif 4 / Playfair) and mono are added to
 * public/fonts and loaded in design/fonts.ts; renders stay deterministic per machine, not across machines.
 */
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { FONT } from "../design/fonts";
import { minText } from "../design/fit";

export const DOC = {
  bg: "#0b0f17",
  bg2: "#141b28",
  panel: "#111826",
  line: "rgba(255,255,255,0.10)",
  text: "#f3efe6",
  muted: "#9aa3b5",
  gold: "#e8b04a",
  red: "#e0483e",
  green: "#3fb67b",
  paper: "#f1ead9",
  paperInk: "#1f1b16",
  marker: "#ffe14d",
  desk: "#2a2019",
} as const;

export const SANS = FONT;
export const SERIF = "'Source Serif 4', 'Playfair Display', Georgia, 'Times New Roman', 'DejaVu Serif', serif";
export const MONO = "'Courier Prime', 'Courier New', 'DejaVu Sans Mono', monospace";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Smooth in and out (documentary camera moves are slow and even). */
export const smooth = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
export const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const outBack = (x: number) => { const c = clamp01(x), s = 1.4; return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2); };

/** Size unit: 1 at 1080 px on the short side, so one piece works in 1920×1080 and 1080×1920. */
export const unit = (w: number, h: number) => Math.min(w, h) / 1080;
/** A readable size: `px` at 1080 on the short side, never under the format's minimum (44 Short, 30 long). */
export const fs = (w: number, h: number, px: number) => Math.max(px * unit(w, h), minText(w, h));

/** "2001-04-02" → "Apr 2, 2001"; "2001-04" → "Apr 2001"; "2001" → "2001". Formatting, never a figure. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const mon = mo ? MONTHS[Number(mo) - 1] : undefined;
  if (mon && d) return `${mon} ${Number(d)}, ${y}`;
  if (mon) return `${mon} ${y}`;
  return y!;
}

/** I, II, III… for chapter numbers. */
export function roman(n: number): string {
  const t: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "", x = Math.max(0, Math.floor(n));
  for (const [v, s] of t) while (x >= v) { out += s; x -= v; }
  return out;
}

// ------------------------------------------------------------------ the grade (a LUT-like look per shot)

/**
 * Colour grades. Each is a per-channel tone curve (an SVG feComponentTransfer table: a 1D LUT per
 * channel, so shadows and highlights can be split-toned) followed by CSS adjustments.
 *   doc      the channel's look: teal-lifted shadows, warm highlights, a little desaturated
 *   cold     corporate blue, crisp (offices, trading floors, servers)
 *   warm     golden hour, nostalgia (a founder's early years)
 *   night    deep blue blacks, orange lights (cities at night, the fall)
 *   bleach   bleach bypass: low saturation, hard contrast (the scandal, the collapse)
 *   archive  aged black and white with a sepia cast (the archive, the past)
 *   bw       clean black and white
 *   none     untouched
 */
export type GradeName = "doc" | "cold" | "warm" | "night" | "bleach" | "archive" | "bw" | "none";
type Curve = { r: string; g: string; b: string; css: string };
export const GRADES: Record<GradeName, Curve> = {
  doc: { r: "0.03 0.22 0.52 0.82 0.98", g: "0.05 0.25 0.53 0.8 0.95", b: "0.1 0.3 0.52 0.74 0.88", css: "saturate(0.86) contrast(1.06)" },
  cold: { r: "0.02 0.2 0.46 0.74 0.92", g: "0.04 0.25 0.53 0.8 0.96", b: "0.1 0.33 0.6 0.86 1", css: "saturate(0.8) contrast(1.08)" },
  warm: { r: "0.06 0.3 0.6 0.86 1", g: "0.04 0.25 0.53 0.8 0.95", b: "0.02 0.18 0.42 0.68 0.86", css: "saturate(0.95) contrast(1.04)" },
  night: { r: "0.0 0.16 0.46 0.8 1", g: "0.02 0.18 0.44 0.72 0.92", b: "0.08 0.28 0.5 0.7 0.84", css: "saturate(0.9) contrast(1.12) brightness(0.92)" },
  bleach: { r: "0.02 0.18 0.5 0.84 1", g: "0.02 0.18 0.5 0.84 1", b: "0.04 0.2 0.5 0.82 0.97", css: "saturate(0.45) contrast(1.28)" },
  archive: { r: "0.1 0.32 0.58 0.82 0.94", g: "0.08 0.28 0.53 0.76 0.88", b: "0.06 0.22 0.44 0.64 0.76", css: "grayscale(1) contrast(1.12)" },
  bw: { r: "0 0.25 0.5 0.75 1", g: "0 0.25 0.5 0.75 1", b: "0 0.25 0.5 0.75 1", css: "grayscale(1) contrast(1.18)" },
  none: { r: "0 1", g: "0 1", b: "0 1", css: "" },
};
export const isGrade = (x: unknown): x is GradeName => typeof x === "string" && x in GRADES;

/** The SVG filter a grade needs (render once next to the graded element) and the CSS `filter` to use.
 * grayscale runs before the curve, so archive is toned after it is made black and white. */
export function useGrade(name: GradeName, id: string): { defs: React.ReactNode; filter: string } {
  const g = GRADES[name];
  if (name === "none") return { defs: null, filter: "none" };
  const bwFirst = name === "archive" || name === "bw";
  const defs = (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        {bwFirst ? <feColorMatrix type="saturate" values="0" /> : null}
        <feComponentTransfer>
          <feFuncR type="table" tableValues={g.r} />
          <feFuncG type="table" tableValues={g.g} />
          <feFuncB type="table" tableValues={g.b} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
  const css = bwFirst ? g.css.replace("grayscale(1)", "").trim() : g.css;
  return { defs, filter: `url(#${id}) ${css}`.trim() };
}

// ------------------------------------------------------------------ texture

/** Film grain over footage: the repo's seeded grain tile, shifted every other frame (a still frame
 * stays still in a cover), at a low strength. `t` is the beat's frame. */
export const FilmGrain: React.FC<{ t: number; o?: number; moving?: boolean }> = ({ t, o = 0.5, moving = true }) => {
  const step = moving ? Math.floor(t / 2) : 0;
  const x = (step * 73) % 256, y = (step * 151) % 256;
  return (
    <AbsoluteFill data-probe="skip" style={{ pointerEvents: "none", opacity: o, backgroundImage: `url(${staticFile("grain.png")})`,
      backgroundRepeat: "repeat", backgroundPosition: `${x}px ${y}px`, mixBlendMode: "multiply" }} />
  );
};

/** A lens vignette, stronger than the frame's own: footage and photos get pulled to the centre. */
export const DocVignette: React.FC<{ o?: number }> = ({ o = 0.55 }) => (
  <AbsoluteFill data-probe="skip" style={{ pointerEvents: "none", background: `radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${o}) 100%)` }} />
);

/** Cinema bars (2.39:1) for a filmic footage beat; `k` slides them in. */
export const Letterbox: React.FC<{ w: number; h: number; k?: number }> = ({ w, h, k = 1 }) => {
  if (h > w) return null;
  const bar = Math.max(0, (h - w / 2.39) / 2) * clamp01(k);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: bar, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: w, height: bar, background: "#000" }} />
    </>
  );
};

/** A dark surface for evidence to sit on: a desk (warm wood under a lamp), felt, or the studio dark. */
export type Surface = "desk" | "felt" | "dark" | "paper";
export const SurfaceBg: React.FC<{ kind?: Surface; lamp?: [number, number] }> = ({ kind = "desk", lamp = [0.42, 0.38] }) => {
  const lx = `${lamp[0] * 100}%`, ly = `${lamp[1] * 100}%`;
  const base: Record<Surface, string> = {
    desk: `radial-gradient(ellipse 70% 80% at ${lx} ${ly}, #5a4330 0%, #3a2b1f 45%, #1a130d 100%)`,
    felt: `radial-gradient(ellipse 70% 80% at ${lx} ${ly}, #2c4a3e 0%, #1b2f28 50%, #0b1411 100%)`,
    dark: `radial-gradient(ellipse 70% 80% at ${lx} ${ly}, #1f2a3d 0%, #121a28 50%, #070a10 100%)`,
    paper: `radial-gradient(ellipse 80% 80% at ${lx} ${ly}, #e9e0cc 0%, #cfc3a8 70%, #a89a7c 100%)`,
  };
  return (
    <AbsoluteFill style={{ background: base[kind] }}>
      {kind === "desk" ? (
        // wood grain: long soft streaks, seeded by position, never random
        <AbsoluteFill style={{ opacity: 0.16, backgroundImage: [
          "repeating-linear-gradient(177deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0) 11px, rgba(0,0,0,0) 31px)",
          "repeating-linear-gradient(179.3deg, rgba(255,220,180,0) 0px, rgba(255,220,180,0.10) 13px, rgba(255,220,180,0) 47px, rgba(0,0,0,0.18) 71px, rgba(0,0,0,0) 97px)",
          "repeating-linear-gradient(176.2deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0.12) 1px, rgba(0,0,0,0) 5px, rgba(0,0,0,0) 17px)",
        ].join(",") }} />
      ) : null}
    </AbsoluteFill>
  );
};
