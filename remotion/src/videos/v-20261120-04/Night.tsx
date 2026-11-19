// "At night, while Britain sleeps and power is cheap, the machines pump water uphill, from the low lake into
// the high one." Britain at night: the moon rises, the cities' lights switch off one by one, a price sign
// over Wales flips to LOW; on "pump" the camera dives back to the valley, now dark, water flowing up the
// tunnel; arrows climb the mountain on "uphill"; the high lake rises on "high".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Flash, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Britain, CityLights, ELIDIR, GOLD, HALL, Lake, MARCHLYN, Mountain, PERIS, Sign, Tunnel, Valley } from "./props";

const Arrows: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(HALL);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={k}>
      {[0, 1, 2].map((i) => {
        const y = xy[1] - 40 - ((t * 3 + i * 60) % 180);
        return <Txt key={i} x={xy[0] + 140 + i * 30} y={y} size={90} fill={GOLD} stroke="#1d1a2b">↑</Txt>;
      })}
    </g>
  );
};

const PriceSign: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(ELIDIR);
  if (!xy) return null;
  return <Sign x={Math.max(300, xy[0])} y={xy[1] - 120} w={420} label="POWER PRICE" value="LOW" k={k} bg="#1f2a48" fg="#9ff0b0" />;
};

const Night: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const nt = m.at("night", 4), sl = m.at("sleeps", 30), ch = m.at("cheap", 60), pu = m.at("pump", 90), uh = m.at("uphill", 115), hi = m.at("high", 150);
  const valley = m.t >= pu;
  return (
    <Stage p={p} bg="#0e1b36" vignette={0.4}>
      {!valley ? (
        <View zoom={1.02 + m.lerp([0, pu], [0, 0.06])}>
          <Britain center={[-3, 53.8]} scale={4200} night={1}>
            <CityLights each={(i) => 1 - m.lerp([sl + i * 3, sl + i * 3 + 8], [0, 1])} names />
            <PriceSign k={m.pop(ch, 12)} />
          </Britain>
          <Ball x={860} y={m.lerp([nt, nt + 24], [520, 330])} r={70} fill="#f4efd0" shadow={false} sw={5} />
        </View>
      ) : (
        <View zoom={1.02 + m.wave(80, 0.012)}>
          <Valley center={[-4.09 + 0.004 * m.lerp([hi, hi + 20], [0, 1]), 53.131 + 0.004 * m.lerp([hi, hi + 20], [0, 1])]} scale={900000 * (1 + 0.4 * m.lerp([hi, hi + 20], [0, 1]))} night>
            <Mountain night />
            <Lake at={MARCHLYN} rx={170} ry={100} level={m.lerp([pu, hi + 20], [0.35, 1])} seed={2} rot={-0.3} night t={m.t} />
            <Lake at={PERIS} rx={240} ry={60} level={m.lerp([pu, hi + 20], [1, 0.6])} seed={5} rot={-0.65} night t={m.t} />
            <Tunnel k={1} flow={1} up t={m.t} />
            <Arrows k={m.lerp([uh, uh + 10], [0, 1])} t={m.t} />
            <TopSign k={m.pop(hi, 12)} />
          </Valley>
          <Flash k={m.pulse(pu, 5)} />
        </View>
      )}
    </Stage>
  );
};

const TopSign: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(MARCHLYN);
  if (!xy) return null;
  return <Sign x={Math.min(720, xy[0])} y={Math.max(420, xy[1] - 160)} w={400} label="TOP LAKE" value="FILLING" k={k} bg="#1f2a48" fg="#9fd8ff" />;
};

export default Night;
