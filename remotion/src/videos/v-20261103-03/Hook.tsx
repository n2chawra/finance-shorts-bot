/**
 * Hook (a shock number): "You think Zuckerberg lives on his salary? Here's why he can't."
 * A penthouse at night, Rohan on the left shrugging. Frame 0 reads LIVES ON HIS SALARY? over a pay
 * slip. On "Zuckerberg" the slip pops; on "salary" its figure slams on in green; on "why" a tower of
 * shares shoots up behind it, dwarfing the slip; on "can't" the slip shrinks and a coffee cup beside
 * it looks bigger than the pay. The line fades before the cover frame.
 *
 * params: { line, slip, slipLabel }, events: zuckerberg, salary, why, cant
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Slip = props.payslip!, Tower = props.sharetower!, Cup = props.coffeecup!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; slip?: string; slipLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tZ = at(p, "zuckerberg", 0.5), tSal = at(p, "salary", 1.4), tWhy = at(p, "why", 2.4), tCant = at(p, "cant", 3.0);
  const kZ = sp(tZ, 8), kSal = sp(tSal, 8), kTower = sp(tWhy, 14), kCant = sp(tCant, 10);
  const Pent = SETS.penthouse!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 120, box.x1 - box.x0 - 40, { upper: true }));
  const slip = P.slip ?? "";
  const slipSize = Math.max(min, fitLine(slip, 120, w * 0.3));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 50, w * 0.4, { upper: true }));
  const g = h * 0.7, sx = w * 0.6;
  const slipScale = (0.9 + 0.12 * kZ) * (1 - 0.35 * kCant);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.02 * t})`, transformOrigin: "55% 55%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(80,200,160,0.2), rgba(0,20,20,0.55) 75%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kTower > 0 && <g transform={`translate(${w * 0.82},${g}) scale(${kTower})`}><Tower s={h * 0.42} t={t} k={1} /></g>}
          <g transform={`translate(${sx},${g}) scale(${slipScale})`}><Slip s={h * 0.34} t={t} /></g>
          <g transform={`translate(${w * 0.4},${g}) scale(${0.8 + 0.3 * kCant})`}><Cup s={h * 0.1} t={t} /></g>
          {kSal > 0 && slip && (
            <g transform={`translate(${sx},${g - h * 0.34 * slipScale * 0.55}) scale(${(2 - kSal) * slipScale})`} opacity={clamp(kSal * 2)}>
              <text textAnchor="middle" y={slipSize * 0.35} fontFamily={FONT} fontWeight={900} fontSize={slipSize} fill="#1f8f55" stroke="#fff" strokeWidth={10} paintOrder="stroke">{slip}</text>
              {P.slipLabel && <text textAnchor="middle" y={slipSize * 0.35 + min * 1.3} fontFamily={FONT} fontWeight={900} fontSize={lab(P.slipLabel)} fill={INK} stroke="#fff" strokeWidth={6} paintOrder="stroke">{P.slipLabel.toUpperCase()}</text>}
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.1, acting: [{ sec: 0, pose: "shrug", expression: "confused" }, { at: "why", pose: "facepalm", expression: "shock" }] }}
            ground={h * 0.74} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.09, textAlign: "center", opacity: 1 - clamp((t - tWhy - 0.2) / 0.25) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg)`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
