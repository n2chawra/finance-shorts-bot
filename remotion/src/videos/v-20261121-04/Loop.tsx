// "Hormuz or Malacca: which strait should we shut next? Tell me below, while the Strait of Hormuz shuts for a week."
// From Hormuz to Malacca: a pin pulses at Hormuz; the camera swings east and a pin drops at Malacca on "Malacca";
// both glow on "strait"; a barrier hovers over Malacca on "shut"; a comment bubble pops on "below"; then the camera
// dives back to the strait and ends on the hook's first frame on "week".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { Gulf, HORMUZ, MALACCA, RED } from "./props";
import { HookMap } from "./Hook";

const Hover: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(MALACCA);
  if (!xy || k <= 0) return null;
  return <g opacity={Math.min(1, k)} transform={`translate(${xy[0]} ${xy[1] - 90 + Math.sin(t / 6) * 8})`}><rect x={-80} y={-12} width={160} height={24} fill="#ffffff" stroke={INK} strokeWidth={5} /><rect x={-80} y={-12} width={160} height={24} fill={RED} opacity={0.8} /></g>;
};

const Bubble: React.FC<{ k: number }> = ({ k }) => k <= 0 ? null : (
  <g transform={`translate(540 520) scale(${Math.min(1.1, k)})`}>
    <rect x={-330} y={-90} width={660} height={180} rx={40} fill="#ffffff" stroke={INK} strokeWidth={7} />
    <path d="M -60 88 L -110 160 L 10 88 Z" fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-40} y={80} width={60} height={14} fill="#ffffff" />
    <Txt x={0} y={0} size={60} fill={INK}>HORMUZ or MALACCA?</Txt>
  </g>
);

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hz = m.at("hormuz", 2), ma = m.at("malacca", 16), st = m.at("strait", 30), sh = m.at("shut", 40), be = m.at("below", 60), tl = m.at("tell", 54), wh = m.at("while", 70), shs = m.at("shuts", 90), wk = m.at("week", 100);
  const back = m.t >= wh;
  const east = m.lerp([ma - 4, ma + 18], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.38}>
      <View zoom={1 + m.wave(70, 0.01)}>
        {back ? (
          <HookMap t={m.t} out={m.lerp([wh, shs], [1, 0])} trace={m.lerp([shs, m.end - 2], [1, 0])} bar={0} bunch={0} q={0} />
        ) : (
          <Gulf wide center={[60 + 20 * east, 18 - 4 * east]} scale={900 - 300 * east}>
            <MapPin at={HORMUZ} k={1 + 0.1 * Math.sin(m.t / 5) * m.lerp([hz, hz + 6], [0, 1])} r={30} />
            <MapLabel at={[HORMUZ[0], HORMUZ[1] + 4]} text="HORMUZ" size={56} fill="#ffd84a" />
            <MapPin at={MALACCA} k={m.pop(ma, 11)} r={30} />
            <MapLabel at={[MALACCA[0] - 4, MALACCA[1] + 5]} text="MALACCA" size={56} fill="#ffd84a" type={m.lerp([ma, ma + 12], [0, 1])} />
            <Hover k={m.lerp([sh, sh + 8], [0, 1]) * (m.t >= st ? 1 : 0)} t={m.t} />
          </Gulf>
        )}
        <Bubble k={(m.pop(tl, 11) + 0.06 * m.pulse(be + 4, 6)) * (1 - m.lerp([wh - 4, wh + 4], [0, 1]))} />
      </View>
    </Stage>
  );
};

export default Loop;
