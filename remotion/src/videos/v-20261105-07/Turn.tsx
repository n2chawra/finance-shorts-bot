/**
 * The turn: "So does the pile shrink? No. The growth outruns the shopping."
 * A bank hall, header DOES THE PILE SHRINK? from frame 0, the money pile in the middle. On "pile" it
 * pulses; on "shrink" shopping bags fly off its top, it sinks, and SPENT with the year's spending
 * appears on the left; on "No" a huge red NO stamps; on "growth" a money vine climbs on the right, the
 * pile shoots up taller than before and GREW with the year's growth slams in; on "shopping" the
 * spent figure dims.
 *
 * params: { header, spend, spendLabel, gain, gainLabel, stamp }, events: pile, shrink, no, growth, shopping
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Pile = props.megapile!, Bag = props.shopbag!, Vine = props.moneyvine!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; spend?: string; spendLabel?: string; gain?: string; gainLabel?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPile = at(p, "pile", 0.4), tShrink = at(p, "shrink", 0.8), tNo = at(p, "no", 1.4), tGrow = at(p, "growth", 2.0), tShop = at(p, "shopping", 2.8);
  const kPile = sp(tPile, 8), kShrink = sp(tShrink, 13), kNo = sp(tNo, 8), kGrow = sp(tGrow, 12), kShop = sp(tShop, 14);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 100, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.64, px = w * 0.5;
  const k = 0.6 - 0.25 * kShrink + 0.6 * kGrow;
  const bags = t < tShrink ? [] : Array.from({ length: 3 }, (_, i) => {
    const f = clamp((t - tShrink - i * 0.12) / 0.9);
    const x = px - f * w * 0.3, y = g - h * 0.24 - Math.sin(f * Math.PI) * h * 0.1 + f * h * 0.06;
    return f > 0 && f < 1 && <g key={i} transform={`translate(${x},${y}) scale(${1 - 0.3 * f})`}><Bag s={h * 0.07} t={t + i} /></g>;
  });
  const fig = (x: number, y: number, s: string | undefined, label: string | undefined, kk: number, color: string, dim = 1) => kk > 0 && s && (
    <g opacity={clamp(kk * 2) * dim} transform={`translate(${x},${y}) scale(${1.5 - 0.5 * kk})`}>
      <rect x={-w * 0.22} y={-min * 2.1} width={w * 0.44} height={min * 3.8} rx={22} fill="rgba(20,22,40,0.82)" stroke={color} strokeWidth={6} />
      <text y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(s, w * 0.4, 96)} fill={color} stroke={INK} strokeWidth={9} paintOrder="stroke">{s}</text>
      {label && <text y={min * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(label, w * 0.36)} fill="#fff" stroke={INK} strokeWidth={7} paintOrder="stroke">{label.toUpperCase()}</text>}
    </g>
  );
  const stamp = (P.stamp ?? "").toUpperCase();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.1 * kGrow})`, transformOrigin: "50% 60%" }}>
        <World kind="bank" tint="#2b2a50" w={w} h={h} t={t} seed="turn-bank-pile" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${px},${g}) scale(${1 + 0.06 * kPile * Math.abs(Math.sin((t - tPile) * 6)) * (t < tShrink ? 1 : 0)})`}><Pile s={h * 0.28} t={t} k={k} /></g>
          {kGrow > 0 && <g transform={`translate(${w * 0.8},${g})`} opacity={clamp(kGrow * 2)}><Vine s={h * 0.26} t={t} k={kGrow} /></g>}
          {bags}
          {fig(w * 0.26, h * 0.3, P.spend, P.spendLabel, kShrink, "#ff8a8a", 1 - 0.5 * kShop)}
          {fig(w * 0.72, h * 0.3, P.gain, P.gainLabel, kGrow, "#7cf0b2")}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {kNo > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.4, textAlign: "center", transform: `rotate(-10deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) * (1 - 0.6 * kGrow) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, 150), color: "#fff", background: "#d63031", padding: "4px 40px", border: "8px solid #fff", borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
