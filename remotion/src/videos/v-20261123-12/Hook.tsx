// Hook: "The Strait of Malacca closes overnight. Which way do the oil tankers go now?" Tankers sail up the lane
// between Malaysia and Sumatra from frame 0; on "closes" a red barrier slams across the narrow end at Singapore,
// the map dims to night, the tankers bunch up, and on "now" the camera pulls back and question marks pop south.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Barrier, LANE, Night, QMark, SEAsia, Tanker, tipOf } from "./props";

/** The strait with its tankers; `go` moves them up the lane, `stop` packs them behind the barrier. */
export const StraitShips: React.FC<{ t: number; go: number; stop: number; n?: number }> = ({ t, go, stop, n = 5 }) => {
  const at = useAt();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const free = 0.08 + i * 0.1 + go;
        const held = 0.5 - i * 0.045;
        const k = free * (1 - stop) + Math.min(free, held) * stop;
        const tip = tipOf(at, LANE, k % 1);
        return tip ? <Tanker key={i} x={tip[0]} y={tip[1]} s={78} rot={tip[2]} t={t + i * 7} /> : null;
      })}
    </g>
  );
};

const Gate: React.FC<{ k: number; lamp: number }> = ({ k, lamp }) => {
  const at = useAt();
  const a = at([103.55, 1.42]), b = at([103.9, 0.95]);
  return a && b ? <Barrier a={a} b={b} k={k} lamp={lamp} /> : null;
};

const Qs: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const spots: [number, number][] = [[104.5, -5.0], [113.5, -6.4]];
  return <g>{spots.map((s, i) => { const xy = at(s); return xy ? <QMark key={i} x={xy[0]} y={xy[1]} k={Math.max(0, k * 1.4 - i * 0.4)} t={t + i * 9} /> : null; })}</g>;
};

export const HookMap: React.FC<{ t: number; center: [number, number]; scale: number; go: number; stop: number; gate: number; lamp: number; night: number; q: number; label: number }> = ({ t, center, scale, go, stop, gate, lamp, night, q, label }) => (
  <SEAsia center={center} scale={scale} colors={{ Malaysia: { fill: "#e0b46a" }, Indonesia: { fill: "#c9c27a" }, Singapore: { fill: "#e8453c" } }}>
    <MapLabel at={[102.0, 4.9]} text="MALAYSIA" size={50} />
    <MapLabel at={[100.6, 0.8]} text="SUMATRA" size={50} />
    <StraitShips t={t} go={go} stop={stop} />
    <Gate k={gate} lamp={lamp} />
    <Night k={night} />
    <Qs k={q} t={t} />
  </SEAsia>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const st = m.at("strait", 2), ma = m.at("malacca", 10), cl = m.at("closes", 20), ov = m.at("overnight", 28), wa = m.at("way", 40), ta = m.at("tankers", 52), no = m.at("now", 60);
  const back = m.lerp([ta - 4, no + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01) + 0.03 * m.pulse(cl + 3, 8)}>
        <HookMap t={m.t} center={[100.9 + 6.1 * back, 3.0 - 3.8 * back]} scale={7000 - 4700 * back}
          go={m.lerp([0, m.end], [0, 0.18]) + 0.04 * m.lerp([st, st + 10], [0, 1])} stop={m.lerp([wa - 4, wa + 14], [0, 1])}
          gate={m.pop(cl, 10)} lamp={m.lerp([ov, ov + 10], [0, 1])} night={m.lerp([ov, ov + 14], [0, 1])} q={m.pop(no, 10)}
          label={m.lerp([ma - 4, ma + 12], [0.4, 1])} />
      </View>
      <Banner k={1} glow={m.pulse(ma + 4, 12)} />
    </Stage>
  );
};

/** The strait's name on a sign at the top of the frame, typed on as `k` goes 0 -> 1 (the loop ends on it whole). */
export const Banner: React.FC<{ k: number; glow?: number }> = ({ k, glow = 0 }) => {
  const text = "STRAIT OF MALACCA";
  const n = Math.max(1, Math.round(text.length * Math.min(1, k)));
  return (
    <g>
      <rect x={170} y={190} width={740} height={110} rx={18} fill={glow > 0.3 ? "#ffe08a" : "#f3e4c2"} stroke={INK} strokeWidth={6} />
      <Txt x={540} y={247} size={60} fill={INK}>{text.slice(0, n)}</Txt>
    </g>
  );
};

export default Hook;
