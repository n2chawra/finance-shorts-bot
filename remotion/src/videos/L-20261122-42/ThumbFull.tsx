// Thumbnail A (owner, 2026-11-23: new title and three new thumbnails): the control room's screen reads a calm
// green NORMAL while the tower beside it is full to the brim in red and spilling from the top. The pattern of the
// CSB's lit process diagrams (0.67M, 0.55M): one picture that tells the moment, one label.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

export default function ThumbFull({ th, w, h }: ThumbProps) {
  // the screen, lower left
  const sx = w * 0.05, sy = h * 0.5, sw = w * 0.4, sh = h * 0.42;
  // the tower, right: a tall column cut open (platforms, ladder, domed head), liquid to the very top
  const tx = w * 0.66, ty = h * 0.1, tw = w * 0.15, tH = h * 0.86;
  const platforms = [0.22, 0.42, 0.62, 0.82];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 75% 35%, #3a1410 0%, #120607 45%, #050304 100%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {/* the overhead pipe off the top, carrying liquid away */}
        <path d={`M ${tx + tw / 2} ${ty} L ${tx + tw / 2} ${ty - h * 0.06} L ${tx + tw * 1.55} ${ty - h * 0.06} L ${tx + tw * 1.55} ${h * 0.95}`}
          stroke="#2b3038" strokeWidth={30} fill="none" strokeLinejoin="round" />
        <path d={`M ${tx + tw / 2} ${ty} L ${tx + tw / 2} ${ty - h * 0.06} L ${tx + tw * 1.55} ${ty - h * 0.06} L ${tx + tw * 1.55} ${h * 0.95}`}
          stroke="#ff3b2f" strokeWidth={16} fill="none" strokeLinejoin="round" />
        {/* shell */}
        <rect x={tx + 16} y={ty + 16} width={tw} height={tH} rx={tw / 2} fill="#000" opacity={0.45} />
        <rect x={tx} y={ty} width={tw} height={tH} rx={tw / 2} fill="#2b3038" stroke="#0a0a0a" strokeWidth={9} />
        {/* the cut: liquid to the brim */}
        <clipPath id="vessel"><rect x={tx + 14} y={ty + 14} width={tw - 28} height={tH - 28} rx={(tw - 28) / 2} /></clipPath>
        <g clipPath="url(#vessel)">
          <rect x={tx} y={ty} width={tw} height={tH} fill="#ff3b2f" />
          <rect x={tx + tw * 0.6} y={ty} width={tw * 0.12} height={tH} fill="#ff8a6e" opacity={0.5} />
          {platforms.map((p, i) => <rect key={i} x={tx} y={ty + tH * p} width={tw} height={5} fill="#a81d14" opacity={0.6} />)}
        </g>
        {/* platforms and the ladder outside */}
        {platforms.map((p, i) => (
          <g key={i}>
            <rect x={tx - tw * 0.22} y={ty + tH * p} width={tw * 1.44} height={10} fill="#c8ccd2" stroke="#0a0a0a" strokeWidth={4} />
            <path d={`M ${tx - tw * 0.22} ${ty + tH * p} l 0 -${h * 0.04} M ${tx + tw * 1.22} ${ty + tH * p} l 0 -${h * 0.04}`} stroke="#c8ccd2" strokeWidth={5} />
          </g>
        ))}
        <path d={`M ${tx - tw * 0.12} ${ty + tH * 0.1} L ${tx - tw * 0.12} ${ty + tH}`} stroke="#c8ccd2" strokeWidth={6} />
        <path d={`M ${tx - tw * 0.2} ${ty + tH * 0.1} L ${tx - tw * 0.2} ${ty + tH}`} stroke="#c8ccd2" strokeWidth={6} />
        {/* the board's screen: a calm green NORMAL and an almost empty level bar */}
        <rect x={sx + 14} y={sy + 14} width={sw} height={sh} rx={26} fill="#000" opacity={0.5} />
        <rect x={sx} y={sy} width={sw} height={sh} rx={26} fill="#0a1410" stroke="#39ff9a" strokeWidth={9} />
        <rect x={sx + sw * 0.08} y={sy + sh * 0.18} width={sw * 0.16} height={sh * 0.66} rx={10} fill="#0f2a1e" stroke="#39ff9a" strokeWidth={5} />
        <rect x={sx + sw * 0.08 + 7} y={sy + sh * 0.84 - sh * 0.11} width={sw * 0.16 - 14} height={sh * 0.11 - 7} rx={6} fill="#39ff9a" />
        <text x={sx + sw * 0.62} y={sy + sh * 0.63} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={h * 0.13}
          fill="#39ff9a" style={{ letterSpacing: 2 }}>NORMAL</text>
      </svg>
      <Ring x={sx + sw * 0.62} y={sy + sh * 0.52} rx={sw * 0.36} ry={sh * 0.3} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.06} width={w * 0.5} size={150} align="left" />
    </AbsoluteFill>
  );
}
