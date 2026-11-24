// Loop: "पुरानी गाड़ियाँ आज भी टी एस हैं। आपकी गाड़ी पर कौन-सा कोड है? और तेलंगाना की" Close on Telangana, an old TS car
// parked above the new TG car; on "आपकी" the camera pulls back to all of India as every other state brushes in with its
// plate; on "कौन-सा" a comment bubble pops over the map; on "और" the camera glides back to the hook's framing and the
// other states fade to pale, leaving Telangana yellow with its plate (the hook's first frame).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import type { StateFx } from "../../flat/india";
import { CODES, COLOUR, Car, F, MapView, Plate, TEL, doneBefore, lerpFrame, type LL } from "./props";
import { Bubble, HOOK_START, TEL_C, WIDE } from "./extra";

/** States too small (or too crowded) at the wide shot to carry a plate of their own. */
const NO_PLATE = new Set(["Chandigarh", "Delhi", "Puducherry", "Lakshadweep", "Andaman and Nicobar", "Dadra and Nagar Haveli and Daman and Diu",
  "Goa", "Sikkim", "Haryana", "Himachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya"]);
/** Plates moved off a crowded middle. */
const PLATE_AT: Record<string, LL> = { "Andhra Pradesh": [80.1, 15.3] };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pu = m.at("purani", 3), aj = m.at("aaj", 26), ap = m.at("aapki", 48), ka = m.at("kaun", 66), au = m.at("aur", 100);
  const hai = m.at("hain", 38), ko = m.at("kod", 80);
  const pull = m.lerp([ap, ap + 30], [0, 1]);
  const back = m.lerp([au, Math.max(au + 8, m.end - 2)], [0, 1]);
  const frame = lerpFrame(lerpFrame(F.tel, WIDE, pull), HOOK_START, back);
  const before = doneBefore("loop");
  const others = Object.keys(CODES).filter((n) => n !== TEL && !before.includes(n));
  const all = [...before, ...others];
  const delay = (n: string) => (others.includes(n) ? Math.round((others.indexOf(n) / Math.max(1, others.length - 1)) * 20) : 0);
  const states: Record<string, StateFx> = { [TEL]: { fill: "#ffc43d", lift: 0.4 } };
  for (const n of before) states[n] = { fill: COLOUR[n]!, k: 1 - back };
  for (const n of others) if (m.t >= ap + delay(n)) states[n] = { fill: COLOUR[n]!, paint: m.lerp([ap + delay(n), ap + delay(n) + 10], [0, 1]), k: 1 - back };
  const cars = 1 - m.lerp([ap, ap + 12], [0, 1]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.008) + m.lerp([0, ap], [0, 0.03]) - 0.03 * pull + 0.02 * m.pulse(ka + 2, 7) + 0.025 * m.pulse(hai + 2, 8) + 0.02 * m.pulse(ko + 2, 8)}>
        <MapView frame={frame} states={states} dim={0.45 + 0.05 * back}>
          <g data-probe="skip" opacity={1 - back}>
            {all.filter((n) => !NO_PLATE.has(n)).map((n) => (
              <Plate key={n} state={PLATE_AT[n] ? undefined : n} at={PLATE_AT[n]} text={CODES[n]!} size={0.5} k={m.pop(ap + 4 + delay(n), 12)} />
            ))}
          </g>
          <Plate at={TEL_C} text={CODES[TEL]!} size={0.95 + 0.3 * back} dy={-40 * back} k={m.pop(ap + 6, 12)} glow={m.pulse(au + 10, 14)} />
        </MapView>
        {cars > 0 ? (
          <g opacity={cars} transform={`translate(540 960) scale(${1 - 0.4 * (1 - cars)}) translate(-540 -960)`}>
            <Car x={560} y={860 - 24 * m.pulse(aj + 4, 6) + m.wave(40, 3)} s={460} color="#9a8f7e" t={m.t} code="TS" />
            <Car x={520 + m.lerp([pu, pu + 20], [60, 0])} y={1250} s={460} color="#e8453c" t={m.t + 11} code="TG" />
          </g>
        ) : null}
      </View>
      <Bubble x={470} y={330} w={620} h={150} k={m.pop(ka, 10) * (1 + 0.12 * m.pulse(ko + 1, 8))} text="आपका कोड?" size={60} o={1 - m.lerp([au, au + 10], [0, 1])} />
    </Stage>
  );
};

export default Loop;
