/**
 * The tech channel's dark flat look (how-tech-and-ai-actually-work-chips-ai-p, 2026-11-18): a near-black
 * base, hairline panels, one accent (amber) for the named item, white words, condensed numerals.
 *
 * Fonts: no condensed OFL face ships yet (assets/fonts has Poppins only), so `Num` narrows Poppins
 * ExtraBold horizontally (NUM_SQUEEZE) with tabular figures. Swap in a real condensed face (Barlow
 * Condensed or Oswald, both OFL) by loading it in design/fonts.ts and setting NUM_FONT; nothing else changes.
 */
import React from "react";
import { FONT } from "../../design/fonts";
import { minText } from "../../design/fit";
import { useFrameSize } from "../kit";

export const TECH = {
  bg: "#07090d",
  bgHi: "#0f141c",
  panel: "#11161e",
  panelHi: "#18202b",
  line: "#263040",
  grid: "#161d27",
  text: "#eef2f7",
  muted: "#8592a3",
  dim: "#4a5566",
  accent: "#ffb020",
};

export const NUM_FONT = FONT;
/** Horizontal squeeze that stands in for a condensed face (1 once a condensed font is loaded). */
export const NUM_SQUEEZE = 0.82;

/** The frame's unit: 1 at 1080 on the short side, so pieces size the same in 1080×1920 and 1920×1080. */
export function useUnit() {
  const { w, h } = useFrameSize();
  return { w, h, u: Math.min(w, h) / 1080, vertical: h > w, min: minText(w, h) };
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Words in the tech look. `deco` print is skipped by the layout probe (nobody has to read it). */
export const Words: React.FC<{
  x: number; y: number; size: number; children: React.ReactNode; fill?: string; weight?: number;
  anchor?: "start" | "middle" | "end"; deco?: boolean; opacity?: number; spacing?: number; upper?: boolean;
}> = ({ x, y, size, children, fill = TECH.text, weight = 700, anchor = "start", deco, opacity, spacing = 0, upper }) => (
  <g data-probe={deco ? "skip" : undefined} opacity={opacity}>
    <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={fill} textAnchor={anchor}
      dominantBaseline="central" letterSpacing={spacing} style={upper ? { textTransform: "uppercase" } : undefined}>
      {children}
    </text>
  </g>
);

/** A figure in condensed numerals. `size` is the visible size (the squeeze is horizontal only). */
export const Num: React.FC<{
  x: number; y: number; size: number; children: React.ReactNode; fill?: string; anchor?: "start" | "middle" | "end"; glow?: string; opacity?: number;
}> = ({ x, y, size, children, fill = TECH.text, anchor = "start", glow, opacity }) => (
  <g transform={`translate(${x} ${y}) scale(${NUM_SQUEEZE} 1)`} opacity={opacity}>
    <text x={0} y={0} fontFamily={NUM_FONT} fontWeight={800} fontSize={size} fill={fill} textAnchor={anchor}
      dominantBaseline="central" letterSpacing={-size * 0.02}
      style={{ fontVariantNumeric: "tabular-nums", filter: glow ? `drop-shadow(0 0 ${size * 0.18}px ${glow})` : undefined }}>
      {children}
    </text>
  </g>
);

/** Rough width of a figure drawn by `Num` (Poppins digits ~0.62 em, squeezed). */
export const numWidth = (s: string, size: number) => [...s].reduce((a, c) => a + (/[0-9]/.test(c) ? 0.62 : /[.,]/.test(c) ? 0.3 : c === " " ? 0.3 : 0.7), 0) * size * NUM_SQUEEZE;

/** Split a sentence into lines of at most `chars` characters (at spaces). */
export function wrap(text: string, chars: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + " " + word).length > chars) { out.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
}

/** The dark backdrop: a vertical gradient and a faint dot grid. Draw it first inside a `Stage`. */
export const TechBackdrop: React.FC<{ grid?: boolean; glowAt?: [number, number] }> = ({ grid = true, glowAt }) => {
  const { w, h, u } = useUnit();
  const gap = 54 * u;
  return (
    <g>
      <defs>
        <linearGradient id="tech-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TECH.bgHi} />
          <stop offset="1" stopColor={TECH.bg} />
        </linearGradient>
        <pattern id="tech-dots" width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={gap / 2} cy={gap / 2} r={1.6 * u} fill={TECH.line} />
        </pattern>
        <radialGradient id="tech-accent-glow">
          <stop offset="0" stopColor={TECH.accent} stopOpacity="0.16" />
          <stop offset="1" stopColor={TECH.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#tech-bg)" />
      {grid ? <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#tech-dots)" opacity={0.7} /> : null}
      {glowAt ? <ellipse cx={glowAt[0]} cy={glowAt[1]} rx={700 * u} ry={700 * u} fill="url(#tech-accent-glow)" /> : null}
    </g>
  );
};
