// "And it used to be even longer: over 8,000 kilometres of wire, all to stop one dog." Over the dimmed map two
// ribbons of fence stretch out, today's length and the old one far past it (widths computed from the two figures);
// the old one's length counts up, both pulse, a dingo stands at its end and the camera pushes in on the one dog.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Dingo, Fence, Map, Sides, num, SeaMarks } from "./props";
import { WIDE } from "./Hook";

type Params = { fig?: { today?: string; once?: string } };

const Ribbon: React.FC<{ x: number; y: number; w: number; label: string; value: string; k: number; pulse: number; tone: string }> = ({ x, y, w, label, value, k, pulse, tone }) => {
  if (k <= 0) return null;
  const ww = Math.max(20, w * Math.min(1, k));
  const n = Math.floor(ww / 46);
  return (
    <g>
      <Block x={x} y={y - 120} w={640} h={100} fill={tone} r={14} opacity={Math.min(1, k * 3)} />
      <Txt x={x + 320} y={y - 70} size={54} fill={INK}>{`${label} ${value} KM`}</Txt>
      <line x1={x} y1={y + 20} x2={x + ww} y2={y + 20} stroke={INK} strokeWidth={34 + 8 * pulse} strokeLinecap="round" />
      <line x1={x} y1={y + 20} x2={x + ww} y2={y + 20} stroke="#7a5532" strokeWidth={24 + 6 * pulse} strokeLinecap="round" />
      {Array.from({ length: n + 1 }, (_, i) => <Block key={i} x={x + i * 46 - 5} y={y - 6} w={10} h={46} fill="#7a5532" r={2} sw={2} shadow={false} />)}
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const today = f.today ?? "", once = f.once ?? "";
  const us = m.at("used", 4), lo = m.at("longer", 22), ov = m.at("over", 36), ki = m.at("kilometres", 66), st = m.at("stop", 86), dg = m.at("dog", 100);
  const max = 820, wOnce = max, wToday = (max * num(today)) / Math.max(1, num(once));
  const push = m.lerp([dg, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.4}>
      <View zoom={1.0 + 0.25 * push} cx={540 + 300 * push} cy={960 + 30 * push}>
        <Map center={WIDE.center} scale={WIDE.scale + 40 * m.lerp([0, m.end], [0, 1])}>
          <Sides dingo={0.5} sheep={0.5} />
          <SeaMarks t={m.t} />
          <Fence w={10} />
        </Map>
        <rect x={0} y={0} width={1080} height={1920} fill="#10131c" opacity={0.18} />
        <Ribbon x={100} y={640} w={wToday} label="TODAY" value={today} k={m.lerp([us, us + 20], [0, 1])} pulse={m.pulse(ki, 10)} tone="#f4e6c4" />
        <Ribbon x={100} y={900} w={wOnce} label="ONCE OVER" value={countText(once, m.lerp([ov, ov + 26], [0, 1]))} k={m.lerp([lo, lo + 30], [0, 1])} pulse={m.pulse(ki + 4, 10)} tone="#ffd36a" />
        <Dingo x={820} y={1220} s={300} k={m.pop(st)} head={Math.sin(m.t / 16) * 5} />
      </View>
    </Stage>
  );
};
export default Payoff;
