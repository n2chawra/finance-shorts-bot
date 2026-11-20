// "But the strangest part: with every border gone, there is no foreign country left. Every trip abroad
// becomes a trip at home." The camera pushes in on a traveller with a suitcase in Europe; the last dotted
// border rubs out; a FOREIGN sign stamps on and is crossed out; the departures board flips; a plane flies
// across the world and lands beside a HOME sign on "home".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapRoute, useAt } from "../../flat/map";
import { LONDON, RED, Spot, World } from "./props";

const PARIS: [number, number] = [2.35, 48.85];
const LIMA: [number, number] = [-77.0, -12.05];

const Plane: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(0.9)`}>
    <path d="M -50 -8 L 40 -8 Q 60 0 40 8 L -50 8 Z" fill="#ffffff" stroke={INK} strokeWidth={5} />
    <path d="M -6 -8 L -26 -46 L -12 -46 L 16 -8 Z M -6 8 L -26 46 L -12 46 L 16 8 Z" fill="#3b6fb5" stroke={INK} strokeWidth={4} />
  </g>
);

const Traveller: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(LONDON);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Char x={xy[0] - 150} y={xy[1] + 40} s={70} face="happy" armR={[30, 10]} armL={[20 + Math.sin(t / 8) * 5, 10]} />
      <Block x={xy[0] - 110} y={xy[1] - 20} w={60} h={60} fill="#c8553d" r={8} sw={4} />
    </g>
  );
};

const Dotted: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([22, 60]), b = at([25, 41]);
  if (!a || !b || k >= 1) return null;
  return <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={INK} strokeWidth={8} strokeDasharray="20 14" pathLength={1} opacity={1 - k} />;
};

const Family: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(LIMA);
  if (!xy || k <= 0) return null;
  return <g opacity={Math.min(1, k * 2)}>{[0, 1].map((i) => <Char key={i} x={xy[0] + 90 + i * 70} y={xy[1] + 150} s={60 - i * 12} face="happy" armR={[150 + Math.sin(t / 4 + i) * 15, 20]} armL={[20, 10]} />)}</g>;
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pa = m.at("paris", 100), pe = m.at("peru", 115);
  const st = m.at("strangest", 4), bo = m.at("border", 30), fo = m.at("foreign", 55), le = m.at("left", 70), tr = m.at("trip", 90), ho = m.at("home", 130);
  const push = m.lerp([st, st + 18], [0, 1]) * (1 - m.lerp([tr - 4, tr + 14], [0, 1]));
  const cross = m.lerp([le, le + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + 0.2 * push + m.wave(70, 0.01)} cx={540 + 40 * push} cy={960 - 200 * push}>
        <World center={[-30, 22]} scale={330} merge={() => 1}>
          <Dotted k={m.lerp([bo, bo + 14], [0, 1])} />
          <Traveller k={m.pop(st, 12)} t={m.t} />
          <Spot at={PARIS} name="PARIS" k={m.pop(pa, 12)} />
          <MapRoute via={[PARIS, [-30, 15], LIMA]} k={m.lerp([tr, ho], [0, 1])} color="#ffffff" width={8} mover={(x, y, a) => <Plane x={x} y={y} a={a} />} />
          <Family k={m.pop(ho, 12)} t={m.t} />
          <Spot at={LIMA} name={m.t >= ho ? "HOME" : "PERU"} k={m.pop(pe, 12)} color={m.t >= ho ? "#3a9d5d" : RED} />
        </World>
      </View>
      {m.t >= fo ? (
        <g transform={`translate(540 ${380 - (1 - m.pop(fo, 12)) * 200})`}>
          <Block x={-230} y={-80} w={460} h={140} fill="#fff6dc" r={16} />
          <Txt x={0} y={-10} size={70} fill={INK}>FOREIGN</Txt>
          {cross > 0 ? <path d={`M -200 -10 L ${-200 + 400 * cross} -10`} stroke={RED} strokeWidth={20} strokeLinecap="round" /> : null}
        </g>
      ) : null}
      <Tag x={330} y={540} w={420} h={96} text="ABROAD" bg="#ffffff" k={m.pop(le + 4, 12) * (1 - m.lerp([tr, tr + 8], [0, 1]))} rot={4} />
    </Stage>
  );
};

export default Payoff;
