// Turn: "Castro took it all at once instead, and all at once it was only $997.6M."
// The lottery's counting vault: Castro steps in and points at the cash on "Castro", a forklift rolls the pallet of
// cash toward him on "took", the JACKPOT sign over it flickers out on "instead", and on "only" the pallet's LED
// counter drops from the jackpot to the cash figure with a thud as the camera closes in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Castro, CashPile } from "./props";

type Params = { fig?: { cash?: string; jackpot?: string } };

const Vault: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const castro = m.at("castro", 2), took = m.at("took", 10), instead = m.at("instead", 30), only = m.at("only", 52), andW = m.at("and", 40);
  const walk = m.lerp([castro - 2, castro + 16], [0, 1], Easing.out(Easing.cubic));
  const lift = m.lerp([took, took + 20], [0, 1], Easing.inOut(Easing.cubic));
  const sign = m.t < instead ? 1 : m.t < instead + 10 ? (Math.floor(m.t / 2) % 2 ? 0.2 : 0.9) : 0.08;
  const dropped = m.t >= only;
  const mid = m.lerp([instead - 4, instead + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([m.at("cash", 70) - 4, m.at("cash", 70) + 8], [0, 1], Easing.inOut(Easing.cubic));
  const shake = m.pulse(only + 1, 6) * 10;
  const zoom = 1.0 + 0.1 * mid + 0.08 * close;
  const cx = 540 + 40 * mid - 80 * close, cy = 860 - 60 * mid - 40 * close;
  return (
    <Stage p={p} bg="#2a1f12" vignette={0.48}>
      <View zoom={zoom} cx={cx + m.wave(90, 4) + Math.sin(m.t * 2) * shake} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2400} fill="#3a2c18" />
        {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={-200 + i * 190} cy={180} r={50} fill="#4a3a20" stroke={INK} strokeWidth={4} />)}
        {/* the round vault door, open, at the back */}
        <Ball x={1000} y={760} r={260} fill="#9a8a6a" />
        <Ball x={1000} y={760} r={170} fill="#7a6a4a" />
        <rect x={-400} y={1250} width={1880} height={900} fill="#2a2016" />
        {/* the jackpot sign */}
        <g opacity={sign}>
          <Glow x={540} y={350} r={420} color="#ffcf4a" o={0.5} />
          <Block x={130} y={240} w={820} h={230} r={20} fill="#1a1208" />
          <Txt x={540} y={300} size={58} fill="#ffcf4a" glow="#ffcf4a">JACKPOT</Txt>
          <Txt x={540} y={400} size={100} fill="#ffcf4a" glow="#ffcf4a">{P.jackpot ?? ""}</Txt>
        </g>
        {/* the pallet of cash on the forklift */}
        <g transform={`translate(${-120 * lift} 0)`}>
          <Block x={300} y={1180} w={520} h={50} fill="#a87a4a" />
          <CashPile x={320} y={1180} cols={4} rows={8} bw={120} />
          <Display x={330} y={600} w={460} h={200} label="CASH TODAY" value={dropped ? P.cash ?? "" : P.jackpot ?? ""} color={dropped ? "#ff6a5a" : "#4dff9a"} />
          <Glow x={560} y={700} r={300} color="#ff6a5a" o={0.6 * m.pulse(only + 2, 10)} />
          {/* the forklift */}
          <Block x={840} y={980} w={220} h={220} r={16} fill="#ffcf4a" />
          <Block x={870} y={1000} w={150} h={110} r={8} fill="#9fd3ff" sw={4} />
          <Ball x={880} y={1230} r={46} fill="#2b2b33" />
          <Ball x={1020} y={1230} r={46} fill="#2b2b33" />
          {m.t >= andW ? <g><Glow x={950} y={960} r={140 + 40 * Math.abs(Math.sin(m.t / 3))} color="#ff3a2a" o={0.8} /><Block x={925} y={940} w={50} h={40} r={10} fill="#ff3a2a" sw={4} /></g> : <Block x={925} y={940} w={50} h={40} r={10} fill="#7a2a2a" sw={4} />}
          <rect x={815} y={900} width={20} height={330} fill="#5a5f73" stroke={INK} strokeWidth={3} />
        </g>
        {/* Castro walks in and points */}
        <Castro x={-160 + 330 * walk} y={1460 + m.wave(50, 3)} s={190} face={m.t >= m.at("cash", 70) ? "shock" : dropped ? "worried" : "grin"}
          armR={[90 + 10 * walk, 95]} armL={[20, 10]} />
      </View>
    </Stage>
  );
};

export default Vault;
