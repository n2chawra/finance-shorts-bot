/**
 * A still photo with a Ken Burns move toward a focus point (a face, a sign, a storefront).
 *   frame "full"      fills the frame (a portrait photo in a landscape frame sits on a blurred copy of itself)
 *   frame "polaroid"  a print on a surface, white border and a written caption, slightly turned
 *   frame "clipping"  a newspaper clipping: halftone print, a caption under it, cut edges
 *   frame "torn"      a print with torn top and bottom edges
 * treatment "sepia" | "bw" | "archive" (black and white, dust and scratches, a soft flicker) ages it.
 * The camera pushes onto the photo over the beat; `at` drops a framed print in.
 */
import React, { useId, useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { rng } from "../flat/kit";
import { moveTransform, type MoveKind } from "./move";
import { clamp01, DOC, DocVignette, FilmGrain, outBack, SERIF, smooth, fs, SurfaceBg, unit, useGrade, type GradeName, type Surface } from "./theme";

export type PhotoFrame = "full" | "polaroid" | "clipping" | "torn";
export type Treatment = "none" | "sepia" | "bw" | "archive";

export type PhotoProps = {
  src: string;                 // under remotion/public: "media/<slug>/x.jpg" or "real/<name>.jpg" (Commons)
  t: number; end: number; w: number; h: number;
  aspect?: number;             // width / height of the photo (credits.json / the fetcher's log); 1.5 if unknown
  focus?: [number, number];    // 0..1 of the photo: where the push ends
  move?: MoveKind; amount?: number;
  frame?: PhotoFrame;
  treatment?: Treatment;
  grade?: GradeName;
  caption?: string;            // polaroid / clipping caption (words; figures only from fig)
  surface?: Surface;
  inAt?: number;               // frame the framed print lands
  tilt?: number;               // degrees the print is turned
  pos?: [number, number];      // where a framed print lies (0..1 of the frame; right of centre leaves room for a lower third)
};

const TREAT: Record<Treatment, GradeName | null> = { none: null, sepia: "archive", bw: "bw", archive: "archive" };

/** Dust and scratches for the archive treatment: a few thin lines and specks that jump every 3 frames. */
const Scratches: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const step = Math.floor(t / 3);
  const r = rng(`scratch-${step}`);
  const lines = Array.from({ length: 2 }, () => ({ x: r() * w, o: 0.12 + r() * 0.2, wd: 1 + r() * 1.5 }));
  const specks = Array.from({ length: 7 }, () => ({ x: r() * w, y: r() * h, s: 1.5 + r() * 3.5, o: 0.2 + r() * 0.4 }));
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }} data-probe="skip">
      {lines.map((l, i) => <line key={i} x1={l.x} y1={0} x2={l.x + 6} y2={h} stroke="#f8f2e0" strokeWidth={l.wd} opacity={l.o} />)}
      {specks.map((s, i) => <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.s} fill={i % 2 ? "#111" : "#f4eedd"} opacity={s.o} />)}
    </svg>
  );
};

/** A jagged edge (torn paper) as a CSS polygon, seeded so every frame tears the same way. */
function tornPolygon(seed: string): string {
  const r = rng(seed);
  const top: string[] = [], bottom: string[] = [];
  for (let i = 0; i <= 24; i++) top.push(`${(i / 24) * 100}% ${r() * 3.2}%`);
  for (let i = 24; i >= 0; i--) bottom.push(`${(i / 24) * 100}% ${100 - r() * 3.2}%`);
  return `polygon(${[...top, ...bottom].join(",")})`;
}

const Picture: React.FC<{ src: string; filter: string; style?: React.CSSProperties; fit?: "cover" | "contain" }> = ({ src, filter, style, fit = "cover" }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit, filter: filter === "none" ? undefined : filter, display: "block", ...style }} />
);

export const PhotoPan: React.FC<PhotoProps> = ({
  src, t, end, w, h, aspect = 1.5, focus = [0.5, 0.4], move = "push", amount = 0.12, frame = "full", treatment = "none",
  grade = "doc", caption, surface = "desk", inAt = 0, tilt = -3, pos = [0.5, 0.5],
}) => {
  const id = `docphoto-${useId().replace(/:/g, "")}`;
  const g = TREAT[treatment] ?? grade;
  const { defs, filter } = useGrade(g, id);
  const tone = treatment === "sepia" || treatment === "archive" ? `${filter} sepia(${treatment === "sepia" ? 0.55 : 0.3})` : filter;
  const u = unit(w, h);
  const k = end > 0 ? t / end : 0;
  const clip = useMemo(() => tornPolygon(src), [src]);

  if (frame === "full") {
    const frameAspect = w / h;
    const narrow = aspect < frameAspect * 0.8;     // a portrait photo in a landscape frame (or the reverse)
    const mv = moveTransform(move, k, amount, focus, 1.04);
    return (
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {defs}
        {narrow ? (
          <AbsoluteFill style={{ transform: "scale(1.2)" }}>
            <Picture src={src} filter={`${tone === "none" ? "" : tone} blur(${28 * u}px) brightness(0.55)`} />
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{ transform: mv.transform, transformOrigin: mv.origin, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {narrow ? (
            <div style={{ height: h * 0.94, width: h * 0.94 * aspect, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
              <Picture src={src} filter={tone} />
            </div>
          ) : <Picture src={src} filter={tone} />}
        </AbsoluteFill>
        {treatment === "archive" ? <Scratches t={t} w={w} h={h} /> : null}
        <FilmGrain t={t} o={treatment === "none" ? 0.25 : 0.55} moving={treatment === "archive"} />
        <DocVignette o={treatment === "none" ? 0.45 : 0.65} />
      </AbsoluteFill>
    );
  }

  // a framed print on a surface: the print lands at `inAt`, the camera pushes onto its focus point
  const land = smooth((t - inAt) / 14);
  const bounce = outBack((t - inAt) / 16);
  const v = h > w;
  const boxH = v ? h * 0.4 : h * 0.6;
  const imgW = Math.min(v ? w * 0.78 : w * 0.5, boxH * aspect);
  const imgH = imgW / aspect;
  const pad = frame === "polaroid" ? 22 * u : frame === "clipping" ? 26 * u : 0;
  const capH = caption && (frame === "polaroid" || frame === "clipping") ? 74 * u : 0;
  const cardW = imgW + pad * 2, cardH = imgH + pad * 2 + capH;
  const zoom = 1 + amount * smooth(k);
  const fx = (focus[0] - 0.5) * imgW, fy = (focus[1] - 0.5) * imgH;
  const paper = frame === "clipping" ? "#e9e1cc" : "#f7f5ef";
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {defs}
      <SurfaceBg kind={surface} />
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${-fx * smooth(k) * 0.5}px, ${-fy * smooth(k) * 0.5}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: cardW, height: cardH, background: frame === "torn" ? "transparent" : paper, position: "relative", marginLeft: (pos[0] - 0.5) * 2 * w, marginTop: (pos[1] - 0.5) * 2 * h,
          opacity: clamp01(land * 1.5),
          transform: `translateY(${(1 - land) * 60 * u}px) rotate(${tilt + (1 - bounce) * 6}deg) scale(${1.08 - 0.08 * bounce})`,
          boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.55), 0 ${4 * u}px ${10 * u}px rgba(0,0,0,0.35)`,
          clipPath: frame === "torn" || frame === "clipping" ? clip : undefined,
        }}>
          <div style={{ position: "absolute", left: pad, top: pad, width: imgW, height: imgH, overflow: "hidden", background: "#222" }}>
            <Picture src={src} filter={frame === "clipping" ? `${tone === "none" ? "" : tone} grayscale(1) contrast(1.35)` : tone} />
            {frame === "clipping" ? (
              // halftone dots printed over the photo
              <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(20,16,10,0.55) 32%, transparent 36%)", backgroundSize: `${5 * u}px ${5 * u}px`, mixBlendMode: "multiply", opacity: 0.55 }} />
            ) : null}
            {treatment === "archive" ? <Scratches t={t} w={imgW} h={imgH} /> : null}
          </div>
          {capH ? (
            <div style={{ position: "absolute", left: pad, right: pad, top: pad + imgH + 10 * u, height: capH - 14 * u, display: "flex", alignItems: "center",
              justifyContent: frame === "polaroid" ? "center" : "flex-start", fontFamily: SERIF, fontStyle: frame === "polaroid" ? "italic" : "normal",
              fontWeight: frame === "polaroid" ? 500 : 600, fontSize: fs(w, h, 34), color: DOC.paperInk, letterSpacing: frame === "clipping" ? 0.2 : 0 }}>{caption}</div>
          ) : null}
          {/* paper sheen */}
          <AbsoluteFill style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%, rgba(0,0,0,0.08))", pointerEvents: "none" }} />
        </div>
      </AbsoluteFill>
      <FilmGrain t={t} o={0.35} moving={false} />
      <DocVignette o={0.6} />
    </AbsoluteFill>
  );
};
