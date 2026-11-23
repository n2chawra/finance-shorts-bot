// Hook: "Why does South Africa have a hole in the middle? That hole is a country, Lesotho." The old map of
// southern Africa with South Africa in its flag from frame 0; its border traces, the plain gap in its middle
// flashes, the camera pushes in, the gap's border runs round and Lesotho's flag fills it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { LESOTHO_C, LesothoEdge, Map } from "./props";

/** The hook's map, shared with the loop's last frames. */
export const HookMap: React.FC<{ center: [number, number]; scale: number; trace: number; hole: number; edge: number; flag: number; label: number; sa?: number }> = ({ center, scale, trace, hole, edge, flag, label, sa = 1 }) => (
  <Map center={center} scale={scale} colors={{
    "South Africa": { fill: "#d9b77a", flag: sa > 0.05 ? "South Africa" : undefined, k: 0.3 + 0.7 * sa, trace },
    Lesotho: { fill: "#2f6fd0", flag: "Lesotho", k: flag },
  }}>
    <Gap k={hole} />
    <LesothoEdge k={edge} />
    <MapLabel at={[LESOTHO_C[0], LESOTHO_C[1] - 1.25]} text="LESOTHO" size={64} k={label} />
  </Map>
);

const Gap: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(LESOTHO_C);
  if (!xy || k <= 0) return null;
  return <Glow x={xy[0]} y={xy[1]} r={170} color="#fff6c8" o={0.85 * k} />;
};

export const HOOK_START: { center: [number, number]; scale: number } = { center: [25.4, -30.6], scale: 3900 };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const so = m.at("south", 4), ho = m.at("hole", 30), mi = m.at("middle", 50);
  const push = m.lerp([mi - 6, m.end], [0, 0.7]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01)}>
        <HookMap center={pushTo(push)} scale={HOOK_START.scale + 6100 * push}
          trace={m.lerp([so, so + 36], [0, 1])}
          hole={0.35 + 0.35 * m.wave(30, 1) + m.pulse(ho + 4, 10)}
          edge={0} flag={0} label={0} sa={1 - Math.max(0, Math.min(1, (push - 0.3) / 0.35))} />
      </View>
    </Stage>
  );
};

/** The camera's path from the hook's first framing (0) to Lesotho, close (1). */
export const pushTo = (k: number): [number, number] => [HOOK_START.center[0] + (LESOTHO_C[0] - HOOK_START.center[0]) * k, HOOK_START.center[1] + (LESOTHO_C[1] - 0.25 - HOOK_START.center[1]) * k];

export default Hook;
