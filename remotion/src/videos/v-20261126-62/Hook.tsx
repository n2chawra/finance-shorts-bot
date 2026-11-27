// Hook: "राजस्थान बड़ा है या जर्मनी?" Rajasthan lit in sand on India's map at frame 0; it traces gold and lifts on
// "राजस्थान", swells on "बड़ा", a VS badge stamps on "या", and Germany's flag-filled outline slides in beside it at the
// same scale on "जर्मनी" (laid just south of it, over Gujarat and Maharashtra).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { SeaRipples } from "../../flat/india";
import { F, Laid, MapView, OnMap, lerpFrame, rj } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ra = m.at("rajasthan", 2), ba = m.at("bada", 12), ya = m.at("ya", 20), ge = m.at("germany", 26);
  const frame = lerpFrame(F.tall, F.nw, m.lerp([ge - 4, ge + 20], [0, 0.35]));
  const vs = m.pop(ya, 10);
  return (
    <Stage p={p} bg="#2a1c12" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ba + 3, 6)}>
        <MapView frame={frame} states={rj({ trace: m.lerp([ra, ra + 24], [0.15, 1]), lift: 0.5 + 0.4 * m.pulse(ba + 3, 8) })}>
          <SeaRipples t={m.t} />
          <Laid name="Germany" k={0.93 + 0.07 * m.lerp([ge, ge + 18], [0, 1])} fill="#dd0000" dx={0.6} dy={-8.6} flagK={m.lerp([ge - 10, ge + 6], [0.5, 1])} />
          <OnMap at={[71.0, 22.4]}>{(x, y) => vs > 0 ? (
            <g transform={`translate(${x} ${y}) scale(${1.5 - 0.5 * Math.min(1, vs)})`} opacity={Math.min(1, vs * 2)}>
              <circle r={70} fill="#ffd84a" stroke={INK} strokeWidth={8} />
              <Txt x={0} y={4} size={64} fill={INK} weight={900}>VS</Txt>
            </g>
          ) : null}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Hook;
