// "So if the rain stops for good, the lake sinks a little with every ship, the locks run short, and fewer and
// fewer ships get through." The clouds vanish and the sun comes out, the forest browns, the lake shrinks a step
// with each passing ship, the lock marks turn red, cracked mud opens at its edge and the ships thin out.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion, rng } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Canal, CanalShip, Cloud, GATUN_LOCKS, LAKE_C, Lake, PACIFIC_LOCKS, PMap, Sun, Tree } from "./props";

const R = rng("v1124d");
const TREES: [number, number][] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + R() * 0.3, r = 0.22 + R() * 0.06;
  return [LAKE_C[0] + Math.cos(a) * r * 1.2, LAKE_C[1] + Math.sin(a) * r * 0.8] as [number, number];
});

const Over: React.FC<{ t: number; clouds: number; sun: number; brown: number; red: number }> = ({ t, clouds, sun, brown, red }) => {
  const at = useAt();
  const c = at(LAKE_C);
  return (
    <g>
      {TREES.map((tr, i) => { const xy = at(tr); return xy ? <Tree key={i} x={xy[0]} y={xy[1]} s={62} brown={brown * 12 > i ? 1 : 0} /> : null; })}
      {[GATUN_LOCKS, PACIFIC_LOCKS].map((l, i) => { const xy = at(l); return xy && red > 0 ? <circle key={i} cx={xy[0]} cy={xy[1]} r={34 + 6 * Math.sin(t / 4)} fill="#e0352b" stroke={INK} strokeWidth={4} opacity={Math.min(1, red)} /> : null; })}
      {c ? <Cloud x={c[0] + 60} y={c[1] - 330} s={140} t={t} k={clouds} dark /> : null}
      {c ? <Sun x={c[0] + 170} y={c[1] - 360} s={110} k={sun} t={t} /> : null}
    </g>
  );
};

const Drain: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const st = m.at("stops", 8), go = m.at("good", 16), si = m.at("sinks", 30), ev = m.at("every", 46), lo = m.at("locks", 60), sh = m.at("short", 70), fe = m.at("fewer", 84), th = m.at("through", 110);
  const step = (f: number) => Math.round(f * 4) / 4;
  const shrink = 0.25 * m.lerp([si, si + 8], [0, 1]) + 0.35 * step(m.lerp([ev, fe], [0, 1]));
  const close = m.lerp([si - 4, si + 12], [0, 1]) - m.lerp([fe - 4, fe + 12], [0, 1]);
  const ships = 1 - m.lerp([fe, th], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.1 * close + m.wave(80, 0.008)}>
        <PMap trees={1} brown={m.lerp([go, go + 20], [0, 1])} center={[LAKE_C[0] + 0.03, LAKE_C[1] - 0.02]} scale={68000} colors={{ Panama: { fill: "#c9a86a", k: m.lerp([go, go + 16], [0, 0.8]) } }}>
          <Lake k={1 - shrink} mud={m.lerp([sh - 10, sh + 8], [0, 1])} color="#4f8fc9" />
          <Canal w={22} dry={m.lerp([fe, th], [0, 1])} />
          {ships > 0.66 ? <CanalShip f={m.lerp([ev, fe], [0.1, 0.5])} s={66} /> : null}
          {ships > 0.33 ? <CanalShip f={m.lerp([0, fe], [0.55, 0.75])} s={66} color="#3a7ad0" /> : null}
          <CanalShip f={m.lerp([fe, th + 20], [0.3, 0.42])} s={66} color="#3aa06a" />
          <Over t={m.t} clouds={1 - m.lerp([st, st + 10], [0, 1])} sun={m.pop(st + 4, 12)} brown={m.lerp([go, go + 20], [0, 1])} red={m.pop(lo, 10)} />
        </PMap>
      </View>
    </Stage>
  );
};

export default Drain;
