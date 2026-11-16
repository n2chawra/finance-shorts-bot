// Build: "So why does the store keep so little? Every parcel needs a warehouse, a driver and a van." A
// suburban street at dawn: the van pulls up piled with parcels, one tiny coin drops into its "kept" jar on
// "little", then a cost tag lands on each thing the parcel needs as it is named: the warehouse behind the
// street, the driver running up the path to Rohan's door, the van puffing exhaust as its fuel needle drops.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Parcel, Van } from "./props";

const Street: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const why = m.at("why", 4), little = m.at("little", 30), every = m.at("every", 40);
  const wh = m.at("warehouse", 50), drv = m.at("driver", 60), van = m.at("van", 72);
  const vanX = m.lerp([0, why + 14], [-900, -120], Easing.out(Easing.cubic));
  const run = m.lerp([drv - 4, m.end], [0, 1], Easing.inOut(Easing.quad));
  const zoom = m.t < every ? m.lerp([0, every], [1.0, 1.04]) : m.t < van ? m.lerp([every, every + 12], [1.04, 1.22]) : m.lerp([van, van + 10], [1.22, 1.55]);
  const cx = m.t < van ? m.lerp([every, every + 12], [540, 600]) : m.lerp([van, van + 10], [600, 360]);
  const cy = m.t < van ? m.lerp([every, every + 12], [1000, 960]) : m.lerp([van, van + 10], [960, 1250]);
  const needle = m.lerp([van, van + 14], [60, -60]);
  return (
    <Stage p={p} bg="#ffcf9a" vignette={0.3}
      defs={<linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb4e8" /><stop offset="0.7" stopColor="#ffd6a3" /><stop offset="1" stopColor="#ffb27a" /></linearGradient>}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={1300} fill="url(#st-sky)" />
        <circle cx={200} cy={700} r={110} fill="#fff1c4" />
        <Glow x={200} y={700} r={380} color="#fff1c4" o={0.45} />
        {/* the warehouse far behind the street */}
        <Block x={-260} y={520} w={700} h={400} fill="#8d97ad" />
        <path d="M -270 530 L 90 400 L 450 530 Z" fill="#6c7690" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <Tag x={200} y={600} w={230} h={110} text="COST" size={64} k={m.t < van ? m.pop(wh, 10) : 0} rot={-4} bg="#e0352b" fg="#ffffff" />
        {/* Rohan's house */}
        <Block x={560} y={560} w={620} h={560} fill="#f2e2c4" />
        <path d="M 530 570 L 870 330 L 1210 570 Z" fill="#c4553f" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <Block x={780} y={830} w={170} h={290} fill="#2f6fb5" />
        <Block x={600} y={680} w={140} h={130} fill="#9fd4ff" />
        <Char x={865} y={1120 + m.wave(60, 3)} s={190} who="rohan" face={m.t >= drv + 20 ? "happy" : "neutral"} armL={[30, 20]} armR={[m.lerp([drv + 18, drv + 26], [20, 80]), 70]} look={[-0.6, 0]} />
        {/* the street */}
        <rect x={-300} y={1120} width={1680} height={140} fill="#9fb06a" />
        <rect x={-300} y={1260} width={1680} height={700} fill="#55596a" />
        <line x1={-300} y1={1260} x2={1380} y2={1260} stroke={INK} strokeWidth={STROKE} />
        {[-200, 100, 400, 700, 1000].map((x) => <rect key={x} x={x} y={1540} width={160} height={18} fill="#f2f2f2" />)}
        {/* the path from the van to the door */}
        <polygon points="760,1260 960,1260 900,1120 820,1120" fill="#d8cdb8" stroke={INK} strokeWidth={4} />
        <g transform={`translate(${vanX} 0)`}>
          <Van x={0} y={1500} s={1} t={m.t} />
          {[0, 1, 2, 3, 4].map((i) => <Parcel key={i} x={40 + i * 92} y={1130 - (i % 2) * 40} w={110} />)}
          {[0, 1, 2].map((i) => <Parcel key={`t${i}`} x={90 + i * 120} y={1060} w={100} rot={(i - 1) * 6} />)}
          {/* the kept jar on the roof */}
          <rect x={560} y={1060} width={110} height={130} rx={18} fill="#cfe8ff" opacity={0.75} stroke={INK} strokeWidth={5} />
          <Txt x={615} y={1030} size={46} fill={INK} weight={800}>KEPT</Txt>
          {m.t >= little - 8 ? <Coin x={615} y={m.lerp([little - 8, little], [900, 1165], Easing.in(Easing.quad))} r={20} spin={Math.abs(Math.cos(m.t / 3))} /> : null}
          <Tag x={260} y={1300} w={240} h={100} text="COST" size={58} k={m.pop(van, 10)} rot={4} bg="#e0352b" fg="#ffffff" />
          {/* fuel gauge on the van's side */}
          <g transform="translate(150 1340)">
            <circle r={52} fill="#ffffff" stroke={INK} strokeWidth={5} />
            <line x1={0} y1={0} x2={Math.sin((needle * Math.PI) / 180) * 40} y2={-Math.cos((needle * Math.PI) / 180) * 40} stroke="#e0352b" strokeWidth={8} strokeLinecap="round" />
          </g>
          {m.t >= van ? [0, 1, 2].map((i) => {
            const k = m.lerp([van + i * 3, van + i * 3 + 16], [0, 1]);
            return <circle key={i} cx={-20 - k * 120} cy={1430 - k * 60} r={20 + k * 30} fill="#c9c9d1" opacity={1 - k} />;
          }) : null}
        </g>
        {/* the driver with the parcel */}
        {m.t >= drv - 4 ? (
          <g>
            <Char x={720 + run * 120} y={1250 - run * 120 + m.wave(10, 6)} s={210 - run * 30}
              outfit="tee" top="#1f6fbf" hair="cap" hat="#1f6fbf" skin="#c98b5e" face="worried" sweat look={[0.7, -0.2]} armL={[60, 90]} armR={[60, 90]}
              holdR={(h) => <Parcel x={h[0] - 60} y={h[1] - 70} w={120} />} />
            <Tag x={720 + run * 120 - 120} y={850 - run * 120} w={240} h={100} text="COST" size={58} k={m.t < van ? m.pop(drv, 10) : 0} rot={-5} bg="#e0352b" fg="#ffffff" />
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Street;
