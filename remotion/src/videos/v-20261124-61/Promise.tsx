// Promise: "पहले देखिए, हर राज्य और केंद्र शासित प्रदेश की गाड़ी पर उसका अपना कोड होता है, कुल {count}।" The camera pulls back from Telangana to
// all of India, every state's border flashes, a blank plate drops onto the middle of India and a green highway sign
// rises in the Arabian Sea with the number of codes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { F, HighwaySign, MapView, Plate, TEL, lerpFrame } from "./props";

type Params = { fig?: { count?: string } };

const Over: React.FC<{ blank: number; sign: number; count: string; flash: number; fan: number }> = ({ blank, sign, count, flash, fan }) => {
  const at = useAt();
  const sea = at([66.5, 14.5]);
  return (
    <g>
      {flash > 0 ? <rect x={-200} y={-200} width={1480} height={2320} fill="#ffffff" opacity={0.18 * flash} data-probe="skip" /> : null}
      {/* a fan of blank plates behind the first one: one for every state and UT */}
      {fan > 0 ? [-2, -1, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 70 * fan} ${Math.abs(i) * 18 * fan}) rotate(${i * 7 * fan} 540 900)`} opacity={0.85 * Math.min(1, fan * 2)}>
          <Plate at={[79.0, 23.2]} text="" k={1} size={1.1} />
        </g>
      )) : null}
      <Plate at={[79.0, 23.2]} text="? ?" k={blank} size={1.2} />
      {sea ? <HighwaySign x={Math.max(300, sea[0])} y={Math.min(1180, sea[1])} k={sign} value={count} label="कोड" /> : null}
    </g>
  );
};

const PromiseBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const count = (p.beat.params as Params).fig?.count ?? "";
  const de = m.at("dekhiye", 6), ra = m.at("rajya", 20), pr = m.at("pradesh", 30), ap = m.at("apna", 40), co = m.at("code", 46), ku = m.at("kul", 60);
  // the union territories light up teal on "pradesh", then settle back
  const ut = m.lerp([pr, pr + 8], [0, 1]) * (1 - m.lerp([co, co + 12], [0, 0.7]));
  const UTS = ["Ladakh", "Jammu and Kashmir", "Delhi", "Andaman and Nicobar", "Lakshadweep", "Puducherry", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu"];
  const frame = lerpFrame(F.tel, F.india, m.lerp([de, de + 26], [0, 1]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.0 + m.lerp([de + 26, m.end], [0, 0.04])}>
        <MapView frame={frame} states={{ ...Object.fromEntries(UTS.map((u) => [u, { fill: "#2fb5a5", k: ut }])), [TEL]: { fill: "#ffc43d", k: 1 - 0.6 * m.lerp([de, de + 20], [0, 1]) } }}>
          <Over blank={m.pop(co, 10)} sign={m.lerp([ku - 2, ku + 14], [0, 1])} count={count} flash={m.pulse(ra + 2, 8)} fan={m.lerp([ap, ap + 10], [0, 1])} />
        </MapView>
      </View>
    </Stage>
  );
};

export default PromiseBeat;
