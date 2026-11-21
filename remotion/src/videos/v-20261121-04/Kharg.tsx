// "And the strangest part? Iran ships most of its own oil from inside the Gulf too." A question mark spins over Iran
// on "strangest"; Iran traces and fills on "Iran"; a tanker sets off from Kharg Island on "ships"; a pin drops on
// Kharg, deep inside the Gulf, as the camera closes in on "own"; the tanker's route runs to the barrier and stops on
// "inside"; Iran's own tanker bobs behind its own barrier on "Gulf".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, useAt } from "../../flat/map";
import { Barrier, DayBoard, Gulf, KHARG, QMark, Tanker } from "./props";

const ROUTE: [number, number][] = [KHARG, [51.5, 28.0], [53.5, 26.9], [55.6, 26.6], [56.15, 26.55]];

const Q: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([53.5, 30.5]);
  return xy ? <QMark x={xy[0]} y={xy[1]} k={k} t={t} size={180} /> : null;
};

const Kharg: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const st = m.at("strangest", 6), ir = m.at("iran", 22), sh = m.at("ships", 30), ow = m.at("own", 46), ins = m.at("inside", 62), gu = m.at("gulf", 76), kh = m.at("kharg", 96);
  const close = m.lerp([ow - 6, ow + 12], [0, 1]) * (1 - m.lerp([ins, ins + 14], [0, 1]));
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf center={[52.6 - 1.8 * close, 28.0 + 0.9 * close]} scale={4100 + 2600 * close}
          colors={{ Iran: { fill: "#239f40", trace: m.lerp([ir, ir + 24], [0, 1]), k: m.lerp([ir + 6, ir + 22], [0, 1]), flag: "Iran" } }}>
          <Barrier k={1} glow={m.lerp([ins, ins + 10], [0, 1])} />
          <Q k={m.pop(st, 10) * (1 - m.lerp([sh, sh + 10], [0, 1]))} t={m.t} />
          {m.t >= sh ? <MapRoute via={ROUTE} k={m.lerp([sh, ins + 6], [0.03, 1])} color="#f4efe4" width={8}
            mover={(x, y, a) => <Tanker x={x} y={y - 14} s={90} angle={a} t={m.t} barrels={1} />} /> : null}
          <MapPin at={KHARG} k={m.pop(ow, 11)} r={30} />
          <MapLabel at={[KHARG[0] - 0.2, KHARG[1] - 0.55]} text="KHARG ISLAND" size={54} type={m.lerp([kh, kh + 12], [0, 1])} />
          <MapLabel at={[54.5, 31.0]} text="IRAN" size={64} k={m.lerp([ir, ir + 10], [0, 1])} />
        </Gulf>
      </View>
      <DayBoard day={4} />
    </Stage>
  );
};

export default Kharg;
