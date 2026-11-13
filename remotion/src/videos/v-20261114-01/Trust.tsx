// Turn: "The other {part}? Its own trust funds hold it, like Social Security."
// The trust fund vault: the round door swings open on "other" and light floods out; inside, on "own", no
// cash, shelves of IOU stacks and the figure stamped on the biggest; more stacks thud down on "hold"; on
// "Social" a pension envelope marked SOCIAL SECURITY pops on top and a retiree peeks in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Envelope, Iou } from "./props";

type Params = { fig?: { part?: string } };

const Trust: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const part = (p.beat.params as Params).fig?.part ?? "";
  const other = m.at("other", 4), own = m.at("own", 40), hold = m.at("hold", 55), social = m.at("social", 75);
  const open = m.lerp([other, other + 18], [0, 1], Easing.inOut(Easing.cubic));
  const stamp = m.pop(own + 2, 9);
  const z = m.t < own ? m.lerp([0, own], [1.0, 1.08]) : m.t < social ? m.lerp([own, own + 12], [1.08, 1.3], Easing.out(Easing.cubic)) : m.lerp([social, social + 12], [1.3, 1.6], Easing.inOut(Easing.cubic));
  const cy = m.t < social ? m.lerp([own, own + 12], [960, 900]) : m.lerp([social, social + 12], [900, 760]);
  const cx = 540, cyV = 900, R = 400;
  return (
    <Stage p={p} bg="#f2e6c4" vignette={0.3}>
      <View zoom={z} cx={540} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={1700} fill="#e9dcb6" />
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={-300} y1={-200 + i * 160} x2={1380} y2={-200 + i * 160} stroke="#d4c59c" strokeWidth={6} />)}
        <rect x={-300} y={1400} width={1680} height={800} fill="#b8a77e" />
        <defs><clipPath id="d01-vault"><circle cx={cx} cy={cyV} r={R} /></clipPath></defs>
        <circle cx={cx} cy={cyV} r={R} fill="#4a3b26" />
        <g clipPath="url(#d01-vault)">
          <rect x={cx - R} y={cyV - R} width={R * 2} height={R * 2} fill="#5c4a30" />
          {[cyV - 230, cyV - 40, cyV + 150].map((y, k) => (
            <g key={y}>
              <rect x={cx - R} y={y + 110} width={R * 2} height={18} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
              {Array.from({ length: 5 }).map((_, i) => {
                const d = m.pop((k === 2 ? hold : own) + i * 2 + k * 3, 12);
                const hgt = 5 + ((i + k) % 3);
                return (
                  <g key={i} transform={`translate(0 ${(1 - d) * -300})`} opacity={d > 0.02 ? 1 : 0}>
                    {Array.from({ length: hgt }).map((__, j) => <Iou key={j} x={cx - R + 40 + i * 150} y={y + 110 - 20 - j * 16} w={120} rot={(j % 2) * 3 - 1} />)}
                  </g>
                );
              })}
            </g>
          ))}
          <Glow x={cx} y={cyV} r={R * 1.3} color="#fff1c9" o={0.5 * open} />
        </g>
        <circle cx={cx} cy={cyV} r={R + 26} fill="none" stroke="#9aa3b8" strokeWidth={52} />
        <circle cx={cx} cy={cyV} r={R + 52} fill="none" stroke={INK} strokeWidth={STROKE} />
        <circle cx={cx} cy={cyV} r={R} fill="none" stroke={INK} strokeWidth={STROKE} />
        {/* the door swings from closed (over the hole) to open (to the right) */}
        <g transform={`translate(${open * 470} 0) scale(${1 - open * 0.7} 1)`} style={{ transformOrigin: `${cx + R}px ${cyV}px` }}>
          <circle cx={cx} cy={cyV} r={R} fill="#b5bccc" stroke={INK} strokeWidth={STROKE} />
          <circle cx={cx} cy={cyV} r={R * 0.6} fill="#a3abbd" stroke={INK} strokeWidth={5} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 + m.lerp([0, other + 10], [0, 1.2]);
            return <line key={i} x1={cx} y1={cyV} x2={cx + Math.cos(a) * 180} y2={cyV + Math.sin(a) * 180} stroke="#5a6278" strokeWidth={18} strokeLinecap="round" />;
          })}
          <Ball x={cx} y={cyV} r={50} fill="#5a6278" />
          <Txt x={cx} y={cyV - 300} size={52} fill={INK}>TRUST FUNDS</Txt>
        </g>
        {/* the figure stamped on the biggest stack */}
        <Tag x={300} y={420} w={480} h={150} text={part} rot={-5} bg="#2b4fa8" fg="#ffffff" k={stamp} />
        {/* the pension envelope pops on top */}
        {m.t >= social ? (
          <g transform={`translate(540 650) scale(${m.pop(social, 10)}) translate(-540 -650)`}>
            <Envelope x={360} y={580} w={360} h={190} rot={4}>
              <Txt x={540} y={690} size={44} fill="#2b4fa8">SOCIAL SECURITY</Txt>
            </Envelope>
          </g>
        ) : null}
        <Char x={m.lerp([social - 4, social + 10], [1300, 960], Easing.out(Easing.back(1.2)))} y={1480 + m.wave(50, 3)} s={230} who="sharma" face={m.t > social ? "happy" : "neutral"}
          look={[-1, -0.3]} armL={[m.lerp([social, social + 8], [20, 110]), 40]} armR={[20, 10]} />
      </View>
    </Stage>
  );
};

export default Trust;
