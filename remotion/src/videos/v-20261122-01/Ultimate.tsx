// Ultimate (the turn): "But what if every fan bought the Ultimate box at {fact2}? Then only {ult_years} copies."
// A glass display case under a gold spotlight: the light turns gold on "But", a fan in a cap presses against the
// glass on "fan", the gold Ultimate box rises on its stand on "Ultimate", its gold price tag stamps on "box", the
// copy counter on the case drops to the smaller count on "only", and the stack of boxes beside it shrinks on "copies".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { GameBox, GOLD, Gamer, Sparkle } from "./props";

type Params = { fig?: { price?: string; copies?: string } };

const Ultimate: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const but = m.at("but", 2), fan = m.at("fan", 14), ult = m.at("ultimate", 30), box = m.at("only", 44), only = m.at("only", 70), copies = m.at("copies", m.end - 12);
  const gold = m.lerp([but, but + 10], [0, 1]);
  const rise = m.pop(ult, 12);
  const tag = m.pop(box, 10);
  const count = m.lerp([only, only + 20], [0, 1]);
  const shrink = m.lerp([copies - 6, copies + 14], [1, 0.7]);
  const zoom = m.t < box ? m.lerp([0, box], [1.05, 1.1]) : m.t < copies ? m.lerp([box, box + 14], [1.1, 1.28]) : m.lerp([copies - 4, copies + 12], [1.28, 1.1]);
  const cy = m.t < box ? 860 : m.t < copies ? m.lerp([box, box + 14], [860, 760]) : m.lerp([copies - 4, copies + 12], [760, 840]);
  const bg = gold > 0.5 ? "#2b1f08" : "#1b1433";
  return (
    <Stage p={p} bg={bg} vignette={0.5}>
      <View zoom={zoom} cx={560 + m.wave(100, 5)} cy={cy}>
        <rect x={-600} y={-600} width={2280} height={3200} fill={bg} />
        <Glow x={560} y={600} r={700} color={GOLD} o={0.15 + 0.35 * gold} />
        <path d={`M 480 -100 L 640 -100 L 820 1100 L 300 1100 Z`} fill="#fff2b8" opacity={0.12 * gold} />
        {/* the case: plinth, glass, gold trim */}
        <Block x={250} y={1100} w={620} h={260} fill="#3a2f20" />
        <rect x={250} y={1100} width={620} height={20} fill={GOLD} stroke={INK} strokeWidth={4} />
        <rect x={270} y={420} width={580} height={680} fill="#bfe6ff" opacity={0.18} stroke="#e8f6ff" strokeWidth={6} />
        {/* the Ultimate box rising on its stand */}
        <rect x={500} y={1100 - rise * 120} width={120} height={rise * 120} fill="#5a4a30" />
        <GameBox x={560} y={1100 - rise * 120} w={320} ultimate />
        <Sparkle x={420} y={560} r={36} k={m.pop(ult + 4, 10)} />
        <Sparkle x={720} y={500} r={28} k={m.pop(ult + 9, 10)} />
        <Tag x={620} y={420} w={300} h={110} text={fig.price ?? ""} rot={-7} size={62} k={tag} bg={GOLD} />
        {/* the copy counter on the case */}
        <Display x={300} y={160} w={520} h={220} label="COPIES IT BUYS" value={countText(fig.copies ?? "", 0.3 + 0.7 * count)} color={GOLD} k={Math.min(1, count * 4)} />
        {/* the stack beside the case, shrinking */}
        <g transform={`translate(110 1100) scale(1 ${shrink}) translate(-110 -1100)`}>
          {Array.from({ length: 6 }).map((_, r) => <GameBox key={r} x={110} y={1100 - r * 114} w={88} label={false} tilt={(r % 3) - 1} />)}
        </g>
        {/* the fan at the glass */}
        {m.t >= fan ? <Gamer x={m.lerp([fan, fan + 14], [1100, 900])} y={1560} s={300} m={m} i={3} face={m.t >= ult ? "shock" : "happy"} /> : null}
      </View>
    </Stage>
  );
};

export default Ultimate;
