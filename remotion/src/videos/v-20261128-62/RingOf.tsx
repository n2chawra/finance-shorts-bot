// A ring of neighbours lighting round one state, one per spoken word (shared by Maha and Assam; not a beat itself).
import React from "react";
import type { motion } from "../../flat/kit";
import { StateTag, type StateFx } from "../../flat/india";
import { Link, MID, TONES } from "./props";

export type N = { name: string; ev: string; dy: number; text?: string };

export const ringStates = (m: ReturnType<typeof motion>, centre: string, fill: string, ns: N[], centreAt: number): Record<string, StateFx> => {
  const out: Record<string, StateFx> = { [centre]: { fill, lift: 0.3 + 0.3 * m.pulse(centreAt + 6, 10), trace: m.lerp([centreAt, centreAt + 24], [0, 1]) } };
  ns.forEach((n, i) => {
    const on = m.at(n.ev, 10 + i * 8);
    out[n.name] = { fill: TONES[i % TONES.length]!, paint: m.lerp([on - 2, on + 12], [0, 1]), lift: 0.35 * m.pulse(on + 6, 10) };
  });
  return out;
};

export const RingTags: React.FC<{ m: ReturnType<typeof motion>; centre: string; ns: N[]; size?: number }> = ({ m, centre, ns, size = 46 }) => (
  <>
    {ns.map((n, i) => {
      const on = m.at(n.ev, 10 + i * 8);
      return <Link key={`l${n.name}`} from={MID[centre]!} to={MID[n.name]!} k={m.lerp([on - 2, on + 10], [0, 1])} />;
    })}
    {ns.map((n, i) => <StateTag key={n.name} state={n.name} text={n.text} k={m.pop(m.at(n.ev, 10 + i * 8), 12)} size={size} dy={n.dy} />)}
  </>
);
const ring = { ringStates };
export default ring;
