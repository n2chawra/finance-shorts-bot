// Loop: "जर्मनी या राजस्थान, आप कहाँ घूमना चाहेंगे? कमेंट कीजिए। तो बताइए," Germany lifts off and floats up-left on
// "जर्मनी"; Rajasthan's desert glows and a camel crosses it on "राजस्थान"; the camera pulls wide and a plane flies between
// the two on "घूमना"; a comment bubble pops on "कमेंट"; on "बताइए" the camera settles back on Rajasthan and Germany slides to where the hook began.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { SeaRipples } from "../../flat/india";
import { Bubble, Camel, F, Laid, MapView, OnMap, lerpFrame, rj } from "./props";

const Plane: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`} data-probe="skip">
    <path d="M -50 0 L 40 -8 Q 60 0 40 8 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -4 L -20 -46 L -6 -46 L 20 -4 Z M 0 4 L -20 46 L -6 46 L 20 4 Z M -40 -2 L -54 -22 L -46 -22 L -32 -2 Z" fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ge = m.at("germany", 2), ra = m.at("rajasthan", 14), gh = m.at("ghoomna", 30), co = m.at("comment", 44), bt = m.at("batayiye", 60);
  const frame = lerpFrame(lerpFrame(F.rj, F.tall, m.lerp([gh - 4, gh + 18], [0, 1])), F.tall, m.lerp([bt - 4, m.end - 4], [0, 1]));
  const off = m.lerp([ge, ge + 20], [0, 1]), home = m.lerp([bt, m.end - 4], [0, 1]);
  const gdx = (1 - home) * -4.5 * off + home * 0.6, gdy = (1 - home) * 9.5 * off + home * -8.6;
  const fly = m.lerp([gh, co + 30], [0, 1]);
  return (
    <Stage p={p} bg="#2a1c12" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <MapView frame={frame} states={rj({ lift: 0.5 + 0.3 * m.pulse(ra + 4, 10), trace: m.lerp([bt, m.end - 4], [0, 0.15]) })}>
          <SeaRipples t={m.t} />
          <Laid name="Germany" k={1} fill="#dd0000" dx={gdx} dy={gdy} flagK={0.6 + 0.4 * off} />
          <OnMap at={[71.8 + m.lerp([ra, m.end], [0, 2.2]), 26.9]}>{(x, y) => m.t >= ra - 2 ? <Camel x={x} y={y} t={m.t} s={0.9} /> : null}</OnMap>
          <OnMap at={[73.8 - 3.5 * fly, 28.2 + 6.5 * fly]}>{(x, y) => fly > 0 && fly < 1 ? <Plane x={x} y={y} a={-58} /> : null}</OnMap>
          <OnMap at={[79.5, 23.5]}>{(x, y) => <Bubble x={Math.min(820, x)} y={Math.min(1150, y)} k={m.pop(co, 10) * (1 - m.lerp([bt, bt + 10], [0, 1]))} bounce={m.pulse(co + 16, 8)} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Loop;
