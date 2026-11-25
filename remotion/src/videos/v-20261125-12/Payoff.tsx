// "How long would it take? Tens of millions of years. But one crack opened fast: in 2005, 60 kilometres of the Afar
// tore open in a matter of days." An hourglass stands over the future map and spins faster, the map fades back to
// today, a pin drops on the Afar, the camera dives to it, a date sign stands by the crack, the crack rips open along a
// ruler that reads its length and a calendar flips its pages.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { DABBAHU, Flood, Island, Map, RiftSea, SeaMarks, Sign, mix, mixLL } from "./props";

type Params = { fig?: { year?: string; len?: string } };

const Hourglass: React.FC<{ k: number; sand: number; spin: number }> = ({ k, sand, spin }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(540,600) scale(${Math.min(1, k)}) rotate(${spin})`} opacity={Math.min(1, k * 2)}>
      <Block x={-130} y={-200} w={260} h={30} fill="#8a5a32" r={6} />
      <Block x={-130} y={170} w={260} h={30} fill="#8a5a32" r={6} />
      <path d="M-100,-170 L100,-170 L10,0 L100,170 L-100,170 L-10,0 Z" fill="#e8f4f8" opacity={0.8} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${-90 * (1 - sand)},${-160 + 150 * sand} L${90 * (1 - sand)},${-160 + 150 * sand} L0,-5 Z`} fill="#e9c46a" />
      <path d={`M${-90 * sand},${165 - 110 * sand} L${90 * sand},${165 - 110 * sand} L90,165 L-90,165 Z`} fill="#e9c46a" />
      <line x1={0} y1={-5} x2={0} y2={160} stroke="#e9c46a" strokeWidth={5} />
    </g>
  );
};

const Rip: React.FC<{ k: number; gape?: number; len: string }> = ({ k, gape = 0, len }) => {
  const xy = useAt()(DABBAHU);
  if (!xy || k <= 0) return null;
  const L = 520, q = Math.min(1, k);
  const x0 = xy[0] - L / 2, y0 = xy[1] + 40;
  const pts = Array.from({ length: 13 }, (_, i) => `${x0 + (L * q * i) / 12},${y0 + (i % 2 ? -14 : 14)}`).join(" ");
  return (
    <g>
      <polyline points={pts} fill="none" stroke={INK} strokeWidth={20 + 16 * gape} strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke="#ff7a2f" strokeWidth={8} strokeLinejoin="round" />
      <Block x={x0} y={y0 + 50} w={L} h={44} fill="#ffd36a" r={6} />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={x0 + (L * i) / 10} y1={y0 + 50} x2={x0 + (L * i) / 10} y2={y0 + 70} stroke={INK} strokeWidth={4} />)}
      <Txt x={xy[0]} y={y0 + 150} size={62} fill="#ffffff" stroke={INK}>{`${countText(len, q)} KM`}</Txt>
    </g>
  );
};

const Calendar: React.FC<{ k: number; flip: number }> = ({ k, flip }) => {
  if (k <= 0) return null;
  const f = flip % 1;
  return (
    <g transform={`translate(810,560) scale(${Math.min(1, k)})`}>
      <Block x={-110} y={-110} w={220} h={220} fill="#ffffff" r={14} />
      <Block x={-110} y={-110} w={220} h={60} fill="#c0392b" r={14} shadow={false} />
      <Txt x={0} y={20} size={60} fill={INK}>DAYS</Txt>
      <g transform={`scale(1,${1 - f})`} style={{ transformOrigin: "0px -50px" }}><rect x={-108} y={-50} width={216} height={150} fill="#f6f1e6" opacity={0.9} /></g>
      <Limb a={[-60, -125]} b={[-60, -95]} w={10} color="#555" sw={2} />
      <Limb a={[60, -125]} b={[60, -95]} w={10} color="#555" sw={2} />
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const ho = m.at("how", 4), lo = m.at("long", 12), te = m.at("tens", 36), ye = m.at("years", 56), cr = m.at("crack", 80), fa = m.at("fast", 96), km = m.at("kilometres", 130), af = m.at("afar", 150), to = m.at("tore", 166), da = m.at("days", 196), me = m.at("metre", 230);
  const today = m.lerp([ye, ye + 20], [0, 1]);
  const dive = m.lerp([fa, fa + 26], [0, 1]);
  const hg = 1 - m.lerp([ye + 10, ye + 24], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <Map center={mixLL(mixLL([37.2, 7.4], [39.5, 10.5], m.lerp([0, ye], [0, 1])), [40.55, 12.25], dive)} scale={mix(mix(4500, 2600, m.lerp([0, ye], [0, 1])), 6800, dive)}
          colors={{ Ethiopia: { fill: "#e9c46a", k: 1 } }}>
          <SeaMarks t={m.t} />
          <g opacity={1 - today}>
            <Flood k={1} />
            <Island cover={1} drift={150} />
            <RiftSea k={1} w={140} />
          </g>
          <MapPin at={DABBAHU} k={m.pop(cr)} r={34 + 14 * m.pulse(km + 4, 8)} />
          <Rip k={m.lerp([to, to + 20], [0, 1])} gape={m.lerp([me, me + 14], [0, 1])} len={f.len ?? ""} />
        </Map>
        <Sign x={300} y={800} w={360} title="YEAR" value={f.year ?? ""} k={m.pop(af)} />
      </View>
      <Hourglass k={m.pop(ho) * hg} sand={m.lerp([lo, ye], [0, 1])} spin={m.lerp([te, ye], [0, 360])} />
      <Calendar k={m.pop(da)} flip={m.t > da ? (m.t - da) / 6 : 0} />
    </Stage>
  );
};
export default Payoff;
