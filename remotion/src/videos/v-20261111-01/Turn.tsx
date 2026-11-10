/**
 * The turn: "{pay_years} years of steady work, just to match one of his."
 * An office at dusk, header YOUR SALARY with the yearly pay. Left: a tower of salary slips stacking up
 * far past the top of the frame, the years figure slamming in huge with OF YOUR WORK. Right: one cash
 * pile with a trophy, ONE YEAR / OF HIS. On "years" the figure slams; on "work" the slips keep piling
 * up fast; on "his" the single pile glows and grows while the camera pushes in.
 *
 * params: { header, pay, years, yearsLabel, one, oneLabel }, events: years, work, his
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Slip = props.payslip!, Pile = props.cashpile!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; pay?: string; years?: string; yearsLabel?: string; one?: string; oneLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tYears = at(p, "years", 0.6), tWork = at(p, "work", 1.4), tHis = at(p, "his", 2.6);
  const kYears = sp(tYears, 8), kHis = sp(tHis, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const colW = (box.x1 - box.x0) * 0.47;
  const header = `${(P.header ?? "").toUpperCase()} ${P.pay ?? ""}`.trim();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 100, { upper: true }));
  const lab = (s: string, b = 52) => Math.max(min, fitLine(s.toUpperCase(), b, colW, { upper: true }));
  const g = h * 0.64, lx = w * 0.28, rx = w * 0.74;
  const n = Math.floor(clamp(t / 0.6) * 4 + clamp((t - tWork) / 1.2) * 18);
  const slips = Array.from({ length: n }, (_, i) => (
    <g key={i} transform={`translate(${lx + Math.sin(i * 1.9) * w * 0.02},${g - i * h * 0.045}) rotate(${Math.sin(i * 2.3) * 6})`}><Slip s={h * 0.07} t={0} /></g>
  ));
  const label = (top: string, bottom: string, x: number, k: number, bg: string, y: number) => (
    <div style={{ position: "absolute", left: x - colW / 2, width: colW, top: y, textAlign: "center", background: "rgba(20,24,40,0.55)", borderRadius: 18, padding: "8px 0", opacity: clamp(k * 2), transform: `scale(${1.5 - 0.5 * k})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(top.toUpperCase(), 96, colW, { upper: true })), color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{top.toUpperCase()}</div>
      <span style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: lab(bottom), color: INK, background: bg, padding: "4px 16px", borderRadius: 12, border: `4px solid ${INK}` }}>{bottom.toUpperCase()}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.07 * kHis})`, transformOrigin: "70% 58%" }}>
        <World kind="office" tint="#3a2e6e" w={w} h={h} t={t} seed="turn-ronaldo-office" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {slips}
          <ellipse cx={rx} cy={g - h * 0.1} rx={w * 0.2} ry={h * 0.1} fill="#ffd27a" opacity={0.06 + 0.2 * kHis} />
          <g transform={`translate(${rx},${g}) scale(${0.9 + 0.2 * kHis})`}><Pile s={h * 0.2} t={t} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#7cc7f0", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.years && label(P.years, P.yearsLabel ?? "", lx, kYears, "#ffd84a", h * 0.17)}
      {P.one && label(P.one, P.oneLabel ?? "", rx, kHis, "#8fd19e", h * 0.3)}
    </AbsoluteFill>
  );
};

export default Turn;
