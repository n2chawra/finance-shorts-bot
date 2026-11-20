// "Border queues vanish. A truck leaves Lisbon and drives all the way to Singapore without a single stamp."
// Close on a border gate in Europe with a line of trucks; on "vanish" the gate and the queue go in a puff;
// a truck sets off from a pin on Lisbon and the camera pulls out over Eurasia as its road draws all the way
// to a pin on Singapore; a passport stamp falls and is crossed out on "stamp".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Char } from "../../flat/cast";
import { LISBON, RED, ROAD, SINGAPORE, Spot, Truck, World } from "./props";

const GATE: [number, number] = [21, 52.2];

const Queue: React.FC<{ gone: number; t: number }> = ({ gone, t }) => {
  const xy = useAt()(GATE);
  if (!xy || gone >= 1) return null;
  return (
    <g opacity={1 - gone} transform={`translate(${xy[0]} ${xy[1]}) scale(${1 + gone * 0.4}) translate(${-xy[0]} ${-xy[1]})`}>
      <rect x={xy[0] - 10} y={xy[1] - 120} width={20} height={130} fill="#9aa0ad" stroke={INK} strokeWidth={5} />
      <rect x={xy[0] - 10} y={xy[1] - 120} width={170} height={24} fill="#ffffff" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <rect key={i} x={xy[0] + 10 + i * 50} y={xy[1] - 120} width={25} height={24} fill={RED} />)}
      {[0, 1, 2, 3].map((i) => <Truck key={i} x={xy[0] - 90 - i * 130} y={xy[1] + 10 + Math.sin(t / 10 + i) * 2} s={90} />)}
    </g>
  );
};

const Stamp: React.FC<{ k: number; cross: number }> = ({ k, cross }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(780 ${420 - (1 - Math.min(1, k)) * 200}) rotate(-12)`}>
      <circle cx={0} cy={0} r={110} fill="#ffffff" stroke="#3b6fb5" strokeWidth={12} />
      <Txt x={0} y={0} size={48} fill="#3b6fb5">STAMP</Txt>
      {cross > 0 ? <g stroke={RED} strokeWidth={22} strokeLinecap="round"><path d={`M -90 -90 L ${-90 + 180 * cross} ${-90 + 180 * cross}`} /><path d={`M 90 -90 L ${90 - 180 * cross} ${-90 + 180 * cross}`} /></g> : null}
    </g>
  );
};

const DriverAt: React.FC<{ k: number; t: number; gone: number }> = ({ k, t, gone }) => {
  const xy = useAt()(LISBON);
  if (!xy || k <= 0 || gone >= 1) return null;
  return <g opacity={Math.min(1, k * 2) * (1 - gone)}><Char x={xy[0] + 60} y={xy[1] + 150} s={80} face="happy" armR={[150 + Math.sin(t / 4) * 15, 20]} armL={[15, 10]} /></g>;
};

const Drive: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const cn = m.at("continents", 110);
  const qu = m.at("queues", 2), va = m.at("vanish", 22), tr = m.at("truck", 40), li = m.at("lisbon", 55), sg = m.at("singapore", 95), st = m.at("stamp", 125);
  const out = m.lerp([tr - 2, sg], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <World center={[5 + 58 * out, 46 - 18 * out]} scale={1000 - 550 * out} merge={() => 1} extra={{ Russia: { fill: "#f2c76b", k: 0.8 * m.pulse(cn + 6, 10) }, China: { fill: "#f2c76b", k: 0.8 * m.pulse(cn + 10, 10) }, Spain: { fill: "#f2c76b", k: 0.8 * m.pulse(cn + 2, 10) } }}>
          <Queue gone={m.lerp([va, va + 10], [0, 1])} t={m.t + qu} />
          <Spot at={LISBON} name="LISBON" k={m.pop(va + 4, 12) * (1 - Math.min(1, Math.max(0, (out - 0.2) * 6)))} />
          {m.t >= va + 6 ? <MapRoute via={ROAD} k={Math.max(0.02, m.lerp([tr, sg + 8], [0, 1]))} color="#ffffff" width={10} mover={(x, y) => <Truck x={x} y={y - 18} s={130 - 30 * out} />} /> : null}
          <DriverAt k={m.pop(va + 6, 12)} t={m.t} gone={m.lerp([tr, tr + 8], [0, 1])} />
          <Spot at={SINGAPORE} name="SINGAPORE" k={m.lerp([sg - 12, sg], [0, 1])} left />
        </World>
      </View>
      <Stamp k={m.pop(st - 6, 12)} cross={m.lerp([st, st + 10], [0, 1])} />
    </Stage>
  );
};

export default Drive;
