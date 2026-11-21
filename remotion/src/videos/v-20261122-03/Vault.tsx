// Vault (the turn): "On Pizza Day this year, the same coins were worth more than {fact4}."
// A huge bank vault: the round door swings open under a PIZZA DAY banner on "Pizza", the same glass jar of coins tips
// over on "same", the coins swell into a golden mountain filling the vault on "coins", the vault's counter lands on the
// figure on "more".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Display, Glow, INK, Stage, Txt, View, countText, motion, rng } from "../../flat/kit";
import { Laszlo } from "./props";

type Params = { fig?: { now?: string } };

const Vault: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const now = (p.beat.params as Params).fig?.now ?? "";
  const pizza = m.at("pizza", 2), same = m.at("same", 18), coins = m.at("coins", 30), more = m.at("more", m.end - 30);
  const open = m.lerp([pizza, pizza + 14], [0, 1]);
  const tip = m.lerp([same, same + 10], [0, 1]);
  const swell = m.lerp([coins, more + 10], [0, 1]);
  const count = m.lerp([more - 6, more + 24], [0, 1]);
  const r = rng("vault-mountain");
  const mound = Array.from({ length: 90 }).map(() => [r(), r()] as [number, number]);
  const zoom = m.t < more ? m.lerp([0, more], [1.0, 1.06]) : m.lerp([more, more + 14], [1.06, 1.12]);
  const cy = m.t < more ? 920 : m.lerp([more, more + 14], [920, 780]);
  return (
    <Stage p={p} bg="#2a2418" vignette={0.45}>
      <View zoom={zoom} cx={570 + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#4a4030" />
        <rect x={-700} y={1250} width={2480} height={1400} fill="#3a3224" />
        <Glow x={540} y={900} r={700} color="#ffcf5c" o={0.2 + 0.4 * swell} />
        {/* the banner */}
        <path d="M 180 230 L 900 230 L 870 330 L 210 330 Z" fill="#c8102e" stroke={INK} strokeWidth={6} />
        <Txt x={540} y={280} size={60} fill="#ffffff">PIZZA DAY</Txt>
        {/* the round vault door swinging open to the right */}
        <g transform={`translate(${880 + open * 120} 760) scale(${1 - open * 0.75} 1)`}>
          <circle r={300} fill="#9aa0b4" stroke={INK} strokeWidth={8} />
          <circle r={230} fill="#b8bdd0" stroke={INK} strokeWidth={6} />
          {[0, 60, 120].map((a) => <line key={a} x1={-120 * Math.cos((a * Math.PI) / 180)} y1={-120 * Math.sin((a * Math.PI) / 180)} x2={120 * Math.cos((a * Math.PI) / 180)} y2={120 * Math.sin((a * Math.PI) / 180)} stroke={INK} strokeWidth={14} />)}
        </g>
        {/* the coin mountain */}
        {mound.map(([a, b], i) => {
          const k = Math.max(0, Math.min(1, swell * 1.4 - (i / mound.length) * 0.4));
          if (k <= 0) return null;
          const hgt = 520 * k;
          const x = 640 + (a - 0.5) * 520 * k;
          const y = 1250 - b * hgt * (1 - Math.abs(a - 0.5) * 1.6);
          return <Ball key={i} x={x} y={y} r={30} fill="#f7931a" sw={3} shadow={false} />;
        })}
        {/* the same jar, tipping */}
        <g transform={`translate(240 1250) rotate(${tip * 70})`} opacity={1 - swell}>
          <rect x={-90} y={-280} width={180} height={280} rx={24} fill="#bfe6ff" opacity={0.4} stroke="#e8f6ff" strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-45 + (i % 3) * 45} cy={-30 - Math.floor(i / 3) * 50} r={22} fill="#f7931a" stroke={INK} strokeWidth={3} />)}
        </g>
        <Laszlo x={250} y={1480} s={220} m={m} face={swell > 0.3 ? "shock" : "happy"} look={[0.8, -0.4]} armR={[100, 30]} armL={[swell > 0.5 ? 150 : 20, 20]} />
        <Display x={200} y={400} w={680} h={230} label="THOSE COINS ON PIZZA DAY" value={count > 0 ? countText(now, count) : "..."} color="#ffc43d" k={1} />
      </View>
    </Stage>
  );
};

export default Vault;
