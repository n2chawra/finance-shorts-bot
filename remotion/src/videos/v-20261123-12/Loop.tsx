// "Malacca or Hormuz: which closure would hurt the world more? Tell me below. Now picture it once more:" A pin pops
// on Malacca and another far west on Hormuz, both pulse red, a comment bubble pops between them, then the camera glides
// back to the strait as the tankers sail up the lane again: the hook's first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapPin } from "../../flat/map";
import { Banner, HookMap } from "./Hook";
import { HORMUZ, RED, SEAsia, Spot } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ma = m.at("malacca", 2), ho = m.at("hormuz", 12), cl = m.at("closure", 22), te = m.at("tell", 50), pi = m.at("picture", 64), on = m.at("once", 74), mo = m.at("more", 82);
  const home = m.lerp([pi - 4, mo + 6], [0, 1]);
  const pulse = 1 + 0.25 * m.pulse(cl + 4, 10);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        {home < 0.5 ? (
          <SEAsia center={[80, 14]} scale={720} wide>
            <MapPin at={[100.5, 3.2]} k={m.pop(ma, 10) * pulse} r={30} color={RED} />
            <Spot at={[100.5, 3.2]} name="MALACCA" k={m.pop(ma, 10)} size={52} dy={50} left />
            <MapPin at={HORMUZ} k={m.pop(ho, 10) * pulse} r={30} color={RED} />
            <Spot at={HORMUZ} name="HORMUZ" k={m.pop(ho, 10)} size={52} dy={50} />
          </SEAsia>
        ) : (
          <HookMap t={m.t} center={[100.9, 3.0]} scale={7000} go={m.lerp([on, m.end], [-0.06, 0])} stop={0} gate={0} lamp={0} night={0} q={0} label={0.4} />
        )}
      </View>
      {m.t >= te && home < 0.5 ? (
        <g transform={`translate(540 520) scale(${m.pop(te, 10)})`}>
          <path d="M-120,-60 L120,-60 Q140,-60 140,-40 L140,30 Q140,50 120,50 L-20,50 L-50,86 L-50,50 L-120,50 Q-140,50 -140,30 L-140,-40 Q-140,-60 -120,-60 Z" fill="#ffffff" stroke={INK} strokeWidth={6} />
          {[-60, 0, 60].map((dx, i) => <circle key={i} cx={dx} cy={-5} r={14} fill={INK} />)}
        </g>
      ) : null}
      {home >= 0.5 ? <Banner k={1} /> : null}
      {home > 0.35 && home < 0.65 ? <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={1 - Math.abs(home - 0.5) / 0.15} /> : null}
    </Stage>
  );
};

export default Loop;
