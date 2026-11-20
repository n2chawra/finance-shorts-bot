// Hook: "Arnold Schwarzenegger said no to a salary for Twins. Why work for free?"
// The old studio office: Arnold behind the desk with the salary cheque held out to him; he shakes his head on
// "no" and tears the cheque in two on "salary". Flash cut on "Why" to the film set: a TWINS clapboard rises,
// and his empty pay envelope drops on his chair on "free".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, type Motion, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Arnold, Cheque, DirChair, Envelope, Office } from "./props";

type Params = { fig?: { pay?: string } };

const Desk: React.FC<{ p: SceneProps; m: Motion; pay: string }> = ({ p, m, pay }) => {
  const no = m.at("no", 14), sal = m.at("salary", 24);
  const tear = m.lerp([sal, sal + 14], [0, 1], Easing.out(Easing.cubic));
  const shake = m.t >= no && m.t < no + 12 ? Math.sin((m.t - no) * 1.2) * 8 : 0;
  return (
    <Stage p={p} bg="#3a2412" vignette={0.42}>
      <View zoom={m.lerp([0, sal + 6], [1.0, 1.12])} cx={540} cy={820}>
        <Office m={m} arnold={
          <Arnold x={540} y={1300 + m.wave(60, 3)} s={360} face={m.t >= sal ? "grin" : m.t >= no ? "smirk" : "neutral"} tilt={shake * 0.4}
            armL={[60, m.t >= sal ? 120 : 60]} armR={[60, m.t >= sal ? 120 : 60]} />
        }>
          <Cheque x={540} y={880} w={560} label="SALARY" value={pay} tear={tear} rot={-4} big={120} />
        </Office>
      </View>
    </Stage>
  );
};

const FilmSet: React.FC<{ p: SceneProps; m: Motion; from: number }> = ({ p, m, from }) => {
  const free = m.at("free", m.end - 12);
  const rise = m.pop(from + 1, 13);
  const drop = m.lerp([free - 6, free + 4], [0, 1], Easing.bounce);
  return (
    <Stage p={p} bg="#1c1a2e" vignette={0.42}>
      <View zoom={m.lerp([from, m.end], [1.0, 1.08])} cx={540} cy={900}>
        <rect x={-500} y={-500} width={2080} height={2900} fill="#2a2440" />
        <Glow x={180} y={300} r={420} color="#fff1c9" o={0.35} />
        <Glow x={900} y={300} r={420} color="#fff1c9" o={0.35} />
        <rect x={-500} y={1200} width={2080} height={1200} fill="#4a4458" />
        <line x1={-500} y1={1200} x2={1580} y2={1200} stroke={INK} strokeWidth={STROKE} />
        {/* the clapboard */}
        <g transform={`translate(0 ${(1 - rise) * 700})`}>
          <Block x={240} y={330} w={600} h={380} r={10} fill="#1f2230" />
          <rect x={240} y={270} width={600} height={60} fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
          {Array.from({ length: 6 }).map((_, i) => <polygon key={i} points={`${260 + i * 100},330 ${300 + i * 100},270 ${340 + i * 100},270 ${300 + i * 100},330`} fill={INK} />)}
          <Txt x={540} y={480} size={150} fill="#ffc43d">TWINS</Txt>
          <Txt x={540} y={630} size={44} fill="#f4f1e8" deco>SCENE ONE · TAKE ONE</Txt>
        </g>
        <DirChair x={540} y={1260} name="ARNOLD" />
        {drop > 0 ? <g transform={`translate(0 ${(1 - drop) * -500})`}><Envelope x={540} y={980} s={1.4} /></g> : null}
      </View>
    </Stage>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pay = (p.beat.params as Params).fig?.pay ?? "";
  const cut = m.at("why", m.end * 0.6);
  return (
    <AbsoluteFill>
      {m.t < cut ? <Desk p={p} m={m} pay={pay} /> : <FilmSet p={p} m={m} from={cut} />}
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(cut, 6) * 0.9 }} />
    </AbsoluteFill>
  );
};

export default Hook;
