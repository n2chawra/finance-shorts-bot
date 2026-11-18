// Payoff: "Remember, that one blockage held up about {fact5} of goods every day. Close it for a year, and that
// jam never ends." The camera rises over the old world on "Remember"; containers stack up at both ends of
// the canal on "held", the figure lands on the stack on "goods"; on "Close" the camera closes on the canal
// again and on "never" the queues stretch on and on, the barrier still down.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Barrier, Canal, SUEZ_MID, Ship, World } from "./props";

type Params = { fig?: { goods?: string } };

const BOX = ["#d9483b", "#f2b134", "#3a9d5d", "#3b7dd8", "#e07a3a"];

const Stack: React.FC<{ at: [number, number]; k: number; s: number }> = ({ at, k, s }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.round(12 * Math.min(1, k));
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        return <rect key={i} x={xy[0] - 2 * s + col * s} y={xy[1] - (row + 1) * s * 0.55} width={s * 0.95} height={s * 0.5} fill={BOX[i % 5]} stroke={INK} strokeWidth={3} />;
      })}
    </g>
  );
};

const Line: React.FC<{ from: [number, number]; dir: [number, number]; n: number; s: number }> = ({ from, dir, n, s }) => {
  const xy = useAt()(from);
  if (!xy) return null;
  return <g>{Array.from({ length: n }).map((_, i) => <Ship key={i} x={xy[0] + dir[0] * i * s * 0.8} y={xy[1] + dir[1] * i * s * 0.6} s={s} hull={["#2c3e66", "#5a3a28", "#1f6b4a"][i % 3]} />)}</g>;
};

const GoodsTag: React.FC<{ k: number; goods: string }> = ({ k, goods }) => {
  const xy = useAt()(SUEZ_MID);
  return xy ? <Tag x={xy[0] - 190} y={xy[1] - 330} w={380} h={130} text={goods} k={k} rot={-3} /> : null;
};

const BarrierAt: React.FC<{ s: number }> = ({ s }) => {
  const xy = useAt()(SUEZ_MID);
  return xy ? <Barrier x={xy[0] + 30} y={xy[1]} s={s} k={1} /> : null;
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const goods = (p.beat.params as Params).fig?.goods ?? "";
  const rem = m.at("remember", 4), held = m.at("held", 30), gd = m.at("goods", 50), close = m.at("close", 80), never = m.at("never", 110);
  const up = m.lerp([rem, rem + 18], [0, 1]) * (1 - m.lerp([close - 4, close + 16], [0, 1]));
  const scale = 12000 - 8500 * up;
  const center: [number, number] = [32.5 + 2 * up, 30.4 - 2 * up];
  const grow = m.lerp([never, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.45}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <World center={center} scale={scale}>
          <Canal k={1} width={10 + scale / 1500} color="#3d6f93" />
          <BarrierAt s={70 + scale / 300} />
          <Stack at={[31.6, 31.5]} k={m.lerp([held, held + 20], [0, 1])} s={30 + scale / 600} />
          <Stack at={[33.4, 29.6]} k={m.lerp([held + 6, held + 26], [0, 1])} s={30 + scale / 600} />
          <GoodsTag k={m.pop(gd, 12)} goods={goods} />
          <Line from={[32.3, 31.5]} dir={[0.4, -1]} n={4 + Math.round(6 * grow)} s={40 + scale / 700} />
          <Line from={[32.65, 29.7]} dir={[0.45, 1]} n={4 + Math.round(6 * grow)} s={40 + scale / 700} />
        </World>
      </View>
    </Stage>
  );
};

export default Payoff;
