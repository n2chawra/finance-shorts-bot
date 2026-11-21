// Payoff: "By New Year, that money buys {std_years} standard copies."
// The city from above at night: the camera dives over the towers on "standard", the yellow price tag hangs on a
// mountain of game boxes towering over the city on "price", the big counter on the mountain lands on the copy count
// on "copies", fireworks start on "before" and burst over the mountain on "Year".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Display, Glow, INK, IsoBlock, Stage, Tag, View, countText, isoProjector, motion, rng } from "../../flat/kit";

type Params = { fig?: { copies?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const copies = (p.beat.params as Params).fig?.copies ?? "";
  const std = m.at("by", 2), money = m.at("money", 15), price = m.at("standard", 40), cop = m.at("copies", 50), before = m.at("by", 2), year = m.at("buys", 25);
  const tag = m.pop(price, 10);
  const count = m.lerp([money, cop + 8], [0, 1]);
  const zoom = m.t < cop ? m.lerp([0, cop], [0.92, 1.08]) : m.lerp([cop, cop + 14], [1.08, 1.16]);
  const cy = m.lerp([0, cop], [1000, 800]);
  const proj = isoProjector(540, 960, 55);
  const r = rng("gta-city");
  const towers = Array.from({ length: 25 })
    .map((_, i) => ({ i, gx: (i % 5) * 3 - 7, gy: Math.floor(i / 5) * 3 - 7, h: 3 + r() * 5 }))
    .filter((t) => Math.abs(t.gx + 1) + Math.abs(t.gy + 1) > 3)
    .sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  const fireworks = [
    { x: 200, y: 360, c: "#ff4fa3", at: before + 2 },
    { x: 880, y: 300, c: "#4dff9a", at: before + 10 },
    { x: 300, y: 180, c: "#ffc43d", at: year },
    { x: 820, y: 520, c: "#7fb8ff", at: year + 4 },
  ];
  return (
    <Stage p={p} bg="#0b0f2e" vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(130, 6)} cy={cy}>
        <rect x={-800} y={-800} width={2680} height={3600} fill="#0b0f2e" />
        {/* the city from above */}
        {towers.map((t) => (
          <IsoBlock key={t.i} iso={proj} x0={t.gx} y0={t.gy} w={2} d={2} h={t.h} color={["#2e3878", "#3b4588", "#36418a"][t.i % 3]!} seed={`gta-t${t.i}`}
            lit={(j) => (j + Math.floor(m.t / 10) + t.i) % 5 !== 0} />
        ))}
        {/* the mountain of game boxes in the middle of the city */}
        <path d="M 180 1180 L 540 520 L 900 1180 Z" fill="#ff5f8f" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 34 }).map((_, i) => {
          const row = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);
          const inRow = i - (row * (row + 1)) / 2;
          const x = 540 + (inRow - row / 2) * 70;
          const y = 600 + row * 78;
          return <rect key={i} x={x - 30} y={y - 36} width={60} height={72} rx={6} fill={["#2b1250", "#ffb347", "#ff5f8f", "#ffd36b"][i % 4]} stroke={INK} strokeWidth={4} />;
        })}
        <Glow x={540} y={820} r={520} color="#ff8fbf" o={0.25} />
        <Tag x={620} y={560} w={250} h={90} text="STANDARD" size={46} rot={10} k={tag} />
        <Display x={210} y={250} w={660} h={250} label="COPIES THAT MONEY BUYS" value={countText(copies, count)} color="#ffc43d" k={Math.min(1, count * 4)} />
        {fireworks.map((f, i) => {
          const k = m.lerp([f.at, f.at + 18], [0, 1]);
          if (k <= 0 || k >= 1) return null;
          return (
            <g key={i} opacity={1 - k * 0.8}>
              <Glow x={f.x} y={f.y} r={160 * k} color={f.c} o={0.6} />
              {Array.from({ length: 10 }).map((_, j) => {
                const a = (j / 10) * Math.PI * 2;
                return <Ball key={j} x={f.x + Math.cos(a) * 130 * k} y={f.y + Math.sin(a) * 130 * k} r={9} fill={f.c} sw={2} shadow={false} />;
              })}
            </g>
          );
        })}
      </View>
    </Stage>
  );
};

export default Payoff;
