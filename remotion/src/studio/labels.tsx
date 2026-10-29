/**
 * Labels and figure tags drawn after the camera, in screen space (2026-10-29: tags and labels drawn
 * inside the camera ran off the frame on close shots, shrank under the minimum size on wide ones,
 * and sat on the captions: together the most common reason a render failed). Each one follows its
 * thing on screen but is clamped inside the safe frame, fitted to the width, never smaller than the
 * format's minimum, and steps above its thing when it would land on the captions band.
 */
import React from "react";
import { FONT } from "../design/fonts";
import { fitLine, minText, safeBox, textWidth } from "../design/fit";
import { captionBand, captionTop } from "../fx/captions";

const INK = "#1d2433";

export interface ScreenText {
  key: string;
  kind: "tag" | "label";
  text: string;
  /** tag: the bottom centre of the tag; label: the top centre of the label (screen px) */
  x: number; y: number;
  /** where a label goes instead when (x, y) is on the captions: its bottom edge (screen px) */
  above?: number;
  k?: number;           // pop-in 0..1+
  fill?: string;        // a tag's colour (white by default, ink text)
  ink?: string;
  upper?: boolean;
}

const clampN = (x: number, a: number, b: number) => (a > b ? (a + b) / 2 : Math.min(b, Math.max(a, x)));

export const ScreenTexts: React.FC<{ items: ScreenText[]; w: number; h: number; scene: string; top?: number }> = ({ items, w, h, scene, top: top0 }) => {
  const v = h > w;
  const box = { ...safeBox(w, h) }, min = minText(w, h);
  if (top0 !== undefined) box.y0 = Math.max(box.y0, top0);     // below the HUD counter
  const bandTop = captionTop(w, h, scene), bandBot = bandTop + captionBand(w, h);
  const onBand = (y0: number, y1: number) => y1 > bandTop && y0 < bandBot;
  const maxW = box.x1 - box.x0 - 40;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {items.map((it) => {
        const k = Math.max(0, it.k ?? 1);
        if (k <= 0.01 || !it.text) return null;
        if (it.kind === "tag") {
          const H = v ? 84 : 64;
          const fs = fitLine(it.text, v ? 56 : 44, maxW - 48, { min, upper: it.upper });
          const bw = textWidth(it.text, fs, it.upper) + 48;
          let yb = clampN(it.y, box.y0 + H, box.y1);
          if (onBand(yb - H, yb)) yb = bandTop - 10 >= box.y0 + H ? bandTop - 10 : Math.min(box.y1, bandBot + H + 10);
          const cx = clampN(it.x, box.x0 + bw / 2, box.x1 - bw / 2);
          return (
            <g key={it.key} transform={`translate(${cx},${yb}) scale(${Math.min(k, 1.2)})`}>
              <rect x={-bw / 2} y={-H} width={bw} height={H} rx={18} fill={it.fill ?? "#fff"} stroke={it.fill ? "#fff" : INK} strokeWidth={5} />
              <text x={0} y={-H / 2 + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={it.ink ?? INK}
                style={{ textTransform: it.upper ? "uppercase" : undefined }}>{it.text}</text>
            </g>
          );
        }
        const fs = fitLine(it.text, v ? 50 : 36, maxW, { min, upper: it.upper });
        const tw = textWidth(it.text, fs, it.upper);
        let top = clampN(it.y, box.y0, box.y1 - fs * 1.15);
        if (onBand(top, top + fs * 1.15)) {
          const alt = it.above !== undefined ? it.above - fs * 1.15 : bandTop - 10 - fs * 1.15;
          top = alt >= box.y0 && !onBand(alt, alt + fs * 1.15) ? alt : bandTop - 10 - fs * 1.15;
        }
        const cx = clampN(it.x, box.x0 + tw / 2 + 10, box.x1 - tw / 2 - 10);
        return (
          <text key={it.key} x={cx} y={top + fs * 0.92} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={it.ink ?? "#fff"}
            stroke={INK} strokeWidth={v ? 9 : 7} paintOrder="stroke" opacity={Math.min(1, k)}
            style={{ textTransform: it.upper ? "uppercase" : undefined }}>{it.text}</text>
        );
      })}
    </svg>
  );
};
