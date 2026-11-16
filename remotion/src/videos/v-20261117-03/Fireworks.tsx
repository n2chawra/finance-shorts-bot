// Payoff: "The busiest day takes about 9 hours, a whole shift in the suit for one ticket."
// The castle at night under fireworks: fireworks burst on "busiest", the castle clock's hands spin round on
// "takes", the figure lights up on the clock face on "hours", the tired bear sits on the castle steps on "whole",
// and on "ticket" one small ticket floats down into its paws as the camera pulls back.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, Stage, Txt, View, motion, rng } from "../../flat/kit";
import { Bear, Castle, ParkTicket } from "./props";

type Params = { fig?: { hours?: string; price?: string } };

const Fireworks: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hours = (p.beat.params as Params).fig?.hours ?? "";
  const price = (p.beat.params as Params).fig?.price ?? "";
  const busiest = m.at("busiest", 2), takes = m.at("takes", 10), hrs = m.at("hours", 30), whole = m.at("whole", 40), ticket = m.at("ticket", 70);
  const r = rng("dl-fw");
  const bursts = [busiest, busiest + 10, takes + 6, hrs + 2, whole + 6, ticket].map((at, i) => ({ at, x: 120 + r() * 840, y: 150 + r() * 300, c: ["#ff7cc0", "#ffcf4a", "#7cc4ff", "#7cff9a"][i % 4]! }));
  const clock = m.t < takes ? 0.1 : m.t < hrs ? 0.1 + (m.t - takes) / 8 : 0.1 + (hrs - takes) / 8;
  const shown = m.t >= hrs;
  const sit = m.t >= whole;
  const fall = m.lerp([ticket - 4, ticket + 18], [0, 1], Easing.out(Easing.quad));
  const close = m.lerp([hrs - 4, hrs + 8], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([ticket - 4, ticket + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.2 * close - 0.2 * back;
  const cx = 540, cy = 900 - 200 * close + 200 * back;
  return (
    <Stage p={p} bg="#141838" vignette={0.46}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-500} y={-600} width={2080} height={2700} fill="#141838" />
        {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(i * 173) % 1500 - 200} cy={-400 + ((i * 97) % 700)} r={3} fill="#ffffff" opacity={0.7} />)}
        {bursts.map((b, i) => {
          const k = (m.t - b.at) / 18;
          if (k < 0 || k > 1.4) return null;
          return (
            <g key={i} opacity={Math.max(0, 1 - k / 1.4)}>
              <Glow x={b.x} y={b.y} r={180 * k} color={b.c} o={0.7} />
              {Array.from({ length: 12 }).map((_, j) => <Ball key={j} x={b.x + Math.cos(j * 0.52) * 150 * k} y={b.y + Math.sin(j * 0.52) * 150 * k + 30 * k * k} r={9} fill={b.c} sw={0} shadow={false} />)}
            </g>
          );
        })}
        <Castle x={540} y={1150} s={230} night clock={clock} />
        {shown ? (
          <g>
            <Glow x={540} y={1150 - 2.25 * 230} r={240} color="#ffcf4a" o={0.6} />
            <circle cx={540} cy={1150 - 2.25 * 230} r={0.32 * 230} fill="#fffaf0" stroke="#1d1a2b" strokeWidth={6} />
            <Txt x={540} y={1150 - 2.25 * 230} size={110} fill="#d7262b">{hours}</Txt>
            <Block x={390} y={1150 - 2.25 * 230 + 90} w={300} h={70} r={12} fill="#ffcf4a" />
            <Txt x={540} y={1150 - 2.25 * 230 + 125} size={50} fill="#1d1a2b">HOURS</Txt>
          </g>
        ) : null}
        {/* the steps and the crowd */}
        <Block x={-500} y={1150} w={2080} h={60} fill="#5a4a7a" />
        <Block x={-500} y={1210} w={2080} h={60} fill="#4a3a6a" />
        {Array.from({ length: 10 }).map((_, i) => <Ball key={i} x={-200 + i * 160} y={1380 + (i % 2) * 20} r={50} fill="#2a2850" sw={0} shadow={false} />)}
        <Bear x={820} y={1290} s={120} sit={sit} tired={sit} wave={sit ? 0.15 : 0.6} />
        {fall > 0 ? <ParkTicket x={640} y={560 + 560 * fall} w={260} price={price} rot={20 - 26 * fall} label="ONE DAY" /> : null}
      </View>
    </Stage>
  );
};

export default Fireworks;
