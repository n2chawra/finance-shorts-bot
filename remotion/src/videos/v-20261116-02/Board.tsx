// Turn: "And Oracle bans every other director from pledging. Ellison is the exception."
// Oracle's boardroom: a NO PLEDGING sign drops over the table on "bans", each director's plate flips to a red
// cross on "every", the directors fold their arms on "pledging", the camera pushes in on the empty head chair on
// "Ellison", and a gold EXCEPTION stamp lands on its plate on "exception".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const bans = m.at("bans", 2), every = m.at("every", 12), pledging = m.at("pledging", 30), ell = m.at("ellison", 46), exc = m.at("exception", 60);
  const close = m.lerp([ell - 4, ell + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.6 * close, cx = 540, cy = 980 - 120 * close;
  const sign = m.pop(bans - 6, 14);
  const seats: [number, number, number][] = [[170, 1020, 0], [330, 1020, 1], [750, 1020, 2], [910, 1020, 3]];
  return (
    <Stage p={p} bg="#1d1630" vignette={0.48}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#3a2d52" />
        <rect x={-400} y={1300} width={1880} height={900} fill="#2a2238" />
        {/* the sign */}
        <g transform={`translate(0 ${(1 - sign) * -500 - 400 * close})`} opacity={1 - close}>
          <line x1={300} y1={-100} x2={300} y2={240} stroke={INK} strokeWidth={6} />
          <line x1={780} y1={-100} x2={780} y2={240} stroke={INK} strokeWidth={6} />
          <rect x={200} y={230} width={680} height={150} rx={14} fill="#e0352b" stroke={INK} strokeWidth={STROKE} />
          <Txt x={540} y={307} size={78} fill="#ffffff">NO PLEDGING</Txt>
        </g>
        {/* the head chair at the far end */}
        <Glow x={540} y={760} r={260} color="#ffd23f" o={0.25 + 0.35 * m.pop(exc, 10)} />
        <rect x={430} y={540} width={220} height={330} rx={40} fill="#5a3a26" stroke={INK} strokeWidth={STROKE} />
        <rect x={400} y={820} width={280} height={86} rx={10} fill="#d9d6d0" stroke={INK} strokeWidth={5} />
        <Txt x={540} y={864} size={50} fill={INK}>ELLISON</Txt>
        {/* the table and the directors */}
        {seats.filter((s) => s[1] < 1100).map(([x, y, i]) => (
          <Char key={i} x={x} y={y} s={130} outfit="suit" top={["#2f3445", "#3a2f45", "#2f4540"][i % 3]} hair={i % 2 ? "side" : "bald"} skin={["#e2a679", "#c98652", "#8a5a36"][i % 3]}
            face={m.t >= pledging ? "smirk" : "neutral"} armL={m.t >= pledging ? [40, -100] : [20, 10]} armR={m.t >= pledging ? [40, -100] : [20, 10]} look={[x < 540 ? 0.6 : -0.6, 0]} />
        ))}
        <polygon points="380,920 700,920 1000,1300 80,1300" fill="#7a4a2e" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        {seats.map(([x, y, i]) => {
          const flip = m.lerp([every + i * 2, every + i * 2 + 6], [0, 1]);
          const px = x < 540 ? x + 40 : x - 40, py = y < 1100 ? 1010 : 1200;
          return (
            <g key={`p${i}`} transform={`translate(${px} ${py}) scale(1 ${Math.abs(1 - 2 * flip)})`}>
              <rect x={-60} y={-30} width={120} height={60} rx={8} fill={flip > 0.5 ? "#ffffff" : "#d9d6d0"} stroke={INK} strokeWidth={4} />
              {flip > 0.5 ? <g><line x1={-24} y1={-20} x2={24} y2={20} stroke="#e0352b" strokeWidth={10} /><line x1={-24} y1={20} x2={24} y2={-20} stroke="#e0352b" strokeWidth={10} /></g> : null}
            </g>
          );
        })}
        {seats.filter((s) => s[1] > 1100).map(([x, y, i]) => (
          <Char key={i} x={x} y={y + 260} s={170} back outfit="suit" top={["#2f3445", "#3a2f45", "#2f4540"][i % 3]} hair={i % 2 ? "side" : "spiky"} />
        ))}
        {m.t >= exc ? (
          <g transform={`translate(540 700) rotate(-10) scale(${1 + (1 - m.pop(exc, 9)) * 1.4})`}>
            <rect x={-210} y={-50} width={420} height={100} rx={12} fill="#d4af37" stroke={INK} strokeWidth={6} />
            <Txt x={0} y={3} size={64} fill={INK}>EXCEPTION</Txt>
          </g>
        ) : null}
        <Block x={-400} y={1500} w={1880} h={30} fill="#3a2f45" sw={0} shadow={false} />
      </View>
    </Stage>
  );
};

export default Board;
