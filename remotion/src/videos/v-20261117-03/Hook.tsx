// Hook: "How long does a Disneyland character work to buy one ticket?"
// The Disneyland gate in the morning: the Disneyland sign over the gate lights up on "Disneyland", the costumed
// bear at the gate waves on "character", the castle clock starts ticking on "work", and on "ticket" the giant
// top-day ticket beside the bear pops up big as the camera closes in.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, SourceLine, Stage, View, motion, type Motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { Bear, Castle, ParkTicket } from "./props";

type Params = { fig?: { price?: string } };

/** The gate, shared with the loop. */
export const Gate: React.FC<{ m: Motion; sign: number; wave: number; clock: number; children?: React.ReactNode }> = ({ m, sign, wave, clock, children }) => (
  <g>
    <rect x={-500} y={-500} width={2080} height={1900} fill="#9fd8ff" />
    <Glow x={850} y={200} r={300} color="#fff2a8" o={0.6} />
    <Castle x={540} y={930} s={150} clock={clock} />
    {/* the gate wall */}
    <Block x={-500} y={930} w={2080} h={380} fill="#e8c9a0" shadow={false} />
    <path d="M 380 1310 L 380 1080 Q 540 960 700 1080 L 700 1310 Z" fill="#5a3a6a" />
    <rect x={-500} y={1300} width={2080} height={800} fill="#b8a07a" />
    {/* the sign over the gate */}
    <Glow x={540} y={290} r={360} color="#ffd8f0" o={0.6 * sign} />
    <Block x={250} y={200} w={580} h={190} r={30} fill="#ffffff" />
    <g transform="translate(540 370)" opacity={0.35 + 0.65 * sign}><Photo name="disneyland" s={150} t={m.t / 30} /></g>
    <Bear x={790} y={1500 + m.wave(50, 4)} s={150} wave={wave} />
    {children}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = (p.beat.params as Params).fig?.price ?? "";
  const dl = m.at("disneyland", 4), ch = m.at("character", 14), work = m.at("work", 24), ticket = m.at("ticket", 50);
  const sign = m.t < dl ? 0.3 : m.pop(dl, 10);
  const wave = m.t < ch ? 0 : 0.6 + 0.4 * Math.sin((m.t - ch) / 3);
  const clock = m.t < work ? 0 : (m.t - work) / 30;
  const big = m.lerp([ticket - 2, ticket + 8], [0, 1], Easing.out(Easing.back(1.6)));
  const wide = m.lerp([work - 4, work + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([ticket - 4, ticket + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.08 - 0.08 * wide + 0.12 * close;
  const cx = 540 - 60 * close, cy = 900 + 20 * wide + 100 * close;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#9fd8ff" vignette={0.24}>
        <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
          <Gate m={m} sign={sign} wave={wave} clock={clock}>
            <g transform={`translate(330 1100) scale(${0.85 + 0.25 * big}) translate(-330 -1100)`}>
              <Block x={315} y={1150} w={30} h={180} fill="#7a5a3a" shadow={false} />
              <ParkTicket x={140} y={1000} w={380} price={price} rot={-4} label="TOP DAY" />
            </g>
          </Gate>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
