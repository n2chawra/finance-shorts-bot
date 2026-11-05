/**
 * Hook (a question): "You think spending {spend_amount} a day would empty a billionaire? It wouldn't. Here's why."
 * A night skyline, Sharma (the billionaire) on the right, smirking; a tall money pile in the middle.
 * Frame 0 reads SPEND IT ALL? over the pile. On "spending" shopping bags fly off the pile and the daily
 * figure pops with EVERY DAY; on "empty" the pile sinks; on "wouldn't" a red IT WOULDN'T stamp slams
 * and the pile springs back taller; on "why" a gold crown drops onto the pile.
 *
 * params: { line, spend, spendLabel, cross }, events: think, spending, day, empty, wouldnt, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Pile = props.megapile!, Bag = props.shopbag!, Crown = props.dollarcrown!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; spend?: string; spendLabel?: string; cross?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tSpend = at(p, "spending", 0.6), tEmpty = at(p, "empty", 1.8), tNo = at(p, "wouldnt", 3.0), tWhy = at(p, "why", 3.8);
  const kSpend = sp(tSpend, 12), kEmpty = sp(tEmpty, 14), kNo = sp(tNo, 8), kWhy = sp(tWhy, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 150, box.x1 - box.x0 - 60, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.8, { upper: true }));
  const lab = (s: string, max: number, base = 54) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, px = w * 0.42;
  const k = 0.75 - 0.3 * kEmpty + 0.5 * kNo;
  const bags = t < tSpend ? [] : Array.from({ length: 4 }, (_, i) => {
    const f = ((t - tSpend) * 0.7 + i / 4) % 1;
    const dir = i % 2 ? 1 : -1;
    const x = px + dir * f * w * 0.3, y = g - h * 0.16 - Math.sin(f * Math.PI) * h * 0.05 + f * h * 0.08;
    return <g key={i} transform={`translate(${x},${y}) scale(${1 - 0.3 * f})`} opacity={clamp((1 - f) * 4) * (t < tNo ? 1 : 0.4)}><Bag s={h * 0.07} t={t + i} /></g>;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.02 * t + 0.03 * kNo})`, transformOrigin: "45% 55%" }}>
        <World kind="city" tint="#2a1f5e" w={w} h={h} t={t} seed="hook-city-billion" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={px} cy={g - h * 0.1} rx={w * 0.3} ry={h * 0.14} fill="#ffe27a" opacity={0.12 + 0.05 * Math.sin(t * 3)} />
          <g transform={`translate(${px},${g})`}><Pile s={h * 0.3} t={t} k={k} /></g>
          {kWhy > 0 && <g transform={`translate(${px},${g - h * 0.3 * 0.09 * Math.round(3 + 7 * k) - (1 - kWhy) * h * 0.3})`} opacity={clamp(kWhy * 2)}><Crown s={h * 0.08} t={t} /></g>}
          {bags}
          {kSpend > 0 && P.spend && (
            <text x={w * 0.24} y={g - h * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.spend, w * 0.36, 80)} fill="#ffd84a" stroke={INK} strokeWidth={9}
              paintOrder="stroke" opacity={clamp(kSpend * 2)}>{P.spend}</text>
          )}
          {kSpend > 0 && P.spendLabel && (
            <text x={w * 0.24} y={g - h * 0.16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.spendLabel, w * 0.34)} fill="#fff" stroke={INK} strokeWidth={7}
              paintOrder="stroke" opacity={clamp(kSpend * 2)}>{P.spendLabel.toUpperCase()}</text>
          )}
          <Actor p={p} spec={{ who: "sharma", x: 0.78, scale: 0.9, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "wouldnt", pose: "thumbsUp", expression: "proud" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, opacity: 1 - 0.45 * kNo, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.18, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
