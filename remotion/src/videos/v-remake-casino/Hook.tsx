/**
 * Hook (a curiosity gap, 2026-10-30): "Casinos make money even on the nights you win. Here's how."
 * Rohan wins at the roulette table: chips pour onto his pile and he celebrates. On "money" the
 * picture contradicts him: a stream of chips slips from his pile back into the casino behind. On
 * "how" a big question mark lands over the casino. The answer (the edge) is not shown: it is the payoff.
 *
 * events: win, money, how
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Wheel = props.wheel!, Chips = props.chips!, Casino = props.casino!, Slots = props.slots!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.9 } }));
  const tWin = at(p, "win", 1.2), tMoney = at(p, "money", 0.6), tHow = at(p, "how", 2.8);
  const pile = 1 + 0.5 * clamp((t - 0) / 1.0) - 0.25 * clamp((t - tMoney) / 1.6);
  const kQ = sp(tHow, 9);
  const Pent = SETS.penthouse!;
  const push = 1.04 + 0.02 * t;
  // chips slipping from Rohan's pile (left) to the casino door (right), one after another
  const from: [number, number] = [w * 0.36, h * 0.7], to: [number, number] = [w * 0.74, h * 0.5];
  const stream = Array.from({ length: 9 }, (_, i) => {
    const f = (t - tMoney - i * 0.18) / 1.1;
    if (f <= 0 || f >= 1) return null;
    const x = from[0] + (to[0] - from[0]) * f, y = from[1] + (to[1] - from[1]) * f - Math.sin(f * Math.PI) * h * 0.06;
    return <g key={i} transform={`translate(${x},${y}) scale(${1 - 0.4 * f})`} opacity={clamp((1 - f) * 3)}><Chips s={h * 0.035} t={t} /></g>;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 65%, rgba(255,210,80,0.22), rgba(20,0,40,0.5) 70%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.76},${h * 0.56})`}><Casino s={h * 0.2} t={t} /></g>
          <g transform={`translate(${w * 0.92},${h * 0.66})`}><Slots s={h * 0.1} t={t} /></g>
          {/* the green table, the wheel spinning, Rohan's pile growing then leaking */}
          <path d={`M${-w * 0.05},${h * 0.7} L${w * 0.7},${h * 0.68} L${w * 0.74},${h * 0.84} L${-w * 0.05},${h * 0.86} Z`} fill="#0f7a4a" stroke="#1d2433" strokeWidth={8} />
          <g transform={`translate(${w * 0.56},${h * 0.8})`}><Wheel s={h * 0.13} t={t} k={0.6} /></g>
          <g transform={`translate(${from[0]},${h * 0.8}) scale(${pile})`}><Chips s={h * 0.09} t={t} /></g>
          {stream}
          <Actor p={p} spec={{ who: "rohan", x: 0.22, scale: 1.2, acting: [{ sec: 0, pose: "celebrate", expression: "laugh" }, { at: "how", pose: "shrug", expression: "confused" }] }}
            ground={h * 1.02} index={0} />
          {/* the question over the casino */}
          {kQ > 0 && <g transform={`translate(${w * 0.76},${h * 0.3}) scale(${kQ}) rotate(${(1 - kQ) * -20})`}>
            <circle r={h * 0.075} fill="#ffd84a" stroke="#1d2433" strokeWidth={10} />
            <text y={h * 0.042} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.11} fill="#1d2433">?</text>
          </g>}
        </svg>
      </AbsoluteFill>
      {/* the win, in lights, until the money starts leaving */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", opacity: 1 - clamp((t - tMoney - 0.6) / 0.6) * 0.65 }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 130, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
          transform: `scale(${0.8 + 0.2 * sp(tWin < tMoney ? tWin : 0, 8)}) rotate(-4deg)`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>YOU WIN!</span>
      </div>
    </AbsoluteFill>
  );
};

export default Hook;
