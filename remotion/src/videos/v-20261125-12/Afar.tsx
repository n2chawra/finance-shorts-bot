// "It already is. Along a line that starts in Ethiopia's Afar desert, Africa's two plates pull apart by 8 to 9
// millimetres a year." The camera dives to the Horn; Ethiopia traces with its flag, AFAR writes on, cracks open in
// the sand, arrows push the two sides apart and a ruler sign shows the rate.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, SourceLine, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { AFAR_C, Crack, Map, SeaMarks, Sign, mix, mixLL } from "./props";
import { HOOK_END } from "./Hook";

type Params = { fig?: { lo?: string; hi?: string } };

const Arrows: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(AFAR_C);
  if (!xy || k <= 0) return null;
  const o = 40 + 30 * Math.min(1, k) + Math.sin(t / 8) * 6;
  return (
    <g opacity={Math.min(1, k * 2)}>
      {[-1, 1].map((d) => (
        <g key={d}>
          <Limb a={[xy[0] + d * o, xy[1] + 140]} b={[xy[0] + d * (o + 150), xy[1] + 140]} w={22} color="#ffd36a" sw={4} />
          <path d={`M${xy[0] + d * (o + 190)},${xy[1] + 140} l${-d * 56},-40 l0,80 Z`} fill="#ffd36a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
};

const Cracks: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(AFAR_C);
  if (!xy || k <= 0) return null;
  const segs: [number, number, number, number][] = [[-120, -60, -40, 20], [-40, 20, 30, -30], [30, -30, 110, 40], [-80, 80, 0, 120], [60, 90, 140, 60]];
  return (
    <g>
      {segs.map(([a, b, c, d], i) => {
        const q = Math.max(0, Math.min(1, k * 2.5 - i * 0.3));
        return q > 0 ? <line key={i} x1={xy[0] + a} y1={xy[1] + b} x2={xy[0] + a + (c - a) * q} y2={xy[1] + b + (d - b) * q} stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null;
      })}
    </g>
  );
};

const Afar: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const al = m.at("already", 2), et = m.at("africa's", 14), pl = m.at("plates", 30), pu = m.at("pull", 74), mm = m.at("millimetres", 100), ye = m.at("year", 110);
  const dive = m.lerp([al, pl], [0, 1]);
  return (
    <>
      <Stage p={p} bg="#5f9fae" vignette={0.35}>
        <View zoom={1.0 + m.wave(80, 0.008)}>
          <Map center={mixLL(HOOK_END.center, [40.6, 10.2], dive)} scale={mix(HOOK_END.scale, 4200, dive)}
            colors={{ Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: m.lerp([et, et + 14], [0, 1]), trace: m.lerp([et, et + 30], [0, 1]) } }}>
            <SeaMarks t={m.t} />
            <Crack glow={0.4 + m.pulse(pl + 4, 14)} w={12} />
            <Cracks k={m.lerp([pl, pl + 20], [0, 1])} />
            <Arrows k={m.lerp([pu, pu + 14], [0, 1]) + 0.6 * m.pulse(ye + 4, 8)} t={m.t} />
          </Map>
          <Sign x={540} y={1300} w={560} title="EVERY YEAR" value={`${f.lo ?? ""}–${f.hi ?? ""} MM`} k={m.pop(mm)} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </>
  );
};
export default Afar;
