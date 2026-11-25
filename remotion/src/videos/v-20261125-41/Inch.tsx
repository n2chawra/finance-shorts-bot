// Inch (flat, the pressure on the hull, a general principle): the top of the hull's black carbon cross-section
// fills the lower frame under dark water ("depth"), water arrows close in ("sea"), the pressure gauge's needle
// swings and its readout counts up ("presses"), one square inch outlines in amber on the skin ("square") and a
// stack of arrows presses on it ("inch"); pull back: the whole hull ringed by arrows ("hull").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { AMBER, ANTON, figOf, GREEN, ICE, MONO, moments, ramp, RED, Screen, TypeText } from "./ui";

const HC = { x: 540, y: 1520 }, HR = 560;        // the hull's cross-section circle (its top arc crosses the frame)

const Arrow: React.FC<{ x: number; y: number; ang: number; len: number; k: number; color?: string; w?: number }> = ({ x, y, ang, len, k, color = ICE, w = 10 }) => {
  if (k <= 0) return null;
  const L = len * k;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`} opacity={Math.min(1, k * 2)}>
      <line x1={-L} y1={0} x2={-18} y2={0} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M 0 0 L -30 -18 L -30 18 Z`} fill={color} />
    </g>
  );
};

const Inch: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const psi = figOf(p, "psi");
  const sea = ramp(t, e("sea"), 20);
  const g = ramp(t, e("presses"), 26);
  const sq = ramp(t, e("square"), 10);
  const stack = ramp(t, e("inch"), 14);
  const ring = ramp(t, e("inch") + 24, 24);
  // camera: wide → close on the square → back out past wide to show the whole ring
  const zc = ramp(t, e("square"), 16) * (1 - ring);
  const zoom = 1 + 0.28 * zc - 0.3 * ring;
  const cx = 540, cy = 900 + 80 * zc + 520 * ring;
  const topY = HC.y - HR;
  return (
    <Screen t={t} zoom={zoom} cx={cx} cy={cy} tag="principle">
      {/* dark water */}
      <rect x={-800} y={-400} width={2680} height={3400} fill="#021019" opacity={0.6} />
      {/* the gauge */}
      <g transform="translate(330 560)">
        <circle r={190} fill="#03100a" stroke={GREEN} strokeWidth={8} />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={0} y1={-170} x2={0} y2={-140} stroke={i > 8 ? RED : ICE} strokeWidth={8} transform={`rotate(${-120 + i * 24})`} />)}
        <line x1={0} y1={0} x2={0} y2={-150} stroke={AMBER} strokeWidth={12} strokeLinecap="round" transform={`rotate(${-120 + 228 * g + 2 * Math.sin(t * 0.5) * g})`} />
        <circle r={18} fill={AMBER} />
      </g>
      <g opacity={g > 0 ? 1 : 0} transform={`translate(${740} ${560}) scale(${1 + 0.12 * Math.max(0, 1 - Math.abs(t - e("pounds") - 6) / 8)}) translate(${-740} ${-560})`}>
        <rect x={560} y={430} width={360} height={260} rx={12} fill="rgba(2,12,6,0.92)" stroke={AMBER} strokeWidth={4} />
        <text x={590} y={490} fontFamily={MONO} fontWeight={700} fontSize={44} fill={ICE}>POUNDS PER</text>
        <text x={590} y={540} fontFamily={MONO} fontWeight={700} fontSize={44} fill={ICE}>SQUARE INCH</text>
        <text x={590} y={650} fontFamily={ANTON} fontSize={96} fill={AMBER}>{g >= 0.999 ? psi : countText(psi, g)}</text>
      </g>
      {/* the hull: the carbon cross-section, a weave texture on its skin */}
      <circle cx={HC.x} cy={HC.y} r={HR} fill="#16191d" stroke={GREEN} strokeWidth={6} />
      <circle cx={HC.x} cy={HC.y} r={HR - 120} fill="#123222" stroke="#2a3a32" strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => <line key={`g${i}`} x1={HC.x - 440 + i * 80} y1={HC.y - 440} x2={HC.x - 440 + i * 80} y2={HC.y + 440} stroke="#1d4a33" strokeWidth={3} />)}
      <TypeText x={HC.x} y={HC.y - HR + 290} t={t} at={e("sea") + 10} text="INSIDE: SURFACE AIR" size={46} color={ICE} anchor="middle" />
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return <line key={i} x1={HC.x + Math.cos(a) * (HR - 110)} y1={HC.y + Math.sin(a) * (HR - 110)} x2={HC.x + Math.cos(a) * (HR - 8)} y2={HC.y + Math.sin(a) * (HR - 8)} stroke="#2b3036" strokeWidth={6} />;
      })}
      <TypeText x={HC.x} y={HC.y - HR + 200} t={t} at={e("depth")} text="TITAN'S HULL" size={56} color={GREEN} anchor="middle" />
      {/* the water pressing in from above (and, on "hull", from every side) */}
      {Array.from({ length: 5 }, (_, i) => <Arrow key={i} x={180 + i * 180} y={topY + 40 + Math.abs(i - 2) * 60} ang={90} len={150} k={sea * (0.9 + 0.1 * Math.sin(t * 0.3 + i)) * (1 + 0.4 * ramp(t, e("pounds"), 8))} />)}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <Arrow key={`r${i}`} x={HC.x + Math.cos(a) * (HR + 10)} y={HC.y + Math.sin(a) * (HR + 10)} ang={(a * 180) / Math.PI + 180} len={170} k={ring} color={AMBER} />;
      })}
      {/* one square inch on the skin */}
      {sq > 0 && <rect x={HC.x - 60} y={topY - 4} width={120} height={120} fill="rgba(255,176,0,0.18)" stroke={AMBER} strokeWidth={8} opacity={sq} />}
      {sq > 0 && <TypeText x={HC.x + 90} y={topY - 70} t={t} at={e("square")} text="ONE SQUARE INCH" size={50} color={AMBER} />}
      {Array.from({ length: 4 }, (_, i) => <Arrow key={`s${i}`} x={HC.x} y={topY - 14 - i * 70} ang={90} len={60} k={ramp(t, e("inch") + i * 4, 8)} color={RED} w={14} />)}
      {stack > 0 && <rect x={HC.x - 60} y={topY - 4} width={120} height={120} fill={RED} opacity={0.2 + 0.15 * Math.sin(t * 0.6)} />}
    </Screen>
  );
};

export default Inch;
