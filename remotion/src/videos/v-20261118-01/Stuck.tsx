// "So what happens when it is blocked? In {fact3}, one giant ship, the Ever Given, got stuck sideways across
// it." The camera dives to the canal on "happens"; a huge container ship sails down it on "giant", its name
// writes along its hull on "Ever"; on "stuck" it swings and jams, and on "sideways" it locks across both
// banks, the water behind it going still; the year sits on a tag on the bank.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Canal, Ship, World } from "./props";

type Params = { fig?: { year?: string } };

const SPOT: [number, number] = [32.33, 30.6];

const Giant: React.FC<{ along: number; turn: number; name: number }> = ({ along, turn, name }) => {
  const at = useAt();
  const a = at([32.32, 30.9]), b = at(SPOT);
  if (!a || !b) return null;
  const x = a[0] + (b[0] - a[0]) * along, y = a[1] + (b[1] - a[1]) * along;
  const angle = 90 - 62 * turn;
  const n = Math.round("EVER GIVEN".length * name);
  return (
    <g>
      <Ship x={x} y={y} s={300} angle={angle} hull="#1f6b4a" />
      {n > 0 ? <g transform={`translate(${x} ${y}) rotate(${angle})`}><Txt x={0} y={22} size={44} fill="#ffffff" stroke="#1d1a2b">{"EVER GIVEN".slice(0, n)}</Txt></g> : null}
    </g>
  );
};

const Sand: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([32.3, 30.62]);
  if (!xy || k <= 0 || k >= 1) return null;
  return <g opacity={1 - k}>{[0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return <circle key={i} cx={xy[0] + Math.cos(a) * 90 * k} cy={xy[1] + Math.sin(a) * 60 * k - 30 * k} r={14 - 6 * k} fill="#d9bf86" stroke="#1d1a2b" strokeWidth={2} />;
  })}</g>;
};

const YearAt: React.FC<{ k: number; year: string }> = ({ k, year }) => {
  const xy = useAt()([32.0, 30.95]);
  return xy ? <Tag x={xy[0] - 260} y={xy[1] - 60} w={230} h={96} text={year} k={k} bg="#ffffff" rot={-3} /> : null;
};

const Stuck: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const happens = m.at("happens", 6), giant = m.at("giant", 40), ever = m.at("ever", 56), stuck = m.at("stuck", 80), side = m.at("sideways", 96);
  const dive = m.lerp([happens - 4, happens + 18], [0, 1]);
  const scale = 3000 + 37000 * dive;
  const center: [number, number] = [32.6 - 0.27 * dive, 29.6 + 1.0 * dive];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(70, 0.01) + m.pulse(side, 6) * 0.03}>
        <World center={center} scale={scale}>
          <Canal k={1} width={10 + scale / 700} color={m.t > side ? "#3d6f93" : "#2f7fb8"} />
          {dive > 0.6 ? <Giant along={m.lerp([happens + 10, stuck], [-0.4, 1])} turn={m.lerp([stuck, side + 6], [0, 1])} name={m.lerp([ever, ever + 12], [0, 1])} /> : null}
          <YearAt k={m.pop(giant, 12)} year={year} />
          <Sand k={m.lerp([m.at("tail", 110), m.at("tail", 110) + 14], [0, 1])} />
        </World>
      </View>
    </Stage>
  );
};

export default Stuck;
