// "Day one: the tankers stop. Kuwait, Qatar and Bahrain are stuck behind the gate, and their ships have nowhere else
// to go." The whole Gulf: DAY ONE on the sign; tankers line up and halt with a jolt on "stop"; Kuwait, Qatar and
// Bahrain each trace and fill on their names; the barrier glows on "stuck"; the tankers turn on "ships" and bump
// into the barrier on "nowhere".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { BAHRAIN, Barrier, DayBoard, Fleet, Gulf, KUWAIT, Port, QATAR } from "./props";

const SPOTS: [number, number][] = [[49.2, 28.9], [50.6, 27.6], [52.4, 26.8], [53.8, 26.4], [55.2, 26.4], [51.9, 25.9]];

const Trapped: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dy = m.at("day", 2), tk = m.at("tankers", 14), st = m.at("stop", 22), ku = m.at("kuwait", 36), qa = m.at("qatar", 46), ba = m.at("bahrain", 56), sk = m.at("stuck", 68), sh = m.at("ships", 96), nw = m.at("nowhere", 110);
  const near = m.lerp([ku - 6, ku + 14], [0, 1]) * (1 - m.lerp([sk - 4, sk + 14], [0, 1]));
  const tr = (w: number) => m.lerp([w, w + 22], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf center={[51.6 - 0.8 * near, 27.0 + 0.4 * near]} scale={3600 + 900 * near}
          colors={{ Kuwait: { fill: "#4a8f5a", trace: tr(ku), k: tr(ku) }, Qatar: { fill: "#8a1538", trace: tr(qa), k: tr(qa) }, Bahrain: { fill: "#ce1126", trace: tr(ba), k: tr(ba) } }}>
          <Fleet spots={SPOTS} k={SPOTS.map((_, i) => m.pop(tk + i * 3, 12))} t={m.t * (m.t > st ? 0.2 : 1)} s={64} jolt={m.pulse(st + 3, 6) + m.pulse(nw + 4, 6)} />
          <Barrier k={1} glow={m.lerp([sk, sk + 10], [0, 1])} />
          <Port at={KUWAIT} name="KUWAIT" k={m.lerp([ku, ku + 10], [0, 1])} dy={-50} />
          <Port at={QATAR} name="QATAR" k={m.lerp([qa, qa + 10], [0, 1])} dx={10} dy={70} />
          <Port at={BAHRAIN} name="BAHRAIN" k={m.lerp([ba, ba + 10], [0, 1])} dx={-150} dy={0} />
          <MapLabel at={[56.9, 25.4]} text="HORMUZ" size={52} fill="#ffd84a" k={1 - near} />
        </Gulf>
      </View>
      <DayBoard day={1} flip={m.pop(dy, 10)} />
    </Stage>
  );
};

export default Trapped;
