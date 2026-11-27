// Loop: "पश्चिमी तट या पूर्वी तट, आपका स्टेट किस पर है? कमेंट कीजिए। पर सोचिए," Close on the southern tip; the camera pans
// to the west coast on "पश्चिमी" (its states lift, surf laps them), across to the east coast on "पूर्वी", pulls back to the
// peninsula on "आपका" with arrows to both coasts on "किस", a comment bubble pops on "कमेंट", and on "सोचिए" the colours
// fade back as the camera returns to the hook's India.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { Bubble, COAST, EAST, F, MapView, OnMap, UTS, WEST, lerpFrame, painted, type Frame } from "./props";

const Arrow: React.FC<{ x: number; y: number; k: number; dir: 1 | -1 }> = ({ x, y, k, dir }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * Math.min(1, k)} ${Math.min(1, k)})`} data-probe="skip">
      <path d="M 70 -22 L -10 -22 L -10 -54 L -80 0 L -10 54 L -10 22 L 70 22 Z" fill="#ffd84a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pw = m.at("pashchimi", 2), pv = m.at("purvi", 16), aa = m.at("aapka", 30), ki = m.at("kis", 40), co = m.at("comment", 52), so = m.at("sochiye", 72);
  const fade = 1 - 0.6 * m.lerp([so, m.end - 6], [0, 1]);
  const tip: Frame = { center: [77.6, 10.2], scale: F.south.scale * 1.35 };
  const west: Frame = { center: [74.4, 14.5], scale: F.south.scale * 1.2 };
  const east: Frame = { center: [81.6, 14.0], scale: F.south.scale * 1.2 };
  let frame = lerpFrame(tip, west, m.lerp([pw, pw + 14], [0, 1]));
  frame = lerpFrame(frame, east, m.lerp([pv, pv + 14], [0, 1]));
  frame = lerpFrame(frame, F.south, m.lerp([aa, aa + 16], [0, 1]));
  frame = lerpFrame(frame, F.india, m.lerp([so - 4, m.end - 4], [0, 1]));
  const lifted = (n: string) => (WEST.includes(n) ? m.lerp([pw, pw + 10], [0, 1]) * (1 - m.lerp([pv, pv + 10], [0, 1])) : EAST.includes(n) ? m.lerp([pv, pv + 10], [0, 1]) * (1 - m.lerp([aa, aa + 10], [0, 1])) : 0);
  const states: Record<string, StateFx> = {
    ...painted(UTS, fade),
    ...Object.fromEntries(COAST.map((s) => [s, { ...painted([s], fade)[s]!, lift: lifted(s) * fade }])),
  };
  const arrows = m.pop(ki, 10) * (1 - m.lerp([so, so + 10], [0, 1]));
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <MapView frame={frame} states={states}>
          <SeaRipples t={m.t} k={1} />
          <CoastSurf t={m.t} reach={70 + 30 * m.pulse(pw + 8, 14) + 30 * m.pulse(pv + 8, 14)} />
          <CoastLine k={fade} width={10} />
          <OnMap at={[71.8, 13.0]}>{(x, y) => <Arrow x={x} y={y} k={arrows} dir={1} />}</OnMap>
          <OnMap at={[83.6, 12.6]}>{(x, y) => <Arrow x={x} y={y} k={arrows} dir={-1} />}</OnMap>
          <OnMap at={[87.5, 15.5]}>{(x, y) => <Bubble x={Math.min(820, x)} y={Math.min(1150, y)} k={m.pop(co, 10) * fade} bounce={m.pulse(co + 16, 8)} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Loop;
