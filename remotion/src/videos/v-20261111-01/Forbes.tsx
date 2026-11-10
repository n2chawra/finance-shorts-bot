/**
 * The promise: "Forbes estimates that Ronaldo made {fact1} in a single year."
 * The floodlit pitch at night: the football star in the middle, arms up. Header FORBES ESTIMATE from
 * frame 0 with RONALDO'S YEAR. On "Forbes" a ball bounces in; on "made" cash bundles fly from the
 * star into a pile that rises on the right and the year's figure slams in huge; on "year" a chip
 * PITCH AND SPONSORS drops under it. The source line prints here (the first beat that says the fact).
 *
 * params: { header, sub, figure, label }, events: forbes, at, year
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import { showsSource } from "../../studio/source";
import props from "./props";

const Star = props.footballer!, Pile = props.cashpile!, BallP = props.football!;

const Forbes: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; sub?: string; figure?: string; label?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tF = at(p, "forbes", 0.2), tMade = at(p, "at", 1.4), tYear = at(p, "year", 2.6);
  const kF = sp(tF, 9), kMade = sp(tMade, 9), kYear = sp(tYear, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 76, maxW, { upper: true }));
  const sub = (P.sub ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(sub, 60, maxW, { upper: true }));
  const fig = P.figure ?? "";
  const fSize = Math.max(min, fitLine(fig, 200, maxW * 0.8));
  const label = (P.label ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(label, 52, maxW * 0.8, { upper: true }));
  const g = h * 0.66, sx = w * 0.32, px = w * 0.72;
  const bounce = Math.abs(Math.sin((t - tF) * 5)) * h * 0.08 * Math.max(0, 1 - (t - tF) * 0.6);
  const notes = t < tMade ? [] : Array.from({ length: 7 }, (_, i) => {
    const f = ((t - tMade) * 1.3 + i / 7) % 1;
    const x = sx + (px - sx) * f, y = g - h * 0.22 - Math.sin(f * Math.PI) * h * 0.12;
    return <rect key={i} x={x - h * 0.018} y={y - h * 0.01} width={h * 0.036} height={h * 0.02} rx={3} fill="#8fd19e" stroke={INK} strokeWidth={3} transform={`rotate(${f * 300} ${x} ${y})`} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.05 * kMade})`, transformOrigin: "50% 60%" }}>
        <World kind="field" tint="#0f3d22" w={w} h={h} t={t} seed="forbes-ronaldo-night" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={sx} cy={g - h * 0.12} rx={w * 0.2} ry={h * 0.14} fill="#fff8d0" opacity={0.14} />
          <g transform={`translate(${sx},${g})`}><Star s={h * 0.26} t={t} /></g>
          {kF > 0 && <g transform={`translate(${sx + w * 0.16},${g - bounce})`}><BallP s={h * 0.06} t={t} /></g>}
          <g transform={`translate(${px},${g}) scale(${0.2 + 0.8 * kMade})`} opacity={clamp(kMade * 3)}><Pile s={h * 0.24} t={t} /></g>
          {notes}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#e5484d", padding: `${hSize * 0.18}px ${hSize * 0.45}px`, borderRadius: 14, border: `5px solid ${INK}` }}>{header}</span>
        {sub && <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{sub}</div>}
      </div>
      {kMade > 0 && fig && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.24, textAlign: "center", opacity: clamp(kMade * 2), transform: `scale(${1.6 - 0.6 * kMade})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{fig}</div>
          {kYear > 0 && label && <span style={{ display: "inline-block", marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: lSize, color: INK, background: "#8fd19e", padding: "4px 20px", borderRadius: 12, border: `4px solid ${INK}`, transform: `scale(${kYear})` }}>{label}</span>}
        </div>
      )}
      {false && showsSource(p) && p.tl.sources && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.43, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: min, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "4px 16px", borderRadius: 10 }}>{p.tl.sources}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Forbes;
