// "His farms died out. So how did Denmark get it? A missionary, Hans Egede, sailed from Denmark-Norway, then one
// kingdom, and started a colony." Close on the fjords: the farm huts fade under snow on "died"; Denmark glows
// across the sea on "Denmark"; a ship with a cross on its sail leaves Bergen on "missionary" with a man in a black
// coat on deck on "Hans"; the camera pulls back as it crosses on "sailed"; Denmark and Norway fill one red on
// "kingdom"; a Danish flag plants on the west coast at the colony on "colony".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Atlantic, BERGEN, Flag, Hut, NUUK, RED, SailShip, Spot } from "./props";

const HUTS: [number, number][] = [[-45.6, 61.3], [-46.6, 61.0], [-44.9, 60.8], [-48.6, 62.0]];
const ROUTE: [number, number][] = [BERGEN, [-2, 61], [-20, 61.5], [-38, 59.2], [-44, 59.4], [-49, 61.6], [-52.4, 64.0]];

const Missionary: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <path d="M -16 0 L -12 -46 L 12 -46 L 16 0 Z" fill="#1f1d26" stroke={INK} strokeWidth={3} />
    <rect x={-6} y={-46} width={12} height={8} fill="#ffffff" />
    <Ball x={0} y={-62} r={17} fill="#f0c9a0" shadow={false} sw={3} />
    <path d="M -18 -66 Q 0 -86 18 -66 Q 20 -56 16 -52 L -16 -52 Q -20 -56 -18 -66 Z" fill="#e8e2d4" stroke={INK} strokeWidth={3} />
  </g>
);

const Huts: React.FC<{ fade: number }> = ({ fade }) => {
  const at = useAt();
  return <g>{HUTS.map((h, i) => { const xy = at(h); return xy ? <Hut key={i} x={xy[0]} y={xy[1]} s={80} k={1} fade={Math.max(0, Math.min(1, fade * 1.6 - i * 0.2))} /> : null; })}</g>;
};

const Colony: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(NUUK);
  return xy ? <Flag x={xy[0] + 10} y={xy[1]} s={120} k={k} kind="dk" t={t} /> : null;
};

const Egede: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const farms = m.at("farms", 4), died = m.at("died", 14), dk = m.at("denmark", 34), mis = m.at("missionary", 52), hans = m.at("hans", 64), sailed = m.at("sailed", 80), king = m.at("kingdom", 100), col = m.at("colony", 120);
  const back = m.lerp([dk - 4, sailed + 10], [0, 1]);
  const go = m.lerp([sailed - 6, col], [0.03, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.008)}>
        <Atlantic center={[-45 + 25 * back, 61.8 + 1.7 * back]} scale={3000 - 2350 * back} near
          colors={{ Denmark: { fill: RED, k: m.lerp([dk, dk + 10], [0, 1]) }, Norway: { fill: RED, k: m.lerp([king, king + 12], [0, 1]) } }}>
          <Huts fade={m.lerp([died, died + 20], [0, 1])} />
          <Spot at={[10.5, 56.2]} name="DENMARK" k={m.lerp([dk, dk + 10], [0, 1])} size={46} left />
          <Spot at={BERGEN} name="NORWAY" k={m.lerp([king, king + 10], [0, 1])} size={46} left />
          {m.t >= mis - 4 ? <MapRoute via={ROUTE} k={go} color="#f4e3bd" width={7} mover={(x, y, a) => (
            <g transform={`translate(0 ${Math.sin(m.t / 7) * 4})`}>
              <SailShip x={x} y={y - 6} s={120} angle={a} kind="mission" />
              {m.t >= hans ? <Missionary x={x + (Math.abs(a) > 90 ? 30 : -30)} y={y - 12} s={70 * Math.min(1, m.pop(hans, 12))} /> : null}
            </g>
          )} /> : null}
          <Colony k={m.lerp([col, col + 12], [0, 1])} t={m.t} />
          <Spot at={NUUK} name="COLONY" k={m.lerp([col + 4, col + 14], [0, 1])} size={46} left />
        </Atlantic>
        {m.t < died + 24 ? <g opacity={m.lerp([died, died + 24], [0, 0.6])}>{Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={(i * 97 + m.t * 4) % 1080} cy={((i * 173) % 1300) + 300 + (m.t * 5) % 80} r={5 + (i % 4)} fill="#ffffff" />
        ))}</g> : null}
      </View>
    </Stage>
  );
};

export default Egede;
