/**
 * A row of polaroids on a surface (the people in the story, the stores, the before and after): N prints
 * lying tilted side by side, all soft and dim until their word. On its `at` a print unblurs, lifts toward
 * the camera and straightens, and the others dim behind it; the last one named stays up.
 * A Short (vertical frame) lays them in two rows. Captions are words; figures only from fig.
 */
import React, { useId } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { rng } from "../flat/kit";
import { clamp01, DOC, DocVignette, FilmGrain, outBack, SERIF, smooth, fs, SurfaceBg, unit, useGrade, type Surface } from "./theme";

export type Polaroid = {
  src: string;          // under remotion/public: "media/<slug>/x.jpg" or "real/<name>.jpg"
  aspect?: number;      // width / height of the photo; 1 if unknown
  caption?: string;
  at: number;           // frame (layer clock) the print is named
  bw?: boolean;         // black and white print
};

export type PolaroidProps = {
  items: Polaroid[];
  t: number; end: number; w: number; h: number;
  surface?: Surface;
  bw?: boolean;         // every print black and white
  dim?: number;         // how dark the unnamed prints go (0..1)
};

const Print: React.FC<{ it: Polaroid; i: number; n: number; on: number; active: boolean; seen: boolean; x: number; y: number;
  cw: number; u: number; w: number; h: number; t: number; dim: number; filter: string; seed: string }> = ({
  it, i, on, active, seen, x, y, cw, u, w, h, dim, filter, seed,
}) => {
  const r = rng(`${seed}-${i}`);
  const tilt = (i % 2 ? 1 : -1) * (3 + r() * 5);
  const lift = active ? outBack(on / 14) : 0;           // springs up on its word
  const pad = 16 * u;
  const imgW = cw - pad * 2;
  const imgH = imgW / Math.max(0.6, Math.min(1.25, it.aspect ?? 1)) * 0.92;
  const capH = it.caption ? 64 * u : 22 * u;
  const blur = seen ? 0 : 7 * u;
  const bright = active ? 1 : seen ? 1 - dim * 0.75 : 1 - dim;
  return (
    <div style={{
      position: "absolute", left: x - cw / 2, top: y - (imgH + pad + capH) / 2, width: cw, height: imgH + pad + capH, background: "#f7f5ef",
      transform: `translateY(${-lift * 40 * u}px) rotate(${tilt * (1 - 0.85 * lift)}deg) scale(${1 + 0.16 * lift})`,
      zIndex: active ? 10 : i, filter: `brightness(${bright})`,
      boxShadow: `0 ${(14 + 30 * lift) * u}px ${(30 + 50 * lift) * u}px rgba(0,0,0,${0.5 + 0.15 * lift}), 0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.35)`,
    }}>
      <div style={{ position: "absolute", left: pad, top: pad, width: imgW, height: imgH, overflow: "hidden", background: "#222" }}>
        <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%", display: "block",
          filter: `${filter === "none" ? "" : filter} ${it.bw ? "grayscale(1)" : ""} blur(${blur}px)`.trim() || undefined }} />
      </div>
      {it.caption ? (
        <div style={{ position: "absolute", left: pad, right: pad, top: pad + imgH + 6 * u, height: capH - 10 * u, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: fs(w, h, 30), color: DOC.paperInk, whiteSpace: "nowrap", overflow: "hidden" }}>{it.caption}</div>
      ) : null}
      <AbsoluteFill style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%, rgba(0,0,0,0.08))", pointerEvents: "none" }} />
    </div>
  );
};

export const PolaroidRow: React.FC<PolaroidProps> = ({ items, t, end, w, h, surface = "desk", bw = false, dim = 0.55 }) => {
  const id = `docpol-${useId().replace(/:/g, "")}`;
  const { defs, filter } = useGrade(bw ? "bw" : "doc", id);
  const u = unit(w, h);
  const n = Math.max(1, items.length);
  const v = h > w;
  const rows = v && n > 2 ? 2 : 1;
  const perRow = Math.ceil(n / rows);
  const cw = Math.min((w * 0.8) / perRow, (v ? h * 0.3 : h * 0.55) * 0.86);
  // the print named last (at or before now) is up; the ones named before it stay sharp but dim
  let active = -1;
  items.forEach((it, i) => { if (t >= it.at && (active < 0 || it.at >= items[active]!.at)) active = i; });
  // the whole table drifts in slowly: a documentary camera never stands still
  const k = end > 0 ? smooth(t / end) : 0;
  const settle = smooth(t / 18);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {defs}
      <SurfaceBg kind={surface} />
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.05 * k})`, opacity: clamp01(settle * 1.4) }}>
        {items.map((it, i) => {
          const row = Math.floor(i / perRow), col = i % perRow;
          const inRow = row === rows - 1 ? n - perRow * (rows - 1) : perRow;
          const gap = (w * 0.86) / inRow;
          const x = w / 2 + (col - (inRow - 1) / 2) * gap;
          const y = rows === 1 ? h * 0.5 : h * (0.33 + row * 0.34);
          return <Print key={i} it={it} i={i} n={n} on={t - it.at} active={i === active} seen={t >= it.at} x={x} y={y + (1 - settle) * 30 * u}
            cw={cw} u={u} w={w} h={h} t={t} dim={dim} filter={filter} seed={it.src} />;
        })}
      </AbsoluteFill>
      <FilmGrain t={t} o={0.3} moving={false} />
      <DocVignette o={0.6} />
    </AbsoluteFill>
  );
};
