// Gauge (flat, the cross-section recipe): the splitter tower drawn as an engineer's elevation on white paper,
// liquid shaded up to its real level. The level gauge sits at the base; on "reads" a blue bracket draws on over
// the short span it could measure, on "bottom" the camera pushes in on it and its height in feet is pinned to
// the bracket; everything above is hatched red, NOT MEASURED. Figures from params.fig (span, actual, tower).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { ArrowSvg, BLUE, figOf, moments, Paper, ramp, TypeText } from "./ui";

const X = 300, TW = 380, TOP = 250, BOT = 1250;      // the tower in the drawing
const FAIL = "#e0241b", INKC = "#111111";

const Gauge: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const fig = (n: string) => figOf(p, n);
  const tower = Number(fig("tower")) || 170, span = Number(fig("span")) || 9, actual = Number(fig("actual")) || 158;
  const fy = (ft: number) => BOT - (ft / tower) * (BOT - TOP);
  const draw = ramp(t, -6, 18), br = ramp(t, e("reads"), 12), hatch = ramp(t, e("gauge"), 14), pin = ramp(t, e("feet"), 10);
  const z = 1.04 + 0.04 * ramp(t, e("board"), 20) + 0.22 * ramp(t, e("bottom"), 18) + 0.02 * Math.sin(t / 14);
  const cy = 860 + 300 * ramp(t, e("bottom"), 18);
  const cx = 540 + 40 * ramp(t, e("bottom"), 18) + 18 * Math.sin(t / 17);
  const lvl = fy(actual);
  return (
    <Paper t={t} zoom={z} cx={cx} cy={cy}>
      {/* ground */}
      <line x1={80} y1={BOT} x2={1000} y2={BOT} stroke={INKC} strokeWidth={5} />
      {Array.from({ length: 22 }, (_, i) => <line key={i} x1={90 + i * 42} y1={BOT + 4} x2={70 + i * 42} y2={BOT + 30} stroke={INKC} strokeWidth={3} />)}
      {/* the liquid, up to its real level */}
      <rect x={X} y={lvl} width={TW} height={(BOT - lvl) * draw} fill="#ffd9a0" />
      <line x1={X} y1={lvl} x2={X + TW} y2={lvl} stroke="#d9861a" strokeWidth={4} strokeDasharray="14 8" opacity={draw} />
      {/* trays */}
      {Array.from({ length: 22 }, (_, i) => <line key={i} x1={X + 8} y1={TOP + 40 + i * 42} x2={X + TW - 8} y2={TOP + 40 + i * 42} stroke="rgba(17,17,17,0.35)" strokeWidth={2} />)}
      {/* the shell */}
      <rect x={X} y={TOP} width={TW} height={BOT - TOP} fill="none" stroke={INKC} strokeWidth={6} strokeDasharray={`${3000 * draw} 3000`} />
      <path d={`M ${X} ${TOP} Q ${X + TW / 2} ${TOP - 70} ${X + TW} ${TOP}`} fill="none" stroke={INKC} strokeWidth={6} />
      {/* the overhead pipe */}
      <path d={`M ${X + TW / 2} ${TOP - 52} L ${X + TW / 2} ${TOP - 90} L ${X + TW + 90} ${TOP - 90} L ${X + TW + 90} ${BOT - 120}`} fill="none" stroke={INKC} strokeWidth={5} />
      {/* NOT MEASURED: everything above the gauge's span */}
      {hatch > 0 && <g opacity={hatch}>
        <defs><pattern id="tc-hatch" width={26} height={26} patternUnits="userSpaceOnUse" patternTransform={`rotate(45) translate(${(t * 1.5) % 26} 0)`}><rect width={6} height={26} fill="rgba(224,36,27,0.5)" /></pattern></defs>
        <rect x={X} y={TOP} width={TW} height={fy(span) - TOP} fill="url(#tc-hatch)" />
      </g>}
      <TypeText x={X + TW / 2} y={700} t={t} at={e("gauge")} text="NOT" size={58} color={FAIL} anchor="middle" />
      <TypeText x={X + TW / 2} y={770} t={t} at={e("gauge") + 4} text="MEASURED" size={52} color={FAIL} anchor="middle" />
      {/* the level gauge at the base */}
      <rect x={X - 70} y={BOT - 60} width={56} height={44} fill={BLUE} stroke={INKC} strokeWidth={3} />
      <line x1={X - 14} y1={BOT - 50} x2={X} y2={BOT - 50} stroke={INKC} strokeWidth={3} />
      <line x1={X - 14} y1={fy(span)} x2={X} y2={fy(span)} stroke={INKC} strokeWidth={3} />
      {/* its span */}
      {br > 0 && <rect x={X - 4} y={fy(span)} width={TW + 8} height={(BOT - fy(span)) * br} fill="rgba(31,111,209,0.35)" stroke={BLUE} strokeWidth={5} />}
      <TypeText x={150} y={1180} t={t} at={e("board") - 2} text="GAUGE" size={46} color={BLUE} />
      <ArrowSvg x1={226} y1={1192} x2={X - 76} y2={BOT - 40} k={ramp(t, e("board"), 10)} color={BLUE} w={7} />
      {/* the span's height, pinned */}
      {pin > 0 && <g opacity={pin}>
        <line x1={X + TW + 30} y1={fy(span)} x2={X + TW + 30} y2={BOT} stroke={BLUE} strokeWidth={5} />
        <rect x={X + TW + 50} y={fy(span) - 40} width={220} height={78} rx={6} fill="#ffffff" stroke={BLUE} strokeWidth={4} />
        <text x={X + TW + 160} y={fy(span) + 18} fontFamily="Anton, Poppins, sans-serif" fontSize={60} fill={BLUE} textAnchor="middle">{countText(fig("span"), pin)} FT</text>
      </g>}
      {/* the tower's height (spoken in the beat before) */}
      <line x1={X - 40} y1={TOP} x2={X - 40} y2={BOT - 90} stroke={INKC} strokeWidth={3} opacity={draw} />
      <text x={X - 60} y={TOP + 260} fontFamily="Anton, Poppins, sans-serif" fontSize={56} fill={INKC} textAnchor="end" opacity={draw}>{fig("tower")} FT</text>
      <TypeText x={X + TW / 2} y={lvl + 70} t={t} at={4} text="REAL LEVEL" size={46} color="#8a4a06" anchor="middle" />
    </Paper>
  );
};
export default Gauge;
