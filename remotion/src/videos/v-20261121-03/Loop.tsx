// Loop: "Saint Helena or Pitcairn: which lonely island should we map next? Tell me below, and look again at Tristan
// da Cunha." The world map: Saint Helena's pin pulses, on "Pitcairn" the camera swings west and a pin drops far off
// in the Pacific, both bob on "lonely", a comment bubble pops on "below", and on "again" the camera drifts back to
// the hook's first frame, Tristan's name writing on again.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, WorldMap } from "../../flat/map";
import { HELENA, Isle, PITCAIRN, Patterns, SEA, TRISTAN } from "./props";
import { HookMap } from "./Hook";

const Bubble: React.FC<{ k: number }> = ({ k }) => k <= 0 ? null : (
  <g transform={`translate(540 520) scale(${Math.min(1.1, k)})`}>
    <rect x={-330} y={-90} width={660} height={180} rx={40} fill="#ffffff" stroke={INK} strokeWidth={7} />
    <path d="M -60 88 L -110 160 L 10 88 Z" fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-40} y={80} width={60} height={14} fill="#ffffff" />
    <Txt x={0} y={0} size={60} fill={INK}>HELENA or PITCAIRN?</Txt>
  </g>
);

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hel = m.at("helena", 4), pit = m.at("pitcairn", 24), lon = m.at("lonely", 34), mp = m.at("map", 50), bel = m.at("below", 66), ag = m.at("again", 84), tr = m.at("tristan", 100);
  const west = m.lerp([pit - 4, pit + 18], [0, 1]) * (1 - m.lerp([ag - 4, tr + 10], [0, 1]));
  const back = m.t >= ag;
  const bob = (ph: number) => m.wave(24, 0.08, ph) * m.lerp([lon, lon + 6], [0, 1]);
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        {back ? (
          <HookMap t={m.t} dive={m.lerp([ag, m.end], [0.35, 0.12])} name={m.lerp([tr, tr + 16], [0, 1])} isle={0} pin={0} q={0} roofs={[0, 0, 0, 0]} />
        ) : (
          <WorldMap w={1080} h={1920} center={[-12 - 70 * west, -20]} scale={520 - 120 * m.lerp([mp, mp + 16], [0, 1])} kind="flat" look="vintage" political={0.6} sea={SEA}>
            <Patterns />
            <Isle at={TRISTAN} r={24} t={m.t} />
            <Isle at={HELENA} r={20} t={m.t} glow={m.pulse(hel + 8, 10)} />
            <MapPin at={HELENA} k={1 + bob(0)} r={30} color="#f2b134" />
            <MapLabel at={[HELENA[0], HELENA[1] + 7]} text="SAINT HELENA" size={56} k={1 - Math.min(1, west * 3)} />
            <MapPin at={PITCAIRN} k={m.pop(pit, 11) + bob(1.5)} r={30} />
            <MapLabel at={[PITCAIRN[0], PITCAIRN[1] - 7]} text="PITCAIRN" size={56} type={m.lerp([pit, pit + 12], [0, 1])} />
          </WorldMap>
        )}
        <Bubble k={m.pop(bel, 11) * (1 - m.lerp([ag, ag + 10], [0, 1]))} />
      </View>
    </Stage>
  );
};

export default Loop;
