// "At Hope Bay, on the very tip, Argentine soldiers even fire shots over a British team's heads." Close on the tip
// of the peninsula under its three striped slices; HOPE BAY writes on with a pin; a British hut and its small team
// stand on the shore; Argentine soldiers stand up the slope; on "fire" muzzle flashes and tracer lines streak high
// over the team's heads and they duck; the camera holds close and drifts.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Flash, INK, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapPin, useAt } from "../../flat/map";
import { AntMap, Floes, Name, SEA, Slices } from "./props";
import { PlantedFlag } from "../../flat/polar";

const HOPE: [number, number] = [-56.98, -63.4];

const Scene: React.FC<{ m: ReturnType<typeof motion> }> = ({ m }) => {
  const xy = useAt()(HOPE);
  if (!xy) return null;
  const [x, y] = xy;
  const so = m.at("soldiers", 30), fi = m.at("fire", 46), ov = m.at("over", 58), he = m.at("heads", 70);
  const duck = m.lerp([fi + 4, fi + 10], [0, 1]);
  const tr = (i: number) => m.lerp([fi + i * 5, fi + i * 5 + 10], [0, 1]);
  const bx = x - 40, by = y + 210, sx = x + 250, sy = y - 60;
  return (
    <g>
      <Block x={bx - 200} y={by - 110} w={150} h={100} fill="#c94a3a" r={6} />
      <path d={`M ${bx - 214} ${by - 108} L ${bx - 125} ${by - 170} L ${bx - 36} ${by - 108} Z`} fill="#7a3b2e" stroke={INK} strokeWidth={5} />
      <PlantedFlag at={HOPE} name="United Kingdom" dx={-170} dy={100} s={0.7} t={m.t} />
      {[0, 1, 2].map((i) => <Char key={i} x={bx + i * 70} y={by} s={70 - 18 * duck} face={duck > 0.5 ? "shock" : "neutral"} outfit="tee" top="#2b5cb8" armL={[12 + 150 * duck, 20]} armR={[12 + 150 * duck, 20]} />)}
      {[0, 1].map((i) => <Char key={`s${i}`} x={sx + i * 80} y={sy + i * 20} s={70 * Math.min(1, m.pop(so + i * 4))} outfit="tee" top="#6d7a3a" face="angry" armR={[80, 90]} />)}
      <PlantedFlag at={HOPE} name="Argentina" dx={380} dy={-60} s={0.7} t={m.t} k={m.pop(so)} />
      {[0, 1, 2].map((i) => {
        const k = tr(i);
        if (k <= 0 || k >= 1) return null;
        const x0 = sx - 20, y0 = sy - 150, x1 = bx - 300, y1 = by - 420 - i * 40;
        return <line key={`t${i}`} x1={x0 + (x1 - x0) * Math.max(0, k - 0.3)} y1={y0 + (y1 - y0) * Math.max(0, k - 0.3)} x2={x0 + (x1 - x0) * k} y2={y0 + (y1 - y0) * k} stroke="#ffd84a" strokeWidth={10} strokeLinecap="round" />;
      })}
      {m.pulse(fi + 2, 4) + m.pulse(fi + 7, 4) + m.pulse(fi + 12, 4) > 0 ? <circle cx={sx - 20} cy={sy - 150} r={40} fill="#ffe27a" opacity={0.9} /> : null}
      {void ov}{void he}
    </g>
  );
};

const Shots: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ho = m.at("hope", 2), ti = m.at("tip", 16);
  const cam = { center: [-57.6 + 0.4 * m.lerp([0, m.end], [0, 1]), -63.5] as [number, number], scale: 9000 };
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + 0.05 * m.lerp([ti, ti + 20], [0, 1]) + m.wave(80, 0.01)} cy={980}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={90} lat={-63.6} />
          <Slices s={{ uk: { k: 1, stripes: true }, chile: { k: 1, stripes: true }, arg: { k: 1, stripes: true } }} />
          <MapPin at={[-56.98, -63.4]} k={m.pop(ho)} r={26} />
          <Name at={[-57.3, -63.05]} text="HOPE BAY" size={60} dy={-170} type={m.lerp([ho, ho + 14], [0, 1])} />
          <Scene m={m} />
        </AntMap>
      </View>
      <Flash k={m.pulse(m.at("fire", 46) + 3, 5) * 0.2} />
    </Stage>
  );
};
export default Shots;
