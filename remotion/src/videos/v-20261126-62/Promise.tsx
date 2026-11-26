// Promise: "राजस्थान भारत का सबसे बड़ा स्टेट है, पूरे {area}।" The camera pulls back to all of India on "भारत"; every other
// state dims and Rajasthan glows on "सबसे"; a camel walks across the Thar; a stone milestone rises with the area on "पूरे".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { INK, STROKE, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { SeaRipples } from "../../flat/india";
import { Camel, F, MapView, OnMap, lerpFrame, rj } from "./props";

type Params = { fig?: { area?: string } };

const Milestone: React.FC<{ x: number; y: number; k: number; value: string }> = ({ x, y, k, value }) => {
  if (k <= 0) return null;
  const up = (1 - Math.min(1, k)) * 220;
  const size = Math.min(70, 520 / Math.max(1, value.length * 0.6));
  return (
    <g transform={`translate(${x} ${y + up})`} opacity={Math.min(1, k * 2)}>
      <ellipse cx={0} cy={6} rx={300} ry={24} fill={INK} opacity={0.3} />
      <path d="M -280 0 L -280 -230 Q -280 -330 0 -330 Q 280 -330 280 -230 L 280 0 Z" fill="#f4efe4" stroke={INK} strokeWidth={STROKE} />
      <path d="M -280 -230 Q -280 -330 0 -330 Q 280 -330 280 -230 Z" fill="#f2a93b" stroke={INK} strokeWidth={STROKE} />
      <Txt x={0} y={-262} size={50} fill={INK} weight={800}>राजस्थान</Txt>
      <Txt x={0} y={-110} size={size} fill={INK} weight={900}>{value}</Txt>
    </g>
  );
};

const PromiseBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const area = (p.beat.params as Params).fig?.area ?? "";
  const bh = m.at("bharat", 6), sb = m.at("sabse", 16), st = m.at("state", 24), po = m.at("poore", 34);
  const frame = lerpFrame(F.rj, F.india, m.lerp([bh - 2, bh + 22], [0, 1]) * (1 - 0.45 * m.lerp([po - 4, po + 18], [0, 1])));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a1c12" vignette={0.3}>
        <View zoom={1.02 + m.wave(80, 0.01)}>
          <MapView frame={frame} dim={0.5} sheet={m.lerp([sb, sb + 10], [0, 1]) > 0.5 ? "#d9d2c3" : undefined}
            states={rj({ lift: m.lerp([sb, sb + 12], [0, 1]), trace: m.lerp([sb, sb + 20], [0, 1]) })}>
            <SeaRipples t={m.t} />
            <OnMap at={[71.6 + m.lerp([st, m.end], [0, 2.4]), 27.2]}>{(x, y) => m.t >= st - 4 ? <Camel x={x} y={y} t={m.t} s={0.9} /> : null}</OnMap>
          </MapView>
          <Milestone x={540} y={1240} k={m.pop(po, 12)} value={area} />
        </View>
      </Stage>
      <SourceLine p={p} y={190} />
    </AbsoluteFill>
  );
};
export default PromiseBeat;
