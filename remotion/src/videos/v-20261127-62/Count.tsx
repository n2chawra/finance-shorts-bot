// Count: "गिनती शुरू हुई। पहले देखिए, ना कहने वाले कितने थे?" On the hill over Gangtok: the ballot box tips on "गिनती" and
// slips pour out, two trays slide in on "पहले" (red for no, green for yes), the red one glows on "ना" and a question tag pops
// over it on "कितने".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { BallotBox, F, GOLD, MapView, Pile, lerpFrame } from "./props";

const Count: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const gi = m.at("ginti", 2), pe = m.at("pehle", 20), na = m.at("na", 34), ki = m.at("kitne", 44);
  const frame = lerpFrame({ ...F.gangtok, scale: F.gangtok.scale * 1.2 }, F.gangtok, m.lerp([na - 2, na + 16], [0, 1]));
  const slide = m.lerp([pe, pe + 14], [0, 1]);
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.012)}>
        <MapView t={m.t} frame={frame} states={{ Sikkim: { fill: GOLD, lift: 0.3 } }} dim={0.45} />
        <BallotBox x={540} y={760} s={300} k={1} slip={0} tip={m.lerp([gi, gi + 12], [0, 1])} />
        {Array.from({ length: 14 }, (_, i) => {
          const q = m.lerp([gi + 6 + i, gi + 22 + i], [0, 1]);
          return q > 0 && q < 1 ? <rect key={i} x={620 + q * (i % 2 ? 260 : -340) + i * 6} y={700 + q * 380 - Math.sin(q * Math.PI) * 120} width={60} height={76} rx={4}
            fill="#ffffff" stroke="#1d1a2b" strokeWidth={3} transform={`rotate(${q * 200 + i * 20} ${640 + i * 6} ${760})`} /> : null;
        })}
        <Glow x={300 + (1 - slide) * -400} y={1150} r={200} color="#ff5a4a" o={0.6 * m.lerp([na, na + 8], [0, 1])} />
        <Pile x={300 + (1 - slide) * -400} y={1180} w={240} level={m.lerp([gi + 10, gi + 30], [0, 0.15])} full={300} color="#e8453c" t={m.t} />
        <Pile x={780 + (1 - slide) * 400} y={1180} w={240} level={m.lerp([gi + 10, m.end], [0, 0.6])} full={300} color="#3a9d5d" t={m.t} />
        <Tag x={300} y={960} w={150} h={110} text="?" size={80} bg="#ffc43d" k={m.pop(ki, 10)} />
      </View>
    </Stage>
  );
};
export default Count;
