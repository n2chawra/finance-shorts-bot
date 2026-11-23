// Promise: "In {fact3}, about {fact1} of the world's trade sailed through this one strip of water." The
// camera pulls back to the whole old world map on "world's"; sea lanes draw across every ocean on "trade";
// the lanes through Suez glow gold and ships slide along them on "sailed"; on "strip" the camera closes on
// the canal and the share lands on a tag beside it, the year above.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, Tag, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { AbsoluteFill } from "remotion";
import { GOLD, SEA_LANE, SUEZ_MID, VIA_SUEZ, World, rider } from "./props";

type Params = { fig?: { year?: string; share?: string } };

const LANES: [number, number][][] = [
  [[121.5, 31.2], [140, 35], [-125, 37]],
  [[-74, 40.6], [-40, 45], [-9.8, 40]],
  [[103.8, 1.3], [115, -10], [151, -34]],
  [[55, 25], [65, 15], [72.8, 19]],
  [[-80, 25], [-45, 5], [-35, -10], [-43, -23]],
];

/** Rings spreading from the canal while the share is said (something new before the lanes appear). */
const Pulse: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(SUEZ_MID);
  if (!xy || k <= 0 || k >= 1) return null;
  return <g>{[0, 0.33, 0.66].map((o) => {
    const q = (k * 1.5 + o) % 1;
    return <circle key={o} cx={xy[0]} cy={xy[1]} r={20 + 160 * q} fill="none" stroke={GOLD} strokeWidth={8} opacity={1 - q} />;
  })}</g>;
};

const ShareTag: React.FC<{ k: number; share: string; year: string; yk: number }> = ({ k, share, year, yk }) => {
  const xy = useAt()(SUEZ_MID);
  if (!xy) return null;
  return (
    <g>
      <Tag x={xy[0] + 40} y={xy[1] - 60} w={250} h={110} text={share} k={k} rot={-3} />
      <Tag x={xy[0] + 60} y={xy[1] - 190} w={200} h={90} text={year} k={yk} bg="#ffffff" rot={2} />
    </g>
  );
};

const Trade: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const world = m.at("world", 20), trade = m.at("trade", 34), sailed = m.at("sailed", 50), strip = m.at("strip", 80);
  // out from the canal to the whole world on "world's", back in towards the canal on "strip"
  const a = m.lerp([world - 4, world + 12], [0, 1]), b = m.lerp([strip - 4, strip + 16], [0, 1]);
  const sc = (1 - b) * (9000 - 8550 * a) + b * 3000;
  const center: [number, number] = [(1 - b) * (32.6 + 22 * a) + b * 33.5, (1 - b) * (29.9 - 8 * a) + b * 29.6];
  const glow = m.lerp([sailed, sailed + 12], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#5f9fae" vignette={0.35}>
        <View zoom={1 + m.wave(80, 0.01)}>
          <World center={center} scale={sc}>
            {LANES.map((l, i) => <MapRoute key={i} via={l} k={m.lerp([trade + i * 3, trade + 24 + i * 3], [0, 1])} color={SEA_LANE} width={6} />)}
            <MapRoute via={VIA_SUEZ} k={m.lerp([trade, trade + 30], [0, 1])} color={glow > 0 ? GOLD : SEA_LANE} width={6 + 6 * glow} dash={glow < 0.5} />
            {[0.2, 0.45, 0.75].map((f, i) => glow > 0 ? (
              <MapRoute key={`s${i}`} via={VIA_SUEZ} k={Math.min(0.98, f + m.lerp([sailed, m.end], [0, 0.18]))} color="rgba(0,0,0,0)" width={1} dash={false} mover={rider(34)} />
            ) : null)}
            {(["phones", "cars", "oil"] as const).map((w, i) => {
              const at = m.at(w, strip + 20 + i * 12);
              return m.t >= at ? <MapRoute key={w} via={VIA_SUEZ} k={0.46 + 0.04 * i + m.lerp([at, m.end], [0, 0.06])} color="rgba(0,0,0,0)" width={1} dash={false}
                mover={(x, y, a) => <g transform={`translate(0 ${(1 - m.pop(at, 11)) * -60})`}>{rider(52, ["#3b7dd8", "#7a2f3a", "#2c3e66"][i])(x, y, a)}</g>} /> : null;
            })}
            <Pulse k={m.lerp([0, m.at("about", 12) + 30], [0.02, 1])} />
            <ShareTag k={m.pop(strip + 6, 12)} share={fig.share ?? ""} year={fig.year ?? ""} yk={m.pop(strip + 12, 12)} />
          </World>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Trade;
