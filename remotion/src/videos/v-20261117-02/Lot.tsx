// Promise: "Not on the ticket: 50% of every ticket dollar goes to the studio that made the film."
// A Hollywood studio lot gate on a bright day: a giant ticket is wheeled up on "Not", it tears in two on
// "ticket", a stamp with the share lands on the torn half on "dollar", the gate guard waves that half through
// into the lot on "studio", and on "film" the camera pulls back over the sound stages and the film reel sign.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Limb, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Ticket } from "./props";

type Params = { fig?: { half?: string } };

const Lot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const half = (p.beat.params as Params).fig?.half ?? "";
  const not = m.at("not", 1), ticket = m.at("ticket", 12), dollar = m.at("dollar", 34), studio = m.at("studio", 50), film = m.at("film", 66);
  const roll = m.lerp([not - 2, not + 14], [0, 1], Easing.out(Easing.cubic));
  const tear = m.lerp([ticket, ticket + 10], [0, 1], Easing.out(Easing.back(1.5)));
  const through = m.lerp([studio + 2, studio + 24], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([dollar - 4, dollar + 8], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([film - 4, film + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.05 + 0.1 * close - 0.25 * back;
  const cx = 540 - 40 * close + 40 * back, cy = 900 - 40 * close - 120 * back;
  const W = 520, X = 100 - 700 * (1 - roll), Y = 900;
  return (
    <Stage p={p} bg="#8fd3ff" vignette={0.22}
      defs={<linearGradient id="amc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#62b6ff" /><stop offset="1" stopColor="#ffe9c4" /></linearGradient>}>
      <View zoom={zoom} cx={cx + m.wave(100, 4)} cy={cy}>
        <rect x={-600} y={-700} width={2280} height={2100} fill="url(#amc-sky)" />
        {/* sound stages behind the wall, the film reel sign */}
        {[[-300, 360], [80, 420], [700, 380], [1080, 330]].map(([x, h], i) => (
          <g key={i}>
            <Block x={x!} y={740 - h!} w={360} h={h!} fill="#e8d6b0" shadow="right" />
            <path d={`M ${x} ${740 - h!} Q ${x! + 180} ${640 - h!} ${x! + 360} ${740 - h!}`} fill="#cdb48a" stroke={INK} strokeWidth={5} />
          </g>
        ))}
        <Limb a={[540, 300]} b={[540, 120]} w={20} color="#5a5f73" />
        <g transform={`rotate(${m.t * 2} 540 40)`}>
          <Ball x={540} y={40} r={120} fill="#2b2b33" />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={540 + Math.cos(i * 1.256) * 70} cy={40 + Math.sin(i * 1.256) * 70} r={26} fill="#8fd3ff" stroke={INK} strokeWidth={3} />)}
        </g>
        {/* the wall and the gate */}
        <Block x={-600} y={740} w={2280} h={560} fill="#f0e4c8" shadow={false} />
        <path d="M 470 1300 L 470 900 Q 620 780 770 900 L 770 1300 Z" fill="#3a2a4a" stroke={INK} strokeWidth={6} />
        <Limb a={[470, 900]} b={[470, 640]} w={16} color="#5a5f73" /><Limb a={[770, 900]} b={[770, 640]} w={16} color="#5a5f73" /><Block x={430} y={590} w={380} h={110} r={12} fill="#d4af37" />
        <Txt x={620} y={645} size={64} fill={INK}>STUDIO</Txt>
        <rect x={-600} y={1300} width={2280} height={800} fill="#9a9aa8" />
        {/* the guard */}
        <Char x={880} y={1310} s={140} outfit="shirt" top="#2a3a6a" pants="#2a2f3d" hair="cap" hat="#2a3a6a" skin="#c98a5e"
          face={m.t >= studio ? "happy" : "neutral"} armR={m.t >= studio ? [150 + m.wave(8, 20), 170] : [20, 10]} />
        {/* the giant ticket on its dolly, torn in two */}
        <g transform={`translate(${X - 100} 0)`}>
          <Block x={110} y={1150} w={540} h={30} fill="#5a5f73" />
          <Ball x={170} y={1210} r={34} fill="#2b2b33" />
          <Ball x={590} y={1210} r={34} fill="#2b2b33" />
        </g>
        <defs>
          <clipPath id="amc-lh"><rect x={-1000} y={0} width={1000 + 100 + W * 0.5} height={2000} /></clipPath>
          <clipPath id="amc-rh"><rect x={100 + W * 0.5} y={0} width={2000} height={2000} /></clipPath>
        </defs>
        <g transform={`translate(${X - 100 + 150 * through + 40 * tear} ${-50 * tear})`} >
          <g clipPath="url(#amc-rh)"><Ticket x={100} y={Y} w={W} label={false} /></g>
          <Tag x={390} y={930} w={260} h={130} size={100} text={half} rot={-8} k={m.t < dollar ? 0 : m.pop(dollar, 9)} bg="#ffcf4a" />
        </g>
        <g transform={`translate(${X - 100 - 40 * tear} 0) rotate(${-6 * tear} 230 960)`}>
          <g clipPath="url(#amc-lh)"><Ticket x={100} y={Y} w={W} label={false} /></g>
        </g>
      </View>
    </Stage>
  );
};

export default Lot;
