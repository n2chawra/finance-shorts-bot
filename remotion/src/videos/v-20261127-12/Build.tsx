// "So build it: one span from Russia to Big Diomede, a short hop to Little Diomede, and one more to Alaska." A crane
// swings up on Russia's shore; the first span runs out over the water from Russia's coast and lands on Big Diomede;
// close on the islands a short span hops the channel to Little Diomede; the camera pulls back as the last span runs
// east to Alaska and the whole bridge lights up.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { SideNames, BMap, BRIDGE, Bridge, DEZHNEV, Diomedes, Planted, SEA_STRAIT, STRAIT, Waves, between, fracAt, mix, type LL , Floes } from "./props";

const Crane: React.FC<{ k: number; swing: number }> = ({ k, swing }) => {
  const xy = useAt()(DEZHNEV);
  if (!xy || k <= 0) return null;
  const x = xy[0] - 70, y = xy[1] + 10, h = 260 * Math.min(1, k);
  const a = (-30 + 40 * swing) * (Math.PI / 180);
  const tip: [number, number] = [x + Math.cos(a) * 220, y - h + Math.sin(a) * 220];
  return (
    <g>
      <Block x={x - 14} y={y - h} w={28} h={h} fill="#f2b134" r={3} sw={3} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x - 14} y1={y - (h * i) / 6} x2={x + 14} y2={y - (h * (i + 1)) / 6} stroke={INK} strokeWidth={2} />)}
      <Limb a={[x, y - h]} b={tip} w={14} color="#f2b134" sw={3} />
      <line x1={tip[0]} y1={tip[1]} x2={tip[0]} y2={tip[1] + 70} stroke={INK} strokeWidth={3} />
      <Block x={tip[0] - 14} y={tip[1] + 70} w={28} h={18} fill="#7d828c" r={2} sw={2} />
    </g>
  );
};

const Build: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const bu = m.at("build", 2), sp = m.at("span", 18), ru = m.at("russia", 26), bi = m.at("big", 40), ho = m.at("hop", 60), li = m.at("little", 74), mo = m.at("more", 92), al = m.at("alaska", 106), th = m.at("three", 124), jo = m.at("joined", 150);
  const k1 = fracAt(BRIDGE, 1), k3 = fracAt(BRIDGE, 3);
  const k = m.t < bi ? mix(0, k1, m.lerp([sp, bi], [0, 1])) : m.t < li ? mix(k1, k3, m.lerp([ho - 4, li], [0, 1])) : mix(k3, 1, m.lerp([mo, al], [0, 1]));
  const isles = { center: [-169.02, 65.79] as LL, scale: 45000 };
  const a = between(STRAIT, isles, m.lerp([ho - 10, ho + 14], [0, 1]));
  const cam = between(a, { center: [-168.9, 65.88], scale: 14000 }, m.lerp([mo, al + 10], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <BMap center={cam.center} scale={cam.scale} colors={{ Russia: { fill: "#e6a39a", k: m.lerp([jo, jo + 12], [0, 0.8]) }, "United States of America": { fill: "#a8c0e0", k: m.lerp([jo, jo + 12], [0, 0.8]) } }}>
          <Floes t={m.t} size={36} />
          <SideNames />
          <Waves pts={SEA_STRAIT} t={m.t} />
          <Diomedes t={m.t} />
          <Planted at={[-170.15, 66.28]} name="Russia" k={1} dx={-60} s={120} />
          <Planted at={[-168.0, 65.72]} name="United States of America" k={1} s={120} dx={-150} />
          <Crane k={m.lerp([bu, bu + 14], [0, 1])} swing={m.lerp([bu + 6, ru + 10], [0, 1])} />
          <Bridge k={k} glow={m.lerp([al, al + 14], [0, 0.6]) + 0.6 * m.pulse(bi, 10) + 0.6 * m.pulse(li, 10) + 0.8 * m.pulse(th, 8) + 0.8 * m.pulse(th + 8, 8) + 0.8 * m.pulse(th + 16, 8)} />
        </BMap>
      </View>
    </Stage>
  );
};
export default Build;
