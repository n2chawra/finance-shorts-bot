/**
 * A company's logo as a die-cut sticker over the picture (2026-11-24, for v-20261124-31: QA asked for Juicero's real
 * logo in the hook, and its logo is dark ink on transparency, invisible on the charcoal stage and lost on the paper one).
 * The transparent PNG sits on an off-white rounded plate with a soft shadow, drops in on the layer's start with a small
 * overshoot, tilts a little and floats while it is on screen. Logos only to identify the company the line is about.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { clamp01, DOC, outBack } from "./theme";

export type LogoStickerProps = {
  src: string;                 // transparent PNG under remotion/public ("media/<slug>/x.png")
  aspect: number;              // the logo's width / height
  pos: [number, number];       // centre, 0..1 of the frame
  size: number;                // plate width as a share of the frame width
  tilt: number;                // degrees
  t: number; end: number; w: number; h: number;
};

export const LogoSticker: React.FC<LogoStickerProps> = ({ src, aspect, pos, size, tilt, t, end, w, h }) => {
  const k = outBack(clamp01(t / 10));
  const fade = clamp01((end - t) / 4);
  const pw = w * size;
  const lw = pw * 0.84;
  const lh = lw / Math.max(0.2, aspect);
  const ph = lh + pw * 0.16;
  const bob = Math.sin(t / 22) * h * 0.003;
  return (
    <div style={{ position: "absolute", left: pos[0] * w - pw / 2, top: pos[1] * h - ph / 2 + bob, width: pw, height: ph,
      transform: `scale(${0.6 + 0.4 * k}) rotate(${tilt * k}deg)`, opacity: fade,
      background: DOC.text, borderRadius: ph * 0.18, boxShadow: "0 14px 34px rgba(0,0,0,0.55), 0 0 0 6px rgba(255,255,255,0.9)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile(src)} style={{ width: lw, height: lh, objectFit: "contain" }} />
    </div>
  );
};
