// "Every person on the planet now carries that same passport: the same colour, the same name on the cover."
// The one-colour world: little people appear on every continent; the camera drifts over the planet; each
// holds up a passport in its own colour; on "colour" they all turn navy; on "name" a big passport writes
// EARTH on its cover; on "cover" it stamps shut onto the map.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { NAVY, Passport as Book, World } from "./props";

const SPOTS: [number, number][] = [[-100, 42], [-58, -12], [2, 47], [20, 5], [45, 25], [78, 22], [105, 35], [135, -25], [60, 58], [-70, 5]];
const COLORS = ["#8b1e2d", "#1f6b4a", "#2c3e66", "#6b2f7a", "#b5651d", "#8b1e2d", "#1f6b4a", "#c94f3d", "#2c3e66", "#6b2f7a"];

const People: React.FC<{ k: (i: number) => number; up: number; one: number; t: number }> = ({ k, up, one, t }) => {
  const at = useAt();
  return (
    <g>
      {SPOTS.map((s, i) => {
        const xy = at(s);
        const kk = k(i);
        if (!xy || kk <= 0) return null;
        const y = xy[1] + (1 - Math.min(1, kk)) * 40;
        return (
          <g key={i} opacity={Math.min(1, kk * 2)}>
            <Char x={xy[0]} y={y} s={44} face="happy" armR={[60 + 110 * up, 20]} armL={[15, 10]} tilt={Math.sin(t / 9 + i) * 3} />
            {up > 0.2 ? <Book x={xy[0] + 44} y={y - 150 - 20 * up} s={34} color={one > 0.5 ? NAVY : COLORS[i]!} /> : null}
          </g>
        );
      })}
    </g>
  );
};

const Passport: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const vi = m.at("visa", 160);
  const pe = m.at("person", 2), pl = m.at("planet", 25), pa = m.at("passport", 50), co = m.at("colour", 80), na = m.at("name", 105), cv = m.at("cover", 130);
  const name = "EARTH".slice(0, Math.round(5 * m.lerp([na, na + 12], [0, 1])));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + m.lerp([pl, m.end], [0, 0.08]) + m.wave(80, 0.01)} cx={540 + m.lerp([pl, na], [0, 60])}>
        <World center={[20, 18]} scale={300} merge={() => 1}>
          <People k={(i) => m.pop(pe + i * 2, 12)} up={m.lerp([pa, pa + 10], [0, 1])} one={m.lerp([co, co + 6], [0, 1])} t={m.t} />
        </World>
      </View>
      {m.t >= na - 6 ? (
        <g transform={`translate(0 ${(1 - m.pop(na - 6, 12)) * -400}) rotate(${-6 * (1 - m.lerp([cv, cv + 6], [0, 1]))} 540 640)`}>
          <Book x={540} y={640} s={260 + 30 * m.pulse(cv + 3, 6)} name={name || " "} />
        </g>
      ) : null}
      <Tag x={330} y={880} w={420} h={100} text="ONE PASSPORT" bg="#f2b134" k={m.pop(cv, 12)} rot={-4} />
      {m.t < vi + 16 ? <g transform={`translate(${m.lerp([vi, vi + 16], [0, 500])} ${m.lerp([vi, vi + 16], [0, -300])}) rotate(${m.lerp([vi, vi + 16], [0, 40])} 760 470)`}><Tag x={640} y={430} w={240} h={84} text="VISA" bg="#d9483b" fg="#ffffff" k={m.pop(cv + 4, 12)} rot={8} /></g> : null}
    </Stage>
  );
};

export default Passport;
