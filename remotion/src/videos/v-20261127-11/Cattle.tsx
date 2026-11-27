// "And the jungle works as a wall against a cattle disease, foot-and-mouth, keeping it from walking north out of
// South America." The jungle in the gap pulses, a green wall rises along it, cows pop up on the Colombian side, red
// germs bloom among them, a FOOT-AND-MOUTH tag stamps on as the camera pushes in, the germs march north to the wall
// and bounce off it and fade; SOUTH AMERICA writes on and safe herds pop up beyond the wall.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { AMap, Cow, Germ, NORTH_ROAD, Road, SEA_GAP, TURBO, Waves, between, mix, type LL } from "./props";
import { BORDER, Forest } from "./Jungle";

const COWS: LL[] = [[-76.45, 7.35], [-76.15, 7.15], [-76.35, 6.9], [-75.95, 7.0], [-76.1, 7.5]];
const WALL: LL[] = [[-77.0, 8.6], ...BORDER.slice(1, 5).map((b) => [b[0] + 0.3, b[1]] as LL)];

const Wall: React.FC<{ k: number; pulse: number }> = ({ k, pulse }) => {
  const at = useAt();
  const xy = WALL.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2 || k <= 0) return null;
  const h = 90 * Math.min(1, k);
  const top = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${(p[1] - h).toFixed(1)}`).join(" ");
  const base = [...xy].reverse().map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <g>
      <path d={`${top} ${base} Z`} fill="#3f7a46" stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={0.92} />
      <path d={top} fill="none" stroke="#a8e07a" strokeWidth={8 + 10 * pulse} strokeLinecap="round" opacity={0.9} />
    </g>
  );
};

const Herd: React.FC<{ cows: number; germs: number; march: number; bounce: number; t: number }> = ({ cows, germs, march, bounce, t }) => {
  const at = useAt();
  const target = at([-77.25, 7.75]);
  return (
    <g>
      {COWS.map((c, i) => {
        const xy = at(c);
        if (!xy) return null;
        const k = Math.min(1, Math.max(0, cows * 2 - i * 0.2));
        return <Cow key={i} x={xy[0]} y={xy[1]} s={110} k={k} flip={i % 2 === 1} graze={Math.max(0, Math.sin(t / 18 + i))} />;
      })}
      {target ? COWS.map((c, i) => {
        const xy = at([c[0] + 0.05, c[1] + 0.12]);
        if (!xy) return null;
        const g = Math.min(1, Math.max(0, germs * 2 - i * 0.2));
        const go = Math.min(1, march) * (1 - 0.6 * Math.min(1, bounce));
        const x = mix(xy[0], target[0] + 40 + i * 6, go), y = mix(xy[1] - 120, target[1] - 40 + i * 24, go);
        return <Germ key={`g${i}`} x={x} y={y} r={22} k={g * (1 - Math.max(0, bounce - 0.4))} t={t} />;
      }) : null}
    </g>
  );
};

const SAFE: LL[] = [[-77.75, 8.55], [-77.95, 8.35], [-78.1, 8.6]];
const Safe: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  if (k <= 0) return null;
  return (
    <g>
      {SAFE.map((c, i) => {
        const xy = at(c);
        return xy ? <Cow key={i} x={xy[0]} y={xy[1]} s={80} k={Math.min(1, Math.max(0, k * 2 - i * 0.3))} flip={i === 1} /> : null;
      })}
    </g>
  );
};

const Cattle: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ju = m.at("jungle", 2), wa = m.at("wall", 16), ca = m.at("cattle", 36), di = m.at("disease", 50), fm = m.at("foot-and-mouth", 64), wk = m.at("walking", 92), no = m.at("north", 104), so = m.at("south", 116), he = m.at("herds", 130);
  const med = { center: [-76.85, 7.75] as LL, scale: 14500 };
  const close = { center: [-76.4, 7.4] as LL, scale: 19000 };
  const a = between(med, close, m.lerp([fm, fm + 20], [0, 1]));
  const cam = between(a, med, m.lerp([no - 6, no + 20], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)} cx={540 + 12 * m.pulse(no, 8)}>
        <AMap center={cam.center} scale={cam.scale} colors={{ Panama: { fill: "#e2bd7a", k: 1, flag: "Panama" }, Colombia: { fill: "#e8cf86", k: 1, flag: "Colombia" } }}>
          <Waves pts={SEA_GAP} t={m.t} />
          <Road pts={NORTH_ROAD} w={14} />
          <Road pts={[TURBO, [-76.68, 7.8], [-76.65, 7.5], [-76.5, 7.1]]} w={14} />
          <Forest k={1} s={56 + 6 * m.pulse(ju, 14)} />
          <Wall k={m.lerp([wa, wa + 16], [0, 1])} pulse={m.pulse(ju, 14) + m.pulse(no, 12)} />
          <Herd cows={m.lerp([ca, ca + 14], [0, 1])} germs={m.lerp([di, di + 14], [0, 1])} march={m.lerp([wk, no], [0, 1])} bounce={m.lerp([no, no + 24], [0, 1])} t={m.t} />
          <MapLabel at={[-76.2, 6.75]} text="SOUTH AMERICA" size={52} dy={20} type={m.lerp([so, so + 14], [0, 1])} />
          <Safe k={m.lerp([he, he + 14], [0, 1])} />
        </AMap>
      </View>
      <Tag x={210} y={320} w={660} h={120} text="FOOT-AND-MOUTH" size={58} bg="#f26b5a" fg="#ffffff" k={m.pop(fm)} />
    </Stage>
  );
};
export default Cattle;
