/**
 * Hook (a question): "You think Elon Musk could just give his billions away? He can't. Here's why."
 * An office at night, Rohan on the left pointing. Frame 0 reads JUST GIVE IT AWAY? over a tall stack
 * of share certificates with an electric car and a gift box beside it. On "Musk" the stack pulses
 * and a ticker lights up; on "give" shares start sliding towards the gift box; on "gives" a tax
 * envelope slams in front of the gift box and the slide stalls; on "why" a gold ring pulses round the stack.
 *
 * params: { line }, events: musk, give, can't, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { PALETTE } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Stack = props.sharestack!, Gift = props.giftbox!, Car = props.evcar!, Tick = props.ticker!, Tax = props.taxenvelope!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tMusk = at(p, "musk", 0.6), tGive = at(p, "sell", 1.2), tCant = at(p, "cash", 1.8), tWhy = at(p, "catch", 2.6);
  const kMusk = sp(tMusk, 8), kGive = sp(tGive, 12), kCant = sp(tCant, 8), kWhy = sp(tWhy, 10);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 140, box.x1 - box.x0 - 40, { upper: true }));
  const g = h * 0.7, sx = w * 0.56, gx = w * 0.84;
  const slide = t < tGive ? [] : Array.from({ length: 4 }, (_, i) => {
    const run = t < tCant ? (t - tGive) : (tCant - tGive);
    const f = (run * 1.1 + i / 4) % 1;
    const stuck = kCant > 0;
    return <rect key={i} x={sx + (gx - sx) * f * (stuck ? 0.5 : 1) - h * 0.04} y={g - h * 0.3 + f * h * 0.12} width={h * 0.08} height={h * 0.03} rx={6} fill={PALETTE.cream} stroke={PALETTE.red} strokeWidth={4} opacity={stuck ? 0.5 : 1} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.02 * t})`, transformOrigin: "55% 60%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 55%, rgba(80,120,255,0.18), rgba(5,8,30,0.6) 75%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.78},${h * 0.42})`} opacity={0.4 + 0.6 * kMusk}><Tick s={h * 0.14} t={t} k={kMusk} /></g>
          <g transform={`translate(${sx},${g}) scale(${0.95 + 0.1 * kMusk * (1 - clamp((t - tMusk) / 0.6))})`}><Stack s={h * 0.36} t={t} state="tall" /></g>
          <g transform={`translate(${w * 0.3},${g + h * 0.06})`}><Car s={h * 0.13} t={t} /></g>
          {slide}
          <g transform={`translate(${gx},${g})`}>
            <Gift s={h * 0.13} t={t} k={1} />
            {kCant > 0 && <g opacity={clamp(kCant * 2)} transform={`translate(${-w * 0.14},${-h * 0.02}) scale(${2 - kCant})`}><Tax s={h * 0.1} t={t} /></g>}
          </g>
          {kWhy > 0 && <circle cx={sx} cy={g - h * 0.2} r={h * 0.24 * kWhy} fill="none" stroke="#ffd84a" strokeWidth={8} opacity={0.6 * (1 - clamp((t - tWhy) / 1.3))} />}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 0.95, acting: [{ sec: 0, pose: "point", expression: "confused" }, { at: "cash", pose: "shrug", expression: "shock" }] }}
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
