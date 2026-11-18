// Turn: "Now close it for a year. Where does every ship go? It turns around and takes the long way, past the
// tip of Africa." The barrier slams down on "Now" and a lock stamps onto it on "close"; a calendar flips
// through the months on "year"; ships stop and spin on "Where" and turn back south on "turns"; on "long"
// the camera pulls out over all of Africa as the long route draws round it; a pin drops on the Cape on "tip".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapPin, MapRoute, useAt } from "../../flat/map";
import { Barrier, CAPE, Calendar, Canal, Place, SUEZ_MID, VIA_CAPE, World, rider } from "./props";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const Gate: React.FC<{ k: number; lock: number; cal: number; month: number; s: number }> = ({ k, lock, cal, month, s }) => {
  const xy = useAt()(SUEZ_MID);
  if (!xy) return null;
  return (
    <g>
      <Barrier x={xy[0] + 30} y={xy[1]} s={s} k={k} />
      {lock > 0 ? (
        <g transform={`translate(${xy[0] + 40} ${xy[1] - 10}) scale(${(s / 100) * Math.min(1, lock * 1.3)})`}>
          <path d="M -16 -10 L -16 -26 Q 0 -44 16 -26 L 16 -10" fill="none" stroke={INK} strokeWidth={7} />
          <rect x={-24} y={-12} width={48} height={36} rx={6} fill="#f2b134" stroke={INK} strokeWidth={4} />
        </g>) : null}
      {cal > 0 ? <Calendar x={xy[0] - 150} y={xy[1] - 140} s={s} label={MONTHS[Math.min(11, Math.floor(month * 12))]!} /> : null}
    </g>
  );
};

const Spinner: React.FC<{ at: [number, number]; k: number; t: number }> = ({ at, k, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Ball x={xy[0]} y={xy[1] - 70} r={30} fill="#ffffff" shadow={false} sw={4} />
      <Txt x={xy[0]} y={xy[1] - 68} size={46} fill={INK}>?</Txt>
      <g transform={`rotate(${(t * 9) % 360} ${xy[0]} ${xy[1]})`}><circle cx={xy[0]} cy={xy[1]} r={34} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="10 10" /></g>
    </g>
  );
};

const Detour: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const now = m.at("now", 4), close = m.at("close", 16), year = m.at("year", 30), where = m.at("where", 48), turns = m.at("turns", 80), long = m.at("long", 100), tip = m.at("tip", 130);
  const out = m.lerp([long - 4, long + 26], [0, 1]);
  const scale = 9000 - 8500 * out;
  const center: [number, number] = [32.8 + 12 * out, 28.5 - 22 * out];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01) + m.pulse(now + 4, 5) * 0.03}>
        <World center={center} scale={scale}>
          <Canal k={1} width={10 + scale / 1500} color="#3d6f93" />
          <Gate k={m.lerp([now, now + 6], [0, 1])} lock={m.pop(close, 11)} cal={m.pop(year, 11) * (1 - out)} month={m.lerp([year, where], [0, 1])} s={100 - 50 * out} />
          <Spinner at={[34.2, 27.2]} k={m.lerp([where, where + 6], [0, 1]) * (1 - m.lerp([turns, turns + 8], [0, 1]))} t={m.t} />
          <MapRoute via={VIA_CAPE.slice(3)} k={m.lerp([turns, tip + 20], [0.01, 1])} color="#ffffff" width={9} mover={rider(46)} />
          <MapPin at={CAPE} k={m.pop(tip, 12)} r={30} />
          <Place at={CAPE} name="CAPE OF GOOD HOPE" k={m.lerp([tip - 6, tip + 4], [0, 1])} size={40} />
        </World>
      </View>
    </Stage>
  );
};

export default Detour;
