/**
 * Products as things: die-cut product images (transparent PNGs) on a charcoal or paper backdrop.
 *   mode "stage"  up to four products slide in one by one on their words, each standing on its own shadow
 *   mode "pallet" one product stacked on a wooden pallet, N units
 *   mode "wall"   one product filling a shelf wall, N units
 * N is a figure from params.fig (a placeholder Python filled, "1,200" or "4.5K"), never a typed literal.
 * Pallet and wall fill on their word, unit by unit; at most CAP units are drawn, and the figure itself
 * (the full number) lands big once the fill ends.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, DISPLAY, DOC, DocVignette, FilmGrain, outBack, outCubic, SANS, smooth, fs, unit } from "./theme";

export type Product = { src: string; aspect?: number; label?: string; at: number };
export type StageMode = "stage" | "pallet" | "wall";

export type ProductStageProps = {
  mode: StageMode;
  items: Product[];              // stage: the products; pallet/wall: the first is the unit
  count?: string;                // pallet/wall: the figure (from fig), parsed for how many units to draw
  countLabel?: string;           // words under the figure ("units on one pallet")
  fillAt?: number; fillLen?: number;
  backdrop?: "charcoal" | "paper";
  t: number; end: number; w: number; h: number;
};

export const CAP = 240;

/** "1,200" → 1200, "4.5K" → 4500, "$2M" → 2000000; NaN when there is no number. */
export function parseCount(s: string | undefined): number {
  if (!s) return NaN;
  const m = s.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*([kKmMbB])?/);
  if (!m) return NaN;
  const mult = m[2] ? { k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase() as "k" | "m" | "b"] : 1;
  return Math.round(Number(m[1]) * mult);
}

const Backdrop: React.FC<{ kind: "charcoal" | "paper"; floor: number }> = ({ kind, floor }) => (
  <AbsoluteFill style={{
    background: kind === "paper"
      ? "radial-gradient(ellipse 80% 70% at 50% 40%, #f1ead9 0%, #ddd2b8 65%, #b9ab8c 100%)"
      : "radial-gradient(ellipse 75% 70% at 50% 38%, #3a3d44 0%, #23262c 55%, #0e0f12 100%)",
  }}>
    {/* the floor: a soft horizon so things stand on something */}
    <div style={{ position: "absolute", left: 0, right: 0, top: `${floor * 100}%`, bottom: 0,
      background: kind === "paper" ? "linear-gradient(180deg, rgba(120,100,70,0.18), rgba(120,100,70,0))" : "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.05))" }} />
  </AbsoluteFill>
);

const Cut: React.FC<{ src: string; style: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", objectFit: "contain", ...style }} />
);

export const ProductStage: React.FC<ProductStageProps> = ({ mode, items, count, countLabel, fillAt = 6, fillLen = 36, backdrop = "charcoal", t, end, w, h }) => {
  const u = unit(w, h);
  const v = h > w;
  const ink = backdrop === "paper" ? DOC.paperInk : DOC.text;
  const k = end > 0 ? smooth(t / end) : 0;
  const drift = `scale(${1 + 0.04 * k})`;

  if (mode === "stage") {
    const n = Math.max(1, Math.min(4, items.length));
    const floor = v ? 0.62 : 0.7;
    const slot = (w * 0.86) / (v && n > 2 ? 2 : n);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Backdrop kind={backdrop} floor={floor} />
        <AbsoluteFill style={{ transform: drift }}>
          {items.slice(0, 4).map((it, i) => {
            const cols = v && n > 2 ? 2 : n;
            const row = Math.floor(i / cols), col = i % cols;
            const inRow = Math.min(cols, n - row * cols);
            const cx = w / 2 + (col - (inRow - 1) / 2) * slot;
            const base = v && n > 2 ? h * (0.42 + row * 0.26) : h * floor;
            const a = it.aspect ?? 1;
            const iw = Math.min(slot * 0.8, (v ? h * 0.22 : h * 0.42) * a), ih = iw / a;
            const e = outBack((t - it.at) / 16);
            const o = clamp01((t - it.at) / 6);
            if (t < it.at) return null;
            const dx = (1 - e) * w * 0.6;          // slides in from the right, overshoots and settles
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: cx - iw * 0.45 + dx, top: base - 12 * u, width: iw * 0.9, height: 26 * u, borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)", filter: `blur(${10 * u}px)`, opacity: o }} />
                <Cut src={it.src} style={{ left: cx - iw / 2 + dx, top: base - ih, width: iw, height: ih, opacity: o,
                  filter: `drop-shadow(0 ${10 * u}px ${18 * u}px rgba(0,0,0,0.45))`, transform: `rotate(${(1 - e) * 8}deg)` }} />
                {it.label ? (
                  <div style={{ position: "absolute", left: cx - slot / 2, width: slot, top: base + 26 * u, textAlign: "center", fontFamily: SANS, fontWeight: 600,
                    fontSize: fs(w, h, 34), color: ink, opacity: clamp01((t - it.at - 8) / 8) }}>{it.label}</div>
                ) : null}
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
        <FilmGrain t={t} o={0.25} moving={false} />
        <DocVignette o={0.5} />
      </AbsoluteFill>
    );
  }

  // pallet / wall: N units of one product, filling on the word
  const it = items[0];
  const total = parseCount(count);
  const drawn = isFinite(total) ? Math.max(1, Math.min(CAP, total)) : 0;
  const a = it?.aspect ?? 1;
  const pallet = mode === "pallet";
  // the area the units fill (pallet: a block above the pallet; wall: most of the frame, room for the figure)
  const area = pallet
    ? { x: w * (v ? 0.12 : 0.3), y: h * (v ? 0.3 : 0.14), w: w * (v ? 0.76 : 0.4), h: h * (v ? 0.36 : 0.56) }
    : { x: w * 0.06, y: h * (v ? 0.12 : 0.08), w: w * 0.88, h: h * (v ? 0.6 : 0.64) };
  const cols = Math.max(1, Math.round(Math.sqrt((drawn * area.w) / (area.h * a))));
  const rows = Math.max(1, Math.ceil(drawn / cols));
  const cellW = Math.min(area.w / cols, (area.h / rows) * a), cellH = cellW / a;
  const gx = area.x + (area.w - cellW * cols) / 2;
  const gy = area.y + area.h - cellH * rows;      // stacked from the bottom up
  const fill = clamp01((t - fillAt) / fillLen);
  const shown = Math.floor(drawn * fill);
  const figK = outCubic((t - fillAt - fillLen) / 12);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop kind={backdrop} floor={(area.y + area.h) / h} />
      <AbsoluteFill style={{ transform: drift }}>
        {!pallet ? (
          // shelf lines: the wall the units sit on
          Array.from({ length: rows }, (_, r) => (
            <div key={`s${r}`} style={{ position: "absolute", left: area.x - 10 * u, width: area.w + 20 * u, top: gy + (r + 1) * cellH - 3 * u, height: 8 * u,
              background: backdrop === "paper" ? "#8b7a5c" : "#4a4e57", boxShadow: "0 4px 8px rgba(0,0,0,0.4)" }} />
          ))
        ) : (
          // the wooden pallet
          <div style={{ position: "absolute", left: area.x - 20 * u, width: area.w + 40 * u, top: area.y + area.h, height: 46 * u }}>
            <div style={{ height: 14 * u, background: "#b8864b", borderBottom: `2px solid #6e4b25` }} />
            <div style={{ display: "flex", justifyContent: "space-between", height: 18 * u }}>
              {[0, 1, 2].map((b) => <div key={b} style={{ width: 54 * u, background: "#9a6d38", borderLeft: "2px solid #6e4b25", borderRight: "2px solid #6e4b25" }} />)}
            </div>
            <div style={{ height: 14 * u, background: "#b8864b", borderTop: `2px solid #6e4b25` }} />
          </div>
        )}
        {it ? Array.from({ length: shown }, (_, i) => {
          // fill bottom row first, left to right
          const r = rows - 1 - Math.floor(i / cols), c = i % cols;
          const born = fillAt + (i / drawn) * fillLen;
          const p = outBack((t - born) / 6);
          return <Cut key={i} src={it.src} style={{ left: gx + c * cellW + cellW * 0.04, top: gy + r * cellH + cellH * 0.04 - (1 - p) * 30 * u, width: cellW * 0.92, height: cellH * 0.92,
            opacity: clamp01(p * 2), filter: cellW > 60 * u ? `drop-shadow(0 ${3 * u}px ${4 * u}px rgba(0,0,0,0.4))` : undefined }} />;
        }) : null}
      </AbsoluteFill>
      {count ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: v ? h * 0.74 : h * 0.79, textAlign: "center", opacity: figK, transform: `scale(${0.85 + 0.15 * figK})` }}>
          <div style={{ fontFamily: DISPLAY, fontSize: fs(w, h, 120), lineHeight: 1, color: DOC.gold, textShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>{count}</div>
          {countLabel ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, 36), color: ink, marginTop: 8 * u }}>{countLabel}</div> : null}
        </div>
      ) : null}
      <FilmGrain t={t} o={0.25} moving={false} />
      <DocVignette o={0.5} />
    </AbsoluteFill>
  );
};
