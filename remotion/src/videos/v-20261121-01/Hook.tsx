// Hook: "Your Uber fare splits in two the moment you pay. So how much of it stays with Uber?"
// The night street: the Uber car at the kerb under its fare receipt; the receipt tears in two on "splits", the
// phone's PAID card pops on "pay". Flash cut on "So" into the back seat: Rohan stares at the fare on his phone,
// split into two slices, and a question mark stamps on Uber's slice on "stays".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Card, Glow, INK, type Motion, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Receipt, Street, UBERGREEN, UberCar } from "./props";

export const Kerb: React.FC<{ p: SceneProps; m: Motion; tearAt: number; payAt: number; zoomTo?: number }> = ({ p, m, tearAt, payAt, zoomTo = 1.12 }) => {
  const tear = m.lerp([tearAt, tearAt + 12], [0, 1], Easing.out(Easing.back(1.6)));
  const lit = m.lerp([0, 8], [0.4, 1]);
  return (
    <Stage p={p} bg="#141a3a" vignette={0.45}>
      <View zoom={m.lerp([0, m.end], [1.0, zoomTo])} cx={540 + m.wave(90, 8)} cy={900}>
        <Street m={m} />
        <UberCar x={470} y={1250} s={0.95} m={m} lit={lit} />
        <Glow x={540} y={640} r={460} color="#9fd0ff" o={0.25 + 0.15 * m.pulse(tearAt, 8)} />
        <Receipt x={540} y={630} w={560} h={600} m={m} tear={tear} label="YOUR FARE" rot={-3} />
        {tear > 0.2 ? (
          <g opacity={Math.min(1, tear * 1.5)}>
            <Txt x={330} y={1000} size={54} fill="#ffffff" stroke={INK}>THEM</Txt>
            <Txt x={760} y={1000} size={54} fill={UBERGREEN} stroke={INK}>UBER</Txt>
          </g>
        ) : null}
        {m.t >= payAt ? (
          <g transform={`translate(0 ${(1 - m.pop(payAt)) * -200})`}>
            <Card x={250} y={150} w={580} h={110} title="Trip paid" sub="Uber · just now" icon="#000000" />
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

const BackSeat: React.FC<{ p: SceneProps; m: Motion; from: number }> = ({ p, m, from }) => {
  const stays = m.at("stays", m.end - 15);
  const q = m.pop(stays, 9);
  const slice = m.lerp([from, from + 14], [0, 1]);
  return (
    <Stage p={p} bg="#0e1230" vignette={0.5}>
      <View zoom={m.lerp([from, m.end], [1.05, 1.15])} cx={540} cy={860}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#191c2c" />
        {/* the side window with the city streaming past */}
        <Block x={-60} y={180} w={640} h={520} r={60} fill="#0d1240" />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = ((i * 170 - m.t * 22) % 900 + 900) % 900 - 60;
          return <rect key={i} x={x} y={300 + (i % 3) * 110} width={70} height={14} rx={7} fill={["#ffd98a", "#ff8a5a", "#9fd0ff"][i % 3]} opacity={0.8} />;
        })}
        <Block x={-200} y={980} w={1480} h={700} r={80} fill="#2a2e44" />
        <Char x={330} y={1900 + m.wave(50, 4)} s={460} sit who="rohan" hair="spiky" outfit="tee" face={m.t >= stays ? "shock" : "worried"} look={[0.8, -0.4]}
          armR={[60, 120]} armL={[20, -30]} light="#7fb8ff" />
        {/* the phone, big, with the fare split into two slices */}
        <g transform={`translate(720 640) rotate(${4 + m.wave(80, 1.5)})`}>
          <Glow x={0} y={0} r={420} color="#7fb8ff" o={0.35} />
          <rect x={-230} y={-420} width={460} height={840} rx={56} fill="#111318" stroke={INK} strokeWidth={STROKE} />
          <rect x={-205} y={-390} width={410} height={780} rx={40} fill="#ffffff" />
          <g transform="translate(0 -300)"><Photo name="uber" s={70} t={0} /></g>
          <Txt x={0} y={-200} size={46} fill={INK}>YOUR FARE</Txt>
          <circle cx={0} cy={40} r={150} fill="#d9d3c4" stroke={INK} strokeWidth={5} />
          <path d={`M 0 40 L 0 -110 A 150 150 0 0 1 ${150 * Math.sin(1.57 * slice)} ${40 - 150 * Math.cos(1.57 * slice)} Z`} fill={UBERGREEN} stroke={INK} strokeWidth={5} />
          <Txt x={0} y={280} size={48} fill={INK}>WHO KEEPS IT?</Txt>
          {q > 0 ? <g transform={`translate(80 -20) scale(${0.4 + 0.6 * q})`}><circle r={70} fill="#ffc43d" stroke={INK} strokeWidth={5} /><Txt x={0} y={4} size={96} fill={INK}>?</Txt></g> : null}
        </g>
      </View>
    </Stage>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const cut = m.at("how", m.end * 0.55);
  return (
    <AbsoluteFill>
      {m.t < cut ? <Kerb p={p} m={m} tearAt={m.at("splits", 18)} payAt={m.at("pay", 40)} /> : <BackSeat p={p} m={m} from={cut} />}
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(cut, 6) * 0.9 }} />
    </AbsoluteFill>
  );
};

export default Hook;
