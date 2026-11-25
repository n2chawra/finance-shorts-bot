// "And here is the twist: Ethiopia, a country with no sea today, wakes up with a coast and a harbour of its own."
// The camera swings to the west bank of the new sea; Ethiopia's west traces with its flag, a NO SEA sign is crossed
// out, a palm tree pops on the new shore, a little harbour appears and a boat sails out of it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { Flood, Island, Map, RiftSea, SeaMarks, mix, mixLL, riftAt } from "./props";

const Shore: React.FC<{ sign: number; cross: number; palm: number; port: number; sail: number; flag: number; t: number }> = ({ sign, cross, palm, port, sail, flag, t }) => {
  const xy = useAt()(riftAt(0.36));
  if (!xy) return null;
  const [x, y] = [xy[0] - 70, xy[1]];
  return (
    <g>
      {sign > 0 ? (
        <g opacity={Math.min(1, sign * 2)} transform={`translate(${x - 300},${y - 260})`}>
          <Limb a={[0, 120]} b={[0, 260]} w={14} color="#6b4a2a" sw={3} />
          <Block x={-150} y={20} w={300} h={110} fill="#f4e6c4" r={12} />
          <Txt x={0} y={75} size={56} fill={INK}>NO SEA</Txt>
          {cross > 0 ? <g opacity={Math.min(1, cross * 2)}><Limb a={[-140, 30]} b={[140, 120]} w={22} color="#e0352b" /><Limb a={[140, 30]} b={[-140, 120]} w={22} color="#e0352b" /></g> : null}
        </g>
      ) : null}
      {palm > 0 ? (
        <g transform={`translate(${x - 120},${y + 40}) scale(${Math.min(1, palm)})`}>
          <path d="M0,0 Q-10,-90 10,-170" fill="none" stroke="#8a5a32" strokeWidth={18} strokeLinecap="round" />
          {[-60, -20, 20, 60, 100].map((a, i) => <path key={i} d={`M10,-170 q${Math.cos((a * Math.PI) / 180) * 60},${-30 + Math.sin(t / 15 + i) * 5} ${Math.cos((a * Math.PI) / 180) * 110},${20}`} fill="none" stroke="#3f8a3a" strokeWidth={16} strokeLinecap="round" />)}
        </g>
      ) : null}
      {port > 0 ? (
        <g transform={`translate(${x - 40},${y + 150}) scale(${Math.min(1, port)})`}>
          <Block x={-120} y={-20} w={130} h={40} fill="#8a6a4a" r={4} />
          <Block x={-110} y={-90} w={70} h={70} fill="#f4ead6" r={4} />
          <path d="M-120,-88 L-75,-125 L-30,-88 Z" fill="#c0392b" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {flag > 0 ? <g><Limb a={[0, -20]} b={[0, -20 - 150 * Math.min(1, flag)]} w={8} color="#6b4a2a" sw={2} /><FlagArt name="Ethiopia" x={4} y={-20 - 150 * Math.min(1, flag)} w={90} h={60} /></g> : null}
        </g>
      ) : null}
      {port > 0 ? (
        <g transform={`translate(${x + 40 + 220 * sail},${y + 150 + 20 * sail + Math.sin(t / 6) * 4})`}>
          <path d="M-50,0 L50,0 L35,26 L-35,26 Z" fill="#c0392b" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <Limb a={[0, 0]} b={[0, -80]} w={6} color={INK} sw={1} />
          <path d="M4,-76 L50,-12 L4,-12 Z" fill="#ffffff" stroke={INK} strokeWidth={3} />
          <Ball x={0} y={-86} r={6} fill="#e0352b" sw={2} shadow={false} />
        </g>
      ) : null}
    </g>
  );
};

const Gull: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(riftAt(0.36));
  if (!xy || k <= 0) return null;
  const a = t / 14, x = xy[0] + 60 + Math.cos(a) * 110, y = xy[1] - 160 + Math.sin(a) * 40;
  return <path d={`M${x - 40},${y} q20,-24 40,0 q20,-24 40,0`} fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={Math.min(1, k)} />;
};

const Coast: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tw = m.at("twist", 6), et = m.at("ethiopia", 26), cn = m.at("country", 40), se = m.at("sea", 52), to = m.at("today", 62), co = m.at("coast", 86), ha = m.at("harbour", 104), ex = m.at("exist", 130), ow = m.at("own", 114), dn = m.at("does", 122);
  const sw = m.lerp([0, tw + 20], [0, 1]);
  const close = m.lerp([co, co + 24], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <Map center={mixLL([40.0, 2.0], [37.2, 7.4], sw)} scale={mix(1650, 3600, sw) + 900 * close}
          colors={{ Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: 1, trace: m.lerp([et, et + 28], [0, 1]) } }}>
          <SeaMarks t={m.t} />
          <Flood k={1} />
          <Island cover={1} drift={150} />
          <RiftSea k={1} w={140 + 30 * m.pulse(dn + 4, 10)} />
          <Gull k={m.pop(ex)} t={m.t} />
          <Shore sign={m.pop(cn)} cross={m.lerp([se, se + 8], [0, 1])} palm={m.pop(to)} port={m.pop(co)} sail={m.lerp([ha, m.end], [0, 1])} flag={m.pop(ow)} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Coast;
