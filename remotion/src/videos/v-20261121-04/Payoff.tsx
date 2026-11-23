// "So who runs out first? Kuwait, Qatar and Bahrain run out of ways to sell their oil: this gap is their only road
// out, and it carries about {fact2} of all the oil the world uses." DAY FIVE on the sign on "who"; Kuwait, Qatar and
// Bahrain light up on their names; oil tanks on their coasts fill on "sell"; the camera pushes toward the strait on
// "gap"; a road of light runs from their coasts to the barrier and stops on "road"; the share sign lands on the
// strait on "carries"; on "world" the camera pulls back to the world with lines spreading from the strait.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { BAHRAIN, Barrier, DayBoard, Gulf, HORMUZ, KUWAIT, OIL, Port, QATAR } from "./props";

type Params = { fig?: { share?: string } };

const ROAD: [number, number][] = [[48.3, 29.0], [50.0, 27.6], [52.0, 26.7], [54.5, 26.3], [56.1, 26.55]];
const TANKS: [number, number][] = [[47.9, 29.0], [51.4, 25.6], [50.5, 26.2]];
const OUT: [number, number][][] = [[HORMUZ, [70, 12], [100, 4]], [HORMUZ, [62, 12], [45, -10]], [HORMUZ, [64, 22], [74, 19]]];

const Tanks: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  return <g>{TANKS.map((p, i) => { const xy = at(p); if (!xy) return null; return <g key={i}><rect x={xy[0] - 30} y={xy[1] - 70} width={60} height={70} rx={10} fill="#f4efe4" stroke={INK} strokeWidth={5} /><rect x={xy[0] - 26} y={xy[1] - 4 - 62 * Math.min(1, k)} width={52} height={62 * Math.min(1, k)} rx={6} fill={OIL} /></g>; })}</g>;
};

const Share: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()(HORMUZ);
  if (!xy || k <= 0) return null;
  const x = Math.max(300, Math.min(700, xy[0] - 40)), y = Math.max(560, xy[1] - 230);
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, k)})`}>
      <rect x={-250} y={-90} width={500} height={180} rx={24} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
      <Txt x={0} y={-36} size={48} fill={INK} weight={700}>OF THE WORLD'S OIL</Txt>
      <Txt x={0} y={34} size={86} fill="#b8352b">{text}</Txt>
    </g>
  );
};

const NoWay: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(HORMUZ);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${Math.min(720, xy[0] - 160)} ${xy[1] - 200}) scale(${Math.min(1.1, k)})`}>
      <rect x={-210} y={-60} width={420} height={120} rx={20} fill="#b8352b" stroke={INK} strokeWidth={7} />
      <Txt x={0} y={0} size={66} fill="#ffffff">NO WAY OUT</Txt>
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.share ?? "";
  const wh = m.at("who", 4), ku = m.at("kuwait", 20), qa = m.at("qatar", 28), ba = m.at("bahrain", 36), se = m.at("sell", 52), gp = m.at("gap", 70), rd = m.at("road", 84), ca = m.at("carries", 100), wo = m.at("world", 130), al = m.at("all", 116), us = m.at("uses", 140);
  const push = m.lerp([gp - 4, gp + 16], [0, 1]);
  const out = m.lerp([wo - 6, wo + 20], [0, 1]);
  const lit = (w: number) => m.lerp([w, w + 10], [0, 1]);
  const scale = (3800 + 1400 * push) * Math.pow(0.3, out);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf wide={out > 0.3} center={[51.8 + 3 * push + 6 * out, 26.9 - 0.3 * push - 6 * out]} scale={scale}
          colors={{ Kuwait: { fill: "#4a8f5a", k: lit(ku), trace: lit(ku) }, Qatar: { fill: "#8a1538", k: lit(qa), trace: lit(qa) }, Bahrain: { fill: "#ce1126", k: lit(ba), trace: lit(ba) } }}>
          <Barrier k={1} glow={m.lerp([rd + 10, rd + 20], [0, 1])} />
          <Tanks k={m.lerp([se, se + 16], [0, 1])} />
          {m.t >= rd ? <MapRoute via={ROAD} k={m.lerp([rd, rd + 18], [0.03, 1])} color="#ffd84a" width={12} dash={false} /> : null}
          {out > 0 ? <g opacity={out}>{OUT.map((r, i) => <MapRoute key={i} via={r} k={out} color="#ffd84a" width={7 + 4 * m.pulse(us + 6, 8)} />)}</g> : null}
          <Port at={KUWAIT} name="KUWAIT" k={lit(ku) * (1 - Math.min(1, push * 2.5))} dx={0} dy={-110} size={54} />
          <Port at={QATAR} name="QATAR" k={lit(qa) * (1 - Math.min(1, push * 2.5))} dx={0} dy={80} size={54} />
          <Port at={BAHRAIN} name="BAHRAIN" k={lit(ba) * (1 - Math.min(1, push * 2.5))} dx={-170} dy={0} size={54} />
          <NoWay k={m.pop(rd + 14, 11) * (1 - m.lerp([ca - 4, ca + 4], [0, 1]))} />
          <Share k={m.pop(ca, 11) + 0.08 * m.pulse(al + 4, 6)} text={share} />
        </Gulf>
      </View>
      <DayBoard day={5} flip={m.pop(wh, 10)} />
    </Stage>
  );
};

export default Payoff;
