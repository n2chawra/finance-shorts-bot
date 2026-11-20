// Build: "Instead, the three took {fact4} of what the film earned after costs."
// The screening room: the film reel on the table turns into a pie on "Instead", a big wedge slides away to the
// three director's chairs on "three", its tag stamps the share on "earned", a COSTS sign covers the rest on "costs".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { DirChair, GOLD } from "./props";

type Params = { fig?: { share?: string } };

const Pie: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const ins = m.at("instead", 2), three = m.at("three", 12), earned = m.at("film", 30), earn = m.at("earnings", 44);
  const turn = m.lerp([ins, ins + 10], [0, 1]);
  const out = m.lerp([three, three + 14], [0, 1], Easing.out(Easing.back(1.3)));
  const cx = 540, cy = 640, r = 280;
  const share = 0.4, a = share * Math.PI * 2;
  const wedge = `M 0 0 L 0 ${-r} A ${r} ${r} 0 0 1 ${r * Math.sin(a)} ${-r * Math.cos(a)} Z`;
  const rest = `M 0 0 L ${r * Math.sin(a)} ${-r * Math.cos(a)} A ${r} ${r} 0 1 1 0 ${-r} Z`;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1a1530" vignette={0.45}>
        <View zoom={1.0 + 0.1 * m.lerp([earned - 6, earned + 10], [0, 1])} cx={540} cy={820}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#2a2140" />
          {Array.from({ length: 5 }).map((_, i) => <Block key={i} x={-300 + i * 400} y={1150} w={300} h={120} r={30} fill="#7a1f2b" shadow={false} />)}
          <Glow x={540} y={640} r={520} color="#ffd98a" o={0.3} />
          {/* the reel, then the pie */}
          <g transform={`translate(${cx} ${cy})`} opacity={1}>
            {turn < 1 ? <circle r={r} fill="#3a3f55" stroke={INK} strokeWidth={STROKE} opacity={1 - turn} /> : null}
            <g opacity={turn}>
              <path d={rest} fill="#e9dcc0" stroke={INK} strokeWidth={STROKE} />
              <g transform={`translate(${out * 120} ${out * 360})`}>
                <Glow x={60} y={-140} r={260} color={GOLD} o={0.6 * m.pulse(earn, 12) + (m.t >= earn ? 0.25 : 0)} />
                <path d={wedge} fill={GOLD} stroke={INK} strokeWidth={STROKE} />
              </g>
            </g>
          </g>
          <Char x={170} y={1080 + m.wave(50, 3)} s={150} skin="#e2b48f" top="#3a3f55" outfit="suit" hair="bald" glasses face={m.t >= three ? "worried" : "smirk"}
            look={[0.8, -0.5]} armR={[m.t >= three ? 100 : 30, m.t >= three ? 110 : 20]} armL={[20, 10]} />
          <Tag x={600} y={880} w={280} h={130} text={f.share ?? ""} size={84} bg="#ffffff" k={m.pop(earned, 10)} rot={6} />
          <g transform="translate(0 0) scale(1)">
            {[250, 540, 830].map((x, i) => <g key={x} transform={`translate(${x} 1340) scale(0.8)`}><DirChair x={0} y={0} name={["ARNOLD", "DEVITO", "REITMAN"][i]!} size={58} /></g>)}
          </g>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Pie;
