// "But here's the catch. Every year the wind carries Sahara dust across the Atlantic, all the way to the Amazon
// rainforest, and that dust feeds its soil." The map snaps back to sand on "catch"; wind lines sweep west off the
// coast on "wind"; an orange plume lifts off the desert on "dust"; the camera pulls back as it crosses the ocean
// on "Atlantic"; Brazil's forest lights up where it lands on "Amazon"; specks sink into the trees on "feeds" and
// the trees grow on "soil".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Flash, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { AMAZON, Africa, DUST, Dunes, Name, saharaColors } from "./props";

const PATH: [number, number][] = [[8, 21], [-6, 20], [-20, 16], [-35, 10], [-48, 4], [-56, 0], AMAZON];

/** The dust plume: puffs along the path up to `k`, drifting. */
export const Plume: React.FC<{ k: number; t: number; thin?: number }> = ({ k, t, thin = 0 }) => {
  const at = useAt();
  if (k <= 0) return null;
  const pts = PATH.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const n = 28;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const u = i / (n - 1);
        if (u > k) return null;
        if (thin > 0 && (i % 3 !== 0) && u > 0.15) return null;
        const f = u * (pts.length - 1);
        const a = pts[Math.floor(f)]!, b = pts[Math.min(pts.length - 1, Math.floor(f) + 1)]!;
        const r = f - Math.floor(f);
        const x = a[0] + (b[0] - a[0]) * r + Math.sin(t / 7 + i) * 10, y = a[1] + (b[1] - a[1]) * r + Math.cos(t / 9 + i) * 8;
        return <Ball key={i} x={x} y={y} r={(46 - 22 * u) * (1 - 0.5 * thin)} fill={DUST} shadow={false} sw={3} />;
      })}
    </g>
  );
};

export const Forest: React.FC<{ k: number; grow: number; sway: number; t: number }> = ({ k, grow, sway, t }) => {
  const at = useAt();
  if (k <= 0) return null;
  const spots: [number, number][] = [[-66, -2], [-60, -5], [-55, -2], [-63, -8], [-52, -6], [-58, 1], [-69, -6]];
  return (
    <g>
      {spots.map((s, i) => {
        const xy = at(s);
        if (!xy) return null;
        const h = (44 + 26 * grow) * Math.min(1, k);
        const sw = Math.sin(t / 6 + i) * 4 * sway;
        return (
          <g key={i} transform={`translate(${xy[0]} ${xy[1]})`}>
            <Limb a={[0, 0]} b={[sw, -h]} w={8} color="#6b4a2b" sw={2} />
            <Ball x={sw} y={-h - 16} r={22 + 10 * grow} fill="#2f8a3e" shadow={false} sw={3} />
          </g>
        );
      })}
    </g>
  );
};

const Wind: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-14, 23]);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      {[0, 1, 2].map((i) => {
        const off = ((t * 8 + i * 60) % 180);
        return <path key={i} d={`M ${xy[0] + 120 - off} ${xy[1] - 60 + i * 50} q -60 -20 -120 0`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />;
      })}
    </g>
  );
};

const Catch: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ca = m.at("catch", 4), wi = m.at("wind", 30), du = m.at("dust", 44), at = m.at("atlantic", 56), am = m.at("amazon", 80), fe = m.at("feeds", 104), so = m.at("soil", 120);
  const back = m.lerp([at - 4, am + 6], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <Africa center={[0 - 30 * back, 18 - 16 * back]} scale={1000 - 520 * back}
          colors={saharaColors(0, 1, { Brazil: { fill: "#3f9a4c", k: m.lerp([am, am + 10], [0.15, 1]) } })}>
          <Dunes k={1} t={m.t} />
          <Wind k={m.lerp([wi, wi + 8], [0, 1])} t={m.t} />
          <Plume k={m.lerp([du, am + 4], [0.05, 1])} t={m.t} />
          <Forest k={m.lerp([am, am + 10], [0, 1])} grow={m.lerp([so, so + 12], [0, 1])} sway={1} t={m.t} />
          <Name at={[-38, 26]} text="ATLANTIC" k={m.lerp([at + 10, at + 20], [0, 1])} size={60} />
          <Name at={[-56, -15]} text="AMAZON" k={m.lerp([am, am + 10], [0, 1])} size={60} />
          {m.t >= fe ? <FallSpecks t={m.t - fe} /> : null}
        </Africa>
      </View>
      <Flash k={m.pulse(ca, 5) * 0.6} />
    </Stage>
  );
};

const FallSpecks: React.FC<{ t: number }> = ({ t }) => {
  const xy = useAt()(AMAZON);
  if (!xy) return null;
  return <g>{Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={xy[0] - 120 + i * 26} cy={xy[1] - 140 + ((t * 5 + i * 17) % 120)} r={7} fill={DUST} stroke={INK} strokeWidth={2} />)}</g>;
};

export default Catch;
