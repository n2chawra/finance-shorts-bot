// Build: "Even after a 4% raise this year, the top rate is only a few dollars more."
// The backstage dressing room: the bear performer lifts off the costume head at the mirror on "Even", the pay
// board on the wall lights up on "after", a raise arrow slaps on and the share counts up on "raise", the
// performer wipes the sweat on "year", the board's second line lights on "top", and on "dollars" a few coins drop
// into the performer's paw as the camera pulls back over the spare costume heads.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Glow, INK, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Bear } from "./props";

type Params = { fig?: { raise?: string; top?: string } };

const Backstage: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const even = m.at("even", 1), best = m.at("after", 8), make = m.at("raise", 30), raise = m.at("raise", 30), year = m.at("year", 40), top = m.at("top", 50), isW = m.at("is", 54), dollars = m.at("dollars", 90);
  const count2 = m.lerp([isW, isW + 20], [0, 1], Easing.out(Easing.cubic));
  const off = m.lerp([even - 2, even + 14], [0, 1], Easing.out(Easing.cubic));
  const board = m.t < best ? 0.3 : 1;
  const count = m.lerp([make, make + 24], [0, 1], Easing.out(Easing.cubic));
  const slap = m.t < raise ? 0 : m.pop(raise, 9);
  const close = m.lerp([make - 4, make + 8], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([dollars - 4, dollars + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.04 + 0.1 * close - 0.16 * back;
  const cx = 540 + 60 * close - 60 * back, cy = 880 - 60 * close + 80 * back;
  return (
    <Stage p={p} bg="#3a2a3a" vignette={0.42}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={2600} fill="#4a3448" />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-500 + i * 180} y={-500} width={6} height={1800} fill="#56405a" />)}
        {/* the mirror with bulbs */}
        <Block x={60} y={330} w={400} h={480} r={16} fill="#2a2030" />
        <rect x={90} y={360} width={340} height={420} rx={10} fill="#bcd8ff" opacity={0.5} />
        {Array.from({ length: 6 }).map((_, i) => <g key={i}><Ball x={60} y={360 + i * 85} r={18} fill="#fff2a8" sw={3} shadow={false} /><Ball x={460} y={360 + i * 85} r={18} fill="#fff2a8" sw={3} shadow={false} /></g>)}
        <Glow x={260} y={560} r={330} color="#fff2a8" o={0.35} />
        {/* the pay board */}
        <g opacity={board}>
          <Glow x={750} y={480} r={300} color="#7cff9a" o={0.3} />
          <Block x={520} y={280} w={420} h={400} r={14} fill="#0b1f14" />
          <Txt x={730} y={330} size={46} fill="#7cff9a">RAISE</Txt>
          <Txt x={730} y={410} size={90} fill="#7cff9a" glow="#7cff9a">{m.t < make ? "" : countText(P.raise ?? "", count)}</Txt>
          <Txt x={730} y={505} size={46} fill={m.t >= top ? "#ffcf4a" : "#2a5a3a"}>TOP RATE</Txt>
          <Txt x={730} y={590} size={84} fill="#ffcf4a" glow="#ffcf4a">{m.t < isW ? "" : countText(P.top ?? "", count2)}</Txt>
        </g>
        {slap > 0 ? <g transform={`translate(500 720) scale(${slap}) translate(-500 -720)`}><path d="M 470 800 L 470 720 L 430 720 L 500 640 L 570 720 L 530 720 L 530 800 Z" fill="#3a9d5d" stroke={INK} strokeWidth={5} /></g> : null}
        {/* the dressing table and spare heads */}
        <Block x={-500} y={1000} w={2080} h={70} fill="#8a5a3a" />
        {[-300, 620, 820, 1020].map((x, i) => (
          <g key={i}>
            <Ball x={x} y={940} r={60} fill="#a8703a" />
            <Ball x={x - 45} y={890} r={22} fill="#a8703a" sw={4} />
            <Ball x={x + 45} y={890} r={22} fill="#a8703a" sw={4} />
            <Ball x={x} y={965} r={28} ry={20} fill="#f1d3a8" sw={3} shadow={false} />
          </g>
        ))}
        <rect x={-500} y={1300} width={2080} height={900} fill="#2a2030" />
        {/* the performer */}
        <Bear x={290} y={1460 + m.wave(60, 3)} s={160} headOff={off} armL={m.t >= dollars ? 0.6 : off} wave={m.t >= year && m.t < top ? 0.9 : 0} />
        {[0, 1, 2].map((i) => { const k = m.lerp([dollars + i * 4, dollars + i * 4 + 10], [0, 1], Easing.in(Easing.quad)); return k > 0 ? <Coin key={i} x={110 + i * 14} y={700 + 420 * k} r={26} spin={Math.abs(Math.cos(m.t / 4 + i))} /> : null; })}
      </View>
    </Stage>
  );
};

export default Backstage;
