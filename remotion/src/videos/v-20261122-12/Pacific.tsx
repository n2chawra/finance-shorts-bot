// Pacific: "Then the Pacific: Tuvalu and the Marshall Islands, whole nations built on low rings of coral, wiped off the
// map." On "Pacific" the camera swings out over the ocean; on "Tuvalu" its islands light up; on "Marshall" the
// Marshall Islands light up further north; on "nations" both flags plant; on "rings" the coral rings glow; on "wiped"
// an eraser sweeps them off the map.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { SEA } from "./props";
import { Isle, Ripples, World } from "./props";

const TUVALU: [number, number][] = [[179.2, -8.5], [178.7, -7.5], [179.4, -9.4]];
const MARSHALL: [number, number][] = [[171.2, 7.1], [167.7, 9.2], [169.6, 6.0], [171.8, 9.9]];

const Flag: React.FC<{ at: [number, number]; k: number; kind: "tv" | "mh" }> = ({ at, k, kind }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0]} ${xy[1] - (1 - Math.min(1, k)) * 120})`}>
      <Limb a={[0, 0]} b={[0, -130]} w={7} color={INK} sw={0} />
      <rect x={0} y={-130} width={120} height={78} fill={kind === "tv" ? "#5bb7e6" : "#1e3a8a"} stroke={INK} strokeWidth={4} />
      {kind === "tv" ? <rect x={0} y={-130} width={56} height={36} fill="#1e3a8a" /> : <path d="M 0 -60 L 120 -110 L 120 -100 L 0 -54 Z" fill="#f2a33a" />}
    </g>
  );
};

const Eraser: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0 || k >= 1) return null;
  const x = -150 + 1350 * k;
  return (
    <g transform={`translate(${x} ${980 + Math.sin(k * 20) * 40}) rotate(-25)`}>
      <rect x={-90} y={-50} width={180} height={100} rx={14} fill="#f08bb0" stroke={INK} strokeWidth={6} />
      <rect x={20} y={-50} width={70} height={100} rx={10} fill="#3a78c9" stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** Hides the map's edge at the antimeridian: sea drawn on past it. */
const Edge: React.FC = () => {
  const at = useAt();
  const ref = at([179, 0])?.[0] ?? 0;
  const e = at([179.999, 0])?.[0] ?? 2000;
  const x = e > ref ? e + 1 : 2000;
  return <rect x={x} y={-200} width={2400} height={2400} fill={SEA} />;
};

const Pacific: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pa = m.at("pacific", 4), tu = m.at("tuvalu", 14), ma = m.at("marshall", 30), na = m.at("nations", 50), ri = m.at("rings", 70), wi = m.at("wiped", 90);
  const swing = m.lerp([pa, pa + 20], [0, 1]);
  const wipe = m.lerp([wi, wi + 22], [0, 1]);
  const gone = (x: number) => (wipe * 1350 - 150 > x ? 1 : 0);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1.04 + 0.08 * m.lerp([ri, ri + 12], [0, 1]) + m.wave(90, 0.01)}>
        <World flat center={[150 + 24 * swing, 10 - 13 * swing]} scale={900 + 1700 * swing} fine only={["Fiji", "Papua New Guinea", "Solomon Is."]}>
          {TUVALU.map((a, i) => <g key={`t${i}`} opacity={m.lerp([tu, tu + 8], [0.3, 1])}><Isle at={a} s={0.8} sink={gone(400) * m.lerp([wi + 8, wi + 16], [0, 1])} t={m.t} /></g>)}
          {MARSHALL.map((a, i) => <g key={`m${i}`} opacity={m.lerp([ma, ma + 8], [0.3, 1])}><Isle at={a} s={0.8} sink={m.lerp([wi + 4, wi + 14], [0, 1])} t={m.t} /></g>)}
          {[...TUVALU, ...MARSHALL].map((a, i) => <Ripples key={`r${i}`} at={a} k={m.lerp([ri, ri + 10], [0, 1])} t={m.t + i * 9} />)}
          <Flag at={[177.6, -7.6]} k={m.pop(na, 10) * (1 - wipe)} kind="tv" />
          <Flag at={[170.4, 8.4]} k={m.pop(na + 4, 10) * (1 - wipe)} kind="mh" />
          <MapLabel at={[174.6, -9.6]} text="TUVALU" size={56} k={m.lerp([tu, tu + 10], [0, 1]) * (1 - wipe)} />
          <MapLabel at={[169.8, 11.6]} text="MARSHALL IS." size={56} k={m.lerp([ma, ma + 10], [0, 1]) * (1 - wipe)} />
          <MapLabel at={[150, 2]} text="PACIFIC OCEAN" size={56} fill="#ffffff" k={m.lerp([pa, pa + 10], [0, 1])} />
        </World>
      </View>
      <Eraser k={wipe} />
    </Stage>
  );
};
export default Pacific;
