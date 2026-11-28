// Thumbnail A (the topic's hit: the ride itself huge against the sky, caution tape across): the Fire Ball at the
// top of its swing in the evening sky, one gondola tearing off a red arm, bold words top-left.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

/** The ride drawn flat for the thumbnails: the yellow A-frame, the orange boom swung out, the wheel of six red arms
 * with gondolas, arm 0 red-hot and its gondola breaking away (`broken`). Coordinates in a 1280×720 frame. */
export const RideArt: React.FC<{ w: number; h: number; px: number; py: number; s: number; swing: number; broken?: boolean; sky?: boolean }> = ({ w, h, px, py, s, swing, broken = true, sky = true }) => {
  const L = 330 * s, R = 120 * s;
  const hx = px + Math.sin(swing) * L, hy = py + Math.cos(swing) * L;
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      {sky && (
        <>
          <defs><linearGradient id="th-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f6aa8" /><stop offset="0.7" stopColor="#f2b27a" /><stop offset="1" stopColor="#f6d2a0" /></linearGradient></defs>
          <rect width={w} height={h} fill="url(#th-sky)" />
          <rect y={h * 0.86} width={w} height={h * 0.14} fill="#2b2a2e" />
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 96} y={h * 0.8} width={80} height={h * 0.06} fill={["#d62828", "#1f6fd1", "#2a9d8f", "#f4a261"][i % 4]} />)}
        </>
      )}
      <path d={`M ${px - 230 * s} ${h * 0.86} L ${px} ${py} L ${px + 230 * s} ${h * 0.86}`} fill="none" stroke="#f2b51c" strokeWidth={30 * s} strokeLinejoin="round" />
      <line x1={px} y1={py} x2={hx} y2={hy} stroke="#ef6a1d" strokeWidth={40 * s} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = swing + (i / 6) * Math.PI * 2 + 0.3;
        const ex = hx + Math.cos(a) * R, ey = hy + Math.sin(a) * R * 0.45;
        const bad = i === 0;
        const off = bad && broken ? 1 : 0;
        return (
          <g key={i}>
            <line x1={hx} y1={hy} x2={ex} y2={ey} stroke={bad ? "#ff2a1a" : "#c9281c"} strokeWidth={20 * s} strokeLinecap="round" />
            <g transform={`translate(${ex + off * 120 * s} ${ey + off * 70 * s}) rotate(${off * 28})`}>
              <rect x={-50 * s} y={-18 * s} width={100 * s} height={40 * s} rx={8 * s} fill={i % 2 ? "#e08a1c" : "#d4321f"} stroke="#1b1d22" strokeWidth={5 * s} />
            </g>
            {bad && broken && <circle cx={ex} cy={ey} r={22 * s} fill="#ffb23e" opacity={0.9} />}
          </g>
        );
      })}
      <circle cx={hx} cy={hy} r={34 * s} fill="#40454d" />
      <circle cx={px} cy={py} r={20 * s} fill="#7d848c" />
    </svg>
  );
};

export default function Thumb({ th, w, h }: ThumbProps) {
  const px = w * 0.56, py = h * 0.07, s = 1.05, sw = 0.75;
  const L = 330 * s;
  const hx = px + Math.sin(sw) * L, hy = py + Math.cos(sw) * L;
  const a = sw + 0.3;
  return (
    <AbsoluteFill>
      <RideArt w={w} h={h} px={px} py={py} s={s} swing={sw} />
      <Ring x={hx + Math.cos(a) * 126 + 60} y={hy + Math.sin(a) * 57 + 36} rx={120} ry={86} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.03} y={h * 0.05} width={w * 0.5} size={130} align="left" />
    </AbsoluteFill>
  );
}
