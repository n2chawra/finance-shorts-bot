// Promise: "{fact1} स्टेट्स, और हर स्टेट का अपना ऑफिशियल पक्षी। चलिए, उत्तर से।" The camera pulls back to all of India;
// a wooden signboard rises in the Bay of Bengal with the count, every state flashes in a west-to-east wave on "हर", a bird
// badge stamps onto the board on "ऑफिशियल" and an arrow swings north on "उत्तर".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, SourceLine, Stage, View, motion } from "../../flat/kit";
import { INDIA_STATES, type StateFx } from "../../flat/india";
import { useAt } from "../../flat/map";
import { F, GREEN, MapView, Signboard, lerpFrame } from "./props";

type Params = { fig?: { count?: string } };

/** a rough west-to-east order for the flash wave */
const LON: Record<string, number> = { Gujarat: 71, Rajasthan: 73, Punjab: 75, Maharashtra: 75, Goa: 74, Karnataka: 76, Kerala: 76, "Himachal Pradesh": 77, Haryana: 76, Delhi: 77, "Madhya Pradesh": 78, "Tamil Nadu": 78, Telangana: 79, Uttarakhand: 79, "Uttar Pradesh": 80, "Andhra Pradesh": 80, Chhattisgarh: 82, Odisha: 84, Jharkhand: 85, Bihar: 86, "West Bengal": 88, Sikkim: 88, Assam: 92, Meghalaya: 91, Tripura: 92, Mizoram: 93, Manipur: 94, Nagaland: 94, "Arunachal Pradesh": 94 };

const Arrow: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const c = at([79.5, 32.5]);
  if (!c || k <= 0) return null;
  const a = -90 + (1 - Math.min(1, k)) * 120;
  return (
    <g transform={`translate(${c[0]} ${c[1] + 40}) rotate(${a + 90})`} opacity={Math.min(1, k * 2)}>
      <path d="M 0 -120 L 44 -50 L 16 -50 L 16 40 L -16 40 L -16 -50 L -44 -50 Z" fill="#ffc43d" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

const Board: React.FC<{ k: number; value: string; badge: number; t: number }> = ({ k, value, badge, t }) => {
  const at = useAt();
  const c = at([89.0, 15.6]);
  return c ? <Signboard x={Math.min(c[0], 810)} y={c[1] + 60} k={k} value={value} label="स्टेट्स" badge={badge} t={t} /> : null;
};

const Promise: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const count = (p.beat.params as Params).fig?.count ?? "";
  const st = m.at("states", 4), har = m.at("har", 20), of = m.at("official", 34), ut = m.at("uttar", 60);
  const frame = lerpFrame(F.mid, F.india, m.lerp([0, st + 14], [0, 1]));
  const states: Record<string, StateFx> = {
    Kerala: { fill: GREEN, k: 1 - m.lerp([st, st + 16], [0, 1]) },
    "Arunachal Pradesh": { fill: GREEN, k: 1 - m.lerp([st, st + 16], [0, 1]) },
  };
  for (const s of INDIA_STATES) {
    const d = (LON[s] ?? 80) - 70;
    const w = m.pulse(har + d * 1.2 + 4, 6);
    if (w > 0 && !(s in states)) states[s] = { fill: "#ffffff", k: 0.85 * w };
  }
  return (
    <Stage p={p} bg="#14382b" vignette={0.3}>
      <View zoom={1.02 + m.wave(75, 0.012)}>
        <MapView t={m.t} frame={frame} states={states}>
          <Board k={m.pop(st, 12)} value={count} badge={m.pop(of, 10)} t={m.t} />
          <Arrow k={m.pop(ut, 10)} />
        </MapView>
      </View>
      <SourceLine p={p} y={190} />
    </Stage>
  );
};
export default Promise;
