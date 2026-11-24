/**
 * Two things side by side (X vs Y): a picture on each side (a photo, a logo, a storefront), the name
 * and a figure under it, a "VS" seal on the seam. `win` dims the losing side on its word. Stacked top
 * and bottom in a Short.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { countText } from "../flat/kit";
import { clamp01, DOC, fs, outBack, outCubic, SANS, smooth, unit } from "./theme";

export type Side = { name: string; src?: string; fit?: "cover" | "contain"; fig?: string; sub?: string; color?: string };

const Panel: React.FC<{ s: Side; k: number; lose: number; figK: number; w: number; h: number; pw: number; ph: number; t: number; end: number; left: boolean }> = ({
  s, k, lose, figK, w, h, pw, ph, t, end, left,
}) => {
  const u = unit(w, h);
  const contain = s.fit === "contain";
  const drift = 1.04 + 0.05 * smooth(t / Math.max(1, end));
  const tint = s.color ?? (left ? "#2b4c7e" : "#7e2b2b");
  return (
    <div style={{ position: "relative", width: pw, height: ph, overflow: "hidden", opacity: clamp01(k * 1.6),
      filter: `grayscale(${lose}) brightness(${1 - 0.45 * lose})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${tint}, ${DOC.bg} 75%)` }} />
      {s.src ? (
        <AbsoluteFill style={{ transform: `scale(${drift}) translateY(${(1 - outCubic(k)) * 40 * u}px)`, padding: contain ? `${ph * 0.18}px ${pw * 0.16}px ${ph * 0.36}px` : 0 }}>
          <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%", objectFit: contain ? "contain" : "cover", filter: contain ? "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" : "saturate(0.85) contrast(1.05)" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,12,0) 45%, rgba(5,7,12,0.92) 88%)" }} />
      {/* in a Short the lower panel's name sits at its top, clear of the captions and the bottom zone (QA, v-20261124-32) */}
      <div style={{ position: "absolute", left: 0, right: 0, ...(h > w && !left ? { top: ph * 0.07 } : { bottom: ph * 0.07 }), textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fs(w, h, 56), color: DOC.text, letterSpacing: -0.5 }}>{s.name}</div>
        {s.fig ? <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: fs(w, h, 92), lineHeight: 1.05, color: lose > 0.5 ? DOC.muted : DOC.gold, opacity: clamp01(figK * 3) }}>{countText(s.fig, figK)}</div> : null}
        {s.sub ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fs(w, h, 30), color: DOC.muted, marginTop: 4 * u }}>{s.sub}</div> : null}
      </div>
    </div>
  );
};

export const Split: React.FC<{ left: Side; right: Side; leftAt?: number; rightAt?: number; figAt?: number; win?: "left" | "right"; winAt?: number; t: number; end: number; w: number; h: number }> = ({
  left, right, leftAt = 2, rightAt = 12, figAt, win, winAt, t, end, w, h,
}) => {
  const v = h > w;
  const u = unit(w, h);
  const kl = outCubic((t - leftAt) / 16), kr = outCubic((t - rightAt) / 16);
  const fk = figAt === undefined ? 1 : outCubic((t - figAt) / 20);
  const wk = win && winAt !== undefined ? smooth((t - winAt) / 12) : 0;
  const pw = v ? w : w / 2, ph = v ? h / 2 : h;
  const seal = outBack((t - Math.max(leftAt, rightAt) - 2) / 14);
  return (
    <AbsoluteFill style={{ background: DOC.bg, display: "flex", flexDirection: v ? "column" : "row" }}>
      <Panel s={left} k={kl} lose={win === "right" ? wk : 0} figK={fk} w={w} h={h} pw={pw} ph={ph} t={t} end={end} left />
      <Panel s={right} k={kr} lose={win === "left" ? wk : 0} figK={fk} w={w} h={h} pw={pw} ph={ph} t={t} end={end} left={false} />
      {/* the seam and the seal */}
      <div style={{ position: "absolute", ...(v ? { left: 0, right: 0, top: h / 2 - 2 * u, height: 4 * u } : { top: 0, bottom: 0, left: w / 2 - 2 * u, width: 4 * u }), background: DOC.gold, opacity: seal > 0 ? 0.9 : 0 }} />
      {seal > 0 ? (
        <div style={{ position: "absolute", left: w / 2 - 70 * u, top: (v ? h / 2 : h * 0.42) - 70 * u, width: 140 * u, height: 140 * u, borderRadius: "50%", background: DOC.bg,
          border: `${5 * u}px solid ${DOC.gold}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${seal})`,
          fontFamily: SANS, fontWeight: 900, fontSize: fs(w, h, 52), color: DOC.gold, boxShadow: `0 0 ${40 * u}px rgba(0,0,0,0.7)` }}>VS</div>
      ) : null}
    </AbsoluteFill>
  );
};
