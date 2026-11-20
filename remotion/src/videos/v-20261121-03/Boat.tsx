// "There's no airport and no runway. To get here, you sail for about a week from Cape Town." Tristan on the map: a
// plane flies in on "airport" and a red cross stamps over it; a runway strip by the island is crossed out on
// "runway"; the camera swings out to Cape Town on "get"; a supply ship leaves the pin on "sail" and a calendar sign's
// seven days fill one by one on "week" as the wake draws across the ocean to the island on "Town".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, useAt } from "../../flat/map";
import { CAPE, Isle, Ocean, RED, Ship, TRISTAN } from "./props";

const ROUTE: [number, number][] = [CAPE, [8, -36.5], [-2, -37.6], [-11.2, -37.3]];

const Cross: React.FC<{ x: number; y: number; r: number; k: number }> = ({ x, y, r, k }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${Math.min(1.15, k)})`}>
    <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
    <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke={RED} strokeWidth={22} strokeLinecap="round" />
  </g>
);

const Plane: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100}) rotate(25)`}>
    <path d="M -60 0 Q -60 -12 -40 -12 L 50 -12 Q 70 -10 72 0 Q 70 10 50 12 L -40 12 Q -60 12 -60 0 Z" fill="#f4efe4" stroke={INK} strokeWidth={5} />
    <path d="M -6 -10 L -30 -62 L -6 -62 L 26 -10 Z M -6 10 L -30 62 L -6 62 L 26 10 Z M -50 -10 L -64 -34 L -50 -34 L -36 -10 Z" fill="#7d8db8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const Calendar: React.FC<{ k: number; fill: number }> = ({ k, fill }) => k <= 0 ? null : (
  <g transform={`translate(540 ${430 + (1 - Math.min(1, k)) * 60})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-330} y={-120} width={660} height={240} rx={24} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
    <rect x={-330} y={-120} width={660} height={70} rx={24} fill={RED} stroke={INK} strokeWidth={7} />
    <Txt x={0} y={-85} size={50} fill="#ffffff">ABOUT A WEEK</Txt>
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i}>
        <rect x={-300 + i * 86} y={-24} width={70} height={110} rx={10} fill={fill * 7 > i ? "#6d9a4c" : "#ffffff"} stroke={INK} strokeWidth={5} />
        {fill * 7 > i + 0.5 ? <path d={`M ${-284 + i * 86} 30 l 14 16 l 26 -34`} fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" /> : null}
      </g>
    ))}
  </g>
);

const OnIsle: React.FC<{ plane: number; x1: number; x2: number }> = ({ plane, x1, x2 }) => {
  const xy = useAt()(TRISTAN);
  if (!xy) return null;
  const px = xy[0] + 330 - 300 * Math.min(1, plane), py = xy[1] - 330 + 250 * Math.min(1, plane);
  return (
    <g>
      <rect x={xy[0] + 70} y={xy[1] - 14} width={190} height={28} fill="#5c5560" stroke={INK} strokeWidth={4} opacity={Math.min(1, x2 * 3)} />
      {plane > 0 ? <Plane x={px} y={py} s={120} /> : null}
      <Cross x={px} y={py} r={70} k={x1} />
      <Cross x={xy[0] + 165} y={xy[1]} r={50} k={x2} />
    </g>
  );
};

const Boat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ap = m.at("airport", 8), rw = m.at("runway", 28), gt = m.at("get", 44), sl = m.at("sail", 66), wk = m.at("week", 86), cp = m.at("cape", 96), tw = m.at("town", 108);
  const swing = m.lerp([gt, sl + 6], [0, 1]);
  const scale = 2000 - 900 * swing;
  const center: [number, number] = [-12.3 + 15.3 * swing, -37 + 2 * swing];
  const voyage = m.lerp([sl, m.end - 4], [0.02, 1]);
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1.05 + m.wave(90, 0.01)} cy={960 - 40 * swing}>
        <Ocean center={center} scale={scale} colors={{ "South Africa": { fill: "#3a8a5a" } }}>
          <Isle at={TRISTAN} r={40} t={m.t} name="TRISTAN" size={54} />
          <OnIsle plane={m.lerp([0, ap + 6], [0.4, 1]) * (1 - m.lerp([gt, gt + 10], [0, 1]))} x1={m.pop(ap + 4, 10) * (1 - m.lerp([gt, gt + 10], [0, 1]))} x2={m.pop(rw, 10)} />
          <MapPin at={CAPE} k={m.pop(gt + 4, 11)} r={26} />
          <MapLabel at={[CAPE[0] - 4, CAPE[1] + 4]} text="CAPE TOWN" size={52} type={m.lerp([gt + 4, gt + 16], [0, 1])} />
          {m.t >= sl ? <MapRoute via={ROUTE} k={voyage} color="#f4efe4" width={9} mover={(x, y, a) => <Ship x={x} y={y - 14} s={110} angle={a} kind="steam" t={m.t} />} /> : null}
        </Ocean>
        <Calendar k={m.pop(wk, 11)} fill={m.lerp([wk, tw + 6], [0, 1])} />
      </View>
    </Stage>
  );
};

export default Boat;
