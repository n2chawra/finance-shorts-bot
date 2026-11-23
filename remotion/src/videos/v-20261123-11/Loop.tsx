// "Fur or gold: which built more empires? Tell me below. And it all started with a few boats, rowing east from
// the place where" A fur pelt and a gold bar pop over the map; the camera glides back to the Urals, three boats
// appear at the ridge, their oars dip, and the red shrinks back west of the mountains: the hook's first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, Txt, View, INK, motion } from "../../flat/kit";
import { HookMap } from "./Hook";
import { GoldBar, Pelt } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fu = m.at("fur", 2), go = m.at("gold", 12), em = m.at("empires", 24), te = m.at("tell", 32), bl = m.at("below", 40), fe = m.at("few", 50), ro = m.at("rowing", 66), ea = m.at("east", 76);
  const home = m.lerp([fe - 6, ea + 4], [0, 1]);
  const off = 1 - m.lerp([fe - 10, fe + 6], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <HookMap t={m.t} center={[100 - 48 * home, 61 - 3 * home]} scale={560 + 840 * home}
          east={146 - 88 * m.lerp([ea - 10, m.end], [0, 1])} ridge={1} label={1} names={m.lerp([ea - 8, ea + 4], [0, 1])} boat={m.after("boats") ? m.lerp([ro, m.end], [0.02, 0]) : 0} front={0.6} />
      </View>
      <g opacity={off}>
        <Glow x={300} y={560} r={200} color="#ffe08a" o={0.5 * m.pulse(em, 12)} />
        <Glow x={780} y={560} r={200} color="#ffe08a" o={0.5 * m.pulse(em, 12)} />
        <Pelt x={300} y={520} s={170} kind="sable" k={m.pop(fu, 10)} rot={-8} />
        <GoldBar x={780} y={560} s={170} k={m.pop(go, 10)} />
        <g transform={`translate(540 ${760 + 120 * m.lerp([bl, bl + 12], [0, 1])}) scale(${m.pop(te, 10)})`}>
          <path d="M-120,-60 L120,-60 Q140,-60 140,-40 L140,30 Q140,50 120,50 L-20,50 L-50,86 L-50,50 L-120,50 Q-140,50 -140,30 L-140,-40 Q-140,-60 -120,-60 Z" fill="#ffffff" stroke={INK} strokeWidth={6} />
          {[-60, 0, 60].map((dx, i) => <circle key={i} cx={dx} cy={-5} r={14} fill={INK} />)}
        </g>
        {m.t >= go ? <Txt x={540} y={560} size={80} fill="#ffffff" stroke={INK}>OR</Txt> : null}
      </g>
    </Stage>
  );
};

export default Loop;
