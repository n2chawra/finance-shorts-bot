// Thumbnail B (the hits' quote pattern, 1.85M: a short phrase over the moment, a red ring): our own picture of
// the last minute, the support ship's tracking screen with Titan's last text and NO SIGNAL under it, the depth
// bar ending at the wreck. Not a copy of any hit's picture.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

export default function ThumbB({ th, w, h }: ThumbProps) {
  const sx = w * 0.42, sy = h * 0.14, sw = w * 0.54, sh = h * 0.8;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 50%, #123a5c 0%, #06131f 55%, #010409 100%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <rect x={sx} y={sy} width={sw} height={sh} rx={24} fill="#06131f" stroke="#9fd8ff" strokeWidth={8} />
        <rect x={sx + sw * 0.06} y={sy + sh * 0.1} width={sw * 0.1} height={sh * 0.8} rx={10} fill="#0d2a40" stroke="#3a6a9a" strokeWidth={4} />
        <rect x={sx + sw * 0.06} y={sy + sh * 0.1} width={sw * 0.1} height={sh * 0.7} rx={10} fill="#1f6fd1" opacity={0.6} />
        <circle cx={sx + sw * 0.11} cy={sy + sh * 0.8} r={sh * 0.045} fill="#6d747c" stroke="#fff" strokeWidth={4} />
        <rect x={sx + sw * 0.22} y={sy + sh * 0.18} width={sw * 0.72} height={sh * 0.2} rx={12} fill="#12324d" stroke="#ffd27a" strokeWidth={6} />
        <text x={sx + sw * 0.25} y={sy + sh * 0.32} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={h * 0.048} fill="#ffffff">DROPPED TWO WEIGHTS</text>
        <rect x={sx + sw * 0.22} y={sy + sh * 0.46} width={sw * 0.72} height={sh * 0.2} rx={12} fill="#1a2733" stroke="#ff2d2d" strokeWidth={6} />
        <rect x={sx + sw * 0.26} y={sy + sh * 0.5} width={sw * 0.03} height={sh * 0.12} fill="#ff2d2d" />
        <text x={sx + sw * 0.25} y={sy + sh * 0.86} fontFamily="Anton, Poppins, sans-serif" fontSize={h * 0.12} fill="#ff2d2d">NO SIGNAL</text>
      </svg>
      <Ring x={sx + sw * 0.58} y={sy + sh * 0.28} rx={sw * 0.42} ry={sh * 0.16} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.03} y={h * 0.2} width={w * 0.38} size={150} align="left" />
    </AbsoluteFill>
  );
}
