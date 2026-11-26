// "Turn the dial back a century, and this land was Germany: East Prussia, with its capital, Koenigsberg." The era dial
// drops in and swings back to GERMANY; the map goes sepia; old East Prussia paints in with Germany's flag; EAST PRUSSIA
// writes across it; a castle stands up on the city's spot and KOENIGSBERG writes on under it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Castle, Dial, KALININGRAD, Map, On, Prussia, SEPIA } from "./props";

const Germany: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tu = m.at("turn", 2), ce = m.at("century", 18), ge = m.at("germany", 40), ea = m.at("east", 56), ca = m.at("capital", 78), ko = m.at("koenigsberg", 92);
  const wide = m.lerp([ge - 4, ge + 18], [0, 1]), close = m.lerp([ko - 4, ko + 18], [0, 1]);
  const old = m.lerp([ce, ce + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.4}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[21.1 - 0.4 * close, 53.75 + 0.55 * close - 0.1 * wide]} scale={9000 + 1800 * wide + 3000 * close} colors={{ Russia: { fill: "#e8d4a2", k: 0 } }}>
          <Prussia k={0.35 + 0.65 * m.lerp([ge, ge + 16], [0, 1])} o={m.lerp([ce, ce + 12], [0, 1])} flagK={m.lerp([ge + 6, ge + 20], [0, 1])} edge={m.lerp([ge, ge + 26], [0, 1])} />
          <MapLabel at={[21.1, 53.75]} text="EAST PRUSSIA" size={58} k={m.pop(ea, 12)} type={m.lerp([ea, ea + 18], [0, 1])} />
          <On at={KALININGRAD} draw={(x, y) => <Castle x={x} y={y} s={120} k={m.pop(ca, 14)} old />} />
          <MapLabel at={[KALININGRAD[0], KALININGRAD[1] - 0.22]} text="KOENIGSBERG" size={54} k={m.pop(ko, 12)} type={m.lerp([ko, ko + 18], [0, 1])} />
        </Map>
        <rect x={-200} y={-200} width={1480} height={2320} fill={SEPIA} opacity={0.22 * old} />
      </View>
      <Dial pos={1 - m.lerp([ce, ce + 20], [0, 1])} k={m.pop(tu, 12)} />
    </Stage>
  );
};
export default Germany;
