// Odd: "कुछ कोड पहेली हैं: उत्तराखंड यू के, छत्तीसगढ़ सी जी, लद्दाख एल ए।" The map so far, wide over the north and the
// middle; on "पहेली" three blank plates wobble over three pale states; each state brushes in on its name and its plate
// flips to its letters; on "लद्दाख" the camera rises north.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import type { StateFx } from "../../flat/india";
import { CODES, COLOUR, F, MapView, ODD, OldPlates, doneBefore, lerpFrame, painted } from "./props";
import { FlipPlate, PLACE } from "./extra";

const Odd: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pa = m.at("paheli", 10), uk = m.at("uk", 30), cg = m.at("cg", 52), la = m.at("la", 76);
  const said: Record<string, number> = { Uttarakhand: uk, Chhattisgarh: cg, Ladakh: la };
  const start = lerpFrame(F.india, F.odd, 0.5);
  const frame = lerpFrame(lerpFrame(start, F.odd, m.lerp([0, la], [0, 0.12])), F.ladakh, m.lerp([la - 2, la + 26], [0, 0.9]));
  const before = doneBefore("odd");
  const states: Record<string, StateFx> = { ...painted(before) };
  for (const n of ODD) {
    const s = said[n]!;
    if (m.t >= s) states[n] = { fill: COLOUR[n]!, paint: m.lerp([s, s + 12], [0, 1]), lift: Math.min(m.lerp([s, s + 6], [0, 1]), 1 - m.lerp([s + 14, s + 30], [0, 0.8])) };
  }
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.lerp([0, m.end], [0, 0.04]) + m.wave(90, 0.008) + 0.025 * m.pulse(la + 4, 8)}>
        <MapView frame={frame} states={states}>
          <g data-probe="skip"><OldPlates names={before} /></g>
          {ODD.map((n, i) => {
            const s = said[n]!;
            const flip = m.lerp([s, s + 10], [0, 1]);
            return (
              <FlipPlate key={n} at={PLACE[n]!} from="?" to={CODES[n]!} k={m.pop(pa + i * 4, 9)} flip={flip} size={1}
                wob={(1 - flip) * m.wave(16, 7, i * 2) + m.wave(50, 1.5, i)} glow={m.pulse(s + 6, 12)} />
            );
          })}
        </MapView>
      </View>
    </Stage>
  );
};

export default Odd;
