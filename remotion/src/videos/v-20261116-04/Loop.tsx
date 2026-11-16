// Loop: "So is Amazon a shop, or a computer company?" Back on the warehouse floor: a parcel drops down
// the chute on "shop", the worker looks up at the server rack blinking behind the shelves on "or", the
// rack pulses on "computer", and on "company" the camera dives into the rack, back to the hook's server hall.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, STROKE, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Floor, Parcel, Rack, Shelves } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const shop = m.at("shop", 6), or = m.at("or", 16), comp = m.at("computer", 22), co = m.at("company", 30);
  const drop = m.lerp([shop - 6, shop + 4], [0, 1], Easing.in(Easing.quad));
  const zoom = m.t < or ? m.lerp([0, or], [0.92, 0.96]) : m.t < co ? m.lerp([or, or + 10], [0.96, 1.1]) : m.lerp([co, m.end], [1.1, 2.6], Easing.in(Easing.cubic));
  const cy = m.t < co ? m.lerp([or, or + 10], [980, 820]) : m.lerp([co, m.end], [820, 380]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3b4a63" vignette={0.42}>
        <View zoom={zoom} cx={540} cy={cy}>
          <rect x={-300} y={-300} width={1680} height={1600} fill="#55688a" />
          {[-200, 160, 520, 880, 1240].map((x) => <rect key={x} x={x} y={-300} width={30} height={1600} fill="#4a5c7c" stroke={INK} strokeWidth={4} />)}
          {[0, 1, 2].map((i) => <Glow key={i} x={180 + i * 360} y={120} r={260} color="#fff3c4" o={0.28} />)}
          {/* the server rack behind the shelves */}
          <Rack x={380} y={160} w={320} h={420} t={m.t} seed="loop" color="#4dd8ff" />
          <Glow x={540} y={370} r={300} color="#4dd8ff" o={0.2 + 0.4 * m.pulse(comp, 8)} />
          <Shelves x={-260} y={640} w={420} h={760} seed="hl" />
          <Shelves x={920} y={640} w={420} h={760} seed="hr" />
          <g transform={`translate(540 ${760 + m.wave(70, 4)})`} opacity={m.lerp([co, co + 6], [1, 0])}><Photo name="amazon" s={170} t={m.t / p.fps} /></g>
          <Floor y={1400} color="#6f6a63" />
          {/* the chute and the conveyor */}
          <polygon points="160,820 300,820 420,1150 300,1150" fill="#8a92a6" stroke={INK} strokeWidth={STROKE} />
          <rect x={160} y={1180} width={760} height={46} rx={20} fill="#2a2f3d" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={190 + i * 88} cy={1203} r={14} fill="#8a92a6" stroke={INK} strokeWidth={3} />)}
          {m.t >= shop - 6 ? <Parcel x={170 + drop * 180 + m.lerp([shop + 4, m.end], [0, 260], Easing.linear)} y={820 + drop * 260} w={130} rot={(1 - drop) * 25} /> : null}
          <rect x={250} y={1340} width={580} height={40} fill="#b98a52" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <Parcel key={i} x={270 + i * 140} y={1240} w={130} />)}
          <Char x={900} y={1620 + m.wave(55, 3)} s={300} who="rohan" outfit="tee" top="#2b5fa8" hair="cap" hat="#ff9900"
            face={m.t >= comp ? "shock" : "neutral"} look={m.t >= or ? [-0.5, -1] : [-0.6, 0]} armL={[30, 20]} armR={[20, 30]} />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
