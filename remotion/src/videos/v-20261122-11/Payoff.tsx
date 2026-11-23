// Payoff: "In {fact3}, more than a century later, that old smoke still explains up to {fact2} of how England's
// neighbourhoods split into rich and poor." England on the old map, every city pin split: a census board shows the
// year; on "century" a COAL AGE tag peels off it; on "smoke" a ghost of the old smoke drifts east across England;
// on "explains" a share board plants, its bar filling; on "neighbourhoods" the camera pulls back over England; on
// "rich" the west halves glow, on "poor" the east halves.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { Board, Britain, CITIES, CityLabels, GOLD, SOOT, SplitPin } from "./props";

type Params = { fig?: { year?: string; share?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const i0 = m.at("in", 2), mo = m.at("more", 18), ce = m.at("century", 30), la = m.at("later", 44), sl = m.at("still", 66), sm = m.at("smoke", 60), ex = m.at("explains", 74), up = m.at("up", 84), hw = m.at("how", 110), ne = m.at("neighbourhoods", 130), ri = m.at("rich", 150), po = m.at("poor", 160);
  const ghost = m.lerp([sm, sm + 10], [0, 1]);
  const back = m.lerp([ne, ne + 20], [0, 1]);
  const push = m.lerp([sl, sl + 14], [0, 1]) * (1 - back);
  const swing = Math.sin((m.t - la) / 4) * 8 * Math.max(0, 1 - Math.abs(m.t - la - 12) / 14);
  const fill = m.lerp([up, up + 16], [0, 0.6]) + m.lerp([hw, hw + 12], [0, 0.4]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={1.0 + 0.16 * push + m.wave(90, 0.008)}>
        <Britain center={[-1.7, 53.5 - 0.2 * back]} scale={6000 - 800 * back} uk={1}>
          {CITIES.map((c, i) => <SplitPin key={c.name} at={c.at} k={1} split={1} r={34 + 6 * m.pulse(mo + 4 + i, 5)} glow={m.lerp([ri + i, ri + i + 6], [0, 1]) * (1 - m.lerp([po, po + 6], [0, 0.4]))} />)}
          <CityLabels k={CITIES.map(() => 1)} size={44} />
        </Britain>
        {ghost > 0 ? [700, 900, 1100].map((y, i) => [0, 1, 2, 3].map((j) => {
          const f = ((m.t - sm) * 0.01 + j / 4 + i * 0.2) % 1;
          return <ellipse key={`${i}${j}`} cx={-100 + f * 1300} cy={y + Math.sin(m.t / 12 + j) * 20} rx={120} ry={60} fill={SOOT} opacity={0.32 * ghost * (1 - Math.abs(f - 0.5))} />;
        })) : null}
      </View>
      <g transform={`rotate(${m.t >= la ? swing : 0} 190 620)`}><Board x={190} y={420} w={320} label="CENSUS" value={fig.year ?? ""} k={m.pop(i0, 12)} color="#3a5a8c" /></g>
      <Tag x={60} y={196} w={260} h={72} text="COAL AGE" rot={-8} bg="#e8453c" fg="#ffffff" size={40} k={1 - m.lerp([ce, ce + 10], [0, 1])} />
      {m.t >= ex - 4 ? (
        <g>
          <Board x={760} y={420} w={420} label="UP TO" value={countText(fig.share ?? "", fill)} k={m.pop(up - 2, 12)} />
          <rect x={560} y={232} width={360} height={40} rx={20} fill="#f4e3bd" stroke={INK} strokeWidth={5} opacity={m.pop(ex, 12)} />
          <rect x={560} y={232} width={360 * 0.2 * fill} height={40} rx={20} fill={GOLD} stroke={INK} strokeWidth={5} opacity={m.pop(ex, 12)} />
        </g>
      ) : null}
    </Stage>
  );
};
export default Payoff;
