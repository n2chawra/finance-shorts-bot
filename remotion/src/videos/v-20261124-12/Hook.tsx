// Hook: "Without rain, the Panama Canal stops." Panama on the old map with its flag from frame 0, a rain cloud
// thinning over the lake in its middle; the border traces, the camera pushes in on the glowing canal and a ship
// on it halts as a STOP tag stamps beside it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Canal, CanalShip, Cloud, LAKE_C, Lake, PMap, PanamaFlag } from "./props";

export const START: { center: [number, number]; scale: number } = { center: [-79.82, 9.05], scale: 30000 };
export const CZ: [number, number] = [-79.76, 9.12];
export const lerpC = (k: number): [number, number] => [START.center[0] + (CZ[0] - START.center[0]) * k, START.center[1] + (CZ[1] - START.center[1]) * k];

/** The hook's map, shared with the loop's last frames. */
export const HookMap: React.FC<{ t: number; k: number; trace: number; glow: number; ship: number; stop: number; rain: number; flag?: number }> = ({ t, k, trace, glow, ship, stop, rain, flag = 1 }) => (
  <PMap trees={1} center={lerpC(k)} scale={START.scale + 20000 * k} colors={{ Panama: { fill: "#d9b77a", k: 0.6 + 0.4 * flag, trace } }}>
    <PanamaFlag at={[-80.12, 8.98]} k={flag} t={t} />
    <Lake k={1} />
    <Canal glow={glow} w={10 + 16 * k} />
    <CanalShip f={ship} s={60 + 20 * k} />
    <Over t={t} rain={rain} stop={stop} k={k} />
    <MapLabel at={[-80.05, 8.93]} text="PANAMA" size={60} k={k < 0.08 ? 1 : 0} />
  </PMap>
);

const Over: React.FC<{ t: number; rain: number; stop: number; k: number }> = ({ t, rain, stop, k }) => {
  const at = useAt();
  const c = at(LAKE_C), s = at([-79.72, 9.1]);
  return (
    <g>
      {c ? <Cloud x={c[0] - 40} y={c[1] - 260} s={170 + 30 * k} rain={rain} t={t} k={0.4 + 0.6 * rain} /> : null}
      {s && stop > 0 ? <Tag x={s[0] + 60} y={s[1] - 150} w={220} h={92} text="STOP" size={60} bg="#e0352b" fg="#ffffff" k={stop} rot={-8} /> : null}
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ra = m.at("rain", 6), pa = m.at("panama", 26), ca = m.at("canal", 36), st = m.at("stops", 50);
  const k = m.lerp([ca - 6, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01) + 0.03 * m.pulse(st + 2, 6)}>
        <HookMap t={m.t} k={k} trace={m.lerp([pa, pa + 24], [0, 1])} glow={m.lerp([ca, ca + 12], [0, 1])}
          ship={0.25 + 0.2 * m.lerp([0, st], [0, 1])} stop={m.pop(st, 10)} rain={1 - m.lerp([ra, ra + 30], [0, 0.8])} flag={1 - k} />
      </View>
    </Stage>
  );
};

export default Hook;
