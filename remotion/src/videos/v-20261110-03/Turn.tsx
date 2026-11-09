/**
 * The turn: "At {life_per_year} a year, earning it takes {life_years} years."
 * A dusk office, header ONE SALARY from frame 0. A salary slip on the left with the yearly pay over
 * A YEAR; an hourglass on the right. On "year" the slip hops and drops a note into the hourglass;
 * on "earning" the hourglass flips and the sand pours fast while a year counter strip of calendar
 * pages flies past behind it; on "takes" the number of years slams in huge with YEARS TO EARN IT.
 *
 * params: { header, salary, salaryLabel, years, yearsLabel }, events: year, earning, takes
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Slip = props.salaryslip!, Glass = props.hourglass!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; salary?: string; salaryLabel?: string; years?: string; yearsLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tYear = at(p, "year", 1.2), tEarn = at(p, "earning", 1.8), tTakes = at(p, "takes", 2.6);
  const kYear = sp(tYear, 8), kEarn = sp(tEarn, 10), kTakes = sp(tTakes, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, box.x1 - box.x0 - 100, { upper: true }));
  const lab = (s: string, max: number, b = 52) => Math.max(min, fitLine(s.toUpperCase(), b, max, { upper: true }));
  const g = h * 0.62, sx = w * 0.27, gx = w * 0.72;
  const hop = kYear * Math.abs(Math.sin((t - tYear) * 6)) * (t < tYear + 0.6 ? 1 : 0);
  const pages = t < tEarn ? [] : Array.from({ length: 8 }, (_, i) => {
    const f = ((t - tEarn) * 1.6 + i / 8) % 1;
    const x = w * 1.05 - f * w * 1.1, y = h * 0.42 + Math.sin(i * 1.7) * h * 0.04;
    return <g key={i} transform={`translate(${x},${y}) rotate(${-10 + i * 3})`} opacity={0.55}>
      <rect x={-h * 0.03} y={-h * 0.035} width={h * 0.06} height={h * 0.07} rx={4} fill="#fff" stroke={INK} strokeWidth={3} />
      <rect x={-h * 0.03} y={-h * 0.035} width={h * 0.06} height={h * 0.018} fill="#e5484d" />
    </g>;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.06 * kTakes})`, transformOrigin: "60% 55%" }}>
        <World kind="office" tint="#2e3a6e" w={w} h={h} t={t} seed="turn-split-office" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {pages}
          <g transform={`translate(${sx},${g - hop * h * 0.02})`}><Slip s={h * 0.2} t={t} /></g>
          <g transform={`translate(${gx},${g}) rotate(${180 * clamp((t - tEarn) * 2)} 0 ${-h * 0.11})`}><Glass s={h * 0.22} t={t * (t > tEarn ? 4 : 1)} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#7cf0b2", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.salary && (
        <div style={{ position: "absolute", left: box.x0, width: w * 0.5 - box.x0, top: h * 0.17, textAlign: "center", opacity: 1 - 0.5 * kTakes }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.salary, 80, w * 0.45)), color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.salary}</div>
          {P.salaryLabel && <div style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: lab(P.salaryLabel, w * 0.4), color: "#1d2433", background: "#fff", padding: "4px 18px", borderRadius: 12 }}>{P.salaryLabel.toUpperCase()}</div>}
        </div>
      )}
      {kTakes > 0 && P.years && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.26, textAlign: "center", opacity: clamp(kTakes * 2), transform: `scale(${1.6 - 0.6 * kTakes})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.years, 190, w * 0.7)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.years}</div>
          {P.yearsLabel && <div style={{ display: "inline-block", marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: lab(P.yearsLabel, (box.x1 - box.x0) * 0.8, 60), color: "#1d2433", background: "#ffd84a", padding: "4px 24px", borderRadius: 14, border: `5px solid ${INK}` }}>{P.yearsLabel.toUpperCase()}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
