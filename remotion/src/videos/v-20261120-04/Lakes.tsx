// "On top sits one lake, Marchlyn Mawr. At its foot sits another, Llyn Peris. And tunnels run through the
// rock between them." The one shot off the map: Elidir Fawr cut through like a geology section. The high
// lake fills its hollow near the top and is named; the camera slides down to the low lake at the foot,
// which fills and is named; a tunnel draws itself down through the rock and the rock cracks along it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Sheep } from "./props";

const SKY = "#8fc3d9";
const PEAK = "M -300 1330 L 80 1280 L 300 1130 L 520 760 L 640 560 L 760 620 L 980 560 L 1100 740 L 1400 1330 Z";
const TUNNEL = "M 860 640 C 840 820, 600 900, 520 1060 S 300 1240, 220 1300";

const Lakes: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tp = m.at("top", 4), mr = m.at("marchlyn", 30), ft = m.at("foot", 60), ll = m.at("llyn", 90), tn = m.at("tunnels", 120), rk = m.at("rock", 145);
  const hi = m.lerp([tp, tp + 16], [0, 1]), lo = m.lerp([ft, ft + 16], [0, 1]);
  const toFoot = m.lerp([ft - 4, ft + 18], [0, 1]);
  const toTunnel = m.lerp([tn - 4, tn + 18], [0, 1]);
  const tun = m.lerp([tn, tn + 26], [0, 1]);
  const crack = m.lerp([rk, rk + 12], [0, 1]);
  return (
    <Stage p={p} bg={SKY} vignette={0.3}>
      <View zoom={1.02 + 0.14 * toFoot + 0.12 * toTunnel + m.wave(80, 0.01)} cx={540 - 120 * toFoot + 60 * toTunnel} cy={900 + 140 * toFoot - 60 * toTunnel}>
        <circle cx={180} cy={360} r={90} fill="#fff3c4" />
        {/* the strata: the whole cut is the mountain's rock, clipped by its outline */}
        <defs><clipPath id="elidir-cut"><path d={PEAK} /></clipPath></defs>
        <rect x={-400} y={1300} width={1900} height={900} fill="#6c5c48" />
        <rect x={-400} y={1290} width={1900} height={24} fill="#7fae5c" />
        <path d={PEAK} fill="#8a7a66" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <g clipPath="url(#elidir-cut)">
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M -300 ${760 + i * 110} Q 400 ${700 + i * 120} 1400 ${800 + i * 100}`} fill="none" stroke={i % 2 ? "#776853" : "#9b8a72"} strokeWidth={46} />)}
          <path d="M -300 1300 L 1400 1300 L 1400 1400 L -300 1400 Z" fill="#6c5c48" />
          <path d={PEAK} fill="none" stroke="#7fae5c" strokeWidth={40} />
        </g>
        <path d={PEAK} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {/* the high lake in its hollow, the low lake at the foot: hollows first, water filling them */}
        <path d="M 760 622 Q 860 700 975 562" fill="#5b4b3a" stroke={INK} strokeWidth={6} />
        {hi > 0 ? <path d={`M ${868 - 105 * hi} ${660 - 40 * hi} Q 868 ${700 - 10 * hi} ${868 + 105 * hi} ${660 - 60 * hi} Z`} fill="#3b8fd0" stroke={INK} strokeWidth={5} /> : null}
        <path d="M 40 1290 Q 210 1390 400 1250" fill="#5b4b3a" stroke={INK} strokeWidth={6} />
        {lo > 0 ? <path d={`M ${220 - 175 * lo} ${1290 - 20 * lo} Q 220 ${1345} ${220 + 175 * lo} ${1260 - 5 * lo} Z`} fill="#3b8fd0" stroke={INK} strokeWidth={5} /> : null}
        {/* the tunnel through the rock, its cracks */}
        {tun > 0 ? (
          <g>
            <Glow x={520} y={1060} r={160} color="#ffe14a" o={0.25 * tun} />
            <path d={TUNNEL} fill="none" stroke={INK} strokeWidth={40} strokeLinecap="round" pathLength={1} strokeDasharray={`${tun} 1`} />
            <path d={TUNNEL} fill="none" stroke="#3a3346" strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={`${tun} 1`} />
          </g>
        ) : null}
        {crack > 0 ? [[600, 860, 650, 820, 700, 850], [430, 1120, 470, 1170, 430, 1210], [700, 760, 760, 780, 790, 740]].map((c, i) => (
          <path key={i} d={`M${c[0]},${c[1]} L${c[2]},${c[3]} L${c[4]},${c[5]}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${crack} 1`} />
        )) : null}
        <Sheep x={560} y={700} s={44} t={m.t} />
        <Sheep x={1040} y={660} s={40} t={m.t} phase={2} />
        {m.t >= mr && toFoot < 0.4 ? <Txt x={640} y={480} size={58} fill="#ffffff" stroke={INK}>{"MARCHLYN MAWR".slice(0, Math.round(13 * m.lerp([mr, mr + 14], [0, 1])))}</Txt> : null}
        {m.t >= ll ? <Txt x={320} y={1150} size={58} fill="#ffffff" stroke={INK}>{"LLYN PERIS".slice(0, Math.round(10 * m.lerp([ll, ll + 12], [0, 1])))}</Txt> : null}
      </View>
    </Stage>
  );
};

export default Lakes;
