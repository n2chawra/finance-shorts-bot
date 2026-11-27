// Vietnam: "पहले वियतनाम, {area}। राजस्थान उससे बड़ा।" Vietnam's outline in its flag flies in from the east and lies on
// Rajasthan at the same scale; a sign with its area pops up; the camera pushes in and a green tick stamps on Rajasthan.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { SeaRipples } from "../../flat/india";
import { Board, F, Laid, MapView, OnMap, Tick, lerpFrame, rj } from "./props";

type Params = { fig?: { area?: string } };

const Vietnam: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const area = (p.beat.params as Params).fig?.area ?? "";
  const pe = m.at("pehle", 4), vi = m.at("vietnam", 14), ra = m.at("rajasthan", 60), ba = m.at("bada", 70);
  const frame = lerpFrame(F.tall, F.nw, m.lerp([ra - 4, ra + 18], [0, 1]));
  return (
    <Stage p={p} bg="#2a1c12" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012) + 0.02 * m.lerp([vi + 20, ra], [0, 1])}>
        <MapView frame={frame} states={rj({ lift: 0.5, trace: m.pulse(ba + 4, 12) })}>
          <SeaRipples t={m.t} />
          <Laid name="Vietnam" k={m.lerp([pe, pe + 26], [0, 1])} fill="#da251d" flagK={0.72} />
          <OnMap at={[73.2, 26.8]}>{(x, y) => <Tick x={x} y={y} k={m.pop(ba, 10)} />}</OnMap>
        </MapView>
        <Board x={540} y={360} k={m.pop(vi, 12)} title="वियतनाम" value={area} bg="#b0201a" />
      </View>
    </Stage>
  );
};
export default Vietnam;
