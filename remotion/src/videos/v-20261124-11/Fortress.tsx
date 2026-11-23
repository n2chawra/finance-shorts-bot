// "It began with a chief called Moshoeshoe, who led his people up Thaba Bosiu, a flat-topped mountain no army
// could take." Close over Thaba Bosiu on the map: Moshoeshoe (his real head) steps on, his people follow, the
// flat mountain rises under them, raiders climb at its foot and slide back down its cliffs.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion, shade } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { CALEDON, Map, RIVER, ROCK, THABA, Walker } from "./props";

const Mesa: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  const h = 190 * k;
  if (k <= 0) return null;
  return (
    <g>
      <path d={`M${x - 330},${y} L${x - 190},${y - h} L${x + 190},${y - h} L${x + 330},${y} Z`} fill={ROCK} stroke="#1d1a2b" strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${x + 120},${y - h} L${x + 190},${y - h} L${x + 330},${y} L${x + 200},${y} Z`} fill={shade(ROCK, -0.25)} />
      <rect x={x - 190} y={y - h - 6} width={380} height={14} fill="#7ea24a" stroke="#1d1a2b" strokeWidth={4} />
    </g>
  );
};

const Scene: React.FC<{ t: number; walk: number; ch: number; people: number; mesa: number; raid: number; fall: number; label: number; arm: number }> = ({ t, walk, ch, people, mesa, raid, fall, label, arm }) => {
  const xy = useAt()(THABA);
  if (!xy) return null;
  const [x, y] = [xy[0], xy[1] + 120];
  const top = y - 190 * mesa;
  return (
    <g>
      <Mesa x={x} y={y} k={mesa} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={Math.min(1, people * 2 - i * 0.3)}>
          <Walker x={x - 60 - i * 55 - (1 - walk) * 200} y={top - 4} s={70} color={["#c8102e", "#2f6fd0", "#e0a020", "#3a7a3a"][i]!} step={t / 4 + i} />
        </g>
      ))}
      {ch > 0 ? <Char x={x + 70 - (1 - walk) * 200} y={top - 4} s={78 * Math.min(1, ch)} photo="moshoeshoe" outfit="suit" top="#3a3036" armR={[40, 160 * arm]} /> : null}
      {raid > 0 ? [0, 1, 2].map((i) => {
        const up = Math.min(1, raid) * (1 - fall);
        return <Walker key={i} x={x + 230 + i * 60 - 40 * up} y={y - 130 * up + 40 * fall * i} s={62} color="#8a3020" step={t / 3 + i} hat />;
      }) : null}
      <MapLabel at={[THABA[0], THABA[1] - 0.16]} text="THABA BOSIU" size={56} k={label} />
    </g>
  );
};

const Fortress: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ch = m.at("chief", 6), mo = m.at("moshoeshoe", 20), pe = m.at("people", 44), th = m.at("thaba", 56), mt = m.at("mountain", 80), ar = m.at("army", 92), ta = m.at("take", 104);
  const zoom = 1 + 0.12 * m.lerp([mo - 4, mo + 14], [0, 1]) - 0.08 * m.lerp([th - 4, th + 14], [0, 1]) + 0.06 * m.lerp([ar - 4, ar + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={zoom + m.wave(70, 0.008)} cy={900}>
        <Map center={[THABA[0] + 0.05, THABA[1] - 0.05]} scale={30000 + 4000 * m.lerp([0, m.end], [0, 1])} colors={{ Lesotho: { fill: "#e3cf9a" }, "South Africa": { fill: "#d9c08a" } }}>
          <MapRoute via={CALEDON.slice(3, 7)} k={1} color={RIVER} width={26} dash={false} />
          <Scene t={m.t} walk={m.lerp([ch, pe + 20], [0, 1])} ch={m.pop(ch, 12)} people={m.lerp([pe, pe + 14], [0, 1])} mesa={m.lerp([th - 6, th + 16], [0.15, 1])}
            raid={m.lerp([ar, ar + 16], [0, 1])} fall={m.lerp([ta, ta + 14], [0, 1])} label={m.pop(mt, 12)} arm={m.lerp([mo, mo + 10], [0, 1])} />
        </Map>
      </View>
    </Stage>
  );
};

export default Fortress;
