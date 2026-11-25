// Turn: "इन इलाकों के लोग बरसों से अपना अलग स्टेट माँग रहे थे। पर स्टेट नंबर {fact3} का नाम कुछ और था।" Wide on the three
// new states; they glow on "इलाकों"; small people with placards pop up on each on "लोग" and wave them on "बरसों"; the
// placards flip to a little new-state map on "माँग"; on "पर" the camera dives to the hills as the others dim; the
// number badge pulses on "नाम"; a big red question mark stamps on its name tag on "और".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { StateTag, type StateFx } from "../../flat/india";
import { AT, BI, Badge, CG, F, JH, MP, MapView, Marcher, NEW, OLD, OnMap, Question, UK, UP, lerpFrame } from "./props";

type Params = { fig?: { rank?: string } };
const SPOTS: Record<string, [number, number][]> = {
  [CG]: [[81.4, 21.9], [82.4, 21.0], [82.9, 22.3]], [UK]: [[78.6, 30.0], [79.6, 29.7], [79.3, 30.6]], [JH]: [[84.6, 23.6], [85.6, 23.2], [86.3, 24.0]],
};
const SHIRTS = ["#e8453c", "#3d8bd9", "#ffc43d"];

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const rank = (p.beat.params as Params).fig?.rank ?? "";
  const il = m.at("ilakon", 2), lo = m.at("log", 10), ba = m.at("barson", 20), mg = m.at("maang", 36), pa = m.at("par", 54), na = m.at("naam", 74), au = m.at("aur", 84);
  const dive = m.lerp([pa, pa + 24], [0, 1]);
  const frame = lerpFrame(F.heart, F.uk, dive);
  const dimOthers = 1 - 0.6 * dive;
  const glow = 0.3 + 0.6 * m.pulse(il + 8, 12);
  const states: Record<string, StateFx> = {
    [MP]: { fill: OLD[MP]!, k: dimOthers }, [UP]: { fill: OLD[UP]!, k: dimOthers }, [BI]: { fill: OLD[BI]!, k: dimOthers },
    [CG]: { fill: NEW[CG]!, lift: glow, k: dimOthers }, [JH]: { fill: NEW[JH]!, lift: glow, k: dimOthers }, [UK]: { fill: NEW[UK]!, lift: glow + 0.3 * dive },
  };
  const wave = m.lerp([ba, ba + 30], [0, 1]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3 + 0.1 * dive}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(au + 3, 7)}>
        <MapView frame={frame} states={states} dim={0.5 + 0.1 * dive}>
          <g data-probe="skip" opacity={1 - 0.8 * dive}>
            {Object.entries(SPOTS).flatMap(([st, spots], j) => spots.map((ll, i) => (
              <OnMap key={`${st}${i}`} at={ll}>{(x, y) => (
                <Marcher x={x} y={y} s={62} shirt={SHIRTS[(i + j) % 3]!} t={m.t * (0.3 + wave)} k={m.pop(lo + i * 3 + j * 2, 12)} phase={i * 1.7 + j} card={m.t >= mg + i * 2 ? NEW[st]! : "#ffffff"} />
              )}</OnMap>
            )))}
          </g>
          {dive > 0.3 ? <Badge at={[79.6, 29.0]} k={1} top="स्टेट नंबर" value={rank} glow={m.pulse(na + 6, 12)} dy={170} /> : null}
          {dive > 0.3 ? <StateTag state={UK} text="?" k={1} size={52} dy={-150} /> : null}
          {dive > 0.3 ? <OnMap at={AT[UK]!}>{(x, y) => <Question x={Math.min(x + 170, 820)} y={y - 220} k={m.pop(au, 10)} r={90} />}</OnMap> : null}
        </MapView>
      </View>
    </Stage>
  );
};

export default Turn;
