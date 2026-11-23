// "But those two pipes carry only a small part of what the tankers did, and the rest has nowhere to go." The whole
// region: both pipelines glow on "two"; oil drips from their ends on "pipes"; a thin trickle stands beside a fat
// stream of tankers on "small", the trickle shrinks on "part"; the stuck tankers bob on "tankers"; barrels pile up
// on the docks on "rest".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { ABQAIQ, Barrier, DayBoard, FUJAIRAH, Fleet, Gulf, HABSHAN, OIL, YANBU } from "./props";

const SAUDI: [number, number][] = [ABQAIQ, [46.7, 25.0], [43.5, 24.6], [40.5, 24.3], YANBU];
const UAE: [number, number][] = [HABSHAN, [54.6, 24.3], [55.6, 24.8], FUJAIRAH];
const STUCK: [number, number][] = [[50.6, 27.6], [52.4, 26.8], [53.8, 26.4], [55.2, 26.4]];

const Bars: React.FC<{ k: number; shrink: number }> = ({ k, shrink }) => k <= 0 ? null : (
  <g transform={`translate(0 ${(1 - Math.min(1, k)) * 80})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={130} y={560} width={820} height={300} rx={26} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
    <Txt x={300} y={610} size={46} fill={INK} weight={700}>PIPES</Txt>
    <Txt x={300} y={720} size={48} fill="#b8352b">SMALL</Txt>
    <Txt x={700} y={610} size={46} fill={INK} weight={700}>TANKERS</Txt>
    <rect x={270} y={820 - 60 * (1 - 0.35 * shrink)} width={60} height={60 * (1 - 0.35 * shrink)} fill={OIL} stroke={INK} strokeWidth={5} />
    <rect x={600} y={650} width={200} height={170} fill={OIL} stroke={INK} strokeWidth={5} />
  </g>
);

const Drips: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  return <g>{[YANBU, FUJAIRAH].map((p, i) => { const xy = at(p); if (!xy || k <= 0) return null; const d = (t * 2 + i * 13) % 30; return <circle key={i} cx={xy[0]} cy={xy[1] + 10 + d} r={9} fill={OIL} stroke={INK} strokeWidth={3} opacity={1 - d / 30} />; })}</g>;
};

const Docks: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const spots: [number, number][] = [[48.4, 28.8], [51.5, 25.6], [50.3, 26.3]];
  return <g>{spots.map((p, i) => { const xy = at(p); if (!xy || k <= 0) return null; return <g key={i}>{[0, 1, 2].map((j) => <rect key={j} x={xy[0] - 30 + j * 22} y={xy[1] - 30 * Math.min(1, Math.max(0, k * 3 - j))} width={18} height={30 * Math.min(1, Math.max(0, k * 3 - j))} rx={4} fill={OIL} stroke={INK} strokeWidth={3} />)}</g>; })}</g>;
};

const PipeTags: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([43.0, 24.6]), b = at([54.8, 24.4]);
  if (!a || !b || k <= 0) return null;
  return <g opacity={Math.min(1, k)}><Txt x={a[0]} y={a[1] + 60} size={48} fill="#ffffff" stroke={INK}>SAUDI PIPE</Txt><Txt x={Math.min(760, b[0])} y={b[1] + 70} size={48} fill="#ffffff" stroke={INK}>UAE PIPE</Txt></g>;
};

const Small: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tw = m.at("two", 4), pi = m.at("pipes", 10), sm = m.at("small", 26), pa = m.at("part", 34), tk = m.at("tankers", 56), rs = m.at("rest", 70);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf center={[48.5, 23.2]} scale={2300}>
          <PipeTags k={m.lerp([tw, tw + 10], [0, 1])} />
          <MapRoute via={SAUDI} k={1} color={m.t >= tw ? "#ffd84a" : "#9aa0ad"} width={14} dash={false} />
          <MapRoute via={UAE} k={1} color={m.t >= tw ? "#ffd84a" : "#9aa0ad"} width={14} dash={false} />
          <Barrier k={1} glow={m.pulse(tk + 6, 10)} />
          <Fleet spots={STUCK} k={STUCK.map(() => 1)} t={m.t} s={48} jolt={m.pulse(tk + 4, 8)} />
          <Drips k={m.lerp([pi, pi + 6], [0, 1])} t={m.t} />
          <Docks k={m.lerp([rs, rs + 14], [0, 1])} />
        </Gulf>
        <Bars k={m.pop(sm, 11)} shrink={m.lerp([pa, pa + 10], [0, 1])} />
      </View>
      <DayBoard day={3} />
    </Stage>
  );
};

export default Small;
