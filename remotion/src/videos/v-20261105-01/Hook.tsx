/**
 * Hook (a question): "You think the rich blow their bonus? They don't. Watch what they buy."
 * A city at night, Rohan on the left, happy. Frame 0 reads SAVE THEIR BONUS? over a fat bonus
 * envelope in the middle. On "bonus" the envelope hops; on "spend" its flap opens and notes fly out
 * both ways: left to a new TV (NEW TV), right to a mystery gift box (RICH BUY?); on "what" a gold ring
 * pulses round the box.
 *
 * params: { line, tvLabel, boxLabel }, events: think, save, bonus, spend, what
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Env = props.bonusenv!, Tv = props.flattv!, Box = props.mysterybox!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; tvLabel?: string; boxLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tBonus = at(p, "bonus", 1.0), tSpend = at(p, "spend", 1.8), tWhat = at(p, "what", 3.0);
  const kBonus = sp(tBonus, 8), kSpend = sp(tSpend, 12), kWhat = sp(tWhat, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 150, box.x1 - box.x0 - 40, { upper: true }));
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 52, max, { upper: true }));
  const g = h * 0.6, ex = w * 0.6, tvx = w * 0.42, bx = w * 0.8;
  const notes = (to: number, dir: number) => (t < tSpend ? [] : Array.from({ length: 4 }, (_, i) => {
    const f = ((t - tSpend) * 0.9 + i / 4) % 1;
    const x = ex + (to - ex) * f, y = g - h * 0.12 - Math.sin(f * Math.PI) * h * 0.12;
    return <rect key={`${dir}-${i}`} x={x - h * 0.025} y={y - h * 0.013} width={h * 0.05} height={h * 0.026} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${dir * f * 200} ${x} ${y})`} opacity={clamp((1 - f) * 5) * clamp(kSpend * 2)} />;
  }));
  const label = (x: number, text: string | undefined, k: number, color = "#fff") => text && k > 0 && (
    <text x={x} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(text, w * 0.28)} fill={color} stroke={INK} strokeWidth={7}
      paintOrder="stroke" opacity={clamp(k * 2)}>{text.toUpperCase()}</text>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.02 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="city" tint="#3a2a6e" w={w} h={h} t={t} seed="hook-city-bonus" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${tvx - (1 - kSpend) * w * 0.5},${g})`} opacity={clamp(kSpend * 2)}><Tv s={h * 0.15} t={t} /></g>
          <g transform={`translate(${bx + (1 - kSpend) * w * 0.4},${g})`} opacity={clamp(kSpend * 2)}><Box s={h * 0.15} t={t} /></g>
          {kWhat > 0 && <circle cx={bx} cy={g - h * 0.08} r={h * 0.13 * (0.6 + 0.4 * kWhat)} fill="none" stroke="#ffd84a" strokeWidth={9}
            opacity={0.8 * (1 - clamp((t - tWhat) / 1.4))} />}
          {notes(tvx, -1)}
          {notes(bx, 1)}
          <g transform={`translate(${ex},${g - h * 0.02}) scale(${(1 + 0.12 * kBonus * Math.abs(Math.sin((t - tBonus) * 6)) * (t < tSpend ? 1 : 0)) * (1 - 0.25 * kSpend)})`}>
            <Env s={h * 0.24} t={t} state={kSpend > 0.4 ? "open" : undefined} />
          </g>
          {label(tvx, P.tvLabel, kSpend)}
          {label(bx, P.boxLabel, kWhat, "#ffd84a")}
          <Actor p={p} spec={{ who: "rohan", x: 0.14, scale: 0.9, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "spend", pose: "shrug", expression: "confused" }] }}
            ground={h * 0.8} index={0} />
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
