// Hook: "The Strait of Hormuz shuts for a week. Which country runs out first?" From frame 0 tankers file through
// the narrow strait with HORMUZ written on the water; on "Hormuz" Iran's and Oman's shores trace in light; on
// "shuts" a red barrier slams down across the water; on "week" the DAY ONE sign drops in; on "country" the camera
// pulls back over the whole Gulf; on "runs" the tankers bunch behind the barrier; on "first" a question mark bounces.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Barrier, DayBoard, Gulf, HORMUZ, QMark, Tanker } from "./props";

/** A file of tankers along the lane through the strait; `bunch` piles them behind the barrier. */
export const Lane: React.FC<{ t: number; bunch: number; s?: number }> = ({ t, bunch, s = 80 }) => {
  const at = useAt();
  const a = at([54.6, 26.2]), b = at([58.2, 25.4]);
  if (!a || !b) return null;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const run = ((t / 90 + i / 5) % 1);
        const free = run;
        const held = 0.42 - i * 0.05;
        const f = free * (1 - bunch) + held * bunch;
        const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f + (i % 2) * 26 * bunch;
        return <Tanker key={i} x={x} y={y} s={s} t={t} />;
      })}
    </g>
  );
};

export const HookMap: React.FC<{ t: number; out: number; trace: number; bar: number; bunch: number; q: number }> = ({ t, out, trace, bar, bunch, q }) => {
  const scale = 9000 * Math.pow(3800 / 9000, out);
  const center: [number, number] = [56.2 - 2.4 * out, 26.5 + 0.9 * out];
  return (
    <Gulf center={center} scale={scale} colors={{ Iran: { fill: "#5f9b5a", trace, k: trace }, Oman: { fill: "#c9543f", trace, k: trace } }}>
      <Lane t={t} bunch={bunch} s={90 - 30 * out} />
      <Barrier k={bar} glow={bunch} />
      <MapLabel at={[57.0, 25.9]} text="HORMUZ" size={76} fill="#ffd84a" />
      <MapLabel at={[55.4, 27.6]} text="IRAN" size={60} k={trace} />
      <MapLabel at={[56.9, 24.4]} text="OMAN" size={56} k={trace} />
      <Q t={t} q={q} />
    </Gulf>
  );
};

const Q: React.FC<{ t: number; q: number }> = ({ t, q }) => {
  const xy = useAt()([51.8, 27.4]);
  return xy ? <QMark x={xy[0]} y={xy[1]} k={q} t={t} size={190} /> : null;
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hz = m.at("hormuz", 14), sh = m.at("shuts", 28), wk = m.at("week", 44), co = m.at("country", 62), ru = m.at("runs", 72), fi = m.at("first", 84);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.38}>
      <View zoom={1.02 + 0.08 * m.lerp([sh, sh + 10], [0, 1]) * (1 - m.lerp([co, co + 16], [0, 1])) + m.wave(70, 0.01)}>
        <HookMap t={m.t} out={m.lerp([co - 4, co + 18], [0, 1])} trace={m.lerp([hz, hz + 24], [0, 1])} bar={m.pop(sh, 9)} bunch={m.lerp([sh, ru + 10], [0, 1])} q={m.pop(fi, 10)} />
      </View>
      <DayBoard day={m.t >= wk ? 1 : 0} flip={m.pop(wk, 10)} />
      <Flash k={m.pulse(sh, 4) * 0.4} color="#ffffff" />
    </Stage>
  );
};

export default Hook;
