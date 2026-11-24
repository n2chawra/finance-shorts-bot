// "At both ends, the line of waiting ships grows longer every day." The camera rises to show both ends of the canal;
// ships anchor off Colon and Panama City, more join, the lines stretch out to sea and a day counter ticks over them.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BALBOA, COLON, Canal, Lake, PMap, Ship } from "./props";

const Line: React.FC<{ at: [number, number]; n: number; dir: [number, number]; t: number; flash: number }> = ({ at: ll, n, dir, t, flash }) => {
  const xy = useAt()(ll);
  if (!xy) return null;
  return (
    <g>
      {flash > 0 ? <circle cx={xy[0]} cy={xy[1]} r={70} fill="#ffe08a" opacity={0.6 * flash} /> : null}
      {Array.from({ length: 8 }, (_, i) => (i < n ? <Ship key={i} x={xy[0] + dir[0] * (110 + i * 85) + (i % 2) * 40} y={xy[1] + dir[1] * (110 + i * 85) + Math.sin(t / 9 + i) * 4} s={64} rot={dir[0] > 0 ? 180 : 0} color={["#d23b30", "#3a7ad0", "#3aa06a", "#e07a3a"][i % 4]!} /> : null))}
    </g>
  );
};

const Lines: React.FC<{ k: number; glow: number }> = ({ k, glow }) => {
  const at = useAt();
  const a = at(COLON), b = at(BALBOA);
  return (
    <g>
      {glow > 0 && a && b ? [a, b].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r={200} fill="#ffe08a" opacity={0.35 * glow} />) : null}
      {k > 0 && a && b ? [[a, [-200, -400]], [a, [900, -300]], [b, [1300, 1500]], [b, [-300, 1400]]].map(([c, e], i) => {
        const p0 = c as [number, number], p1 = e as [number, number];
        return <line key={i} x1={p0[0]} y1={p0[1]} x2={p0[0] + (p1[0] - p0[0]) * k} y2={p0[1] + (p1[1] - p0[1]) * k} stroke="#ffffff" strokeWidth={8} strokeDasharray="18 14" />;
      }) : null}
    </g>
  );
};

const Queue: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const cg = m.at("cargo", 90), sw = m.at("somewhere", 110), bo = m.at("both", 2), en = m.at("ends", 12), wa = m.at("waiting", 30), gr = m.at("grows", 44), lo = m.at("longer", 54), da = m.at("day", 66);
  const wide = m.lerp([bo, en + 6], [0, 1]) - m.lerp([wa - 4, wa + 12], [0, 0.4]) + m.lerp([da - 4, da + 10], [0, 0.4]);
  const n = Math.floor(m.lerp([wa, lo + 20], [1, 8]));
  const days = Math.max(1, Math.floor(m.lerp([da, m.end], [1, 4])));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(80, 0.008)}>
        <PMap trees={1} brown={1} center={[-79.7, 9.14]} scale={26000 - 6000 * wide} colors={{ Panama: { fill: "#c9a86a", k: 0.8 } }}>
          <Lake k={0.45} mud={1} color="#4f8fc9" />
          <Canal w={20} dry={1} />
          <Line at={COLON} n={n} dir={[-0.5, -0.86]} t={m.t} flash={m.pulse(en + 6, 12)} />
          <Line at={BALBOA} n={n} dir={[0.5, 0.86]} t={m.t} flash={m.pulse(en + 6, 12)} />
          <Lines k={m.lerp([sw, sw + 20], [0, 1])} glow={m.pulse(cg + 6, 14)} />
          <MapLabel at={[COLON[0] + 0.12, COLON[1] + 0.02]} text="COLON" size={48} k={m.pop(en, 12)} />
          <MapLabel at={[BALBOA[0] - 0.16, BALBOA[1] - 0.04]} text="PANAMA CITY" size={48} k={m.pop(en, 12)} />
        </PMap>
        {m.t >= da ? (
          <g transform={`translate(540,300) scale(${Math.min(1, m.pop(da, 12))})`}>
            <Block x={-170} y={-60} w={340} h={120} fill="#0b0f14" r={14} />
            <Txt x={0} y={22} size={64} fill="#4dff9a">{`DAY ${days}`}</Txt>
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Queue;
