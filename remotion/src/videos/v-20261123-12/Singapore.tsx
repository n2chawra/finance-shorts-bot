// "Stranger still, Singapore, a port city at the narrow end of the lane, suddenly sits beside a blocked lane with no way through." The camera
// swings back north to the tip of the peninsula; Singapore glows red, cranes and ships fill its harbour, the closed
// lane beside it darkens, the harbour lights flicker and a NO WAY THROUGH sign drops at the harbour mouth and the ship turns back.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { LAND, LANE, Line, SEAsia, SINGAPORE, Tanker } from "./props";

const Harbour: React.FC<{ t: number; back: number; port: number; dark: number; flick: number; sign: number }> = ({ t, back, port, dark, flick, sign }) => {
  const at = useAt();
  const s = at(SINGAPORE);
  if (!s) return null;
  const [x, y] = [s[0], s[1] + 230];
  const lit = flick > 0 ? (Math.sin(t * 1.7) > 0 ? 1 : 0.3) : 1;
  return (
    <g>
      <Line via={LANE.slice(4, 7)} k={1} color={LAND} w={120} ink={false} o={0.6 + 0.4 * dark} />
      {[-160, -40, 80].map((dx, i) => port > 0 ? (
        <g key={i} transform={`translate(${x + dx} ${y}) scale(${Math.min(1, port * 1.5 - i * 0.2)})`}>
          <Limb a={[0, 0]} b={[0, -150]} w={12} color="#e8453c" sw={4} />
          <Limb a={[-30, -140]} b={[90, -140]} w={10} color="#e8453c" sw={4} />
          <circle cx={0} cy={-160} r={9} fill="#ffcf4a" opacity={lit} />
        </g>
      ) : null)}
      {port > 0 ? <Tanker x={x - 40 - 160 * back} y={y + 80} s={80} boxes rot={back > 0 ? 180 : 0} t={t} k={port} /> : null}
      {sign > 0 ? <Limb a={[x + 240, y - 30 - 300 * (1 - Math.min(1, sign))]} b={[x + 240, y + 110 - 300 * (1 - Math.min(1, sign))]} w={10} color="#5a5a66" sw={3} /> : null}
      {sign > 0 ? <Tag x={x + 30} y={y - 130 - 300 * (1 - Math.min(1, sign))} w={420} h={100} text="NO WAY THROUGH" size={46} k={1} rot={0} bg="#ffcf4a" /> : null}
    </g>
  );
};

const Singapore: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const st = m.at("stranger", 2), sg = m.at("singapore", 16), po = m.at("port", 30), na = m.at("narrow", 44), de = m.at("blocked", 84), tr = m.at("through", 100);
  const come = m.lerp([st, sg + 6], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.03 + 0.05 * m.lerp([sg, sg + 12], [0, 1]) + m.wave(80, 0.008)}>
        <SEAsia center={[103.0 + 0.85 * come, -1.0 + 2.25 * come]} scale={9000 + 16000 * come}
          colors={{ Singapore: { fill: "#e8453c", trace: m.lerp([sg, sg + 20], [0, 1]) }, Malaysia: { fill: "#e0b46a" }, Indonesia: { fill: "#c9c27a" } }}>
          <MapLabel at={[103.8, 1.72]} text="SINGAPORE" size={60} k={m.pop(sg, 10)} />
          <Harbour t={m.t} back={m.lerp([tr, tr + 20], [0, 1])} port={m.lerp([po, po + 14], [0, 1])} dark={m.lerp([na, na + 10], [0, 1])} flick={m.after("suddenly") && m.t < de ? 1 : 0} sign={m.pop(de, 10)} />
        </SEAsia>
      </View>
    </Stage>
  );
};

export default Singapore;
