// "First, the sea breaks in through the Red Sea's southern end and floods the Afar, which already lies lower than
// the sea in places." The step sign reads FIRST, waves gather at the strait, an eraser rubs the coastline out, the sea
// pours inland over the Afar, its label sinks, a depth gauge drops below its sea line and bubbles rise.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Crack, Flood, Map, SEA, SeaMarks, mix } from "./props";

const Eraser: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([43.35, 12.55]);
  if (!xy || k <= 0 || k >= 1) return null;
  const dx = Math.sin(k * Math.PI * 4) * 60;
  return (
    <g transform={`translate(${xy[0] + dx},${xy[1] - 40}) rotate(-25)`}>
      <Block x={-70} y={-40} w={140} h={80} fill="#f08fa0" r={14} />
      <Block x={-70} y={-40} w={50} h={80} fill="#3b6fb5" r={10} shadow={false} />
    </g>
  );
};

const Waves: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([43.9, 12.9]);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      {[0, 1, 2].map((i) => {
        const ph = Math.sin(t / 7 + i) * 12;
        return <path key={i} d={`M${xy[0] + 20 + i * 30 + ph},${xy[1] + i * 40 - 40} q-30,-24 -60,0 q-30,-24 -60,0`} fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />;
      })}
    </g>
  );
};

const Gauge: React.FC<{ k: number; drop: number; t: number; bubbles: number }> = ({ k, drop, t, bubbles }) => {
  if (k <= 0) return null;
  const x = 820, y = 520;
  const lvl = 120 + 150 * drop;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y + 330]} b={[x, y + 420]} w={14} color="#6b4a2a" sw={3} />
      <Block x={x - 70} y={y} w={140} h={340} fill="#f4e6c4" r={12} />
      <rect x={x - 60} y={y + lvl} width={120} height={330 - lvl} fill={SEA} />
      <line x1={x - 90} y1={y + 120} x2={x + 90} y2={y + 120} stroke="#c0392b" strokeWidth={8} />
      <Txt x={x} y={y - 40} size={46} fill="#ffffff" stroke={INK}>SEA LEVEL</Txt>
      {bubbles > 0 ? [0, 1, 2].map((i) => <circle key={i} cx={x - 30 + i * 30} cy={y + 320 - (((t * 3 + i * 40) % 160))} r={8} fill="#eef6f4" />) : null}
    </g>
  );
};

const Mouth: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([43.4, 12.6]);
  if (!xy || k <= 0) return null;
  return <circle cx={xy[0]} cy={xy[1]} r={70 + 40 * k} fill="none" stroke="#fff3b0" strokeWidth={12} opacity={k} />;
};

const Sea: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fi = m.at("first", 2), se = m.at("sea", 14), br = m.at("breaks", 24), su = m.at("southern", 44), fl = m.at("floods", 60), af = m.at("afar", 72), lo = m.at("lower", 90), pl = m.at("places", 118);
  const close = m.lerp([fl, fl + 24], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.03 * m.lerp([fi, fi + 20], [0, 1]) + m.wave(80, 0.008)}>
        <Map center={[41.9, 12.0]} scale={mix(3200, 4400, m.lerp([0, br + 10], [0, 1])) + 1000 * close}
          colors={{ Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: 1 } }}>
          <SeaMarks t={m.t} />
          <Crack w={12} glow={0.4} />
          <Waves k={m.lerp([se, se + 10], [0, 1])} t={m.t} />
          <Mouth k={m.pulse(su + 6, 12)} />
          <Flood k={m.lerp([fl - 10, fl + 40], [0, 1]) + 0.08 * m.lerp([br, br + 14], [0, 1])} />
          <Eraser k={m.lerp([br, br + 30], [0, 1])} />
          <g opacity={1 - m.lerp([af + 8, af + 30], [0, 1])}><MapLabel at={[41.2, 12.6]} text="AFAR" size={60} dy={m.lerp([af, af + 30], [0, 40])} /></g>
        </Map>
      </View>
      <Gauge k={m.pop(lo)} drop={m.lerp([lo, lo + 24], [0, 1])} t={m.t} bubbles={m.t > pl ? 1 : 0} />
    </Stage>
  );
};
export default Sea;
