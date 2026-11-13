// Reference directed beat (the turn): "And the ads? Just over $1.5B, out of the $45.2B it brought in."
// Close on the dock: a tiny van marked ADS drives in on "ads", its figure pops on "Just"; on "out" the camera
// pulls all the way back to reveal the cargo ship behind it, the total stamps on the hull on "brought".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, STROKE, Stage, Tag, Txt, View, motion, shade } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { ads?: string; total?: string } };

const Ship: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const ads = m.at("ads", 12), just = m.at("just", 30), out = m.at("out", 90);
  const cols = ["#ffc43d", "#2bb673", "#3d6fd1", "#e8432f", "#7b5cff", "#f07b2a"];
  const reveal = m.lerp([out - 4, out + 50], [0, 1], Easing.inOut(Easing.cubic));
  const van = m.lerp([2, ads + 10], [-520, 0], Easing.out(Easing.back(1.2)));
  const shock = m.t > out + 40;
  const stamp = m.pop(out + 22, 9);           // the total is said right after "out of the"
  return (
    <Stage p={p} bg="#4aa8ff" vignette={0.25}
      defs={<linearGradient id="nfx-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f9cf5" /><stop offset="1" stopColor="#c9ecff" /></linearGradient>}>
      <View zoom={1.5 - 0.5 * reveal} cx={650 - 110 * reveal} cy={1340 - 380 * reveal}>
        <rect x={-300} y={-300} width={1680} height={1400} fill="url(#nfx-day)" />
        {[[200, 260, 1], [780, 180, 1.3], [520, 420, 0.8]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${m.t * (0.3 + i * 0.15)} 0)`}>
            {[[0, 0, 60], [-60, 15, 45], [60, 15, 48], [25, -30, 42]].map(([dx, dy, rr], kk) => <circle key={kk} cx={x! + dx! * s!} cy={y! + dy! * s!} r={rr! * s!} fill="#ffffff" />)}
          </g>
        ))}
        {[[380, 560], [520, 500], [860, 610]].map(([x, y], i) => {
          const fx = x! + ((m.t * 1.2 + i * 40) % 300) - 100, flap = m.wave(19, 8, i);
          return <path key={i} d={`M ${fx - 30} ${y} q 15 ${-14 - flap} 30 0 q 15 ${-14 - flap} 30 0`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
        })}
        <rect x={-300} y={1080} width={1680} height={300} fill="#2f8fd6" />
        {[1130, 1190, 1250, 1310].map((y, i) => (
          <path key={y} transform={`translate(${m.wave(75, 30, i)} 0)`} d={`M ${-140 + i * 30} ${y} q 40 -16 80 0 ${"t 80 0 ".repeat(15)}`} fill="none" stroke="#7cc6f5" strokeWidth={5} opacity={0.7} />
        ))}
        {/* the ship: everything Netflix brought in */}
        <g transform={`translate(0 ${m.wave(88, 5)})`}>
          <Block x={20} y={560} w={190} h={330} fill="#f4f1e8" />
          <rect x={20} y={600} width={190} height={60} fill="#3b4a6b" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 21 }).map((_, i) => {
            const col = i % 7, row = Math.floor(i / 7);
            const x = 220 + col * 112, y = 810 - row * 86, c = cols[(i * 5) % 6]!;
            return (
              <g key={i}>
                <Block x={x} y={y} w={108} h={84} fill={c} sw={4} />
                {[0.25, 0.5, 0.75].map((fr) => <line key={fr} x1={x + 108 * fr} y1={y + 8} x2={x + 108 * fr} y2={y + 76} stroke={shade(c, -0.25)} strokeWidth={4} />)}
              </g>
            );
          })}
          <polygon points="-40,890 1010,890 1140,890 1030,1200 -40,1200" fill="#b5283c" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <polygon points="-40,1110 1060,1110 1030,1200 -40,1200" fill={shade("#b5283c", -0.25)} />
          <rect x={-40} y={910} width={1160} height={26} fill="#f4f1e8" />
          <polygon points="-40,890 1010,890 1140,890 1030,1200 -40,1200" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          {stamp > 0 ? (
            <g transform={`translate(500 1040) scale(${1 + (1 - stamp) * 1.2}) translate(-500 -1040)`}>
              <Txt x={500} y={1015} size={100} fill="#ffffff">{P.total ?? ""}</Txt>
              <Txt x={500} y={1080} size={34} fill="#ffe0e2" weight={700} deco>BROUGHT IN</Txt>
            </g>
          ) : null}
        </g>
        <rect x={-300} y={1360} width={1680} height={760} fill="#c9c3b5" />
        <rect x={-300} y={1360} width={1680} height={34} fill="#a9a395" stroke={INK} strokeWidth={STROKE} />
        {[100, 420, 900].map((x) => <Block key={x} x={x} y={1330} w={44} h={50} r={10} fill="#2a2f3d" shadow={false} />)}
        {/* the van: ads */}
        <g transform={`translate(${van + 240} ${m.t < ads + 10 ? Math.abs(Math.sin(m.t)) * 3 : 0})`}>
          <Block x={140} y={1255} w={150} h={95} r={10} fill="#ffffff" />
          <Block x={290} y={1280} w={56} h={70} r={8} fill="#e9edf2" />
          <rect x={300} y={1290} width={34} height={26} fill="#3b4a6b" />
          <Ball x={180} y={1355} r={20} fill="#2a2f3d" sw={4} />
          <Ball x={310} y={1355} r={20} fill="#2a2f3d" sw={4} />
          <rect x={152} y={1268} width={126} height={64} rx={6} fill="#ffc43d" stroke={INK} strokeWidth={4} />
          <Txt x={215} y={1300} size={26} fill={INK} deco>ADS</Txt>
          {/* the figure is a price tag on the van, big enough to read when the camera pulls out */}
          <Tag x={115} y={1140} w={200} h={84} text={P.ads ?? ""} rot={-4} k={m.pop(just, 9)} />
        </g>
        <Char x={m.lerp([0, out], [810, 830])} y={1540} s={200} who="rohan" hair="spiky" outfit="tee" face={shock ? "shock" : m.t > ads + 10 ? "smirk" : "neutral"}
          look={m.t > out ? [-1, -1] : [-1, 0]} armL={shock ? [m.lerp([out + 40, out + 50], [15, 140]), m.lerp([out + 40, out + 50], [10, 160])] : [15, 10]} armR={[15, 10]}
          tilt={shock ? -6 : 0} />
      </View>
    </Stage>
  );
};

export default Ship;
