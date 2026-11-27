// Hook: "This piece of Russia, on the Baltic, doesn't touch Russia at all." Kaliningrad in Russia's
// flag from frame 0, its border tracing; BALTIC SEA writes on with waves; a dashed line reaches east and stops short;
// the camera pulls back to the rest of Russia in its flag; the gap between them flashes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { Map, On, PIECE_C, Piece, Rest, Waves, type LL } from "./props";

export const HOOK_VIEW: { center: LL; scale: number } = { center: [21.6, 53.9], scale: 9000 };
export const WIDE_VIEW: { center: LL; scale: number } = { center: [27.5, 53.2], scale: 3300 };

export const HookMap: React.FC<{ t: number; pull: number; trace: number; label: number; sea: number; reach: number; rest: number; gap: number }> = ({ t, pull, trace, label, sea, reach, rest, gap }) => {
  const c: LL = [HOOK_VIEW.center[0] + (WIDE_VIEW.center[0] - HOOK_VIEW.center[0]) * pull, HOOK_VIEW.center[1] + (WIDE_VIEW.center[1] - HOOK_VIEW.center[1]) * pull];
  const s = HOOK_VIEW.scale + (WIDE_VIEW.scale - HOOK_VIEW.scale) * pull;
  return (
    <Map center={c} scale={s} colors={{ Russia: { fill: "#e8d4a2", k: 0 } }}>
      <Rest flagK={rest} />
      <Piece k={1} flagK={1} trace={trace} glow={0.5 + 0.5 * Math.sin(t / 8)} />
      <On at={[19.2, 55.6]} draw={(x, y) => <Waves x={x} y={y} t={t} k={sea} />} />
      <MapLabel at={[20.2, 55.75]} text="BALTIC SEA" size={54} k={sea * Math.max(0, 1 - pull * 3)} type={sea} />
      <MapLabel at={[PIECE_C[0], PIECE_C[1] + 0.75]} text="RUSSIA" size={64} k={label} />
      <MapRoute via={[[22.7, 54.85], [24.5, 55.0], [26.5, 55.2]]} k={reach} color="#ffe08a" width={10} />
      {gap > 0 ? <MapRoute via={[[22.9, 54.9], [26.8, 55.3], [29.0, 55.7]]} k={1} color="#ff5a4a" width={14 + 10 * gap} /> : null}
    </Map>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pi = m.at("piece", 4), ru = m.at("russia", 14), ba = m.at("baltic", 26), to = m.at("touch", 44), al = m.at("all", 80);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <HookMap t={m.t} pull={m.lerp([to - 2, to + 24], [0, 1])} trace={m.lerp([pi, pi + 28], [0, 1])} label={m.pop(ru, 12)}
          sea={m.lerp([ba, ba + 16], [0, 1])} reach={m.lerp([to + 4, to + 22], [0, 1])} rest={m.lerp([to + 2, to + 18], [0, 1])}
          gap={m.pulse(al + 2, 14)} />
      </View>
    </Stage>
  );
};
export default Hook;
