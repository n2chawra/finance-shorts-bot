/**
 * Cut-outs for thumbnails (playbook gaps #1, #4, #8): a licensed photo's subject, cut by
 * `python -m generator.media cutout` (<id>-cut.png, staged under public/media/<slug>/), never a rectangle.
 *
 *   <ProductHero>   the product as a sticker: white edge, rim light, soft contact shadow, a slight tilt, and
 *                   `damage` (crack, dust, grey) so the product carries the emotion (P1, P4, P5, P7)
 *   <PersonCutout>  a real person's licensed photo, dark cinematic grade, rim light, big on one side,
 *                   an optional red slash (P3). A calm face is worse than none: pick a reacting one.
 *
 * Both take the PNG's `aspect` (width ÷ height) and the subject's `box` in it as shares [x0, y0, x1, y1]
 * (the cutout command prints both), and place the subject's centre at (cx, cy) at `height` px tall.
 */
import React, { useId } from "react";
import { Img, staticFile } from "remotion";
import { rng } from "../../flat/kit";
import { useGrade, type GradeName } from "../theme";
import { placeCut } from "./frame";

export type Damage = {
  crack?: number;   // 0..1: how many branches and how long (0.6 is one clear crack with two forks)
  dust?: number;    // 0..1: grime and dust specks over the product
  grey?: number;    // 0..1: drained of colour (a dead product)
  seed?: string;
};

type CutBase = {
  src: string;                         // "media/<slug>/<id>-cut.png"
  aspect: number;
  box?: [number, number, number, number];
  cx: number; cy: number; height: number;
  tilt?: number;                       // degrees, around the subject's centre
  flip?: boolean;
  w: number; h: number;
};

/** A seeded crack across the subject: a jagged main line top to bottom, with forks. In the PNG's pixels. */
function crackPaths(seed: string, amount: number, bx: [number, number, number, number], iw: number, ih: number): string[] {
  const r = rng(`crack-${seed}`);
  const [x0, y0, x1, y1] = [bx[0] * iw, bx[1] * ih, bx[2] * iw, bx[3] * ih];
  const W = x1 - x0, H = y1 - y0;
  const walk = (sx: number, sy: number, dir: number, len: number, steps: number): [number, number][] => {
    const pts: [number, number][] = [[sx, sy]];
    let x = sx, y = sy, a = dir;
    for (let i = 0; i < steps; i++) {
      a += (r() - 0.5) * 0.9;
      const s = (len / steps) * (0.7 + r() * 0.6);
      x += Math.cos(a) * s; y += Math.sin(a) * s;
      pts.push([x, y]);
    }
    return pts;
  };
  const toD = (p: [number, number][]) => `M ${p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")}`;
  const main = walk(x0 + W * (0.38 + r() * 0.2), y0 - H * 0.05, Math.PI / 2 + (r() - 0.5) * 0.5, H * (0.7 + 0.4 * amount), 12);
  const out = [toD(main)];
  const forks = Math.round(1 + amount * 3);
  for (let i = 0; i < forks; i++) {
    const p = main[2 + Math.floor(r() * (main.length - 4))]!;
    out.push(toD(walk(p[0], p[1], Math.PI / 2 + (r() < 0.5 ? -1 : 1) * (0.6 + r() * 0.6), H * (0.2 + 0.25 * amount), 6)));
  }
  return out;
}

/** The damage layers, drawn inside the product's own alpha (CSS mask = the cut-out PNG). */
const DamageLayer: React.FC<{ src: string; damage: Damage; box: [number, number, number, number]; iw: number; ih: number; id: string }> = ({ src, damage, box, iw, ih, id }) => {
  const url = `url(${staticFile(src)})`;
  const dust = damage.dust ?? 0, crack = damage.crack ?? 0;
  const seed = damage.seed ?? src;
  const r = rng(`dust-${seed}`);
  const specks = Array.from({ length: Math.round(60 * dust) }, () => ({ x: (box[0] + r() * (box[2] - box[0])) * iw, y: (box[1] + r() * (box[3] - box[1])) * ih, s: 1.5 + r() * 5, o: 0.35 + r() * 0.5 }));
  const sw = Math.max(3, ih * 0.008);
  return (
    <div style={{ position: "absolute", inset: 0, maskImage: url, WebkitMaskImage: url, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } as React.CSSProperties}>
      <svg width={iw} height={ih} style={{ position: "absolute", inset: 0 }}>
        <filter id={`grime-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.012 * (1080 / ih)} numOctaves={4} seed={7} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.80  0 0 0 0 0.76  0 0 0 0 0.68  0 0 0 2.4 -1.25" />
        </filter>
        <filter id={`speck-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.35 * (1080 / ih)} numOctaves={1} seed={3} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.88  0 0 0 0 0.82  0 0 0 9 -6.2" />
        </filter>
        {dust > 0 ? (
          <g>
            {/* grime stays thin so the product's own shape still reads at 168 px; the specks say "dust" */}
            <rect width={iw} height={ih} filter={`url(#grime-${id})`} opacity={0.45 * dust} />
            <rect width={iw} height={ih} filter={`url(#speck-${id})`} opacity={0.9 * dust} />
            {specks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill="#efe9dc" opacity={p.o} />)}
          </g>
        ) : null}
        {crack > 0 ? crackPaths(seed, crack, box, iw, ih).map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={sw * (i ? 0.9 : 1.5)} strokeLinejoin="round" strokeLinecap="round" transform={`translate(${sw * 0.9},${sw * 0.6})`} />
            <path d={d} fill="none" stroke="#0b0907" strokeWidth={sw * (i ? 1.1 : 1.9)} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        )) : null}
      </svg>
    </div>
  );
};

/** A light from one side inside the subject's alpha: the rim / key that separates it from the plate. */
const RimLayer: React.FC<{ src: string; color: string; from: "left" | "right"; strength: number }> = ({ src, color, from, strength }) => {
  const url = `url(${staticFile(src)})`;
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: strength,
      background: `linear-gradient(${from === "left" ? "100deg" : "260deg"}, ${color} 0%, rgba(0,0,0,0) 38%)`,
      maskImage: url, WebkitMaskImage: url, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } as React.CSSProperties} />
  );
};

/** The product as a sticker: white edge, rim light, contact shadow, tilt, damage. */
export const ProductHero: React.FC<CutBase & {
  edge?: number;            // the white sticker edge, px (default 1% of the frame height; 0 for none)
  rim?: string;             // rim light colour (default warm white)
  rimFrom?: "left" | "right";
  shadow?: boolean;         // the soft contact shadow under it (default on)
  damage?: Damage;
}> = ({ src, aspect, box = [0, 0, 1, 1], cx, cy, height, tilt = -6, flip = false, edge, rim = "#fff4dc", rimFrom = "left", shadow = true, damage, w, h }) => {
  const id = useId().replace(/:/g, "");
  const p = placeCut(aspect, box, cx, cy, height);
  const e = edge ?? Math.round(h * 0.01);
  const sticker = e > 0 ? [`${e}px 0`, `-${e}px 0`, `0 ${e}px`, `0 -${e}px`].map((o) => `drop-shadow(${o} 0 #ffffff)`).join(" ") : "";
  const g = damage?.grey ?? 0;
  const imgFilter = g > 0 ? `grayscale(${g}) brightness(${1 - 0.12 * g}) contrast(${1 - 0.08 * g})` : "saturate(1.15) contrast(1.05)";
  const subjW = p.subjectW;
  return (
    <>
      {shadow ? (
        <div style={{ position: "absolute", left: cx - subjW * 0.48, top: cy + height * 0.4, width: subjW * 0.96, height: height * 0.16, borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)", filter: `blur(${Math.round(h * 0.012)}px)` }} />
      ) : null}
      <div style={{ position: "absolute", left: p.left, top: p.top, width: p.width, height: p.height, transformOrigin: p.origin,
        transform: `rotate(${tilt}deg)${flip ? " scaleX(-1)" : ""}`,
        filter: `${sticker} drop-shadow(0 0 ${Math.round(h * 0.012)}px rgba(255,255,255,0.35)) drop-shadow(0 ${Math.round(h * 0.022)}px ${Math.round(h * 0.03)}px rgba(0,0,0,0.5))` }}>
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: imgFilter }} />
        <RimLayer src={src} color={rim} from={flip ? (rimFrom === "left" ? "right" : "left") : rimFrom} strength={0.55} />
        {damage && ((damage.dust ?? 0) > 0 || (damage.crack ?? 0) > 0) ? <DamageLayer src={src} damage={damage} box={box} iw={p.width} ih={p.height} id={id} /> : null}
      </div>
    </>
  );
};

/** A real person, cut out, graded dark and cinematic, big on one side; the bottom bleeds off the frame. */
export const PersonCutout: React.FC<Omit<CutBase, "cx" | "cy" | "height"> & {
  side?: "left" | "right";
  cx?: number; cy?: number; height?: number;
  grade?: GradeName;        // default "bleach" (low saturation, hard contrast)
  rim?: string;             // the rim light from the frame's middle (default cool blue)
  slash?: boolean;          // a red slash across the face's side (Boeing's "FALL OF")
}> = ({ src, aspect, box = [0, 0, 1, 1], side = "right", cx, cy, height, tilt = 0, flip = false, grade = "bleach", rim = "#9cc8ff", slash = false, w, h }) => {
  const id = useId().replace(/:/g, "");
  const gr = useGrade(grade, `person-${id}`);
  const H = height ?? h * 1.1;
  const X = cx ?? (side === "right" ? w * 0.72 : w * 0.28);
  const Y = cy ?? h * 0.62;
  const p = placeCut(aspect, box, X, Y, H);
  return (
    <>
      {gr.defs}
      <div style={{ position: "absolute", left: p.left, top: p.top, width: p.width, height: p.height, transformOrigin: p.origin,
        transform: `rotate(${tilt}deg)${flip ? " scaleX(-1)" : ""}`, filter: `drop-shadow(0 0 ${Math.round(h * 0.03)}px rgba(0,0,0,0.8))` }}>
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: `${gr.filter === "none" ? "" : gr.filter} brightness(0.9)` }} />
        <RimLayer src={src} color={rim} from={(side === "right") !== flip ? "left" : "right"} strength={0.8} />
      </div>
      {slash ? (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          <path d={`M ${X - p.subjectW * 0.45} ${h * 0.12} L ${X + p.subjectW * 0.4} ${h * 0.86}`} stroke="#e5483b" strokeWidth={h * 0.035} strokeLinecap="round"
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }} />
        </svg>
      ) : null}
    </>
  );
};
