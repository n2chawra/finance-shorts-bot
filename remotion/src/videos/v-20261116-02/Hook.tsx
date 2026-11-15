// Hook: "Larry Ellison's Oracle salary was $1 until last year."
// Oracle's payroll office at night: his pay slip is pinned on the board (his name on it, frame 0) and the
// printer pushes a fresh copy out on "Larry"; the slip's salary stamps in on "salary"; on "until" the camera
// pulls back on the tower of share certificates beside the desk, its tag counting to the figure, and on "last"
// a giant padlock snaps shut round the tower as the camera closes in.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, STROKE, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { CertStack, Ellison, Lamp, Padlock } from "./props";

type Params = { fig?: { salary?: string; shares?: string } };

export const Office: React.FC<{ m: ReturnType<typeof motion>; salary: string; shares: string; stamp: number; tag: number; shut: number; n: number }> = ({ m, salary, shares, stamp, tag, shut, n }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={1800} fill="#1f2f4a" />
    {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-400 + i * 200} y={-400} width={100} height={1800} fill="#223453" />)}
    <rect x={-400} y={1340} width={1880} height={900} fill="#2a2238" />
    {/* the cork board with the pay slip */}
    <Block x={50} y={260} w={520} h={460} fill="#a8724a" />
    <g transform="rotate(-4 300 480)">
      <rect x={90} y={300} width={440} height={380} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
      <rect x={90} y={300} width={440} height={70} fill="#c74634" />
      <Txt x={310} y={337} size={40} fill="#fff" deco>ORACLE PAY SLIP</Txt>
      <Txt x={310} y={420} size={46} fill={INK}>LARRY ELLISON</Txt>
      <Txt x={170} y={500} size={34} fill="#6b6880" weight={700} anchor="start" deco>SALARY</Txt>
      <g transform={`translate(310 590) scale(${0.6 + 0.4 * stamp + 0.25 * m.pulse(stamp > 0 ? 1 : 0, 0)})`}>
        <Txt x={0} y={0} size={150} fill="#1f8a52">{salary}</Txt>
      </g>
      <circle cx={310} cy={312} r={14} fill="#e0352b" stroke={INK} strokeWidth={3} />
    </g>
    {/* the desk, the lamp, the printer, Ellison */}
    <Ellison x={300} y={1420} s={250} face="smirk" armR={[120, 100]} armL={[30, 20]} />
    <Block x={-100} y={1150} w={700} h={210} fill="#5a3a26" shadow="bottom" />
    <Lamp x={560} y={1150} />
    {/* the tower of pledged certificates */}
    <Glow x={780} y={900} r={420} color="#ffd890" o={0.25} />
    <CertStack x={630} y={1350} w={250} n={n} />
    <Display x={570} y={300} w={310} h={190} label="PLEDGED" value={shares} color="#ffd23f" k={tag} />
    <Padlock x={755} y={1060 - (1 - shut) * 300} s={1.5} shut={shut} />
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const larry = m.at("larry", 2), salary = m.at("salary", 30), pledged = m.at("until", 50), loans = m.at("last", 66);
  const back = m.lerp([pledged - 2, pledged + 14], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([loans - 4, loans + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.05 - 0.1 * back + 0.2 * close;
  const cx = 520 + 20 * back + 120 * close, cy = 760 + 100 * back + 40 * close;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#14203a" vignette={0.46}>
        <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
          <Office m={m} salary={P.salary ?? ""} shares={P.shares ?? ""} stamp={m.t < salary ? 0.85 : m.pop(salary, 9)} tag={m.lerp([pledged - 4, pledged + 6], [0.45, 1])}
            shut={m.t < loans ? 0 : m.pop(loans, 10)} n={m.lerp([larry, pledged + 10], [24, 40])} />
          <Glow x={780} y={1060} r={300} color="#ffd23f" o={0.5 * m.pulse(loans + 2, 8)} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
