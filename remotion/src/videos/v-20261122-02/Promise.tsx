// Promise: "On paper, it belongs to SpaceX, his rocket company."
// SpaceX's launch site at dusk, the jet parked by the launch tower: the camera starts close on the tail where an
// ownership paper flaps on "paper"; it turns to show the owner line on "belongs", the SpaceX logo stamps along the
// fuselage on "SpaceX", and the camera pulls back as a rocket lifts off the tower behind on "rocket".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { Char } from "../../flat/cast";
import { Jet } from "./props";

const PromiseShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const paper = m.at("paper", 2), belongs = m.at("belongs", 18), spacex = m.at("spacex", 32), rocket = m.at("rocket", m.end - 20);
  const glide = m.lerp([0, belongs + 6], [0, 1]);
  const turn = m.lerp([belongs, belongs + 10], [0, 1]);
  const logo = m.pop(spacex, 10);
  const rise = m.lerp([rocket, m.end + 10], [0, 1]);
  const zoom = m.t < spacex ? m.lerp([0, belongs + 6], [1.3, 1.24]) : m.lerp([spacex, rocket + 14], [1.2, 0.95]);
  const cx = m.lerp([0, belongs + 6], [360, 380]) + (m.t > spacex ? m.lerp([spacex, rocket + 14], [0, 230]) : 0);
  const cy = m.lerp([0, belongs + 6], [900, 920]) + (m.t > spacex ? m.lerp([spacex, rocket + 14], [0, 120]) : 0);
  const flap = Math.sin(m.t / 3) * 6 * (1 - turn);
  return (
    <Stage p={p} bg="#1c2450" vignette={0.35}>
      <View zoom={zoom} cx={cx + m.wave(120, 4)} cy={cy}>
        <rect x={-900} y={-900} width={2880} height={2000} fill="#1c2450" />
        <rect x={-900} y={700} width={2880} height={400} fill="#3b3f78" opacity={0.6} />
        {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={-800 + ((i * 197) % 2600)} cy={-700 + ((i * 131) % 1300)} r={4} fill="#fff6d8" opacity={0.6 + 0.4 * Math.sin(m.t / 9 + i)} />)}
        {/* the launch tower */}
        <g>
          {[0, 1].map((k) => <rect key={k} x={560 + k * 140} y={300} width={20} height={800} fill="#6b7290" stroke={INK} strokeWidth={4} />)}
          {Array.from({ length: 8 }).map((_, i) => <Limb key={i} a={[570, 320 + i * 100]} b={[710, 400 + i * 100]} w={8} color="#6b7290" sw={3} />)}
        </g>
        <rect x={-900} y={1080} width={2880} height={1500} fill="#5a5f6e" />
        <rect x={-900} y={1080} width={2880} height={20} fill="#3a3f4e" />
        {/* the rocket rising on the horizon */}
        {true ? (
          <g transform={`translate(640 ${880 - rise * 700})`}>
            <Glow x={0} y={160} r={140} color="#ffb35c" o={rise > 0 ? 0.8 : 0} />
            {rise > 0 ? <path d="M -14 120 L 14 120 L 30 180 L -30 180 Z" fill="#ffb35c" /> : null}
            <Block x={-45} y={-480} w={90} h={600} r={12} fill="#f4f6fb" shadow="right" />
            <path d="M -45 -480 Q 0 -600 45 -480 Z" fill="#f4f6fb" stroke={INK} strokeWidth={5} />
            <rect x={-45} y={-300} width={90} height={24} fill="#1d1a2b" />
          </g>
        ) : null}
        <Jet x={520} y={980} s={0.85} m={m} steps={1} glow={1}
          tail={null} />
        {/* a SpaceX ground crew member pointing at the tail */}
        <Char x={620} y={1420} s={260} who="rohan" outfit="tee" top="#e8ecf5" hair="cap" hat="#1d1a2b" face={m.t >= belongs ? "grin" : "neutral"} look={[-0.8, -0.4]}
          armL={[150, 20]} />
        <rect x={-900} y={1250} width={2880} height={14} fill="#ffc43d" opacity={0.8} />
        {/* the SpaceX logo along the fuselage */}
        {logo > 0 ? (
          <g transform={`translate(${520 - 90 * 0.85} ${980 - 2}) scale(${1 + (1 - Math.min(1, logo)) * 0.6})`} opacity={Math.min(1, logo * 2)}>
            <Photo name="spacex" s={150} t={0} />
          </g>
        ) : null}
        {/* the ownership paper flapping on the tail fin */}
        <g transform={`translate(150 640) rotate(${-6 + flap}) scale(1.35)`}>
          <Limb a={[0, -40]} b={[0, 10]} w={8} color="#3a3f55" sw={3} />
          <rect x={-110} y={0} width={220} height={260} rx={8} fill="#fbf8f0" stroke={INK} strokeWidth={5} transform={`scale(${0.4 + 0.6 * turn + 0.4 * (1 - turn) * Math.abs(Math.cos(m.t / 6))} 1)`} />
          {turn > 0.6 ? (
            <g>
              <Txt x={0} y={50} size={46} fill={INK}>OWNER</Txt>
              <rect x={-80} y={90} width={160} height={10} rx={4} fill="#d7d2c4" />
              <Txt x={0} y={170} size={50} fill="#2c4a8a">SPACEX</Txt>
            </g>
          ) : null}
        </g>
      </View>
    </Stage>
  );
};

export default PromiseShot;
