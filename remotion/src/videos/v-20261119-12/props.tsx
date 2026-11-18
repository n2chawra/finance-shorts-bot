// Props for the Squid Game Short: a pink-and-green playground arena with a giant traffic light, a film camera
// marked NETFLIX, film reels, a fairground strength tester and a document folder.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";

/** The playground game arena at night: pink walls, a green floor with painted lines, and a giant traffic light. */
export const Arena: React.FC<{ t: number; green: number }> = ({ t, green }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2700} fill="#1b1030" />
    {/* the walls, painted with sky and clouds like a playground */}
    <rect x={-400} y={200} width={1880} height={900} fill="#f07aa8" />
    {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={-200 + i * 330} cy={360 + (i % 2) * 90} rx={120} ry={46} fill="#ffd1e3" />)}
    <rect x={-400} y={1060} width={1880} height={900} fill="#3fb07a" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-400} y={1120 + i * 70} width={1880} height={10} fill="#e8fff2" opacity={0.6} />)}
    {/* the traffic light on its pole */}
    <Block x={520} y={300} w={40} h={780} fill="#3a3a48" />
    <Block x={420} y={120} w={240} h={420} r={40} fill="#2a2a34" />
    <Ball x={540} y={225} r={70} fill={green > 0.5 ? "#4a1a1a" : "#ff3b3b"} sw={5} />
    <Ball x={540} y={420} r={70} fill={green > 0.5 ? "#3dff8a" : "#1a3a24"} sw={5} />
    <Glow x={540} y={green > 0.5 ? 420 : 225} r={220} color={green > 0.5 ? "#3dff8a" : "#ff3b3b"} o={0.45 + 0.08 * Math.sin(t / 5)} />
  </g>
);

/** A film camera on a tripod with NETFLIX on its side; `roll` turns its reels. */
export const NetflixCamera: React.FC<{ x: number; y: number; w: number; t: number }> = ({ x, y, w, t }) => {
  const h = w * 0.55;
  return (
    <g>
      <Limb a={[x + w * 0.45, y + h]} b={[x + w * 0.1, y + h * 2.6]} w={14} color="#2a2a34" />
      <Limb a={[x + w * 0.45, y + h]} b={[x + w * 0.8, y + h * 2.6]} w={14} color="#2a2a34" />
      <Block x={x} y={y} w={w} h={h} r={16} fill="#1d1a2b" />
      <Block x={x + w} y={y + h * 0.25} w={w * 0.25} h={h * 0.5} r={6} fill="#3a3a48" />
      {[0.22, 0.62].map((k, i) => (
        <g key={i} transform={`rotate(${t * 6} ${x + w * k} ${y - w * 0.18})`}>
          <Ball x={x + w * k} y={y - w * 0.18} r={w * 0.2} fill="#2a2a34" />
          <Limb a={[x + w * k - w * 0.15, y - w * 0.18]} b={[x + w * k + w * 0.15, y - w * 0.18]} w={8} color="#55556a" sw={0} />
        </g>
      ))}
      <Txt x={x + w / 2} y={y + h / 2} size={w * 0.16} fill="#e50914">NETFLIX</Txt>
    </g>
  );
};

/** A film reel seen face on, with a label tab. */
export const Reel: React.FC<{ x: number; y: number; r: number; spin?: number; label?: string }> = ({ x, y, r, spin = 0, label }) => (
  <g>
    <g transform={`rotate(${spin} ${x} ${y})`}>
      <circle cx={x} cy={y} r={r} fill="#c0c4cf" stroke={INK} strokeWidth={STROKE} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * r * 0.55} cy={y + Math.sin((a * Math.PI) / 180) * r * 0.55} r={r * 0.2} fill="#1d1a2b" />
      ))}
      <circle cx={x} cy={y} r={r * 0.14} fill="#8a8fa0" stroke={INK} strokeWidth={4} />
    </g>
    {label ? <Txt x={x} y={y + r + 40} size={48} fill="#ffffff" stroke={INK}>{label}</Txt> : null}
  </g>
);

/** A fairground strength tester: a tall tower with marks, a puck at `k` (0..1 of the height) and a bell. */
export const Striker: React.FC<{ x: number; y: number; h: number; k: number; ring: number; mark: string }> = ({ x, y, h, k, ring, mark }) => (
  <g>
    <Block x={x - 50} y={y - h} w={100} h={h} r={10} fill="#f5e6c8" />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={x - 40} y={y - h + 40 + i * ((h - 80) / 10)} width={80} height={(h - 80) / 10 - 8} fill={["#e9473b", "#f39c12", "#f5c542", "#7ac943", "#3fb07a"][i % 5]} opacity={0.75} />
    ))}
    {/* the DOUBLE mark low on the tower */}
    <Block x={x + 60} y={y - h * 0.22 - 36} w={240} h={72} r={10} fill="#ffffff" />
    <Txt x={x + 180} y={y - h * 0.22} size={46} fill={INK}>{mark}</Txt>
    <Block x={x - 30} y={y - 40 - (h - 120) * k} w={60} h={40} r={10} fill="#e9473b" />
    <Ball x={x} y={y - h - 50} r={56} fill="#f5c542" />
    {ring > 0 ? <Glow x={x} y={y - h - 50} r={260} color="#ffe08a" o={0.8 * ring} /> : null}
    <Block x={x - 160} y={y} w={320} h={60} r={8} fill={shade("#8a5a3a", 0)} />
  </g>
);

/** A cardboard folder with pages; `open` 0..1. */
export const Folder: React.FC<{ x: number; y: number; w: number; open: number; title: string }> = ({ x, y, w, open, title }) => {
  const h = w * 0.7;
  return (
    <g>
      <Block x={x} y={y} w={w} h={h} r={10} fill="#d9a35a" />
      <Block x={x + 20} y={y - 20 * open} w={w - 40} h={h - 20} r={6} fill="#ffffff" />
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={x + 60} y={y + 120 + i * 50 - 20 * open} width={(w - 120) * (i % 2 ? 0.7 : 0.9)} height={14} rx={6} fill="#c8c8d4" />)}
      <Txt x={x + w / 2} y={y + 60 - 20 * open} size={48} fill={INK}>{title}</Txt>
    </g>
  );
};

export default Arena;
