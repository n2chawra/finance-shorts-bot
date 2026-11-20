// Build: "But every NBA team gets an equal share of the league's TV money, win or lose."
// Outside the arena by the TV broadcast truck: its satellite dish swings up on "every", a row of identical team
// mailboxes pops up on "equal", cash bundles shoot out of the truck into every mailbox on "money", and the losing team's
// box gets its bundle too, its flag flipping up, on "lose".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Cash, Limb, SourceLine, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { PURPLE, TEAL } from "./props";

const BOX = [120, 330, 540, 750, 960];
const COLORS = ["#e23b3b", "#2f6fd6", TEAL, "#f0a020", "#3fb07a"];

const Truck: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const every = m.at("every", 6), equal = m.at("equal", 20), money = m.at("money", 45), lose = m.at("lose", 70);
  const dish = m.lerp([every - 2, every + 10], [0, 1], Easing.out(Easing.back(1.5)));
  const boxes = BOX.map((_, i) => m.pop(equal - 2 + i * 2, 10));
  const flags = BOX.map((_, i) => m.t >= money + 6 + i * 3);
  const push = m.lerp([money - 4, money + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#141a3a" vignette={0.4}>
        <View zoom={1.0 + 0.1 * push} cx={540 + m.wave(60, 6)} cy={900 + 80 * push + m.wave(70, 5)}>
          <rect x={-500} y={-600} width={2080} height={3200} fill="#1d2550" />
          <Block x={-300} y={150} w={1680} h={500} fill={PURPLE} />
          <Txt x={540} y={260} size={60} fill="#ffffff" weight={800}>ARENA</Txt>
          <rect x={-500} y={650} width={2080} height={1900} fill="#4a4f5c" />
          {/* the broadcast truck */}
          <Block x={140} y={520} w={600} h={300} r={20} fill="#e8e8ee" />
          <Block x={740} y={600} w={200} h={220} r={20} fill="#d0d0d8" />
          <Txt x={440} y={660} size={64} fill="#1d1a2b">TV</Txt>
          {[260, 620, 860].map((x) => <Ball key={x} x={x} y={830} r={50} fill="#2a2a34" />)}
          <g transform={`rotate(${-60 + 60 * dish} 440 520)`}>
            <Limb a={[440, 520]} b={[440, 420]} w={16} color="#8a8a94" />
            <ellipse cx={440} cy={400} rx={110} ry={40} fill="#f4f4f8" stroke="#1d1a2b" strokeWidth={6} />
          </g>
          {/* the mailboxes, one per team, all the same */}
          {BOX.map((x, i) => boxes[i]! > 0 ? (
            <g key={x} transform={`translate(${x} 1180) scale(${boxes[i]!}) translate(${-x} -1180)`}>
              <Limb a={[x, 1180]} b={[x, 1320]} w={14} color="#2a2a34" />
              <Block x={x - 80} y={1060} w={160} h={120} r={40} fill={COLORS[i]!} />
              <Limb a={[x + 80, 1080]} b={[x + 80, flags[i] ? 1000 : 1080]} w={8} color="#ff4b4b" sw={3} />
            </g>
          ) : null)}
          {/* cash flying from the truck into each box */}
          {BOX.map((x, i) => {
            const k = m.lerp([money + i * 3, money + 10 + i * 3], [0, 1], Easing.inOut(Easing.quad));
            if (k <= 0 || k >= 1) return null;
            return <Cash key={x} x={440 + (x - 440) * k - 40} y={700 + (1100 - 700) * k - 260 * Math.sin(Math.PI * k)} w={90} />;
          })}
          <Tag x={BOX[4]! - 140} y={880} w={280} h={100} text="LOST" bg="#ff4b4b" fg="#ffffff" k={m.t >= lose ? 1 : 0} rot={6} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Truck;
