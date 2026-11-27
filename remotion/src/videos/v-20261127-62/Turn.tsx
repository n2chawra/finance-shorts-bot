// Turn: "ना में पड़े सिर्फ़ {fact3} वोट। और हाँ में?" On the plains below Sikkim: the red tray's slips stack into a short
// pile on "ना", the chalk board writes the no count on "सिर्फ़", and on "हाँ" the camera swings to the green tray, slips
// still pouring in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { Board, F, GOLD, MapView, Pile, lerpFrame } from "./props";

type Params = { fig?: { no?: string } };

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const no = (p.beat.params as Params).fig?.no ?? "";
  const na = m.at("na", 2), si = m.at("sirf", 10), ha = m.at("haan", 34), au = m.at("aur", 30);
  const mid = Math.round((si + au) / 2);
  const frame = lerpFrame(F.gangtok, F.plains, m.lerp([0, m.end], [0, 1]));
  const swing = m.lerp([ha - 2, ha + 14], [0, 1]);
  const edge = m.lerp([au, au + 8], [0, 0.4]);
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.04 + m.wave(70, 0.012)} cx={540 + swing * 180} cy={960}>
        <MapView t={m.t} frame={frame} states={{ Sikkim: { fill: GOLD, lift: 0.3 } }} dim={0.45} />
        <Glow x={300} y={1150} r={200} color="#ff5a4a" o={0.5 * (1 - swing)} />
        <Pile x={300} y={1180} w={240} level={m.lerp([na, na + 14], [0.15, 0.22])} full={300} color="#e8453c" t={m.t} />
        <Glow x={780} y={1100} r={240} color="#7cf0a0" o={0.6 * Math.max(swing, edge)} />
        <Pile x={780} y={1180} w={240} level={m.lerp([0, m.end], [0.6, 1.1])} full={300} color="#3a9d5d" t={m.t} />
        {Array.from({ length: 8 }, (_, i) => {
          const q = ((m.t + i * 6) % 24) / 24;
          return <rect key={i} x={740 + (i % 3) * 30} y={760 + q * 300} width={50} height={64} rx={4} fill="#ffffff" stroke="#1d1a2b" strokeWidth={3} opacity={swing} />;
        })}
      </View>
      <Board x={540} y={420} w={620} h={330} k={m.pop(na, 12)} title="गिनती"
        rows={[{ text: "ना", value: no, color: "#ff8a7a", k: m.pop(si, 10) }]} />
      {m.t >= mid ? <ellipse cx={725} cy={395} rx={150 * m.lerp([mid, mid + 10], [0.6, 1])} ry={62} fill="none" stroke="#ff8a7a" strokeWidth={7} /> : null}
    </Stage>
  );
};
export default Turn;
