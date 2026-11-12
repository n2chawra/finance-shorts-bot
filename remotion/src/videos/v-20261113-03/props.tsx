/**
 * The things "Netflix spent $17.1 billion on shows and still kept $11 billion" is about, drawn for
 * this video only: a big flat TV playing a show, a popcorn bucket, a film reel, a member's red
 * subscription card, an advert billboard, a living-room sofa, a profit jar filling with coins (k), a
 * long yearly receipt, and a pile of new show posters.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const RED = "#e50914";

const props: PropSet = {
  // a wide flat TV on a stand, a show playing: a moving skyline and a progress bar
  tv: ({ s, t }) => {
    const W = s * 1.5, H = s * 0.85;
    const f = (t * 0.15) % 1;
    return (
      <g>
        <Shadow w={W * 0.6} s={s} />
        <rect x={-s * 0.05} y={-s * 0.14} width={s * 0.1} height={s * 0.12} fill={INK} />
        <rect x={-s * 0.3} y={-s * 0.04} width={s * 0.6} height={s * 0.04} rx={s * 0.02} fill={INK} />
        <rect x={-W / 2} y={-s * 0.14 - H} width={W} height={H} rx={s * 0.04} fill="#15171f" stroke={INK} strokeWidth={line(s)} />
        <rect x={-W / 2 + s * 0.04} y={-s * 0.1 - H} width={W - s * 0.08} height={H - s * 0.08} fill="#2a1b3d" />
        <circle cx={-W * 0.2 + f * W * 0.4} cy={-s * 0.14 - H * 0.7} r={s * 0.08} fill="#ffb347" opacity={0.9} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-W / 2 + s * 0.06 + i * W * 0.155} y={-s * 0.14 - H * (0.25 + (i % 3) * 0.1)} width={W * 0.12} height={H * (0.18 + (i % 3) * 0.1)} fill={shade("#5b3d8a", -0.1 * (i % 2))} />
        ))}
        <rect x={-W / 2 + s * 0.08} y={-s * 0.2} width={W - s * 0.16} height={s * 0.025} rx={s * 0.01} fill="#555" />
        <rect x={-W / 2 + s * 0.08} y={-s * 0.2} width={(W - s * 0.16) * (0.2 + f * 0.6)} height={s * 0.025} rx={s * 0.01} fill={RED} />
      </g>
    );
  },
  // a striped popcorn bucket overflowing
  popcorn: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      {[[-0.18, -0.82], [0, -0.9], [0.18, -0.82], [-0.08, -0.95], [0.1, -0.97], [-0.22, -0.72], [0.22, -0.72]].map(([x, y], i) => (
        <Ball key={i} cx={x! * s} cy={(y! + Math.sin(t * 3 + i) * 0.01) * s} rx={s * 0.09} fill="#fff3c4" s={s} />
      ))}
      <Shape d={`M${-s * 0.3},${-s * 0.75} L${s * 0.3},${-s * 0.75} L${s * 0.22},0 L${-s * 0.22},0 Z`} fill="#fff" s={s} />
      {[-0.17, 0, 0.17].map((x) => <path key={x} d={`M${(x - 0.04) * s},${-s * 0.75} L${(x * 0.75 - 0.03) * s},0 L${(x * 0.75 + 0.03) * s},0 L${(x + 0.04) * s},${-s * 0.75} Z`} fill={RED} />)}
    </g>
  ),
  // a film reel that spins, film strip trailing off it
  filmreel: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${s * 0.1},${-s * 0.1} Q${s * 0.4},${-s * 0.05} ${s * 0.5},${-s * 0.02}`} fill="none" stroke={INK} strokeWidth={s * 0.08} />
      <g transform={`translate(0,${-s * 0.5}) rotate(${t * 60})`}>
        <circle r={s * 0.45} fill="#9aa3b5" stroke={INK} strokeWidth={line(s)} />
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={Math.cos(i * 1.2566) * s * 0.25} cy={Math.sin(i * 1.2566) * s * 0.25} r={s * 0.1} fill="#2b3245" />)}
        <circle r={s * 0.07} fill={INK} />
      </g>
    </g>
  ),
  // a member's subscription card: red, a chip and a monthly tick
  subcard: ({ s, t }) => (
    <g transform={`rotate(${-6 + Math.sin(t * 1.5) * 2} 0 ${-s * 0.4})`}>
      <Shadow w={s * 0.9} s={s} />
      <rect x={-s * 0.5} y={-s * 0.7} width={s * 1.0} height={s * 0.62} rx={s * 0.06} fill={RED} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.18} height={s * 0.13} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={-s * 0.4} y={-s * 0.3} width={s * 0.6} height={s * 0.05} rx={s * 0.02} fill="#ffd0d3" />
      <rect x={-s * 0.4} y={-s * 0.2} width={s * 0.35} height={s * 0.05} rx={s * 0.02} fill="#ffd0d3" />
      <circle cx={s * 0.3} cy={-s * 0.5} r={s * 0.1} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <path d={`M${s * 0.25},${-s * 0.5} l${s * 0.04},${s * 0.04} l${s * 0.07},${-s * 0.08}`} fill="none" stroke={PALETTE.green} strokeWidth={s * 0.03} />
    </g>
  ),
  // an advert billboard on two posts with a blinking "AD" badge
  adboard: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <rect x={-s * 0.35} y={-s * 0.45} width={s * 0.05} height={s * 0.45} fill={INK} />
      <rect x={s * 0.3} y={-s * 0.45} width={s * 0.05} height={s * 0.45} fill={INK} />
      <Box x={-s * 0.5} y={-s * 0.95} w={s * 1.0} h={s * 0.52} fill="#fffbe8" s={s} r={s * 0.03} />
      <rect x={-s * 0.42} y={-s * 0.86} width={s * 0.4} height={s * 0.34} rx={s * 0.03} fill={PALETTE.teal} />
      <rect x={s * 0.05} y={-s * 0.84} width={s * 0.35} height={s * 0.06} rx={s * 0.02} fill={PALETTE.grey} />
      <rect x={s * 0.05} y={-s * 0.72} width={s * 0.25} height={s * 0.06} rx={s * 0.02} fill={PALETTE.grey} />
      <rect x={s * 0.22} y={-s * 1.04} width={s * 0.24} height={s * 0.14} rx={s * 0.03} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.5} opacity={0.7 + 0.3 * Math.sin(t * 5)} />
    </g>
  ),
  // a living-room sofa with cushions
  sofa: ({ s }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.65} y={-s * 0.6} w={s * 1.3} h={s * 0.35} fill="#5b6fb5" s={s} r={s * 0.08} />
      <Box x={-s * 0.75} y={-s * 0.35} w={s * 1.5} h={s * 0.25} fill={shade("#5b6fb5", -0.1)} s={s} r={s * 0.06} />
      <Box x={-s * 0.8} y={-s * 0.5} w={s * 0.18} h={s * 0.4} fill={shade("#5b6fb5", -0.2)} s={s} r={s * 0.06} />
      <Box x={s * 0.62} y={-s * 0.5} w={s * 0.18} h={s * 0.4} fill={shade("#5b6fb5", -0.2)} s={s} r={s * 0.06} />
      <rect x={-s * 0.6} y={-s * 0.1} width={s * 0.06} height={s * 0.1} fill={INK} />
      <rect x={s * 0.54} y={-s * 0.1} width={s * 0.06} height={s * 0.1} fill={INK} />
      <Box x={-s * 0.45} y={-s * 0.52} w={s * 0.3} h={s * 0.2} fill={PALETTE.orange} s={s} r={s * 0.05} />
    </g>
  ),
  // a glass jar of coins: k (0..1) is how full it is
  profitjar: ({ s, t, k = 0.5 }) => {
    const f = Math.max(0.05, Math.min(1, k));
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.3} y={-s * 0.9} width={s * 0.6} height={s * 0.88} rx={s * 0.1} fill="#dff3ff" opacity={0.6} stroke={INK} strokeWidth={line(s)} />
        <clipPath id="jarclip"><rect x={-s * 0.28} y={-s * 0.88} width={s * 0.56} height={s * 0.84} rx={s * 0.09} /></clipPath>
        <g clipPath="url(#jarclip)">
          {Array.from({ length: Math.round(f * 16) }, (_, i) => (
            <ellipse key={i} cx={-s * 0.18 + (i % 4) * s * 0.12} cy={-s * 0.08 - Math.floor(i / 4) * s * 0.1} rx={s * 0.07} ry={s * 0.04} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} />
          ))}
        </g>
        <rect x={-s * 0.24} y={-s * 1.0} width={s * 0.48} height={s * 0.1} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
        <circle cx={s * 0.15} cy={-s * 0.75} r={s * 0.03} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 4)} />
      </g>
    );
  },
  // a long paper receipt curling at the bottom, twelve lines
  receipt: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.3) * 1.5})`}>
      <Shadow w={s * 0.5} s={s} />
      <path d={`M${-s * 0.25},${-s * 1.0} L${s * 0.25},${-s * 1.0} L${s * 0.25},${-s * 0.08} Q${s * 0.25},0 ${s * 0.15},${-s * 0.02} L${-s * 0.25},${-s * 0.02} Z`} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-s * 0.19} y={-s * (0.93 - i * 0.065)} width={s * (0.22 + (i % 3) * 0.05)} height={s * 0.025} fill={i === 11 ? RED : PALETTE.grey} />)}
    </g>
  ),
};

export default props;
