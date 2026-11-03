/**
 * Hook (a myth): "You think money builds any city? Not this one. Here's why."
 * A desert at golden hour, Rohan on the left pointing. Frame 0 reads ANY CITY? over a pile of gold
 * bars and a short glass wall. On "money" the gold pile pops and coins fly towards the wall; on
 * "city" the mirrored line city stretches out across the whole desert; on "Not" a red cross slams
 * over it and it snaps back to a stub while the tape measure rewinds; on "why" an hourglass rises
 * out of the sand with a pulse.
 *
 * params: { line }, events: money, city, not, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const City = props.linecity!, Gold = props.goldpile!, Glass = props.hourglass!, Tape = props.tape!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tMoney = at(p, "money", 0.6), tCity = at(p, "city", 1.2), tNot = at(p, "not", 1.9), tWhy = at(p, "why", 3.0);
  const kMoney = sp(tMoney, 8), kCity = sp(tCity, 14), kNot = sp(tNot, 8), kWhy = sp(tWhy, 10);
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 150, box.x1 - box.x0 - 40, { upper: true }));
  const g = h * 0.62;
  const reach = clamp(0.15 + 0.85 * kCity - 0.8 * kNot, 0.08, 1);
  const cityX = w * 0.62;
  const coins = t < tMoney || t > tNot + 0.3 ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tMoney) * 1.3 + i / 6) % 1;
    const x0 = w * 0.47, x1 = cityX;
    return <circle key={i} cx={x0 + (x1 - x0) * f} cy={g - h * 0.12 - Math.sin(f * Math.PI) * h * 0.1} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.025 * t})`, transformOrigin: "55% 60%" }}>
        <World kind="desert" tint="#f08c3a" w={w} h={h} t={t} seed="hook-desert-line" props={props} horizon={[{ prop: "camel", x: 0.88, size: 0.05 }, { prop: "crane", x: 0.12, size: 0.07 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${cityX},${g})`}><City s={h * 0.42} t={t} k={reach} /></g>
          <g transform={`translate(${w * 0.56},${g + h * 0.14})`}><Tape s={h * 0.12} t={t} k={clamp(kCity - kNot, 0.05, 1)} /></g>
          <g transform={`translate(${w * 0.47},${g + h * 0.1}) scale(${0.9 + 0.15 * kMoney})`}><Gold s={h * 0.24} t={t} /></g>
          {coins}
          {kNot > 0 && (
            <g transform={`translate(${cityX},${g - h * 0.1}) scale(${2 - kNot})`} opacity={clamp(kNot * 2) * (1 - clamp((t - tWhy) / 0.4))}>
              <line x1={-h * 0.1} y1={-h * 0.1} x2={h * 0.1} y2={h * 0.1} stroke="#e5484d" strokeWidth={22} strokeLinecap="round" />
              <line x1={h * 0.1} y1={-h * 0.1} x2={-h * 0.1} y2={h * 0.1} stroke="#e5484d" strokeWidth={22} strokeLinecap="round" />
            </g>
          )}
          {kWhy > 0 && (
            <g transform={`translate(${w * 0.8},${g + h * 0.08 + (1 - kWhy) * h * 0.2})`}>
              <Glass s={h * 0.18} t={t} />
              <circle cx={0} cy={-h * 0.09} r={h * 0.16 * kWhy} fill="none" stroke="#ffd84a" strokeWidth={6} opacity={0.6 * (1 - clamp((t - tWhy) / 1.2))} />
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.15, scale: 0.95, acting: [{ sec: 0, pose: "point", expression: "confused" }, { at: "not", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.78} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
