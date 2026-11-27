// "Has anyone tried? Russia backed a plan: a 103 kilometre tunnel under the strait, priced at about $65 billion.
// It was never built." Over the strait a question mark pops, a blueprint sheet slides into the sky above it and a
// dashed tunnel draws on it; the tunnel's dashed line drops under the water from coast to coast with its length on a
// tag, a price tag swings onto the plan, the tunnel fades and a red NEVER BUILT stamp hits the blueprint.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { SideNames, BMap, DEZHNEV, Diomedes, PRINCE, Planted, QMark, RED, SEA_STRAIT, STRAIT, Waves, between, type LL , Floes } from "./props";

type Params = { fig?: { length?: string; cost?: string } };

const Tunnel: React.FC<{ k: number; o: number; text: string; tag: number }> = ({ k, o, text, tag }) => {
  const at = useAt();
  const a = at([DEZHNEV[0] - 0.25, DEZHNEV[1] - 0.12]), b = at([PRINCE[0] + 0.3, PRINCE[1] - 0.05]);
  if (!a || !b || k <= 0) return null;
  const d = `M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2},${Math.max(a[1], b[1]) + 160} ${b[0]},${b[1]}`;
  return (
    <g opacity={o}>
      <defs><mask id="plan-tunnel"><path d={d} fill="none" stroke="#fff" strokeWidth={30} pathLength={1} strokeDasharray={`${k} 1`} /></mask></defs>
      <g mask="url(#plan-tunnel)">
        <path d={d} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#f2b134" strokeWidth={14} strokeDasharray="26 16" strokeLinecap="round" />
      </g>
      <Tag x={(a[0] + b[0]) / 2 - 170} y={Math.max(a[1], b[1]) + 140} w={340} h={100} text={text} size={56} k={tag} />
    </g>
  );
};

const Blueprint: React.FC<{ k: number; draw: number; price: number; cost: string; stamp: number; grey?: number }> = ({ k, draw, price, cost, stamp, grey = 0 }) => {
  if (k <= 0) return null;
  const y = 180 + (1 - Math.min(1, k)) * -300;
  const s = 1 + (1 - Math.min(1, stamp)) * 0.35;
  return (
    <g>
      <Block x={150} y={y} w={780} h={420} fill={grey > 0.5 ? "#4a5a6a" : "#2f5d8a"} r={10} />
      {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={150} y1={y + 42 * (i + 1)} x2={930} y2={y + 42 * (i + 1)} stroke="#5b86b0" strokeWidth={2} />)}
      {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={150 + 45 * (i + 1)} y1={y} x2={150 + 45 * (i + 1)} y2={y + 420} stroke="#5b86b0" strokeWidth={2} />)}
      <path d={`M210,${y + 150} h120`} stroke="#e8f0f6" strokeWidth={8} />
      <path d={`M750,${y + 150} h120`} stroke="#e8f0f6" strokeWidth={8} />
      <path d={`M330,${y + 150} Q540,${y + 330} 750,${y + 150}`} fill="none" stroke="#e8f0f6" strokeWidth={8} strokeDasharray="20 14" pathLength={1} style={{}} opacity={Math.min(1, draw * 1.5)} />
      <Txt x={560} y={y + 70} size={48} fill="#e8f0f6">TUNNEL PLAN</Txt>
      <FlagArt name="Russia" x={180} y={y + 30} w={96} h={64} />
      {price > 0 ? <Tag x={370} y={y + 450} w={340} h={100} text={cost} size={56} rot={-6} k={price} /> : null}
      {stamp > 0 ? (
        <g transform={`translate(540,${y + 280}) scale(${s}) rotate(-8)`} opacity={Math.min(1, stamp * 2)}>
          <rect x={-240} y={-62} width={480} height={124} rx={12} fill="#ffffff" stroke={RED} strokeWidth={10} />
          <Txt x={0} y={4} size={58} fill={RED}>NEVER BUILT</Txt>
        </g>
      ) : null}
    </g>
  );
};

const QOver: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-168.95, 65.6]);
  return xy ? <QMark x={xy[0]} y={xy[1]} size={140} k={k} t={t} /> : null;
};

const Plan: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const tr = m.at("tried", 4), so = m.at("russia", 16), dr = m.at("backed", 28), tu = m.at("tunnel", 50), st = m.at("strait", 64), pr = m.at("priced", 80), ne = m.at("never", 116), ap = m.at("built", 130), un = m.at("under", 58), ab = m.at("about", 96), km = m.at("kilometre", 40), it = m.at("it", 110);
  const wide = { center: [-168.9, 65.8] as LL, scale: 12000 };
  const cam = between(between(wide, STRAIT, m.lerp([tu, tu + 20], [0, 1])), { center: [-168.9, 65.8], scale: 17000 }, m.lerp([ap, ap + 16], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)} cy={960 - 10 * m.pulse(ap, 10)}>
        <BMap center={cam.center} scale={cam.scale}>
          <Floes t={m.t} size={30} />
          <SideNames />
          <Waves pts={SEA_STRAIT} t={m.t} />
          <Diomedes t={m.t} />
          <Planted at={[-168.0, 65.72]} name="United States of America" k={1} s={110} dx={-150} />
          <Tunnel k={m.lerp([tu, tu + 20], [0, 1])} o={(1 - 0.6 * m.lerp([ne, ne + 12], [0, 1])) * (1 - 0.3 * m.pulse(un, 12))} text={`${f.length ?? ""} KM`} tag={m.pop(st)} />
          <QOver k={m.pop(tr) * (1 - m.lerp([so, so + 8], [0, 1]))} t={m.t} />
        </BMap>
      </View>
      <g transform={`rotate(${2 * m.pulse(ab, 10)} 540 400)`}><Blueprint k={m.lerp([so, so + 14], [0, 1])} draw={m.lerp([dr, dr + 14], [0, 1]) * (1 + 0.5 * m.pulse(km, 10))} grey={m.lerp([it, it + 14], [0, 1])} price={m.pop(pr)} cost={f.cost ?? ""} stamp={m.lerp([ne, ne + 8], [0, 1])} /></g>
    </Stage>
  );
};
export default Plan;
