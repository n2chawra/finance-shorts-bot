// "But its real secret is speed: with its machines already spinning, it reaches full power in about {fact2}
// seconds, long before a single kettle boils." Britain at night: a stopwatch drops beside Wales and its hand
// sweeps; the mountain glows as the machines spin; on "full" power lines race out to every city and the
// cities blaze; the stopwatch stops on the figure; the camera closes on London's kettle, still cold, and
// only on "boils" does its first steam rise.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Glow, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Britain, CITIES, CityLights, ELIDIR, GOLD, Kettle, LONDON, ZAP } from "./props";

type Params = { fig?: { secs?: string } };

const Stopwatch: React.FC<{ x: number; y: number; k: number; hand: number; text: string; label: boolean }> = ({ x, y, k, hand, text, label }) => {
  if (k <= 0) return null;
  const a = hand * 360;
  return (
    <g transform={`translate(${x} ${y - (1 - Math.min(1, k)) * 300})`}>
      <rect x={-30} y={-235} width={60} height={40} rx={8} fill="#c9ced8" stroke={INK} strokeWidth={6} />
      <Ball x={0} y={0} r={200} fill="#ffffff" sw={8} />
      <circle cx={0} cy={0} r={170} fill="none" stroke="#e3e6ee" strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <Limb key={i} a={[Math.sin(i * Math.PI / 6) * 150, -Math.cos(i * Math.PI / 6) * 150]} b={[Math.sin(i * Math.PI / 6) * 172, -Math.cos(i * Math.PI / 6) * 172]} w={6} color={INK} sw={1} />)}
      <Limb a={[0, 0]} b={[Math.sin((a * Math.PI) / 180) * 140, -Math.cos((a * Math.PI) / 180) * 140]} w={10} color="#d9483b" sw={2} />
      <Txt x={0} y={60} size={110} fill={INK}>{text}</Txt>
      {label ? <Txt x={0} y={130} size={46} fill="#6b6880">SECONDS</Txt> : null}
    </g>
  );
};

const Lines: React.FC<{ k: (i: number) => number; glow: number; t: number }> = ({ k, glow, t }) => {
  const xy = useAt()(ELIDIR);
  return (
    <g>
      {xy && glow > 0 ? <Glow x={xy[0]} y={xy[1]} r={120 + 20 * Math.sin(t / 4)} color={ZAP} o={0.8 * glow} /> : null}
      {CITIES.map((c, i) => <MapRoute key={c.name} via={[ELIDIR, c.at]} k={k(i)} color={GOLD} width={8} dash={false} />)}
    </g>
  );
};

const LondonKettle: React.FC<{ k: number; steam: number; t: number }> = ({ k, steam, t }) => {
  const xy = useAt()(LONDON);
  if (!xy || k <= 0) return null;
  return <Kettle x={xy[0] + 10} y={xy[1] + 20} s={60 + 60 * k} steam={steam} t={t} />;
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const secs = (p.beat.params as Params).fig?.secs ?? "";
  const se = m.at("secret", 4), sd = m.at("speed", 30), spn = m.at("spinning", 60), fu = m.at("full", 90), sc = m.at("seconds", 120), ke = m.at("kettle", 150), bo = m.at("boils", 170);
  const run = m.lerp([sd, sc], [0, 1], (x) => x);
  const close = m.lerp([ke - 4, ke + 16], [0, 1]);
  const wide = m.lerp([fu - 4, fu + 14], [0, 1]) * (1 - close);
  return (
    <Stage p={p} bg="#0e1b36" vignette={0.35}>
      <View zoom={1.02 + m.wave(60, 0.012)}>
        <Britain center={[-3 + 2.6 * close, 53.3 + 0.5 * wide - 1.6 * close]} scale={4600 * (1 - 0.12 * wide) * (1 + 1.6 * close)} night={1}>
          <Lines k={(i) => m.lerp([fu + i * 2, fu + i * 2 + 14], [0, 1])} glow={m.lerp([spn, spn + 10], [0, 1])} t={m.t} />
          <CityLights each={(i) => m.lerp([fu + i * 2 + 10, fu + i * 2 + 16], [0, 1])} />
          <LondonKettle k={m.lerp([ke - 4, ke + 10], [0, 1])} steam={m.lerp([bo, bo + 14], [0, 1])} t={m.t} />
        </Britain>
      </View>
      <g opacity={1 - close}>
        <Stopwatch x={540} y={560} k={m.pop(se, 12)} hand={run * 0.8} text={countText(secs, run)} label={m.t >= sc} />
      </g>
    </Stage>
  );
};

export default Payoff;
