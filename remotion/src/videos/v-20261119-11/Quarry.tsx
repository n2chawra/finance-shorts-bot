// Build: "Musk alone owns {fact3}. That's {muskpct_pct} of the whole pile."
// A gold quarry at noon: a crane hook lowers onto one slab of the giant gold mountain on "alone", the slab lifts
// away with Musk's figure stamped on its tag on "owns", the camera pulls back to the whole mountain with the gap on
// "whole", and a sign at the gap stamps the share on "pile".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { GoldPile } from "./props";
import { Char } from "../../flat/cast";

type Params = { fig?: { musk?: string; pct?: string } };

const Quarry: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const thats = m.at("thats", 34), of = m.at("of", 40), alone = m.at("alone", 4), owns = m.at("owns", 14), whole = m.at("whole", 50), pile = m.at("pile", 60);
  const lower = m.lerp([0, alone + 6], [0, 1]);
  const lift = m.lerp([owns - 2, owns + 18], [0, 1], Easing.inOut(Easing.cubic));
  const swing = m.t >= of ? Math.sin((m.t - of) / 4) * 8 * Math.max(0, 1 - (m.t - of) / 40) : 0;
  const spill = m.lerp([of, of + 24], [0, 1]);
  const tag = m.pop(owns + 4, 9) * (1 + 0.12 * m.pulse(thats + 3, 5));
  const sign = m.pop(pile - 1, 9);
  const back = m.lerp([thats - 2, whole + 14], [0, 1], Easing.inOut(Easing.cubic));
  // the slab sits in the mountain's right side, then rises on the hook
  const sx = 640, sy = 1150 - 400 * lift, sw = 190, sh = 170;
  const hookY = 200 + (sy - 200) * Math.max(lower, 0.2) - 20;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#8fd0ff" vignette={0.3}>
        <View zoom={1.25 - 0.25 * back} cx={560 + m.wave(60, 8)} cy={900 + 60 * back + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#8fd0ff" />
          <Glow x={900} y={120} r={200} color="#fff6c0" o={0.8} />
          {/* terraced quarry walls */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={-400} y={560 + i * 180} width={1880} height={200} fill={["#c9a477", "#bb9468", "#ad865a", "#9f784d"][i]} stroke="#1d1a2b" strokeWidth={5} />
              {Array.from({ length: 7 }).map((_, j) => <rect key={j} x={-360 + j * 280 + (i % 2) * 120} y={600 + i * 180} width={90} height={18} rx={8} fill="#8a6a44" />)}
            </g>
          ))}
          <rect x={-400} y={1280} width={1880} height={900} fill="#8a6a44" />
          <path d="M -400 1280 L 1480 1280 L 1480 1340 L -400 1340 Z" fill="#7a5a3a" />
          <GoldPile x={60} y={1290} w={900} k={1} t={m.t} seed="quarry" gap={lift > 0.05 ? 1 : 0} />
          {/* the crane */}
          <Block x={860} y={-300} w={60} h={1600} fill="#f5c542" />
          {Array.from({ length: 9 }).map((_, i) => <Limb key={i} a={[860, -260 + i * 170]} b={[920, -180 + i * 170]} w={6} color="#c9952a" sw={0} />)}
          <Limb a={[920, 200]} b={[300, 200]} w={40} color="#f5c542" />
          {/* the crane cab and its driver */}
          <Block x={760} y={240} w={200} h={170} r={14} fill="#f0b030" />
          <Block x={775} y={258} w={120} h={90} r={8} fill="#bfe3ff" shadow={false} />
          <Char x={835} y={430} s={70} hat="#ffd34a" top="#e67e22" face="grin" look={[-1, 0.4]} armL={[100 + 20 * Math.sin(m.t / 6), 60]} armR={[60, 40]} />
          <Limb a={[sx + sw / 2, 200]} b={[sx + sw / 2, hookY]} w={6} color="#2a2f3d" sw={0} />
          {/* the slab */}
          <g transform={`rotate(${swing} ${sx + sw / 2} ${hookY})`}>
            <Block x={sx} y={sy} w={sw} h={sh} r={14} fill="#f0bb36" />
            {[0, 1, 2].map((i) => <Coin key={i} x={sx + 40 + i * 55} y={sy + 50} r={22} spin={Math.abs(Math.cos(m.t / 6 + i))} />)}
          </g>
          {spill > 0 && spill < 1 ? [0, 1, 2, 3].map((i) => <Coin key={i} x={sx + 30 + i * 45} y={sy + sh + 500 * spill * spill + i * 20} r={20} spin={Math.abs(Math.cos(m.t / 3 + i))} />) : null}
          {tag > 0 ? <Tag x={sx - 230} y={sy - 170} w={560} h={130} text={`MUSK ${fig.musk ?? ""}`} size={64} bg="#ffffff" fg="#c0392b" rot={-4} k={tag} /> : null}
          {sign > 0 ? (
            <g>
              <Limb a={[790, 1290]} b={[790, 1180]} w={14} color="#7a5a3a" />
              <Tag x={590} y={1030} w={400} h={150} text={`${fig.pct ?? ""} OF ALL`} size={62} bg="#ffd34a" rot={3} k={sign} />
            </g>
          ) : null}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Quarry;
