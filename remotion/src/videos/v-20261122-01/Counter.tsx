// Counter: "Rohan pays it at the counter. One copy, sold."
// The checkout counter: Rohan steps up with the box on "Rohan", taps his card on the reader on "pays" (it beeps
// green), the till screen shows the price on "counter", the box goes into a bag and the till's tally flips to one on
// "copy", a SOLD sticker slaps onto the bag on "sold".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GameBox, NEON } from "./props";

type Params = { fig?: { price?: string } };

const Counter: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = (p.beat.params as Params).fig?.price ?? "";
  const rohan = m.at("rohan", 2), pays = m.at("pays", 20), counter = m.at("counter", 35), copy = m.at("copy", 55), sold = m.at("sold", m.end - 18);
  const step = m.lerp([rohan, rohan + 14], [0, 1]);
  const tap = m.pulse(pays + 4, 6);
  const green = m.t >= pays + 4;
  const screen = m.pop(counter, 10);
  const bag = m.lerp([copy, copy + 12], [0, 1]);
  const stick = m.pop(sold, 9);
  const zoom = m.t < copy ? m.lerp([0, copy], [1.05, 1.12]) : m.t < sold ? m.lerp([copy, copy + 14], [1.12, 1.28]) : m.lerp([sold, sold + 14], [1.28, 1.12]);
  const cx = m.t < copy ? 540 : m.lerp([copy, copy + 14], [540, 620]);
  return (
    <Stage p={p} bg="#2a1d3f" vignette={0.4}>
      <View zoom={zoom} cx={cx + m.wave(100, 5)} cy={m.lerp([0, m.end], [820, 860])}>
        <rect x={-600} y={-600} width={2280} height={3200} fill="#2a1d3f" />
        <rect x={-600} y={180} width={2280} height={16} fill={NEON} opacity={0.8} />
        <Glow x={540} y={190} r={900} ry={120} color={NEON} o={0.3} />
        {/* posters on the wall behind the till: our own drawn game boxes */}
        <GameBox x={150} y={640} w={200} label={false} tilt={-4} />
        <GameBox x={930} y={640} w={200} label={false} tilt={4} />
        {/* the cashier behind the counter */}
        <Char x={760} y={1240} s={280} top="#ff4fa3" hair="cap" hat="#1b1433" face={green ? "happy" : "neutral"} look={[-0.6, 0]}
          armL={[40, -60]} armR={[25, 20]} />
        {/* the till with its screen */}
        <Block x={560} y={560} w={380} h={260} r={18} fill="#2b2d3c" />
        <rect x={585} y={585} width={330} height={210} rx={10} fill={screen > 0 ? "#0b1a14" : "#05070a"} stroke={INK} strokeWidth={4} />
        {screen > 0 ? <Txt x={750} y={690} size={72} fill="#4dff9a" glow="#4dff9a">{price}</Txt> : null}
        {/* the counter top */}
        <Block x={-200} y={960} w={1480} h={80} fill="#c7b38a" shadow="bottom" />
        <Block x={-200} y={1040} w={1480} h={500} fill="#8a6f4a" shadow={false} />
        {/* the card reader */}
        <g transform={`translate(330 ${930 - tap * 10})`}>
          <rect x={-70} y={-150} width={140} height={150} rx={16} fill="#30323f" stroke={INK} strokeWidth={STROKE} />
          <rect x={-50} y={-130} width={100} height={60} rx={8} fill={green ? "#4dff9a" : "#6b6f85"} />
          {green ? <Glow x={0} y={-100} r={120} color="#4dff9a" o={0.5} /> : null}
        </g>
        {/* the bag with the box going in, its tally on a till display */}
        <g transform={`translate(${560 + bag * 40} 960)`}>
          <rect x={-130} y={-260} width={260} height={260} rx={14} fill="#f4efe3" stroke={INK} strokeWidth={STROKE} />
          <path d="M -60 -260 Q 0 -340 60 -260" fill="none" stroke={INK} strokeWidth={10} />
          {bag < 1 ? <g transform={`translate(0 ${-280 + bag * 200})`} opacity={1 - bag * 0.6}><GameBox x={0} y={0} w={170} label={false} /></g> : null}
          {stick > 0 ? <g transform={`rotate(-10) scale(${0.5 + 0.5 * stick})`}><Tag x={-120} y={-180} w={240} h={100} text="SOLD" size={62} bg="#ff4f5e" fg="#ffffff" /></g> : null}
        </g>
        <Display x={170} y={250} w={330} h={170} label="COPIES SOLD" value={m.t >= copy ? "ONE" : "NONE"} color="#ffc43d" k={1} />
        {/* Rohan steps up, card in hand */}
        <Char x={m.lerp([rohan, rohan + 14], [-80, 180])} y={1600} s={330} who="rohan" face={green ? "grin" : "happy"} look={[0.7, -0.2]}
          armR={[80 + tap * 10, 50 - step * 10]} />
      </View>
    </Stage>
  );
};

export default Counter;
