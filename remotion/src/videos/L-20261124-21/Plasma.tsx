// Plasma: inside the EUV light source. Tin drops fall from a nozzle through a target spot; a laser window
// on the left fires a weak pre-pulse (the drop squashes into a pancake) and the main pulse (the pancake
// becomes a violet plasma ball); a big curved collector mirror behind gathers the light to a focus point;
// a screen on the wall counts the drops. Beside it, a ruler for the wavelength and two drawn lines.
// Actions (params.moments[].do): drops, freeze, pre, flatten, pancake, compare, target, catch, laserwin,
// charge, main, flash, glow, hot, ions, rays, invisible, waves, wave, longwave, stretch, shortpulse, lines,
// pencil, marker, collector, cone, converge, focus, exit, repeat, counter.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { Beam, Bowl, Cone, DEEP, DotGrid, EUV, LAB, Lines, PlasmaBall, PulseRing, q, Ripples, Screen, Shot, TinDrop, useBeat, Wave, Words, type Anchor } from "./kit";

const DROP: V3 = [0, 1.7, 0];
const NOZ: V3 = [0, 4.6, 0];
const MIR: V3 = [0, 1.7, -3.6];
const FOC: V3 = [0, 1.7, 5.2];
const WIN: V3 = [-4.6, 1.7, 0];
const WALL: V3 = [3.6, 3.1, -2.4];
const RUL: V3 = [6.2, 1.9, 1.2];
const LIN: V3 = [6.2, 0.8, 1.2];
const RED = "#ff5a3c";

const Plasma: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const pulseAt = (name: string, w = 6, lag = 0) => (has(name) ? Math.max(0, 1 - Math.abs(f - at(name) - lag) / w) : 0);
  // the hero drop: slows into the spot, squashes on the pre-pulse, gone into plasma on the main pulse
  const mainF = at("main");
  const afterMain = f >= mainF;
  const hero = has("freeze") || has("pre") || has("flatten") || has("pancake");
  const heroY = DROP[1] + (has("freeze") ? 1.1 * (1 - k("freeze", 20)) : 0);
  const flat = Math.max(0.6 * k("flatten", 10), 0.6 * k("pre", 8), k("pancake", 14));
  const plasma = Math.max(k("glow", 10), afterMain ? Math.min(1, (f - mainF) / 6) : 0);
  const white = Math.max(pulseAt("flash"), afterMain ? Math.max(0, 1 - (f - mainF) / 8) : 0);
  // the steady rhythm: a flash at the spot every 12 frames once "repeat" (or the hook's "drops") runs
  const rhythmFrom = Math.min(at("repeat"), has("main") && !has("pre") && !has("freeze") ? at("main") : Infinity);
  const cyc = f >= rhythmFrom ? ((f - rhythmFrom) % 12) / 12 : -1;
  const tick = cyc >= 0 ? Math.max(0, 1 - cyc * 3) : 0;
  // the falling stream (always), denser on "drops"
  const n = 9;
  const stream = Array.from({ length: n }, (_, i) => {
    const t = ((f * 0.055 + i / n) % 1);
    return [0, NOZ[1] - 0.3 - t * 6.2, 0] as V3;
  }).filter((s) => !(hero && Math.abs(s[1] - DROP[1]) < 0.5) && (afterMain || !(plasma > 0.3 && Math.abs(s[1] - DROP[1]) < 0.35)));
  const preO = pulseAt("pre", 5, 2);
  const mainO = has("main") ? Math.max(0, 1 - Math.abs(f - mainF - 1) / 5) : 0;
  const win = Math.max(k("laserwin", 10), k("charge", 10), preO, mainO);
  const coll = Math.max(k("collector", 12), 0.35 * plasma, 0.3 * tick);
  const cone = Math.max(k("cone", 14), 0.5 * k("converge", 14));
  const narrow = k("converge", 20);
  const anchors: Record<string, Anchor> = {
    drop: { look: DROP, dir: [1, 0.22, 0.85], d: 4.2 },
    nozzle: { look: [0, 3.9, 0], dir: [1, 0.05, 0.8], d: 3.2 },
    mirror: { look: [0, 1.7, -1.6], dir: [0.95, 0.3, 1], d: 6.4 },
    focus: { look: [0, 1.7, 4.4], dir: [1, 0.3, -0.25], d: 4.2 },
    wall: { look: WALL, dir: [-0.35, 0.05, 1], d: 4.2 },
    wave: { look: RUL, dir: [-0.15, 0.12, 1], d: 5.4 },
    lines: { look: LIN, dir: [-0.1, 0.35, 1], d: 4 },
    all: { look: [0.8, 2, 0], dir: [1, 0.35, 0.95], d: 9 },
  };
  const pos = (on: string): V3 => on === "drop" ? [DROP[0], DROP[1] + 0.25, DROP[2]] : on === "nozzle" ? [NOZ[0], NOZ[1] - 0.4, NOZ[2]] : on === "mirror" ? [0, 3.3, -2.2] : on === "wall" ? [WALL[0], WALL[1] + 1, WALL[2]] : on === "wave" ? [RUL[0] - 2.4, RUL[1] + 0.9, RUL[2]] : on === "lines" ? [LIN[0] - 2.2, LIN[1] + 0.3, LIN[2]] : anchors[on]?.look ?? DROP;
  const longLam = 1.0 + 1.2 * k("stretch", 20);
  const shortLam = 0.22 - 0.06 * k("shortpulse", 14);
  return (
    <Shot p={p} b={b} anchors={anchors} seed="plasma" backdrop={LAB} floor={false} bloom={1.35} dust={{ c: [0, 2, 0], r0: 6, r1: 16, size: 0.7, color: "#b9a2ff" }} fog={{ color: "#0b0814", near: 14, far: 40 }}>
      {/* the chamber: a ribbed steel drum round the spot, a floor, a back wall with bolts */}
      <mesh position={[0, 2.4, 0]} material={mat("brushed", "#2a2d38", { side: 1, roughness: 0.55 })}><cylinderGeometry args={[9.5, 9.5, 12, 48, 1, true]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.4, 0]} material={mat("brushed", "#1c1e26", { roughness: 0.6 })}><circleGeometry args={[9.5, 48]} /></mesh>
      <Lines from={-1.2} to={7.8} step={1.2} along="y" span={[-9, 9]} z={-6.6} color="#3a3e4c" r={0.03} />
      <DotGrid x0={-8} x1={8} y0={-1} y1={7.5} z={-6.55} gap={0.36} size={0.14} color="#a9aed2" />
      {/* the nozzle */}
      <mesh position={[NOZ[0], NOZ[1] + 0.8, NOZ[2]]} material={mat("brushed", "#9aa0ad")}><cylinderGeometry args={[0.22, 0.22, 1.6, 16]} /></mesh>
      <mesh position={NOZ} rotation-x={Math.PI} material={mat("brushed", "#b5bac6")}><coneGeometry args={[0.22, 0.5, 16]} /></mesh>
      {/* the catch tube under the spot */}
      <mesh position={[0, -1.0, 0]} material={mat("brushed", "#6d7280")}><cylinderGeometry args={[0.35, 0.45, 0.8, 16]} /></mesh>
      {/* the stream of drops */}
      {stream.map((s, i) => <TinDrop key={i} position={s} r={0.07} />)}
      {/* the hero drop */}
      {hero && !(afterMain && f > mainF + 2) && <TinDrop position={[DROP[0], heroY, DROP[2]]} r={0.13} flat={flat} lit={0.25 * preO} rotation-z={Math.PI / 2} />}
      {has("compare") && <TinDrop position={[DROP[0] + 0.9, DROP[1] - 0.2, DROP[2] + 0.3]} r={0.13 * q(k("compare", 10))} />}
      {has("target") && <PulseRing f={f} start={at("target")} at={DROP} r={0.6} flat={false} color={TECH.amber} />}
      {/* the laser window and its pulses */}
      <Block size={[0.3, 1.4, 1.4]} radius={0.06} preset="blackPlastic" position={[WIN[0] - 0.2, WIN[1], WIN[2]]} />
      <mesh position={WIN} rotation-y={Math.PI / 2} material={glow(RED, q(0.25 + 0.75 * win))}><circleGeometry args={[0.5, 24]} /></mesh>
      {has("charge") && <mesh position={[WIN[0] + 0.3, WIN[1], WIN[2]]} material={glow("#ffb08a", q(0.8 * k("charge", 16)))}><sphereGeometry args={[0.12 + 0.3 * k("charge", 16), 12, 8]} /></mesh>}
      {preO > 0.02 && <Beam a={[WIN[0] + 0.2, WIN[1], WIN[2]]} b={DROP} r={0.03} color={RED} o={preO} />}
      {mainO > 0.02 && <Beam a={[WIN[0] + 0.2, WIN[1], WIN[2]]} b={DROP} r={0.16} color="#ff7a3c" o={mainO} />}
      {has("catch") && k("catch", 12) < 1 && (
        <mesh position={[WIN[0] + 0.3 + (DROP[0] - WIN[0] - 0.4) * k("catch", 12), DROP[1], DROP[2]]} rotation-y={Math.PI / 2} material={glow(RED, 0.35)}><planeGeometry args={[1.2, 1.2]} /></mesh>
      )}
      {/* the plasma, the white flash, the rhythm of flashes */}
      <PlasmaBall position={DROP} k={Math.max(plasma, 0.8 * tick)} f={f} />
      {white > 0.02 && <mesh position={DROP} material={glow("#ffffff", q(0.6 * white))}><sphereGeometry args={[0.35 + 0.6 * white, 16, 12]} /></mesh>}
      {white > 0.02 && <pointLight position={DROP} intensity={40 * white} distance={20} color="#e8dcff" />}
      {has("hot") && <Ripples f={f} start={at("hot")} position={DROP} n={3} reach={2.2} period={20} color={TECH.amber} upright />}
      {has("ions") && f >= at("ions") && Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2, t = Math.min(1, (f - at("ions")) / 24) + (i % 3) * 0.05;
        return <mesh key={i} position={[DROP[0] + Math.cos(a) * 1.6 * t, DROP[1] + Math.sin(a) * 1.6 * t, DROP[2] + Math.sin(a * 2) * 0.4]} material={glow(i % 2 ? "#ffffff" : TECH.cyan, q(1 - t))}><sphereGeometry args={[0.035, 6, 4]} /></mesh>;
      })}
      {has("rays") && Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const o = k("rays", 12) * (1 - 0.7 * k("invisible", 14));
        return <Beam key={i} a={DROP} b={[DROP[0] + Math.cos(a) * 3.2, DROP[1] + Math.sin(a) * 3.2, DROP[2] + 0.6]} r={0.02} color={EUV} o={0.7 * o} />;
      })}
      {has("waves") && <Ripples f={f} start={at("waves")} position={DROP} n={4} reach={2.6} period={14} color={EUV} upright />}
      {/* the collector mirror and its light */}
      <Bowl position={MIR} R={1.9} open={0.7} lit={coll} />
      {[0.6, 1.0, 1.4].map((r, i) => <mesh key={i} position={[MIR[0], MIR[1], MIR[2] + 0.75 - 0.12 * i]} material={glow(EUV, q(0.25 + 0.5 * coll))}><torusGeometry args={[r, 0.015, 6, 48]} /></mesh>)}
      {cone > 0.02 && <Cone a={[FOC[0], FOC[1], FOC[2] - (1 - narrow) * 3]} b={[MIR[0], MIR[1], MIR[2] + 0.6]} r={1.55} color={EUV} o={0.22 * cone} />}
      {has("focus") && <mesh position={FOC} material={glow("#ffffff", q(0.4 + 0.6 * k("focus", 10)))}><sphereGeometry args={[0.12 + 0.12 * k("focus", 10), 12, 8]} /></mesh>}
      {has("focus") && <PulseRing f={f} start={at("focus")} at={FOC} r={0.5} flat={false} color={EUV} />}
      {has("exit") && <Beam a={FOC} b={[FOC[0], FOC[1], FOC[2] + 4 * k("exit", 16)]} r={0.08} color={EUV} o={0.8} />}
      {/* the exit port in the drum */}
      <mesh position={[FOC[0], FOC[1], FOC[2] + 0.5]} rotation-x={Math.PI / 2} material={mat("brushed", "#5b606d")}><torusGeometry args={[0.45, 0.1, 8, 24]} /></mesh>
      {/* the wall screen: the drop counter */}
      <group position={WALL} rotation-y={-0.35}>
        <Screen b={b} fig={b.fig.rate} start={at("counter")} again={has("repeat") || has("drops") ? 30 : 0} w={2.4} h={1.1} on={has("counter")} />
      </group>
      {/* the ruler beside the chamber: one wave measured, a visible one above, two drawn lines under */}
      {(has("wave") || has("longwave") || has("lines")) && (
        <group>
          <Block size={[5.6, 0.12, 0.2]} radius={0.03} preset="aluminium" position={[RUL[0], RUL[1] - 0.45, RUL[2]]} />
          {Array.from({ length: 23 }, (_, i) => <mesh key={i} position={[RUL[0] - 2.75 + i * 0.25, RUL[1] - 0.36, RUL[2] + 0.11]} material={mat("clay", "#20232c")}><boxGeometry args={[0.02, i % 4 ? 0.06 : 0.12, 0.01]} /></mesh>)}
          <Wave position={[0, RUL[1], RUL[2] + 0.05]} x0={RUL[0] - 2.7} x1={RUL[0] + 2.7} lambda={shortLam} amp={0.14} k={k("wave", 18)} color={EUV} phase={f * 0.2} r={0.022} />
          {has("longwave") && <Wave position={[0, RUL[1] + 1.0, RUL[2] + 0.05]} x0={RUL[0] - 2.7} x1={RUL[0] + 2.7} lambda={longLam} amp={0.3} k={k("longwave", 18)} color="#ff8a4a" phase={f * 0.08} r={0.03} />}
          {b.fig.wl && has("wave") && <Words b={{ ...b, prm: { labels: [{ at: "_", text: "", on: "wave", fig: "wl" }] }, fr: () => at("wave") + 8 }} pos={() => [RUL[0] + 2.2, RUL[1] - 1.2, RUL[2]]} />}
        </group>
      )}
      {has("lines") && (
        <group position={[0, LIN[1], LIN[2] + 0.1]}>
          <Block size={[5.8, 1.1, 0.04]} radius={0.02} material={mat("white", "#e8e6df", { roughness: 0.9 })} position={[LIN[0], 0, -0.05]} />
          <mesh position={[LIN[0] - 2.4 + 2.4 * k("lines", 18), 0.22, 0]} material={mat("clay", "#ff8a4a")}><boxGeometry args={[4.8 * k("lines", 18) + 0.01, 0.22, 0.02]} /></mesh>
          <mesh position={[LIN[0] - 2.4 + 2.4 * k("lines", 18), -0.24, 0]} material={mat("clay", DEEP)}><boxGeometry args={[4.8 * k("lines", 18) + 0.01, 0.045, 0.02]} /></mesh>
          {has("pencil") && <group position={[LIN[0] - 2.4 + 4.8 * k("pencil", 20), -0.24 + 0.55, 0.15]} rotation-z={-0.5}>
            <mesh material={mat("clay", "#f2c45a")}><cylinderGeometry args={[0.07, 0.07, 1, 6]} /></mesh>
            <mesh position={[0, -0.6, 0]} rotation-x={Math.PI} material={mat("clay", "#e8d3b0")}><coneGeometry args={[0.07, 0.2, 6]} /></mesh>
          </group>}
          {has("marker") && <group position={[LIN[0] - 2.4 + 4.8 * k("marker", 20), 0.22 + 0.65, 0.15]} rotation-z={-0.4}>
            <mesh material={mat("clay", "#2b2f3a")}><cylinderGeometry args={[0.16, 0.16, 1.1, 12]} /></mesh>
            <mesh position={[0, -0.62, 0]} material={mat("clay", "#ff8a4a")}><cylinderGeometry args={[0.12, 0.16, 0.16, 12]} /></mesh>
          </group>}
        </group>
      )}
      <Words b={b} pos={pos} signAt={() => [WALL[0] - 3.2, WALL[1] + 1.4, WALL[2] + 0.4]} signH={0.42} />
    </Shot>
  );
};
export default Plasma;
