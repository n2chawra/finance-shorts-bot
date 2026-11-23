// Ear: "So how could he not feel it? Your sense of turning comes from fluid in tiny loops in your ear. Hold a steady
// turn, and the fluid catches up." A general-principle diagram: a head outline with a turn arrow sweeping round it
// ("feel"); the head tilts with the turn ("turning"); blue fluid fills the three loops of the inner ear ("fluid");
// push in on the loops, the hair sensor in one ("loops"); INNER EAR types on ("ear"); the arrow keeps sweeping
// steadily ("steady"); the fluid moves with the loop, the hairs stand straight, the TURN meter drains and FEELS
// LEVEL types on ("catches").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { Arrow, MonoLabel } from "../../disaster/index";
import { AMBER, CREAM, Flat, k01, SKY, sm } from "./World";

const INK = "#d6dde3";

const Ear: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const turning = m.at("turning", 20), fluid = m.at("fluid", 50), loops = m.at("loops", 70), ear = m.at("ear", 85), steady = m.at("steady", 110), catches = m.at("catches", 140);
  const spin = t * 4;
  const caught = sm((t - catches) / 24);
  const lag = 1 - caught;
  const fill = k01((t - fluid) / 16);
  const zoom = m.lerp([loops, loops + 20], [1.2, 1.3]) - 0.1 * sm((t - steady) / 20) + 0.12 * sm((t - catches) / 20);
  const tilt = 14 * sm((t - turning) / 20);
  // the loops sit inside the head at (600, 860)
  const ex = 600, ey = 860;
  const loop = (rot: number, rx: number, ry: number, key: string) => (
    <g key={key} transform={`rotate(${rot} ${ex} ${ey})`}>
      <ellipse cx={ex} cy={ey - ry} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={30} />
      <ellipse cx={ex} cy={ey - ry} rx={rx} ry={ry} fill="none" stroke={SKY} strokeWidth={20} strokeOpacity={fill} />
      {/* the fluid's swirl: dashes that lag the turn, then move with the loop */}
      <ellipse cx={ex} cy={ey - ry} rx={rx} ry={ry} fill="none" stroke="#e8f6ff" strokeWidth={8} strokeDasharray="18 46" strokeDashoffset={-spin * 6 * lag} opacity={fill} />
    </g>
  );
  const meter = k01(sm((t - turning) / 15) * lag);
  return (
    <Flat t={t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={m.lerp([loops, loops + 20], [540, 600])} cy={m.lerp([loops, loops + 20], [860, 840])}>
          {/* the head in profile, tilting with the turn */}
          <g transform={`translate(540 860) scale(1.45) translate(-540 -860) rotate(${tilt} 540 1000)`}>
            <path d="M330,1230 C300,1050 300,820 420,700 C520,600 700,600 790,700 C860,780 860,860 830,930 L880,1010 L830,1030 C840,1080 820,1130 760,1140 L740,1230 Z"
              fill="rgba(30,38,46,0.85)" stroke={INK} strokeWidth={7} />
            {/* the cochlea and the three loops */}
            <path d={`M${ex - 40},${ey + 50} q-60,10 -60,60 q0,50 50,50 q40,0 40,-40 q0,-30 -30,-30`} fill="none" stroke={INK} strokeWidth={16} />
            {loop(0, 70, 95, "a")}
            {loop(62, 62, 88, "b")}
            {loop(-58, 60, 84, "c")}
            {/* the hair sensor at the foot of the first loop */}
            {t >= loops ? (
              <g transform={`translate(${ex} ${ey - 8}) rotate(${-38 * lag * k01((t - loops) / 10)})`}>
                {[-14, 0, 14].map((dx) => <line key={dx} x1={dx} y1={0} x2={dx + 4} y2={-46} stroke={AMBER} strokeWidth={6} strokeLinecap="round" />)}
              </g>
            ) : null}
          </g>
          <MonoLabel t={t} at={ear} x={600} y={500} text="INNER EAR" size={52} color={CREAM} anchor="middle" />
        </View>
        {/* the turn arrow sweeping round */}
        <g transform={`rotate(${spin % 360} 540 900)`}>
          <Arrow x1={540 + 470} y1={900} x2={540 + 450} y2={900 - 140} k={1} color={AMBER} w={14} />
        </g>
        <circle cx={540} cy={900} r={470} fill="none" stroke={AMBER} strokeWidth={5} strokeDasharray="10 22" opacity={0.6} />
        {/* the TURN signal meter */}
        <rect x={140} y={330} width={800} height={50} rx={25} fill="rgba(10,13,16,0.8)" stroke={INK} strokeWidth={4} />
        <rect x={146} y={336} width={788 * meter} height={38} rx={19} fill={AMBER} />
        <MonoLabel t={t} at={0} x={140} y={310} text="TURN FELT" size={46} color={CREAM} />
        {t >= catches ? <MonoLabel t={t} at={catches + 8} x={940} y={310} text="FEELS LEVEL" size={48} color={AMBER} anchor="end" /> : null}
        {t >= steady && t < catches ? <MonoLabel t={t} at={steady} x={940} y={310} text="STEADY TURN" size={46} color={SKY} anchor="end" /> : null}
      </svg>
    </Flat>
  );
};
export default Ear;
