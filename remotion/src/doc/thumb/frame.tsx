/**
 * The doc thumbnail's frame and helpers (Craze & Crash playbook, style-study/2026-11-20-thumbnails.md):
 *   <DocThumb>     the 1280×720 frame (fonts loaded, overflow hidden); `guide` draws the corner to keep clear
 *   CORNER         the duration stamp's corner, bottom right, as shares of the frame: nothing important there
 *   shortFig()     "$185.1M" → "$185M", "$4.04B" → "$4B": a decimal is unreadable at 168 px (rule 6)
 *   placeCut()     where a cut-out PNG goes so its subject's box lands at (cx, cy) at a given height
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import "../fonts";

/** The duration stamp's corner (bottom right): 22% of the width, 16% of the height (the playbook's 18×14 plus a margin). */
export const CORNER = { w: 0.22, h: 0.16 } as const;
/** 3% from every edge (rule 5). */
export const MARGIN = 0.03;

/** A figure in its short form for a thumbnail: no decimal at 10 and above, at most one below, "x.0" dropped.
 * The figure itself always comes from the timeline's filled placeholders (th.figure, th.jump), never typed. */
export function shortFig(fig: string): string {
  return fig.replace(/(\d[\d,]*)\.(\d+)/, (_, int: string, dec: string) => {
    const n = Number(`${int.replace(/,/g, "")}.${dec}`);
    if (n >= 10) return Math.round(n).toLocaleString("en-US");
    const one = Math.round(n * 10) / 10;
    return Number.isInteger(one) ? String(one) : one.toFixed(1);
  });
}

/** A cut-out's placement. `aspect` is the PNG's width ÷ height; `box` the subject inside it as shares
 * [x0, y0, x1, y1] (`python -m generator.media cutout` prints it); the subject's centre lands at (cx, cy)
 * and its height is `height` px. Returns the full PNG's box in frame pixels, and the subject centre within it. */
export function placeCut(aspect: number, box: [number, number, number, number], cx: number, cy: number, height: number) {
  const [x0, y0, x1, y1] = box;
  const ih = height / Math.max(0.01, y1 - y0);
  const iw = ih * aspect;
  const ox = ((x0 + x1) / 2) * iw, oy = ((y0 + y1) / 2) * ih;
  return { left: cx - ox, top: cy - oy, width: iw, height: ih, origin: `${ox}px ${oy}px`, subjectW: (x1 - x0) * iw };
}

/** The frame: everything inside is absolutely placed in w×h. */
export const DocThumb: React.FC<{ w: number; h: number; bg?: string; guide?: boolean; children: React.ReactNode }> = ({ w, h, bg = "#111", guide = false, children }) => (
  <AbsoluteFill style={{ width: w, height: h, background: bg, overflow: "hidden" }}>
    {children}
    {guide ? (
      <div style={{ position: "absolute", right: 0, bottom: 0, width: w * CORNER.w, height: h * CORNER.h, border: "3px dashed #ff00ff", boxSizing: "border-box" }} />
    ) : null}
  </AbsoluteFill>
);
