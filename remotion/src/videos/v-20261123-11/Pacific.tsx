// "And just one lifetime after Yermak crossed the Urals, Cossacks stood on the shore of the Pacific." The red race
// line runs on across the last mountains; far back, Yermak's first boat glows at the Urals and the ridge flashes;
// the camera dives to the Okhotsk shore where Cossacks walk onto the beach, waves break and a banner goes up.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Asia, Banner, Boat, Cossack, Line, OKHOTSK, RACE, RED, RedLand, Ridge, URALS } from "./props";

const Shore: React.FC<{ t: number; walk: number; stop: number; wave: number; flag: number }> = ({ t, walk, stop, wave, flag }) => {
  const at = useAt();
  const c = at(OKHOTSK);
  if (!c || walk <= 0) return null;
  const [x, y] = c;
  const go = walk;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const w = (t / 30 + i / 3) % 1;
        return <path key={i} d={`M${x - 40},${y + 70 + w * 40} q50,-24 100,0 t100,0 t100,0`} fill="none" stroke="#ffffff" strokeWidth={8} opacity={wave * (1 - w)} strokeLinecap="round" />;
      })}
      {[0, 1, 2, 3].map((i) => (
        <Cossack key={i} x={x - 330 + i * 70 + 200 * go} y={y + 30 + (i % 2) * 18} s={90} k={Math.min(1, walk * 3 - i * 0.4)} bob={stop > 0 ? 0 : Math.abs(Math.sin(t / 4 + i)) * -8} arm={i === 3 ? flag : 0} />
      ))}
      <Banner x={x - 40} y={y + 30} s={110} k={flag} t={t} />
    </g>
  );
};

const First: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(URALS[5]!);
  return xy && k > 0 ? <g><Glow x={xy[0]} y={xy[1]} r={140} color="#ffe08a" o={0.8 * k} /><Boat x={xy[0] + 20} y={xy[1]} s={55} crew={3} leader /></g> : null;
};

const Pacific: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const li = m.at("lifetime", 8), ye = m.at("yermak", 20), ur = m.at("urals", 32), co = m.at("cossacks", 44), st = m.at("stood", 54), sh = m.at("shore", 64), pa = m.at("pacific", 78);
  const dive = m.lerp([co - 6, sh], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01)}>
        <Asia center={[103 + 38 * dive, 60 - 0.4 * dive]} scale={560 + 1400 * dive}>
          <RedLand east={134 + 12 * m.lerp([sh, sh + 20], [0, 1])} id="v1123p" front={1} o={0.62} />
          <Ridge k={1} s={0.8} glow={m.pulse(ur + 4, 14)} />
          <Line via={RACE} k={m.lerp([0, li + 20], [0.84, 1])} color={RED} w={12} dash />
          <First k={m.pop(ye, 10) * (1 - dive)} />
          <MapLabel at={[150, 55.5]} text="PACIFIC" size={58} k={m.pop(pa - 10, 10)} />
          <Shore t={m.t} walk={m.lerp([co, st + 10], [0, 1])} stop={m.after("stood") ? 1 : 0} wave={m.lerp([sh - 4, sh + 8], [0, 1])} flag={m.pop(pa, 12)} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Pacific;
