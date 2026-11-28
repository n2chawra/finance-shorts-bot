// Turn: "पर एक स्टेट इन दोनों से आगे है, उत्तर प्रदेश!" The camera swings back west over India; a spotlight sweeps the north
// on "एक"; Maharashtra and Assam dim on "दोनों"; a question mark hovers on "आगे"; Uttar Pradesh lifts off the map in gold on
// "उत्तर" as the camera pushes in, and its name tag stamps on "प्रदेश".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { StateTag } from "../../flat/india";
import { AS, F, GOLD, MH, MID, MapView, OnMap, Question, lerpFrame } from "./props";

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ek = m.at("ek", 6), dn = m.at("donon", 16), aa = m.at("aage", 26), ut = m.at("uttar", 36), pr = m.at("pradesh", 44);
  const frame = m.t < ut ? lerpFrame(F.assam, F.india, m.lerp([0, 20], [0, 1])) : lerpFrame(F.india, F.north, m.lerp([ut - 2, ut + 20], [0, 1]));
  const dim = m.lerp([dn, dn + 10], [1, 0.35]);
  const up = m.lerp([ut - 2, ut + 10], [0, 1]);
  const sweep = m.lerp([ek, ut], [70, 88]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.35}>
      <View zoom={1.02 + m.wave(70, 0.01) + 0.03 * m.pulse(pr + 2, 6)}>
        <MapView frame={frame} states={{
          Maharashtra: { fill: MH, k: dim }, Assam: { fill: AS, k: dim },
          ...(up > 0 ? { "Uttar Pradesh": { fill: GOLD, paint: up, lift: 0.7 * up, trace: m.lerp([ut, ut + 24], [0, 1]) } } : {}),
        }}>
          <OnMap ll={[sweep, 27]}>{(x, y) => (m.t >= ek && m.t < ut + 10 ? <Glow x={x} y={y} r={260} color="#fff3b0" o={0.5} /> : null)}</OnMap>
          <OnMap ll={MID["Uttar Pradesh"]!}>{(x, y) => <Question x={Math.min(x, 820)} y={y - 220} k={m.pop(aa, 10) * m.lerp([ut, ut + 8], [1, 0])} r={90} />}</OnMap>
          <StateTag state="Uttar Pradesh" text="उत्तर प्रदेश" k={m.pop(pr, 12)} size={64} dy={-40} bg="#fff2a8" />
        </MapView>
      </View>
    </Stage>
  );
};
export default Turn;
