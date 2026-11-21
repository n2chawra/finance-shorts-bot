// Call: "The steel maker phoned to split it into two shorter rods. The change went through."
// The steel maker's desk: a 1970s desk phone rings, its handset jumping ("phoned"); on the shop drawing
// beside it the one rod splits ("split") and the lower rod slides over beside the upper one ("shorter");
// a REVISED stamp slams onto the sheet ("change"); the sheet slides off to the side ("through").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { Flat, MONO } from "./World";
import { HangerSheet } from "./Sheet";

const RED = "#ff3b30";

const Phone: React.FC<{ x: number; y: number; ring: number; lift: number }> = ({ x, y, ring, lift }) => (
  <g transform={`translate(${x} ${y}) rotate(${ring * 4})`}>
    <path d="M -150 60 L -110 -40 L 110 -40 L 150 60 Z" fill="#2c2c31" stroke="#0c0c0e" strokeWidth={5} />
    <circle cx={0} cy={10} r={52} fill="#3a3a40" stroke="#0c0c0e" strokeWidth={4} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 1.6 + 0.6;
      return <circle key={i} cx={Math.cos(a) * 34} cy={10 + Math.sin(a) * 34} r={7} fill="#e4ddd2" />;
    })}
    <g transform={`translate(0 ${-58 - lift * 40}) rotate(${-lift * 8})`}>
      <path d="M -140 0 Q -150 -40 -110 -44 L 110 -44 Q 150 -40 140 0 L 100 4 Q 90 -14 70 -14 L -70 -14 Q -90 -14 -100 4 Z" fill="#2c2c31" stroke="#0c0c0e" strokeWidth={5} />
    </g>
    {ring > 0.05 && [1, 2].map((k) => (
      <path key={k} d={`M ${-160 - k * 26} ${-60 - k * 18} q -20 40 0 80 M ${160 + k * 26} ${-60 - k * 18} q 20 40 0 80`} stroke="#ffd84a" strokeWidth={8} fill="none" opacity={ring} strokeLinecap="round" />
    ))}
  </g>
);

const Call: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const phoned = m.at("phoned", 6), split = m.at("split", 24), shorter = m.at("shorter", 40), change = m.at("change", 60), through = m.at("through", 80);
  const ringing = phoned <= m.t && m.t < split + 6 ? Math.abs(Math.sin(m.t * 1.3)) : 0;
  const stamp = m.pop(change, 9, 220);
  const away = m.lerp([through, m.end], [0, 1]);
  const zoom = m.lerp([0, phoned + 8], [1.0, 1.05]) + m.lerp([split - 4, split + 10], [0, 0.18]) - m.lerp([change - 4, change + 8], [0, 0.16]);
  const cy = m.lerp([split - 4, split + 10], [900, 820]) + m.lerp([change - 4, change + 8], [0, 40]);
  return (
    <Flat t={m.t} tag="as reported">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={540} cy={cy}>
          <g transform={`translate(${away * -160} ${away * 30}) rotate(${-2 - away * 3} 540 830) scale(0.86) translate(90 150)`}>
            <HangerSheet t={m.t} draw={1} split={m.lerp([split, split + 2], [0, 1])} slide={m.lerp([shorter, shorter + 12], [0.3, 1])}
              hot4={m.lerp([shorter + 6, shorter + 16], [0, 1])} labels={{ rod: split + 4 }} />
            {stamp > 0 && (
              <g transform={`translate(330 850) rotate(-10) scale(${1.6 - 0.6 * stamp})`} opacity={Math.min(1, stamp * 1.4)}>
                <rect x={-190} y={-62} width={380} height={124} fill="none" stroke={RED} strokeWidth={10} rx={10} />
                <text x={0} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={84} fill={RED} letterSpacing={8}>REVISED</text>
              </g>
            )}
          </g>
          <Phone x={250 + m.wave(50, 2)} y={360} ring={ringing} lift={ringing * 0.5} />
          <MonoLabel t={m.t} at={phoned + 2} x={450} y={330} text="STEEL MAKER" sub="phones the engineers" size={48} />
        </View>
      </svg>
    </Flat>
  );
};
export default Call;
