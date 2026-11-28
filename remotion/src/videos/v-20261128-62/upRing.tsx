// Uttar Pradesh's ring (shared by RingWest, RingEast and Payoff; not a beat itself): its neighbours in the order they
// are named, which beat names each, and the counter of lit states (Delhi, a union territory, is lit but not counted).
import type { motion } from "../../flat/kit";
import type { StateFx } from "../../flat/india";
import { GOLD, TONES } from "./props";

export type RN = { name: string; ev: string; beat: "a" | "b"; dy: number; text?: string; ut?: boolean };
export const RING: RN[] = [
  { name: "Uttarakhand", ev: "uk", beat: "a", dy: -70 },
  { name: "Himachal Pradesh", ev: "hp", beat: "a", dy: -60, text: "हिमाचल" },
  { name: "Haryana", ev: "hr", beat: "a", dy: 70 },
  { name: "Delhi", ev: "dl", beat: "a", dy: 90, ut: true },
  { name: "Rajasthan", ev: "rj", beat: "a", dy: -70 },
  { name: "Madhya Pradesh", ev: "mp", beat: "b", dy: 80 },
  { name: "Chhattisgarh", ev: "cg", beat: "b", dy: 80 },
  { name: "Jharkhand", ev: "jh", beat: "b", dy: 80 },
  { name: "Bihar", ev: "br", beat: "b", dy: -80 },
];
export const STATES_A = RING.filter((r) => r.beat === "a" && !r.ut).length;

/** The map's states for a beat: UP lifted in gold, earlier beats' neighbours lit, this beat's lighting on their words. */
export const upStates = (m: ReturnType<typeof motion>, beat: "a" | "b" | "all", upLift = 0.5): Record<string, StateFx> => {
  const out: Record<string, StateFx> = { "Uttar Pradesh": { fill: GOLD, lift: upLift } };
  RING.forEach((r, i) => {
    const tone = r.ut ? "#e8453c" : TONES[i % TONES.length]!;
    if (beat === "all" || (beat === "b" && r.beat === "a")) out[r.name] = { fill: tone, lift: 0.1 };
    else if (r.beat === beat) {
      const on = m.at(r.ev, 10 + i * 8);
      out[r.name] = { fill: tone, paint: m.lerp([on - 2, on + 12], [0, 1]), lift: 0.1 + 0.35 * m.pulse(on + 6, 10) };
    }
  });
  return out;
};

/** How many states (not union territories) are lit by frame `m.t` of a beat. */
export const litStates = (m: ReturnType<typeof motion>, beat: "a" | "b"): number =>
  (beat === "b" ? STATES_A : 0) + RING.filter((r, i) => r.beat === beat && !r.ut && m.t >= m.at(r.ev, 10 + i * 8)).length;

const ring = { RING };
export default ring;
