// Wind: "Most days, Britain's wind blows in from the west, off the Atlantic, right across the country." The camera
// pulls out over the Atlantic west of Britain; on "days" a weathervane rises on the sea and spins; on "wind" long
// arrows sweep in from the ocean; on "west" the vane points west and WEST WIND writes on; on "Atlantic" ATLANTIC
// OCEAN writes across the sea; on "across" the arrows run right over Britain to the North Sea.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Britain, GOLD, WindArrow } from "./props";

const Vane: React.FC<{ x: number; y: number; k: number; spin: number; west: number }> = ({ x, y, k, spin, west }) => {
  if (k <= 0) return null;
  const a = west >= 1 ? 180 : (spin * 12) % 360 * (1 - west) + 180 * west;
  return (
    <g transform={`translate(${x} ${y + (1 - Math.min(1, k)) * 200})`}>
      <Limb a={[0, 0]} b={[0, -230]} w={12} color="#4a3218" />
      <circle cx={0} cy={-150} r={10} fill={INK} />
      <Txt x={-70} y={-150} size={44} fill="#ffffff" stroke={INK}>W</Txt>
      <Txt x={70} y={-150} size={44} fill="#ffffff" stroke={INK}>E</Txt>
      <g transform={`translate(0 -230) scale(${Math.cos((a * Math.PI) / 180)} 1)`}>
        <path d="M -90 0 L 70 0 M 70 0 l -24 -16 M 70 0 l -24 16 M -90 0 l -18 -26 l 40 26 l -40 26 Z" stroke={INK} strokeWidth={9} fill={GOLD} strokeLinecap="round" />
      </g>
    </g>
  );
};

const Wind: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mo = m.at("most", 2), da = m.at("days", 10), wi = m.at("wind", 20), we = m.at("west", 40), at = m.at("atlantic", 56), ac = m.at("across", 76), nt = m.at("north", 96);
  const out = m.lerp([mo, mo + 22], [0, 1]);
  const run = m.lerp([ac, ac + 20], [0, 1]);
  const ak = 0.5 + 0.5 * m.lerp([wi, wi + 10], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={1.0 + 0.1 * m.lerp([we, we + 12], [0, 1]) * (1 - run) + m.wave(90, 0.008)}>
        <Britain center={[-3.5 - 5 * out + 3 * run, 54.0]} scale={5000 - 2400 * out} uk={1} trace={m.lerp([ac, ac + 24], [0, 1])}>
          <MapLabel at={[-11.5, 50.2]} text="ATLANTIC OCEAN" size={54} fill="#ffffff" type={m.lerp([at, at + 18], [0, 1])} />
          <MapLabel at={[3.2, 56.2]} text="NORTH SEA" size={46} fill="#ffffff" type={m.lerp([nt, nt + 14], [0, 1])} />
        </Britain>
        {[620, 780, 940, 1100, 1260].map((y, i) => {
          const x = -320 + ((m.t + 60) * (8 + 5 * run) + i * 230) % 1500;
          return <WindArrow key={i} x={x} y={y} len={240} k={ak} />;
        })}
      </View>
      <Vane x={820} y={1300} k={m.pop(da, 12)} spin={m.t} west={m.lerp([we, we + 8], [0, 1])} />
      {we > 0 ? <Txt x={540} y={330} size={72} fill="#ffffff" stroke={INK}>{"WEST WIND".slice(0, Math.round(9 * m.lerp([we, we + 14], [0, 1])))}</Txt> : null}
    </Stage>
  );
};
export default Wind;
