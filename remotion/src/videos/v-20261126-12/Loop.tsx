// "Salt desert or blue sea: which would you visit? Because close that one gap again, and the sea starts to drain."
// One half of the sea turns to salt, the other glows blue, a pointer swings between them; the camera turns to
// Gibraltar as the land closes the gap; then the waterline starts slipping back from the coasts, on the hook's frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Limb, Stage, View, motion } from "../../flat/kit";
import { Bridge, GIB, Map, MED, On, SALT, SeaMask } from "./props";
import { HookMap } from "./Hook";
import { useAt } from "../../flat/map";

const Half: React.FC<{ k: number; t: number }> = ({ k, t }) => (
  k <= 0 ? null : (
    <g>
      <SeaMask id="loop-sea" />
      <defs><clipPath id="loop-west"><rect x={-2000} y={-2000} width={2540} height={6000} /></clipPath></defs>
      <g mask="url(#loop-sea)" clipPath="url(#loop-west)">
        <RingPath fill={SALT} o={Math.min(1, k) * (0.85 + 0.1 * Math.sin(t / 7))} />
      </g>
    </g>
  )
);

const RingPath: React.FC<{ fill: string; o: number }> = ({ fill, o }) => {
  const at = useAt();
  const xy = MED.map((pt) => at(pt)).filter((q): q is [number, number] => !!q);
  const d = xy.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ") + " Z";
  return <path d={d} fill={fill} opacity={o} />;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sa = m.at("salt", 2), bl = m.at("blue", 20), vi = m.at("visit", 40), cl = m.at("close", 58), ga = m.at("gap", 74), dr = m.at("drain", 96);
  const gib = m.lerp([cl - 2, cl + 16], [0, 1]) * (1 - m.lerp([dr - 10, dr + 8], [0, 1]));
  const swing = Math.sin(m.lerp([vi, cl], [0, Math.PI * 2]));
  const settle = m.lerp([dr - 10, dr + 8], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        {settle < 1 ? (
          <g opacity={1 - settle}>
            <Map center={[15.0 - 17.0 * gib, 35.6 + 0.3 * gib]} scale={1450 + 5500 * gib}>
              <Half k={m.lerp([sa, sa + 12], [0, 1])} t={m.t} />
              <On at={[25.0, 34.5]} draw={(x, y) => <Glow x={x} y={y} r={170} color="#bfe6ff" o={0.6 * m.lerp([bl, bl + 10], [0, 1])} />} />
              <Bridge k={m.lerp([ga - 2, ga + 12], [0, 1])} />
              <On at={GIB} draw={(x, y) => <Glow x={x} y={y} r={70} color="#fff2b0" o={0.8 * m.pulse(ga, 16)} />} />
            </Map>
            {m.t > vi ? <Limb a={[540, 1180]} b={[540 + 170 * Math.cos(Math.PI / 2 + swing * 0.9), 1180 - 170 * Math.sin(Math.PI / 2 + swing * 0.9)]} w={16} color="#f2b134" sw={3} /> : null}
          </g>
        ) : null}
        {settle > 0 ? (
          <g opacity={settle}>
            <HookMap t={m.t} level={1 - 0.5 * m.lerp([dr, m.end], [0, 1]) - 0.001} glitter={0} label={0} push={0} />
          </g>
        ) : null}
      </View>
    </Stage>
  );
};
export default Loop;
