// Tunnel: "Since then, long bridges are tested as models in wind tunnels first. Its replacement got an open truss the
// wind blows through."
// A wind tunnel drawn on archive paper: a section model of a deck on springs, smoke lines streaming ("Since"); the
// smoke flows smoothly over the model, a gauge needle steady ("tested"); push in, WIND TUNNEL TEST ("models");
// cut to the replacement bridge in 3D, an open steel truss under its deck ("replacement"); the truss lights amber
// ("truss"); wind streaks pass straight through it ("through").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { AMBER, Cam, CREAM, DECK_Y, Flat, GraphPaper, Gertie, k01, Narrows, Shot3D, sm, Tag, TEAL, WindStreaks } from "./World";

const INK = "#e6d6b0";

const Lab: React.FC<{ t: number; tested: number; models: number }> = ({ t, tested, models }) => {
  const zoom = 1 + 0.06 * sm((t - models) / 20);
  const bob = 6 * Math.sin(t * 0.25);
  return (
    <Flat t={t} tag="">
      <GraphPaper />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={540} cy={900}>
          <g transform="translate(540 960) scale(1.0 1.35) translate(-540 -960)">
          {/* the tunnel: a long box with a fan at the left */}
          <rect x={40} y={700} width={1000} height={520} rx={20} fill="rgba(30,34,30,0.7)" stroke={INK} strokeWidth={6} />
          <g transform={`rotate(${t * 20} 110 960)`}>
            {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={110} cy={900} rx={18} ry={60} fill={INK} transform={`rotate(${i * 90} 110 960)`} />)}
          </g>
          {/* smoke lines over the model: smooth */}
          {Array.from({ length: 8 }, (_, i) => {
            const y = 760 + i * 60;
            const near = Math.abs(y - 960) < 90;
            const d = near ? `M 190 ${y} C 420 ${y} 460 ${y < 960 ? 880 : 1040} 540 ${y < 960 ? 880 : 1040} S 680 ${y} 1020 ${y}` : `M 190 ${y} L 1020 ${y}`;
            return <path key={i} d={d} fill="none" stroke="#d9ece8" strokeWidth={5} strokeDasharray="30 18" strokeDashoffset={-t * 7} opacity={k01((t - tested) / 10) * 0.9 + 0.1} />;
          })}
          {/* the section model on two springs */}
          <g transform={`translate(540 966) scale(1.8) translate(-540 -966) translate(0 ${bob})`}>
            <rect x={430} y={945} width={220} height={18} fill="#4a4640" stroke={INK} strokeWidth={4} />
            <rect x={445} y={963} width={190} height={24} fill="none" stroke={TEAL} strokeWidth={4} />
            <path d="M 450 963 L 490 987 L 530 963 L 570 987 L 610 963 L 630 987" fill="none" stroke={TEAL} strokeWidth={4} />
          </g>
          {[440, 640].map((x) => (
            <path key={x} d={`M ${x} ${1010 + bob} l 0 20 l -14 12 l 28 12 l -28 12 l 28 12 l -14 12 l 0 30`} fill="none" stroke={INK} strokeWidth={5} />
          ))}
          </g>
          {/* the gauge, steady */}
          <circle cx={900} cy={1260} r={80} fill="rgba(16,18,16,0.85)" stroke={INK} strokeWidth={5} />
          <line x1={900} y1={1260} x2={900 + 58 * Math.sin(0.3 + 0.03 * Math.sin(t * 0.3))} y2={1260 - 58 * Math.cos(0.3)} stroke={AMBER} strokeWidth={8} strokeLinecap="round" />
          <MonoLabel t={t} at={models} x={540} y={420} text="WIND TUNNEL TEST" size={56} color={AMBER} anchor="middle" />
          <MonoLabel t={t} at={0} x={540} y={700} text="SECTION MODEL" size={48} color={CREAM} anchor="middle" />
        </View>
      </svg>
    </Flat>
  );
};

const Tunnel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const tested = m.at("tested", 20), models = m.at("tunnels", 40), replacement = m.at("replacement", 90), truss = m.at("truss", 120), through = m.at("open", 105);
  if (f < replacement) return <Lab t={f} tested={tested} models={models} />;
  const g = f - replacement;
  const pos: [number, number, number] = [-6 + 0.02 * g, DECK_Y - 0.9 + 0.004 * g, 3.4 - 0.01 * g];
  const look: [number, number, number] = [-1.5, DECK_Y - 0.25, 0];
  const lit = sm((f - truss) / 12);
  return (
    <Shot3D f={f}
      overlay={
        <>
          <Tag t={f} at={replacement} top={380} text="THE REPLACEMENT" color={CREAM} size={50} />
          {f >= truss ? <Tag t={f} at={truss} top={480} text="OPEN TRUSS" color={AMBER} size={58} /> : null}
          <WindStreaks f={f} k={k01((f - through) / 8)} y0={900} y1={1250} seed={7} />
        </>
      }>
      <Cam pos={pos} look={look} fov={44} seed="tac-truss" range={6} />
      <Narrows f={f} />
      <Gertie girder="truss" hot={0.45 * lit} colors={{ steel: "#6d7f74" }} />
    </Shot3D>
  );
};
export default Tunnel;
