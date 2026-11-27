// The fill-up beat used by North, West and East: each named state paints in on its word, its bird's name pops up on a
// tag above it, the camera moving from one framing to another.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import type { StateFx } from "../../flat/india";
import { BIRD, COLOUR, MapView, StateTag, doneBefore, lerpFrame, painted, type BeatId, type Frame, type LL } from "./props";

export const FillBeat: React.FC<{ p: SceneProps; id: BeatId; names: string[]; events: string[]; from: Frame; to: Frame; drift?: Frame; tagAt?: Record<string, LL>; driftAt?: string; children?: (m: ReturnType<typeof motion>) => React.ReactNode }> = ({
  p, id, names, events, from, to, drift, tagAt = {}, driftAt, children,
}) => {
  const m = motion(p);
  const t = events.map((e, i) => m.at(e, 4 + i * 22));
  let frame = lerpFrame(from, to, m.lerp([0, t[0]! + 12], [0, 1]));
  const away = driftAt ? m.lerp([m.at(driftAt, m.end), m.at(driftAt, m.end) + 10], [0, 1]) : 0;
  if (drift) frame = lerpFrame(frame, drift, m.lerp([driftAt ? m.at(driftAt, t[t.length - 1]!) : t[Math.max(0, t.length - 2)]!, driftAt ? m.at(driftAt, t[t.length - 1]!) + 24 : m.end], [0, 1]));
  const states: Record<string, StateFx> = {
    ...painted(doneBefore(id)),
    ...Object.fromEntries(names.map((s, i) => [s, { fill: COLOUR[s]!, paint: m.lerp([t[i]!, t[i]! + 12], [0, 1]), lift: 0.15 + 0.5 * m.pulse(t[i]! + 6, 12), trace: m.lerp([t[i]!, t[i]! + 20], [0, 1]) }])),
  };
  return (
    <Stage p={p} bg="#14382b" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <MapView t={m.t} frame={frame} states={states}>
          {names.map((s, i) => <StateTag key={s} state={s} at={tagAt[s]} text={BIRD[s]!} k={m.pop(t[i]! + 2, 10) * (1 - away)} size={50} dy={-60 - (i % 2) * 30} />)}
          {children ? children(m) : null}
        </MapView>
      </View>
    </Stage>
  );
};
export default FillBeat;
