// Turn: "पर अब बारी जर्मनी की। क्या राजस्थान इसे भी पीछे छोड़ देगा?" The light drops to dusk on "अब", Finland slides away
// on "बारी", Germany's black-red-gold outline lowers over Rajasthan on "जर्मनी", a question mark pops on "क्या", the camera
// pushes in on the edges on "पीछे" and Germany wobbles just above Rajasthan on "छोड़".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { SeaRipples } from "../../flat/india";
import { F, Laid, MapView, Question, lerpFrame, rj } from "./props";

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ab = m.at("ab", 4), ba = m.at("bari", 10), ge = m.at("germany", 18), ky = m.at("kya", 36), pe = m.at("peeche", 50), ch = m.at("chhod", 56);
  const frame = lerpFrame(lerpFrame(F.rj, F.tall, m.lerp([ge - 4, ge + 16], [0, 1])), F.rj, m.lerp([pe - 2, pe + 16], [0, 0.7]));
  const dusk = m.lerp([ab, ab + 12], [0, 1]);
  const lower = m.lerp([ge, ge + 22], [0, 1]);
  const wob = Math.sin(m.t / 4) * 0.25 * m.lerp([ch, ch + 6], [0, 1]);
  return (
    <Stage p={p} bg="#1a1222" vignette={0.3 + 0.2 * dusk}>
      <View zoom={1.02 + m.wave(70, 0.012) - 0.02 * m.pulse(ky + 2, 6)}>
        <MapView frame={frame} states={rj({ lift: 0.5, trace: m.pulse(pe + 4, 14) })} dim={0.5 + 0.15 * dusk}>
          <SeaRipples t={m.t} />
          <Laid name="Finland" k={1 - m.lerp([ba, ba + 12], [0, 1])} fill="#ffffff" flagK={0.8} />
          <Laid name="Germany" k={0.55 + 0.45 * lower} fill="#dd0000" dy={1.2 + wob} flagK={0.85 * m.lerp([ge - 6, ge + 4], [0, 1])} />
          <rect x={-200} y={-200} width={1480} height={2320} fill="#2a1450" opacity={0.18 * dusk} data-probe="skip" />
        </MapView>
        <Question x={830} y={430} k={m.pop(ky, 10)} r={80} />
      </View>
    </Stage>
  );
};
export default Turn;
