// "Bridge or tunnel: which would you build? Either way, you could drive from Russia to Alaska." Over the strait the
// bridge lights up, the dashed tunnel glows under the water, a question mark swings between them; both fade back as
// the camera returns to the hook's view, the car rolls up to the tip of Russia beside its road sign, and Russia's and
// Alaska's coasts light as the frame settles where the video began.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { SideNames, BMap, Bridge, Car, DEZHNEV, Diomedes, HOOK_VIEW, PRINCE, Planted, QMark, RoadSign, SEA_STRAIT, STRAIT, Waves, between, mix , Floes } from "./props";

const Tunnel: React.FC<{ o: number }> = ({ o }) => {
  const at = useAt();
  const a = at([DEZHNEV[0] - 0.25, DEZHNEV[1] - 0.12]), b = at([PRINCE[0] + 0.3, PRINCE[1] - 0.05]);
  if (!a || !b || o <= 0) return null;
  const d = `M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2},${Math.max(a[1], b[1]) + 160} ${b[0]},${b[1]}`;
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#f2b134" strokeWidth={14} strokeDasharray="26 16" strokeLinecap="round" />
    </g>
  );
};

const Swing: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-168.9, 65.5]);
  return xy ? <QMark x={xy[0] + Math.sin(t / 8) * 90} y={xy[1] + 60} size={140} k={k} t={t} /> : null;
};

const AtCape: React.FC<{ roll: number; t: number; k: number }> = ({ roll, t, k }) => {
  const xy = useAt()(DEZHNEV);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={k}>
      <RoadSign x={Math.max(230, xy[0] + 40)} y={xy[1] - 30} text="TO ALASKA" k={1} />
      <Car x={mix(xy[0] - 260, xy[0] - 183, roll)} y={xy[1] + 40} s={120} bump={roll < 1 ? Math.sin(t / 3) : 0} />
    </g>
  );
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const br = m.at("bridge", 2), tu = m.at("tunnel", 16), bu = m.at("build", 30), ei = m.at("either", 44), dr = m.at("drive", 60), ru = m.at("russia", 74), al = m.at("alaska", 86);
  const back = m.lerp([ei, dr + 10], [0, 1]);
  const cam = between(STRAIT, HOOK_VIEW, back);
  const fade = 1 - m.lerp([ei, ei + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.02 * back + m.wave(90, 0.008)}>
        <BMap center={cam.center} scale={cam.scale} colors={{
          Russia: { fill: "#e6a39a", k: m.lerp([ru, ru + 10], [0, 0.6]) },
          "United States of America": { fill: "#a8c0e0", k: m.lerp([al, al + 10], [0, 0.6]) },
        }}>
          <Floes t={m.t} size={34} />
          <SideNames />
          <Waves pts={SEA_STRAIT} t={m.t} />
          <Diomedes t={m.t} />
          <Tunnel o={m.lerp([tu, tu + 10], [0, 1]) * fade} />
          <g opacity={fade}><Bridge k={1} glow={m.pulse(br, 20)} w={16} /></g>
          <Swing k={m.pop(bu) * fade} t={m.t} />
          <Planted at={[-170.15, 66.28]} name="Russia" k={1} dx={-60} />
          <Planted at={[-168.0, 65.72]} name="United States of America" k={1} dx={-150} />
          <AtCape roll={m.lerp([dr, m.end], [0, 1])} t={m.t} k={m.lerp([dr - 6, dr + 6], [0, 1])} />
        </BMap>
      </View>
    </Stage>
  );
};
export default Loop;
