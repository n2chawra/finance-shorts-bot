// "Senegal is its only neighbour, and their border winds on for {fact3}, through villages, farms and
// forest." Close on the map at a crossing on the border: the guard lifts the barrier on "Senegal", a small
// minibus crosses on "neighbour", the border starts drawing itself on "border"; on "winds" the camera pulls
// back as the line runs right round the strip and its length lands on a tag; huts pop up along it on
// "villages", baobabs on "forest".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapRoute } from "../../flat/map";
import { At, Baobab, BorderPost, BorderTrace, GREEN, GeoMap, Hut, RED, RIVER } from "./props";

type Params = { fig?: { len?: string } };

const POST: [number, number] = [-15.62, 13.8];
const HUTS: [number, number][] = [[-16.2, 13.72], [-15.0, 13.85], [-14.3, 13.88], [-14.6, 13.25], [-15.6, 13.15]];
const TREES: [number, number][] = [[-15.85, 13.9], [-14.85, 13.95], [-14.0, 13.75], [-15.3, 13.12], [-14.2, 13.2]];

const BorderLine: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.len ?? "";
  const sen = m.at("senegal", 6), nb = m.at("neighbour", 30), border = m.at("border", 50), winds = m.at("winds", 64), vil = m.at("villages", 100), forest = m.at("forest", 120);
  const out = m.lerp([winds, winds + 24], [0, 1]);
  const scale = 20000 - 11000 * out;
  const center: [number, number] = [-15.62 + 0.5 * out, 13.72 + 0.12 * out];
  const trace = m.lerp([border, winds + 40], [0, 1]);
  const lift = m.lerp([sen, sen + 12], [0, 1]);
  const bus = m.lerp([nb - 4, nb + 40], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <GeoMap center={center} scale={scale} colors={{ Gambia: { fill: RED }, Senegal: { fill: GREEN } }}>
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={9} dash={false} />
          <BorderTrace name="Gambia" k={trace} width={8} />
          <At at={POST}>{(x, y) => (
            <g>
              <BorderPost x={x} y={y} s={190 - 110 * out} lift={lift} />
              <Char x={x - 95 + 60 * out} y={y + 4} s={88 - 50 * out} skin="#6e4630" top="#5d6b3a" pants="#5d6b3a" outfit="shirt" hair="cap" hairColor="#3a4a2a"
                face="neutral" armR={[m.lerp([sen, sen + 12], [20, 150]), 20]} armL={[20, -20]} />
              {bus > 0 && bus < 1 ? <g transform={`translate(${x - 30 + (1 - out) * 0} ${y + 40 - bus * 220})`}>
                <Block x={-34} y={-30} w={68} h={60} r={10} fill="#ffc43d" sw={4} />
                <Block x={-26} y={-24} w={52} h={18} fill="#8ec5e0" shadow={false} sw={3} />
                <Ball x={-22} y={32} r={9} fill="#2f3445" shadow={false} />
                <Ball x={22} y={32} r={9} fill="#2f3445" shadow={false} />
              </g> : null}
            </g>
          )}</At>
          {HUTS.map((h, i) => <At key={i} at={h}>{(x, y) => { const k = m.pop(vil + i * 3, 12); return k > 0.01 ? <Hut x={x} y={y} s={60 * k} /> : null; }}</At>)}
          {TREES.map((h, i) => <At key={`t${i}`} at={h}>{(x, y) => { const k = m.pop(forest + i * 2, 12); return k > 0.01 ? <Baobab x={x} y={y} s={45 * k} /> : null; }}</At>)}
          <At at={[-14.9, 14.35]}>{(x, y) => <Tag x={x - 170} y={y - 260} w={340} h={110} text={len} k={m.pop(winds + 10, 12)} rot={-2} />}</At>
        </GeoMap>
      </View>
    </Stage>
  );
};

export default BorderLine;
