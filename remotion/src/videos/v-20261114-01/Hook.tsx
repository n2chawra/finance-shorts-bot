// Hook: "America owes {total}, and {pct} of it, it owes to itself."
// Shot 1, the Treasury steps at dusk: the real Treasury seal swings in beside a giant debt clock that spins
// up on "owes". Cut on "and" to a clerk's desk: he writes an IOU and, on "itself", slides it into his own
// drawer marked TRUST FUNDS; the share stamps on the slip.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, type Motion, STROKE, SourceLine, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { DebtClock, Iou, StoneFront } from "./props";

type Params = { fig?: { total?: string; pct?: string } };

const Steps: React.FC<{ p: SceneProps; m: Motion; total: string; cut: number }> = ({ p, m, total, cut }) => {
  const owes = m.at("owes", 14);
  const seal = 0.85 + 0.15 * m.pop(0, 12);
  const k = 1 + 0.12 * m.pulse(owes + 3, 8);
  return (
    <Stage p={p} bg="#2a2050" vignette={0.4}
      defs={<linearGradient id="d01-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a6e" /><stop offset="0.6" stopColor="#c45a7a" /><stop offset="1" stopColor="#ffb06b" /></linearGradient>}>
      <View zoom={m.lerp([0, cut], [1.0, 1.16], Easing.inOut(Easing.quad))} cx={540} cy={m.lerp([0, cut], [900, 760])}>
        <rect x={-300} y={-300} width={1680} height={1700} fill="url(#d01-dusk)" />
        <circle cx={860} cy={420} r={60} fill="#ffe6b0" />
        <Glow x={860} y={420} r={260} color="#ffd48a" o={0.4} />
        <g transform={`translate(${m.wave(140, 10)} 0)`}>
          <StoneFront x={40} base={1500} w={1000} />
        </g>
        <rect x={-300} y={1500} width={1680} height={700} fill="#8f8a7c" />
        <line x1={-300} y1={1500} x2={1380} y2={1500} stroke={INK} strokeWidth={STROKE} />
        {/* the clock on the steps carries the figure */}
        <g transform={`translate(540 570) scale(${k}) translate(-540 -570)`}><DebtClock x={150} y={420} w={780} h={300} label="US DEBT" value={total} glow={1 + 0.6 * m.pulse(owes + 4, 10)} /></g>
        {/* the real Treasury seal, big, from frame 0 */}
        <g transform={`translate(540 ${1330 + m.wave(70, 6)}) rotate(${(1 - seal) * -40}) scale(${0.6 + 0.4 * seal})`}>
          <Photo name="treasury" s={440} t={m.t / p.fps} />
        </g>
        <Tag x={290} y={790} w={500} h={86} text="US TREASURY" bg="#2b4fa8" fg="#ffffff" k={Math.max(0.01, seal)} />
        <Char x={880} y={1600 + m.wave(60, 3)} s={210} who="rohan" face={m.t > owes ? "shock" : "neutral"} look={[-0.6, -0.8]}
          armR={[20, 10]} armL={[m.lerp([owes, owes + 10], [20, 150]), m.lerp([owes, owes + 10], [10, 150])]} />
      </View>
    </Stage>
  );
};

const Desk: React.FC<{ p: SceneProps; m: Motion; pct: string; from: number }> = ({ p, m, pct, from }) => {
  const self = m.at("itself", from + 30);
  const slide = m.lerp([self - 10, self + 4], [0, 1], Easing.inOut(Easing.cubic));
  const drawer = m.lerp([m.at("owed", self - 14), m.at("owed", self - 14) + 10], [0, 1]);
  const stamp = m.pop(self + 2, 9);
  const write = m.wave(6, 8);
  return (
    <Stage p={p} bg="#2c3a2e" vignette={0.45}>
      <View zoom={m.lerp([from, self], [1.0, 1.18], Easing.inOut(Easing.quad))} cx={540} cy={m.lerp([from, self], [960, 1000])}>
        <rect x={-200} y={-200} width={1480} height={1400} fill="#3f5a46" />
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-200 + i * 180} y={-200} width={10} height={1400} fill="#36503d" />)}
        <Block x={120} y={260} w={300} h={380} fill="#d8c9a0" />
        <Txt x={270} y={330} size={44} fill={INK} deco>LEDGER</Txt>
        {[400, 460, 520, 580].map((y) => <line key={y} x1={150} y1={y} x2={390} y2={y} stroke="#9a8f74" strokeWidth={4} />)}
        <Glow x={820} y={300} r={340} color="#ffe4a0" o={0.5 + m.wave(9, 0.04)} />
        <polygon points="760,200 880,200 920,300 720,300" fill="#2f6b4a" stroke={INK} strokeWidth={STROKE} />
        <rect x={-200} y={1200} width={1480} height={900} fill="#2a3529" />
        <Char x={560} y={1350 + m.wave(55, 3)} s={330} skin="#e2a679" top="#2f3445" pants="#2f3445" outfit="suit" accent="#d8433a" hair="side" hairColor="#3a2a22" glasses
          face={m.t > self ? "smirk" : "neutral"} look={[0.2, 0.7]} armR={[60, m.t < self - 10 ? 70 + write : 40]} armL={[50, 60]} />
        {/* the desk */}
        <Block x={60} y={1080} w={960} h={60} fill="#8a5226" />
        <Block x={100} y={1140} w={880} h={240} fill="#7a4720" />
        {/* the drawer marked TRUST FUNDS slides open */}
        <g transform={`translate(0 ${drawer * 70})`}>
          <Block x={560} y={1170} w={380} h={170} fill="#9a5a2a" />
          <rect x={590} y={1200} width={320} height={64} rx={6} fill="#f2e3b8" stroke={INK} strokeWidth={4} />
          <Txt x={750} y={1233} size={46} fill={INK}>TRUST FUNDS</Txt>
          <rect x={710} y={1290} width={80} height={18} rx={9} fill="#d9b25a" stroke={INK} strokeWidth={3} />
        </g>
        {/* the IOU slip travels from the pen into the drawer */}
        <g transform={`translate(${slide * 360} ${slide * 200}) scale(${1 - slide * 0.25})`}>
          <Iou x={200} y={900} w={360} rot={-6 + slide * 10} />
          {stamp > 0 ? <Tag x={240} y={760} w={280} h={120} text={pct} rot={-8} bg="#d8433a" fg="#ffffff" k={stamp} /> : null}
        </g>
        <Txt x={540} y={170} size={58} fill="#f6efd9" weight={800}>OWED TO ITSELF</Txt>
      </View>
    </Stage>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const cut = m.at("and", m.end * 0.45);
  return (
    <AbsoluteFill>
      {m.t < cut ? <Steps p={p} m={m} total={f.total ?? ""} cut={cut} /> : <Desk p={p} m={m} pct={f.pct ?? ""} from={cut} />}
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(cut, 6) * 0.85 }} />
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
