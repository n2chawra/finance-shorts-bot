// Build: "He started Oracle, and he still owns 38.2% of the company."
// Oracle's tower over the bay at dusk: a tiny first office lights up at the tower's foot on "started" while
// Ellison points up at it, the name sign on the roof lights on "Oracle", floor after floor turns gold from the
// bottom up to his share on "owns" as the camera closes on them, and the banner with the figure unrolls down the
// gold floors on "company".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Ellison } from "./props";

type Params = { fig?: { owns?: string } };

const Tower: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const owns = (p.beat.params as Params).fig?.owns ?? "";
  const started = m.at("started", 2), oracle = m.at("oracle", 12), own = m.at("owns", 30), company = m.at("company", 50);
  const floors = 20, gold = 8;
  const lit = m.lerp([own - 2, own + 18], [0, gold]);
  const mid = m.lerp([own - 4, own + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 0.95 + 0.2 * mid, cx = 540 + 20 * mid, cy = 860 + 220 * mid;
  const fy = (i: number) => 1300 - (i + 1) * 52;
  const banner = m.lerp([company - 2, company + 10], [0, 1], Easing.out(Easing.cubic));
  return (
    <Stage p={p} bg="#3a2a5e" vignette={0.42}
      defs={<linearGradient id="orc-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a6e" /><stop offset="0.7" stopColor="#d86a6a" /><stop offset="1" stopColor="#ffb07a" /></linearGradient>}>
      <View zoom={zoom} cx={cx + m.wave(90, 6)} cy={cy}>
        <rect x={-400} y={-600} width={1880} height={1960} fill="url(#orc-dusk)" />
        <circle cx={880} cy={1150} r={110} fill="#ffd08a" />
        {[[-200, 900], [-40, 1000], [1000, 950], [1150, 880]].map(([x, y], i) => <Block key={i} x={x!} y={y!} w={150} h={1300 - y!} fill="#3b3570" sw={4} />)}
        {/* the tower */}
        <Block x={330} y={1300 - floors * 52 - 20} w={420} h={floors * 52 + 20} fill="#4a5a7a" />
        {Array.from({ length: floors }).map((_, i) => {
          const g = i < lit;
          return (
            <g key={i}>
              <rect x={350} y={fy(i) + 8} width={380} height={34} fill={g ? "#ffd23f" : i % 3 ? "#9fdcff" : "#2a3350"} stroke={INK} strokeWidth={2} />
              {g ? <Glow x={540} y={fy(i) + 25} r={260} color="#ffd23f" o={0.18} ry={40} /> : null}
            </g>
          );
        })}
        <Block x={380} y={1300 - floors * 52 - 110} w={320} h={90} r={8} fill="#1f2433" />
        <Txt x={540} y={1300 - floors * 52 - 65} size={60} fill={m.t >= oracle ? "#ff5a4a" : "#5a3a3a"} glow={m.t >= oracle ? "#ff5a4a" : undefined}>ORACLE</Txt>
        {/* the banner with his share */}
        <g>
          <rect x={120} y={fy(gold - 1) - 10} width={230} height={(gold * 52 + 10) * banner} fill="#c74634" stroke={INK} strokeWidth={banner > 0.05 ? STROKE : 0} />
          {banner > 0.6 ? <Txt x={235} y={fy(gold - 1) + 120} size={64} fill="#fff">{owns}</Txt> : null}
          {banner > 0.6 ? <Txt x={235} y={fy(gold - 1) + 210} size={46} fill="#ffe08a">HIS</Txt> : null}
          <rect x={110} y={fy(gold - 1) - 22} width={250} height={20} rx={8} fill="#8a5a36" stroke={INK} strokeWidth={4} />
        </g>
        {/* the bay, the first office, Ellison */}
        <rect x={-400} y={1300} width={1880} height={800} fill="#2f5f8a" />
        {[0, 1, 2].map((i) => <line key={i} x1={-400} y1={1360 + i * 60} x2={1480} y2={1360 + i * 60} stroke="#7fc0e0" strokeWidth={4} strokeDasharray="70 50" strokeDashoffset={m.t * (2 + i)} />)}
        <Block x={760} y={1220} w={150} h={80} fill="#e8dcb8" sw={4} />
        <rect x={790} y={1240} width={40} height={30} fill={m.t >= started ? "#ffd27a" : "#3a3a50"} stroke={INK} strokeWidth={3} />
        {m.t >= started ? <Glow x={810} y={1255} r={120} color="#ffd27a" o={0.6 * m.pop(started, 10)} /> : null}
      </View>
    </Stage>
  );
};

export default Tower;
