// Turn: "पर पहले पूरे भारत का तट गिना जाता था बस {old}। फिर इतना बढ़ा कैसे?" The map turns to an old yellowed atlas page on
// "पहले", the camera pulls back to all of India on "भारत", a ruler-straight line draws along the coast on "गिना", an old
// atlas sign drops in with the old length, shakes on "बढ़ा", and a question mark pops on "कैसे".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { Board, COAST, F, MapView, Question, Ruled, UTS, lerpFrame, painted } from "./props";

type Params = { fig?: { old?: string } };

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const old = (p.beat.params as Params).fig?.old ?? "";
  const pe = m.at("pehle", 2), bh = m.at("bharat", 12), gi = m.at("gina", 24), ba0 = m.at("bas", 40), ph = m.at("phir", 56), ba = m.at("badha", 66), ks = m.at("kaise", 72);
  const pan = m.lerp([ba0 + 16, ph + 10], [0, 1.6]);
  const base = lerpFrame(F.gujarat, F.peninsula, m.lerp([bh - 2, bh + 22], [0, 1]));
  const frame = { center: [base.center[0] - pan, base.center[1]] as [number, number], scale: base.scale };
  const sepia = m.lerp([pe, pe + 14], [0, 1]);
  const fade = 1 - 0.85 * sepia;
  const states: Record<string, StateFx> = painted([...COAST, ...UTS], fade);
  const shake = m.lerp([ba, ba + 14], [0, 1]) * (1 - m.lerp([ba + 14, ba + 24], [0, 1]));
  return (
    <Stage p={p} bg={sepia > 0.5 ? "#3b2a17" : "#123049"} vignette={0.45}>
      <View zoom={1.02 + m.wave(70, 0.01) - 0.02 * m.pulse(ks + 2, 6)}>
        <MapView frame={frame} states={states} sheet={sepia > 0.5 ? "#ead9b0" : undefined} dim={0.5 + 0.2 * sepia}>
          <SeaRipples t={m.t} k={1 - sepia} />
          <CoastSurf t={m.t} k={1 - sepia} />
          <rect x={-200} y={-200} width={1480} height={2320} fill="#a5783c" opacity={0.28 * sepia} data-probe="skip" />
          <Ruled k={m.lerp([gi, gi + 30], [0, 1])} width={9 + 4 * m.pulse(ph + 4, 8)} />
        </MapView>
        <Board x={540 + m.lerp([ba0 + 20, ph], [0, 30])} y={360} k={m.pop(ba0, 12)} title="पुरानी किताब में तट" value={old} bg="#7a4a1c" w={640} shake={shake} />
        <Question x={250} y={900} k={m.pop(ks, 10)} r={80} />
      </View>
    </Stage>
  );
};
export default Turn;
