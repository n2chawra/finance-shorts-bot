// Security (the turn): "Tesla pays part of the bill, to a security company Musk owns."
// The security company's office: a Tesla envelope slides under the door on "Tesla", the shield sign lights on
// "security", the door swings open on rows of monitors on "company", Musk sits behind the desk with an OWNER
// nameplate on "owns". On "part" a PART OF THE BILL tag stamps on the envelope.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Desk, Guard } from "./props";


const Shield: React.FC<{ x: number; y: number; s: number; lit: number }> = ({ x, y, s, lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={160} color="#4dc3ff" o={0.5 * lit} />
    <path d="M 0 -110 L 90 -75 Q 90 50 0 110 Q -90 50 -90 -75 Z" fill={lit > 0.5 ? "#2c7be5" : "#3a4260"} stroke={INK} strokeWidth={7} />
    <path d="M -35 0 L -8 28 L 40 -30" fill="none" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Security: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tesla = m.at("tesla", 2), sec = m.at("security", 16), comp = m.at("company", 28), owns = m.at("owns", 40), part = m.at("part", 10);
  const slide = m.lerp([tesla, tesla + 12], [0, 1]);
  const lit = m.lerp([sec, sec + 6], [0, 1]);
  const open = m.lerp([comp, comp + 14], [0, 1]);
  const boss = m.pop(owns, 10);
  const stamp = m.pop(part, 9);
  const zoom = m.t < comp ? m.lerp([0, comp], [1.2, 1.22]) : m.t < owns ? m.lerp([comp, comp + 16], [1.22, 1.0]) : m.lerp([owns, owns + 12], [1.0, 1.22]);
  const cy = m.t < owns ? 980 : m.lerp([owns, owns + 12], [980, 960]);
  return (
    <Stage p={p} bg="#141a2c" vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#141a2c" />
        {/* the room behind the door: monitors and the desk */}
        <g opacity={open}>
          {Array.from({ length: 3 }).map((_, r) => Array.from({ length: 4 }).map((_, c) => (
            <g key={`${r}-${c}`}>
              <rect x={150 + c * 200} y={330 + r * 150} width={180} height={130} rx={10} fill="#0b1a2a" stroke={INK} strokeWidth={5} />
              <rect x={165 + c * 200} y={345 + r * 150} width={150} height={100} rx={4} fill={["#2e5a7a", "#3a6a5a", "#4a4a7a"][(r + c) % 3]} opacity={0.6 + 0.3 * Math.sin(m.t / 7 + r + c)} />
            </g>
          )))}
          {boss > 0 ? (
            <Char x={540} y={1180 + (1 - boss) * 60} s={240} photo="musk" outfit="suit" top="#292a32" face="neutral" armL={[40, 90]} armR={[40, 90]} />
          ) : null}
          <Desk x={220} y={1060} w={640} />
          {boss > 0 ? <Tag x={400} y={1110} w={280} h={90} text="OWNER" size={52} k={boss} bg="#ffc43d" /> : null}
        </g>
        {/* a guard on duty by the door */}
        <Guard x={960} y={1420} s={260} m={m} i={1} look={[-0.6, 0]} />
        <Guard x={110} y={1420} s={260} m={m} i={2} look={[0.6, 0]} />
        <rect x={240} y={1330} width={600} height={90} rx={20} fill="#7a2b3b" stroke={INK} strokeWidth={5} />
        {/* the door, swinging open to the left */}
        <g transform={`translate(160 260) scale(${1 - open * 0.85} 1)`}>
          <Block x={0} y={0} w={760} h={1060} r={10} fill="#3a4260" />
          <Shield x={380} y={330} s={1.6} lit={lit} />
          <Txt x={380} y={640} size={60} fill={lit > 0.5 ? "#9fd8ff" : "#6b7290"}>SECURITY</Txt>
          <circle cx={680} cy={560} r={22} fill="#c9a24a" stroke={INK} strokeWidth={4} />
        </g>
        {/* the Tesla envelope and its cheque */}
        <g transform={`translate(${m.lerp([tesla, tesla + 10], [60, 300]) + open * 0} ${1260 - stamp * 0})`}>
          <rect x={0} y={0} width={480} height={240} rx={12} fill="#fbf8f0" stroke={INK} strokeWidth={6} />
          <path d="M 0 0 L 240 120 L 480 0" fill="none" stroke={INK} strokeWidth={5} />
          <g transform="translate(240 200)"><Photo name="tesla" s={60} t={0} /></g>
          {stamp > 0 ? (
            <g transform={`translate(240 -50) scale(${1 + (1 - Math.min(1, stamp)) * 1.2}) rotate(-5)`}>
              <rect x={-250} y={-50} width={500} height={100} rx={12} fill="#ffc43d" stroke={INK} strokeWidth={6} />
              <Txt x={0} y={2} size={50} fill={INK}>PART OF THE BILL</Txt>
            </g>
          ) : null}
        </g>
        <rect x={-700} y={1330} width={2480} height={1400} fill="#232a40" />
      </View>
    </Stage>
  );
};

export default Security;
