// "So which city becomes the capital? Every capital on the map wants the job, from Washington to Delhi to
// Beijing." The one-colour world: pins glow on capitals; a gold crown hovers over the map on "capital"; more
// capitals light up on "Every"; the pins jump on "wants"; Washington, Delhi and Beijing each hop and are
// named on their words; on "job" the crown spins, undecided.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Char } from "../../flat/cast";
import { BEIJING, DELHI, GOLD, Spot, WASHINGTON, World } from "./props";

const OTHERS: [number, number][] = [[-0.12, 51.5], [37.6, 55.75], [31.2, 30], [-47.9, -15.8], [139.7, 35.7], [3.4, 6.5], [149, -35.3], [-3.7, 40.4], [-99.1, 19.4]];

const Crown: React.FC<{ x: number; y: number; k: number; spin: number }> = ({ x, y, k, spin }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, k) * Math.max(0.15, Math.abs(Math.cos(spin)))} ${Math.min(1.1, k)})`}>
      <path d="M -120 60 L -130 -50 L -60 10 L 0 -80 L 60 10 L 130 -50 L 120 60 Z" fill={GOLD} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-124} y={50} width={248} height={40} rx={8} fill="#d99a1c" stroke={INK} strokeWidth={8} />
      {[-60, 0, 60].map((cx) => <circle key={cx} cx={cx} cy={70} r={10} fill="#d9483b" stroke={INK} strokeWidth={3} />)}
    </g>
  );

const Mayor: React.FC<{ at: [number, number]; dx: number; k: number; wave: number; t: number }> = ({ at, dx, k, wave, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return <Char x={xy[0] + dx} y={xy[1] + 130} s={50} face="grin" armR={[100 + 70 * Math.min(1, wave) + Math.sin(t / 5) * 10, 20]} armL={[20, 10]} />;
};

const Capital: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sa = m.at("says", 150), wi = m.at("win", 170);
  const ca = m.at("capital", 20), ev = m.at("every", 40), wa = m.at("wants", 60), jo = m.at("job", 75), ws = m.at("washington", 95), de = m.at("delhi", 110), be = m.at("beijing", 125);
  const hop = (f: number) => m.pulse(f + 4, 6);
  const close = m.lerp([jo - 2, jo + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + 0.05 * close + m.wave(70, 0.012)} cy={960 - 30 * close}>
        <World center={[20, 28]} scale={240} merge={() => 1}>
          {OTHERS.map((o, i) => <Spot key={i} at={o} name="" k={i < 4 ? 1 : m.pop(ev + (i % 3) * 3, 12)} color="#9aa0ad" hop={m.pulse(wa + 4 + i, 6)} />)}
          <Mayor at={WASHINGTON} dx={60} k={1} wave={hop(ws) + m.pulse(wa + 4, 8)} t={m.t} />
          <Mayor at={DELHI} dx={0} k={1} wave={hop(de) + m.pulse(wa + 4, 8)} t={m.t} />
          <Mayor at={BEIJING} dx={-60} k={1} wave={hop(be) + m.pulse(wa + 4, 8)} t={m.t} />
          <Spot at={WASHINGTON} name="WASHINGTON" k={1} hop={hop(ws)} color="#d9483b" />
          <Spot at={DELHI} name="DELHI" k={1} hop={hop(de)} color="#d9483b" left />
          <Spot at={BEIJING} name="BEIJING" k={1} hop={hop(be)} color="#d9483b" left />
        </World>
      </View>
      {m.t >= sa ? <g opacity={m.pop(sa, 12)}>{([[230, 640], [540, 560], [840, 640]] as [number, number][]).map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx={90} ry={56} fill="#ffffff" stroke={INK} strokeWidth={5} /><text x={x} y={y + 16} fontFamily="Poppins" fontWeight={800} fontSize={48} textAnchor="middle" fill={INK}>ME!</text></g>)}</g> : null}
      <Crown x={540 + 200 * Math.sin((m.t - wi) / 6) * m.lerp([wi, wi + 6], [0, 1])} y={420 + Math.sin(m.t / 9) * 14} k={m.pop(ca, 12)} spin={m.t < jo ? 0 : (m.t - jo) / 5} />
    </Stage>
  );
};

export default Capital;
