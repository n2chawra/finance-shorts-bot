// Reference directed beat (owner-approved Netflix remake, 2026-11-13). Two shots in one beat, cut on a word:
// Rohan frozen mid-bite in the TV glow (popcorn bursts on "spent"), then through the screen onto the film
// set where the slate rises and the clapper snaps shut on "year". The figure is written on the slate.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, CityWindow, Glow, INK, Limb, type Motion, STROKE, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { spent?: string } };

export const Kernel: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 26 }) => {
  const parts: [number, number, number][] = [[0, 0, 1], [-0.6, 0.35, 0.75], [0.6, 0.35, 0.75], [0, 0.7, 0.7]];
  return (
    <g>
      {parts.map(([dx, dy, k], i) => <circle key={i} cx={x + dx * r} cy={y + dy * r} r={r * k} fill="#fff4d6" stroke={INK} strokeWidth={4} />)}
      {parts.map(([dx, dy, k], i) => <circle key={`f${i}`} cx={x + dx * r} cy={y + dy * r} r={r * k - 3} fill="#fff4d6" />)}
    </g>
  );
};

const Popcorn: React.FC<{ p: SceneProps; m: Motion }> = ({ p, m }) => {
  const burst = m.at("spent", 22);
  const kernels: [number, number, number][] = [[250, 560, 26], [840, 500, 24], [200, 860, 22], [880, 880, 26], [720, 300, 20], [360, 310, 18], [930, 690, 18], [140, 700, 16]];
  return (
    <Stage p={p} bg="#2f3378" vignette={0.5}>
      <View zoom={m.lerp([0, m.at("on", m.end)], [1.0, 1.14], Easing.in(Easing.quad))} cx={540} cy={820}>
        <rect x={-200} y={-200} width={1480} height={2400} fill="#3f4392" />
        <CityWindow x={70} y={220} w={360} h={420} />
        <Block x={650} y={470} w={360} h={24} fill="#8a5226" />
        <Block x={690} y={380} w={60} h={90} fill="#e0a53a" />
        <Ball x={720} y={360} r={50} fill="#3fae5a" />
        <Block x={880} y={400} w={56} h={70} fill="#e8e1d4" />
        <Ball x={908} y={385} r={40} fill="#4cbf6a" />
        <Glow x={980} y={180} r={360} color="#ffb35c" o={0.4} />
        <Block x={-100} y={990} w={1280} h={560} r={70} fill="#e0a53a" shadow="bottom" depth={0.3} />
        <Char x={540} y={2050 + m.wave(54, 4)} s={560} sit who="rohan" hair="spiky" outfit="tee" face="shock" look={[0, 0.2]}
          armR={[25, m.lerp([0, m.at("spent", 20)], [150, 199])]} armL={[20, -40]} light="#7fb8ff" tilt={m.lerp([burst - 2, burst + 10], [0, -4])}
          holdR={(h) => <Kernel x={h[0] - 10} y={h[1] - 40} r={24} />} />
        <defs>
          <pattern id="nfx-stripes" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="40" height="80" fill="#e0352b" /><rect x="40" width="40" height="80" fill="#ffffff" /></pattern>
        </defs>
        {[[360, 1400], [430, 1370], [510, 1355], [590, 1370], [660, 1395], [470, 1405], [560, 1400]].map(([x, y], i) => <Kernel key={i} x={x!} y={y!} r={30} />)}
        <polygon points="300,1420 780,1420 700,1880 380,1880" fill="url(#nfx-stripes)" stroke={INK} strokeWidth={STROKE} />
        <rect x={290} y={1410} width={500} height={34} rx={14} fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
        {m.t >= burst ? kernels.map(([x, y, r], i) => {
          const b = m.pop(burst + i * 1.4, 14);
          return <Kernel key={i} x={540 + (x - 540) * b + m.wave(42, 6, i)} y={1400 + (y - 1400) * b + m.wave(48, 6, i + 1)} r={r} />;
        }) : null}
        <Glow x={480} y={1500} r={900} color="#5fa8ff" o={0.34 + m.wave(7, 0.06) + 0.12 * m.pulse(burst, 7)} />
      </View>
    </Stage>
  );
};

const Slate: React.FC<{ p: SceneProps; m: Motion; spent: string; from: number }> = ({ p, m, spent, from }) => {
  const rise = m.pop(from + 1, 13);
  const snap = m.at("year", m.end - 12);
  const clap = m.t < snap - 4 ? -9 : m.lerp([snap - 4, snap], [-9, 0], Easing.in(Easing.cubic));
  const shake = m.t >= snap && m.t < snap + 8 ? Math.sin(m.t * 3.1) * (snap + 8 - m.t) * 2.2 : 0;
  const on = m.at("shows", from + 4);
  const lights = m.t < on ? 0 : m.t < on + 2 ? 0.55 : m.t < on + 4 ? 0.1 : 0.55;
  const stripes = (x: number, y: number, w: number, h: number) =>
    Array.from({ length: 9 }).map((_, i) => (
      <polygon key={i} points={`${x + i * (w / 8) - 20},${y + h} ${x + i * (w / 8) + 30},${y} ${x + i * (w / 8) + 30 + w / 16},${y} ${x + i * (w / 8) - 20 + w / 16},${y + h}`} fill={i % 2 ? INK : "#f4f1e8"} />
    ));
  return (
    <Stage p={p} bg="#1c1a2e" vignette={0.42}
      defs={<linearGradient id="nfx-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b1a5e" /><stop offset="0.55" stopColor="#c2417a" /><stop offset="1" stopColor="#ff9a3d" /></linearGradient>}>
      <View zoom={m.lerp([from, m.end], [1.0, 1.06])} cx={540 + shake} cy={1000}>
        <g transform={`translate(${m.lerp([from, m.end], [-20, 20])} 0)`}>
          <rect x={-100} y={-100} width={1280} height={1360} fill="url(#nfx-sunset)" />
          <circle cx={820} cy={300} r={70} fill="#ffe9b0" />
          <Glow x={820} y={300} r={240} color="#ffe9b0" o={0.4} />
          <Block x={60} y={430} w={210} h={830} fill="#a09bba" />
          <polygon points="40,440 165,250 290,440" fill="#5a3d8a" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <Block x={810} y={560} w={180} h={700} fill="#a09bba" />
          <polygon points="790,570 900,400 1010,570" fill="#5a3d8a" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <Block x={230} y={760} w={620} h={500} fill="#8f8aa8" />
          {Array.from({ length: 8 }).map((_, i) => <Block key={i} x={240 + i * 76} y={700} w={48} h={62} fill="#8f8aa8" shadow={false} />)}
          <path d="M 470 1260 L 470 1080 Q 540 1010 610 1080 L 610 1260 Z" fill="#2d2442" stroke={INK} strokeWidth={STROKE} />
        </g>
        <rect x={-100} y={1255} width={1280} height={900} fill="#585a6e" />
        {[-400, -150, 100, 350, 600, 850, 1100, 1350].map((x, i) => <line key={i} x1={540} y1={1255} x2={x} y2={1920} stroke="#6a6c80" strokeWidth={4} />)}
        <line x1={-100} y1={1258} x2={1180} y2={1258} stroke={INK} strokeWidth={STROKE} />
        {([[110, 1380, 1], [980, 1330, -1]] as const).map(([x, y, d], i) => (
          <g key={i}>
            <Limb a={[x, y]} b={[x, y - 470]} w={12} color="#2a2f3d" sw={3} />
            <Limb a={[x, y]} b={[x - 60, y + 40]} w={10} color="#2a2f3d" sw={3} />
            <Limb a={[x, y]} b={[x + 60, y + 40]} w={10} color="#2a2f3d" sw={3} />
            <g transform={`rotate(${d * 25} ${x} ${y - 500})`}>
              <rect x={x - 60} y={y - 545} width={120} height={95} rx={10} fill="#2a2f3d" stroke={INK} strokeWidth={STROKE} />
              <rect x={d > 0 ? x + 40 : x - 60} y={y - 535} width={20} height={75} fill={lights > 0.3 ? "#fff1c9" : "#555a6a"} />
            </g>
            <Glow x={x + d * 120} y={y - 480} r={300} color="#fff1c9" o={lights} />
          </g>
        ))}
        <g>
          <Limb a={[860, 1180]} b={[790, 1420]} w={10} color="#3a3f4f" sw={3} />
          <Limb a={[860, 1180]} b={[930, 1420]} w={10} color="#3a3f4f" sw={3} />
          <Limb a={[860, 1180]} b={[860, 1440]} w={10} color="#3a3f4f" sw={3} />
          <Block x={790} y={1080} w={150} h={110} r={10} fill="#22252f" shadow={false} />
          <rect x={700} y={1110} width={95} height={50} rx={6} fill="#22252f" stroke={INK} strokeWidth={STROKE} />
          {[830, 910].map((cx) => (
            <g key={cx} transform={`rotate(${m.t * 6} ${cx} 1040)`}><Ball x={cx} y={1040} r={45} fill="#3a3f4f" /><line x1={cx} y1={1000} x2={cx} y2={1080} stroke={INK} strokeWidth={5} /></g>
          ))}
        </g>
        <g transform={`translate(0 ${(1 - rise) * 800})`}>
          <Char x={540} y={1500} s={360} skin="#a8683a" top="#2a2f3d" hair="beanie" hat="#2bb673" face={m.t >= snap ? "grin" : "happy"} look={[0.6, 0]} armL={[80, 95]} armR={[80, 95]} />
          <g transform={`rotate(${shake * 0.3} 540 1150)`}>
            <rect x={178} y={918} width={740} height={490} rx={10} fill="#000" opacity={0.3} />
            <rect x={170} y={900} width={740} height={490} rx={10} fill="#1f2230" stroke={INK} strokeWidth={STROKE} />
            <rect x={192} y={922} width={696} height={446} fill="none" stroke="#f4f1e8" strokeWidth={4} opacity={0.85} />
            <line x1={192} y1={1010} x2={888} y2={1010} stroke="#f4f1e8" strokeWidth={4} opacity={0.85} />
            <line x1={540} y1={922} x2={540} y2={1010} stroke="#f4f1e8" strokeWidth={4} opacity={0.85} />
            <line x1={192} y1={1300} x2={888} y2={1300} stroke="#f4f1e8" strokeWidth={4} opacity={0.85} />
            <Txt x={366} y={968} size={40} fill="#f4f1e8" weight={700} deco>SCENE ONE</Txt>
            <Txt x={714} y={968} size={40} fill="#f4f1e8" weight={700} deco>TAKE ONE</Txt>
            <Txt x={540} y={1158} size={170} fill="#ffd23f">{spent}</Txt>
            <Txt x={540} y={1335} size={32} fill="#f4f1e8" weight={700} deco>NEW SHOWS &amp; FILMS</Txt>
            <defs><clipPath id="nfx-bar1"><rect x={170} y={840} width={740} height={60} /></clipPath></defs>
            <g clipPath="url(#nfx-bar1)">{stripes(170, 840, 740, 60)}</g>
            <rect x={170} y={840} width={740} height={60} fill="none" stroke={INK} strokeWidth={STROKE} />
            <g transform={`rotate(${clap} 170 840)`}>
              <defs><clipPath id="nfx-bar2"><rect x={170} y={778} width={750} height={60} /></clipPath></defs>
              <g clipPath="url(#nfx-bar2)">{stripes(170, 778, 750, 60)}</g>
              <rect x={170} y={778} width={750} height={60} fill="none" stroke={INK} strokeWidth={STROKE} />
            </g>
          </g>
          <Ball x={192} y={1110} r={26} fill="#a8683a" />
          <Ball x={888} y={1110} r={26} fill="#a8683a" />
        </g>
      </View>
    </Stage>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = p.beat.params as Params;
  const cut = m.at("on", m.end * 0.55);       // the cut lands on the word "on"
  return (
    <AbsoluteFill>
      {m.t < cut ? <Popcorn p={p} m={m} /> : <Slate p={p} m={m} spent={P.fig?.spent ?? ""} from={cut} />}
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(cut, 6) * 0.9 }} />
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
