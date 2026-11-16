// Payoff: "That's how rented computers made {prof_pct} of Amazon's {fact2} profit." The server hall's
// roof at sunrise: the cooling fans spin up and gold bars rise out of the vents on "rented", the stack
// climbs past the half line on "computers", the profit billboard lights on "Amazon's", and on "profit"
// the camera pulls back to show the cloud's share of the whole stack glowing in the sunrise.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";

type Params = { fig?: { share?: string; total?: string } };

const Bar: React.FC<{ x: number; y: number; w: number; glow?: boolean }> = ({ x, y, w, glow }) => (
  <g>
    <polygon points={`${x},${y + 50} ${x + w},${y + 50} ${x + w - 24},${y} ${x + 24},${y}`} fill={glow ? "#ffd23f" : "#c9a548"} stroke={INK} strokeWidth={4} />
    <rect x={x + 40} y={y + 10} width={w - 80} height={8} rx={4} fill="#fff1b0" opacity={0.7} />
  </g>
);

const Roof: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = p.beat.params as Params;
  const rented = m.at("rented", 6), comp = m.at("computers", 16), amz = m.at("amazon's", 32), prof = m.at("profit", 44);
  const ROWS = 14, CLOUD = 8; // the stack: the cloud's rows glow
  const grown = m.lerp([rented, prof], [0, ROWS], Easing.out(Easing.quad));
  const zoom = m.t < prof ? m.lerp([0, comp], [1.45, 1.15]) : m.lerp([prof, prof + 16], [1.15, 0.95]);
  const cy = m.t < prof ? m.lerp([0, comp], [1050, 900]) : m.lerp([prof, prof + 16], [900, 880]);
  const base = 1330;
  return (
    <Stage p={p} bg="#ffb36b" vignette={0.3}
      defs={<linearGradient id="rf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a7fd1" /><stop offset="0.55" stopColor="#ffb0a0" /><stop offset="1" stopColor="#ffd28a" /></linearGradient>}>
      <View zoom={zoom} cx={540} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="url(#rf-sky)" />
        <circle cx={880} cy={1180} r={160} fill="#fff1c4" />
        <Glow x={880} y={1180} r={600} color="#fff1c4" o={0.5} />
        {/* the roof and its fans */}
        <Block x={-300} y={base} w={1680} h={700} fill="#7a8399" />
        {[-120, 1000].map((x) => (
          <g key={x}>
            <Block x={x - 90} y={base - 120} w={200} h={120} fill="#9aa3b8" />
            <g transform={`rotate(${m.t * m.lerp([rented, rented + 20], [2, 24])} ${x + 10} ${base - 60})`}>
              {[0, 90, 180, 270].map((a) => <ellipse key={a} cx={x + 10} cy={base - 100} rx={14} ry={36} fill="#4a5266" stroke={INK} strokeWidth={3} transform={`rotate(${a} ${x + 10} ${base - 60})`} />)}
            </g>
            <Ball x={x + 10} y={base - 60} r={12} fill="#2a2f3d" sw={3} shadow={false} />
          </g>
        ))}
        {/* the vent and the stack rising out of it */}
        <Block x={300} y={base - 40} w={480} h={60} fill="#5a6378" />
        {Array.from({ length: ROWS }).map((_, i) => {
          const k = Math.max(0, Math.min(1, grown - i));
          if (k <= 0) return null;
          const glow = i < CLOUD && m.t >= prof;
          return <g key={i} transform={`translate(0 ${(1 - k) * 60})`} opacity={k}><Bar x={330 + (i % 2) * 20} y={base - 90 - i * 52} w={400} glow={glow} /></g>;
        })}
        {m.t >= prof ? <Glow x={540} y={base - 300} r={420} color="#ffd23f" o={0.45 * m.lerp([prof, prof + 10], [0, 1])} /> : null}
        {/* the half line */}
        {m.t >= comp ? <line x1={260} y1={base - 90 - 7 * 52} x2={820} y2={base - 90 - 7 * 52} stroke="#ffffff" strokeWidth={6} strokeDasharray="20 14" opacity={m.lerp([comp, comp + 8], [0, 1])} /> : null}
        {/* the profit billboard behind */}
        <rect x={250} y={480} width={14} height={140} fill="#2a2f3d" />
        <rect x={816} y={480} width={14} height={140} fill="#2a2f3d" />
        <Display x={210} y={250} w={660} h={240} label="AMAZON PROFIT" value={m.t < amz ? "- - -" : P.fig?.total ?? ""} color="#ffc43d" k={m.lerp([0, 8], [0.4, 1]) * (m.t < amz ? 0.7 : 1)} />
        <g transform={`translate(540 ${245 + m.wave(70, 3)})`} opacity={m.lerp([amz - 2, amz + 8], [0, 1])}><Photo name="amazon" s={90} t={m.t / p.fps} /></g>
        {m.t >= comp ? <Tag x={560} y={base - 560} w={270} h={140} text={P.fig?.share ?? ""} size={104} k={m.pop(comp + 2, 10)} rot={5} bg="#4dd8ff" /> : null}
        {m.t >= comp ? <Txt x={695} y={base - 380} size={46} fill="#ffffff" stroke={INK}>THE CLOUD</Txt> : null}
        <Char x={160} y={base + 10 + m.wave(60, 3)} s={230} who="priya" face={m.t >= prof ? "shock" : "happy"} look={[0.8, -0.6]} armL={[30, 20]} armR={[m.lerp([prof, prof + 8], [40, 150]), 30]} />
      </View>
    </Stage>
  );
};

export default Roof;
