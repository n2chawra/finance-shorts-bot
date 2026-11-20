/**
 * A real photo as a 2.5D shot (owner's reference, 2026-11-20: Business Casual's "The Rise of Nike"):
 *   back   the photo itself, desaturated or aged, blurred and dimmed, pushing slowly (~4% over the layer)
 *   middle a big kinetic title (the name, heavy condensed caps in the accent colour) landing on `titleAt`
 *   front  the subject cut out of the same photo (`cut`, a transparent PNG the same size as `src`, made by
 *          `python -m generator.media cutout`), registered exactly over the background subject and pushing
 *          faster (~9%) with a small drift, so it separates from the background and overlaps the type
 *   dust   optional specks drifting in front
 * Both photo layers share one cover-fit box, so the cut-out lines up with the subject at frame 0.
 */
import React, { useId } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { rng } from "../flat/kit";
import { clamp01, DISPLAY, DOC, DocVignette, FilmGrain, fs, outBack, outCubic, SANS, smooth, unit, useGrade, type GradeName } from "./theme";

export type DepthTone = "gold" | "white" | "red";

export type DepthProps = {
  src: string;                 // the photo under remotion/public ("media/<slug>/x.jpg")
  cut: string;                 // its cut-out: "media/<slug>/x-cut.png", same pixel size as src
  title?: string;              // words only (a name, a place); figures never go here
  sub?: string;                // a role or place, types on after the title
  titleAt: number;             // layer frame the title lands
  tone?: DepthTone;
  bgTreatment?: "bw" | "archive" | "none";
  grade: GradeName;
  focus?: [number, number];    // 0..1 of the photo: the subject, where both pushes centre
  side?: "left" | "right";     // where the title sits (the subject stands on the other side)
  particles?: boolean;
  t: number; end: number; w: number; h: number;
};

const TONES: Record<DepthTone, string> = { gold: DOC.gold, white: DOC.text, red: DOC.red };

/** Dust in front of the subject: soft specks drifting up and sideways, seeded. */
const Dust: React.FC<{ t: number; w: number; h: number; seed: string }> = ({ t, w, h, seed }) => {
  const r = rng(`dust-${seed}`);
  const specks = Array.from({ length: 26 }, () => ({ x: r() * w, y: r() * h, s: 2 + r() * 7, v: 0.6 + r() * 1.6, dx: (r() - 0.5) * 0.8, o: 0.15 + r() * 0.45, b: r() * 3 }));
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} data-probe="skip">
      {specks.map((p, i) => {
        const y = (((p.y - t * p.v) % h) + h) % h;
        const x = (((p.x + t * p.dx + Math.sin((t + i * 13) / 23) * 12) % w) + w) % w;
        return <circle key={i} cx={x} cy={y} r={p.s} fill="#f6eedb" opacity={p.o} style={{ filter: `blur(${p.b}px)` }} />;
      })}
    </svg>
  );
};

export const Depth: React.FC<DepthProps> = ({
  src, cut, title, sub, titleAt, tone = "gold", bgTreatment = "bw", grade, focus = [0.5, 0.45], side = "left", particles = true, t, end, w, h,
}) => {
  const id = useId().replace(/:/g, "");
  const back = useGrade(bgTreatment === "none" ? grade : bgTreatment === "archive" ? "archive" : "bw", `depth-b-${id}`);
  // the subject keeps the video's grade (in colour against a grey background), unless the whole shot is archival
  const front = useGrade(bgTreatment === "archive" ? "archive" : grade, `depth-f-${id}`);
  const v = h > w;
  const u = unit(w, h);
  const k = smooth(end > 0 ? clamp01(t / end) : 0);
  const origin = `${focus[0] * 100}% ${focus[1] * 100}%`;
  const bgScale = 1.04 + 0.04 * k;
  const fgScale = 1.04 + 0.09 * k;
  const drift = (side === "left" ? 1 : -1) * 14 * u * k;     // the subject eases away from the title
  const sepia = bgTreatment === "archive" ? " sepia(0.3)" : "";

  // the title: lands with an overshoot, then drifts a little (a middle parallax plane)
  const tk = t - titleAt;
  const land = outBack(clamp01(tk / 12));
  const op = clamp01(tk / 5);
  const words = (title ?? "").toUpperCase().split(/\s+/).filter(Boolean);
  const size = (v ? 200 : 190) * u * (words.some((x) => x.length > 7) ? 0.78 : 1);
  const colour = TONES[tone];
  // vertical: the block sits in the upper half, clear of the caption band (~1110–1350 px) and the right-edge buttons
  const box: React.CSSProperties = v
    ? { position: "absolute", top: h * 0.2, [side]: 70 * u, maxWidth: w - 70 * u - 150 * u, textAlign: side }
    : { position: "absolute", top: h * 0.22, [side]: w * 0.06, maxWidth: w * 0.5, textAlign: side };
  const subChars = sub ? Math.floor(clamp01((tk - 14) / 22) * sub.length) : 0;

  return (
    <AbsoluteFill style={{ background: DOC.bg, overflow: "hidden" }}>
      {back.defs}
      {front.defs}
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: origin }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: origin,
          filter: `${back.filter === "none" ? "" : back.filter}${sepia} blur(${6 * u}px) brightness(0.62)`.trim() }} />
      </AbsoluteFill>
      {words.length ? (
        <div style={{ ...box, opacity: op, transform: `translateX(${(side === "left" ? -1 : 1) * (1 - land) * 60 * u}px) scale(${0.86 + 0.14 * land + 0.03 * k})`,
          transformOrigin: side === "left" ? "left center" : "right center" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 0.9, color: colour, letterSpacing: `${(1 - outCubic(clamp01(tk / 18))) * 0.08 + 0.01}em`,
            textShadow: "0 6px 30px rgba(0,0,0,0.45)" }}>
            {words.map((x, i) => <div key={i}>{x}</div>)}
          </div>
          {sub ? (
            <div style={{ marginTop: 18 * u, fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, 46), letterSpacing: "0.14em", color: DOC.text,
              textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.8)", minHeight: 48 * u }}>
              {sub.slice(0, subChars)}
            </div>
          ) : null}
        </div>
      ) : null}
      <AbsoluteFill style={{ transform: `translateX(${drift}px) scale(${fgScale})`, transformOrigin: origin }}>
        <Img src={staticFile(cut)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: origin,
          filter: `${front.filter === "none" ? "" : front.filter}${sepia} drop-shadow(0 ${18 * u}px ${30 * u}px rgba(0,0,0,0.55))`.trim() }} />
      </AbsoluteFill>
      {particles ? <Dust t={t} w={w} h={h} seed={src} /> : null}
      <DocVignette o={0.5} />
      <FilmGrain t={t} o={0.35} />
    </AbsoluteFill>
  );
};
