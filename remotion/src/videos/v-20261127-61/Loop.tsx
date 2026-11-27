// Loop: "नीलकंठ या धनेश, आपका पसंदीदा कौन-सा? और फिर से देखिए," All of India: the roller-blue states pulse with a
// नीलकंठ pill, the hornbill-green ones with a धनेश pill; on "पसंदीदा" every other state paints in (Dadra and Nagar Haveli
// and Daman and Diu stays grey: the source has no bird), on "फिर" they fade back to paper and on "देखिए" only Keralam and
// Arunachal stay green: the first frame again.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { INDIA_STATES, type StateFx } from "../../flat/india";
import { useAt } from "../../flat/map";
import { BLUE, COLOUR, ENDS, F, GREEN, MapView, ROLLER, SPOT, StateTag, lerpFrame } from "./props";

const Pill: React.FC<{ ll: [number, number]; text: string; bg: string; k: number }> = ({ ll, text, bg, k }) => {
  const at = useAt();
  const c = at(ll);
  if (!c || k <= 0) return null;
  return (
    <g transform={`translate(${c[0]} ${c[1]}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-150} y={-52} width={300} height={104} rx={52} fill={bg} stroke="#1d1a2b" strokeWidth={6} />
      <text x={0} y={4} fontFamily="Poppins" fontWeight={900} fontSize={60} textAnchor="middle" dominantBaseline="middle" fill="#ffffff">{text}</text>
    </g>
  );
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ne = m.at("neelkanth", 2), dh = m.at("dhanesh", 14), pa = m.at("pasand", 28), ph = m.at("phir", 44), de = m.at("dekhiye", 54);
  const fill = m.lerp([pa, pa + 14], [0, 1]), back = m.lerp([ph, de + 4], [0, 1]);
  const states: Record<string, StateFx> = {};
  for (const s of INDIA_STATES) {
    if (s === "Dadra and Nagar Haveli and Daman and Diu") continue;
    const own = ROLLER.includes(s) ? BLUE : ENDS.includes(s) ? GREEN : COLOUR[s]!;
    const keep = ENDS.includes(s) ? 1 : ROLLER.includes(s) ? 1 - back : fill * (1 - back);
    if (keep > 0.01 || ENDS.includes(s)) states[s] = { fill: own, k: Math.max(keep, ENDS.includes(s) ? 1 : 0),
      lift: ROLLER.includes(s) ? 0.5 * m.pulse(ne + 6, 10) : ENDS.includes(s) ? 0.3 + 0.5 * m.pulse(dh + 6, 10) : 0 };
  }
  const frame = lerpFrame(F.india, { center: [F.india.center[0] + 0.6, F.india.center[1]], scale: F.india.scale * 1.04 }, m.lerp([0, m.end], [0, 1]));
  return (
    <Stage p={p} bg="#14382b" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.5}>
          <Pill ll={[82.0, 15.4]} text="नीलकंठ" bg={BLUE} k={m.pop(ne, 10) * (1 - back)} />
          <Pill ll={[86.5, 29.6]} text="धनेश" bg={GREEN} k={m.pop(dh, 10) * (1 - back)} />
          {ENDS.map((s, i) => <StateTag key={s} state={s} at={SPOT[s]} text={i === 0 ? "केरलम" : "अरुणाचल"} k={m.pop(de, 10)} size={50} dy={i === 0 ? -80 : -70} />)}
        </MapView>
      </View>
    </Stage>
  );
};
export default Loop;
