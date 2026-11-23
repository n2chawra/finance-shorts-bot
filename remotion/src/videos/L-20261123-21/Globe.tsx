// Globe: the Earth in space with its orbits at true relative height (the satellites themselves drawn
// far larger than life; the beat carries the "not to scale" tag). Earth radius R; the geostationary ring
// at 6.62 R; the low shell at 1.075 R. Actions: earth, spin, geoRing, geoSat, ride, pin, lockline,
// bracket, pulseUp, pulseDown, pulseLeo, pulses, thread, count, dropSat, leoShell, leoSat, speed, trail,
// pinSlide, overhead, cone, footprint, dark, question, fillA, fillB, fillC, many, links, rise, set, pct.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { glow, rnd, TECH, type V3 } from "../../three/index";
import { BACK, Beam, BoxSat, Cone, Earth, FlatSat, lerpV, Orbit, PulseRing, q, Shot, sph, Stars, useBeat, Words, type Anchor } from "./kit";

const R = 3;
const RG = R * 6.62;
const RL = R * 1.075;
const W = 0.0035;          // the Earth's turn per frame (sped up)
const PIN_LAT = 0.55;

const Globe: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const spin = W * f;
  const lonPin = -1.45 + spin;
  const pin = sph(R * 1.01, PIN_LAT, lonPin);
  const geoOn = Math.max(k("geoRing", 24), k("geoSat", 12));
  const drop = k("dropSat", 30);
  const geoPos = sph(RG + (RL - RG) * drop, 0, lonPin);
  const leoOn = Math.max(k("leoShell", 20), k("leoSat", 12), k("many", 20));
  // the low satellite: it laps the planet; faster once it races
  const ride = has("ride") || has("speed") || has("overhead") || has("trail");
  const t0 = Math.min(at("ride"), at("speed"), at("trail"), at("overhead"), at("catch"));
  const lonLeo = lonPin - 0.6 + (ride && f > t0 ? 0.03 * (f - t0) : 0) + (has("leoSat") ? 0 : 0);
  const leoPos = sph(RL, 0.35, lonLeo);
  const leoSatShown = has("leoSat") || has("ride") || has("speed") || drop >= 1;
  // which satellite a signal goes to
  const toLeo = has("leoShell") || has("leoSat") || has("pulseLeo");
  const geoTarget = geoPos;
  const leoTarget = leoPos;
  const trip = (start: number, dur: number) => (f < start ? -1 : (f - start) / dur);
  const up = trip(at("pulseUp"), 40), dn = trip(at("pulseDown"), 40);
  const leoTrip = trip(at("pulseLeo"), 10);
  const train = has("pulses") ? trip(at("pulses"), toLeo ? 10 : 40) : -1;
  const fills = [k("fillA", 20), k("fillB", 20), k("fillC", 20), k("many", 24)];
  const nRings = has("many") || has("fillA") ? 8 : 0;
  const ringSats: V3[][] = Array.from({ length: nRings }, (_, r) => {
    const show = r < 2 ? Math.max(fills[0]!, fills[3]!) : r < 4 ? Math.max(fills[1]!, fills[3]!) : r < 6 ? Math.max(fills[2]!, fills[3]!) : fills[3]!;
    if (show <= 0.02) return [];
    const tilt = (r - 3.5) * 0.32, node = r * 0.8;
    return Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.012 * f + r * 0.3;
      const x = RL * Math.cos(a), y0 = RL * Math.sin(a);
      // tilt the ring about the x axis, then turn it about y by its node
      const yy = y0 * Math.cos(tilt), zz = y0 * Math.sin(tilt);
      return [x * Math.cos(node) + zz * Math.sin(node), yy, -x * Math.sin(node) + zz * Math.cos(node)] as V3;
    });
  });
  const anchors: Record<string, Anchor> = {
    earth: { look: [0, 0, 0], dir: [0.3, 0.35, 1], d: 9.5 },
    geo: { look: [0, 0, 0], dir: [0.15, 0.7, 1], d: 30 },
    mid: { look: lerpV(pin, sph(RG, 0, -1.45 + W * b.end * 0.5), 0.5), dir: [0.6, 0.5, 1], d: 16 },
    leo: { look: sph(RL, 0.3, -1.6), dir: [0.2, 0.5, 1], d: 7 },
    leoSat: { look: sph(RL, 0.35, -2.0), dir: [-0.3, 0.45, 1], d: 5 },
    pin: { look: sph(R, PIN_LAT, -1.45 + W * b.end * 0.5), dir: [0.35, 0.6, 1], d: 6 },
  };
  const pos = (on: string): V3 => on === "leo" ? leoPos : on === "geo" ? geoPos : on === "pin" ? pin : on === "mid" ? lerpV(pin, geoPos, 0.5) : anchors[on]?.look ?? [0, 0, 0];
  const signalTo = toLeo && !has("pulseUp") ? leoTarget : geoTarget;
  const ticks = has("count") && f > at("count") ? Math.min(8, Math.floor((f - at("count")) / 12) + 1) : 0;
  const cone = Math.max(k("cone", 14), k("overhead", 14));
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 0, 0], r0: 26, r1: 110, size: 2.86 }} seed="globe" backdrop={BACK} floor={false} bloom={1.15} fov={40}>
      <Stars f={f} n={160} r={120} bright={0.55} seed="space" />
      <directionalLight position={[-20, 8, 14]} intensity={1.3} />
      <Earth R={R} spin={spin} lights={0.7 - 0.4 * k("dark", 20)} />
      {/* the far ring and its satellite */}
      <Orbit r={RG} o={0.55 * geoOn * (1 - drop)} tube={0.06} />
      {(has("geoSat") || has("geoRing") || has("dropSat")) && (
        <group position={geoPos} scale={1.4 - 0.8 * drop} rotation-y={lonPin}>
          <BoxSat lit={0.4 + 0.6 * (has("geoSat") ? Math.max(0, 1 - Math.abs(f - at("geoSat")) / 10) : 0)} />
        </group>
      )}
      {has("lockline") && <Beam a={pin} b={geoPos} r={0.05} o={0.7 * k("lockline", 16)} color={TECH.amber} />}
      {/* the low shell */}
      {leoOn > 0 && <mesh material={glow(TECH.cyan, q(0.05 * leoOn))}><sphereGeometry args={[RL, 48, 32]} /></mesh>}
      <Orbit r={RL} o={0.45 * leoOn} tilt={0.35} tube={0.012} />
      {leoSatShown && (
        <group position={leoPos} scale={0.32} rotation={[0, lonLeo + Math.PI / 2, 0.35]}>
          <FlatSat arrays={0.6} />
          <mesh material={glow(TECH.white, 0.9)}><sphereGeometry args={[0.35, 10, 8]} /></mesh>
        </group>
      )}
      {has("speed") && k("speed") > 0 && <Cone a={sph(RL, 0.35, lonLeo - 0.25)} b={leoPos} r={0.12} o={0.35 * k("speed")} color={TECH.white} />}
      {has("trail") && Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} position={sph(RL, 0.35, lonLeo - (i + 1) * 0.06)} material={glow(TECH.cyan, q(k("trail") * (1 - i / 24)))}><sphereGeometry args={[0.03, 6, 4]} /></mesh>
      ))}
      {has("footprint") && (
        <group position={sph(R * 1.004, 0.35, lonLeo)} rotation={[Math.PI / 2 - 0.35, 0, lonLeo + Math.PI / 2, "YXZ"]}>
          <mesh material={glow(TECH.cyan, q(0.45 * k("footprint")))}><circleGeometry args={[0.55, 32]} /></mesh>
        </group>
      )}
      {/* your house's dot, and the sky over it */}
      {(has("pin") || has("pinSlide") || has("cone") || has("overhead") || has("click")) && (
        <mesh position={pin} material={glow(TECH.amber, q(0.4 + 0.6 * Math.max(k("pin"), k("pinSlide"))))}><sphereGeometry args={[0.06, 10, 8]} /></mesh>
      )}
      {cone > 0 && <Cone a={pin} b={sph(R + 1.4, PIN_LAT, lonPin)} r={0.9} o={0.22 * cone} color={TECH.amber} />}
      {/* signals */}
      {(has("thread") || has("pulses")) && <Beam a={pin} b={signalTo} r={0.025} o={0.5 * Math.max(k("thread"), 0.5 * k("pulses"))} color={TECH.cyan} />}
      {up >= 0 && up < 1 && <mesh position={lerpV(pin, geoTarget, up)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.22, 10, 8]} /></mesh>}
      {dn >= 0 && dn < 1 && <mesh position={lerpV(geoTarget, pin, dn)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.22, 10, 8]} /></mesh>}
      {leoTrip >= 0 && (() => {
        const u = leoTrip % 2;
        return <mesh position={lerpV(pin, leoTarget, u < 1 ? u : 2 - u)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.08, 10, 8]} /></mesh>;
      })()}
      {train >= 0 && [0, 0.33, 0.66].map((o, i) => {
        const u = (train + o) % 2;
        return <mesh key={i} position={lerpV(pin, signalTo, u < 1 ? u : 2 - u)} material={glow(TECH.white, 0.95)}><sphereGeometry args={[toLeo ? 0.07 : 0.2, 10, 8]} /></mesh>;
      })}
      {Array.from({ length: ticks }, (_, i) => (
        <mesh key={i} position={lerpV(pin, [0, 0, 0], -0.08 - i * 0.03)} material={glow(TECH.amber, 0.9)}><boxGeometry args={[0.04, 0.04, 0.04]} /></mesh>
      ))}
      {/* the height brackets */}
      {has("bracket") && (
        <group>
          <Beam a={sph(R, 0, lonPin + 0.35)} b={sph(RG, 0, lonPin + 0.35)} r={0.07} o={0.8 * k("bracket", 24) * geoOn} color={TECH.amber} />
          <Beam a={sph(R, 0.35, lonLeo + 0.2)} b={sph(RL + 0.02, 0.35, lonLeo + 0.2)} r={0.05} o={0.9 * k("bracket", 24) * leoOn} color={TECH.lime} />
        </group>
      )}
      {/* the moving web */}
      {ringSats.map((ring, r) => ring.map((s, i) => (
        <group key={`${r}-${i}`}>
          <mesh position={s} material={glow(TECH.white, 0.9)}><sphereGeometry args={[0.045, 6, 4]} /></mesh>
          {has("links") && i > 0 && <Beam a={ring[i - 1]!} b={s} r={0.008} o={0.35 * k("links", 20)} color={TECH.cyan} />}
        </group>
      )))}
      {has("question") && Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={sph(R * 1.01, (rnd("q", i) - 0.5) * 2, lonPin + rnd("q", i + 40) * 3 - 1.5)} material={glow(TECH.pink, q(0.4 * k("question") * (0.5 + 0.5 * Math.sin(f * 0.2 + i))))}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
      ))}
      {has("pinSlide") && <PulseRing f={f} start={at("pinSlide")} at={pin} r={0.3} flat={false} />}
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Globe;
