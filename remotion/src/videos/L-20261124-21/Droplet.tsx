// Droplet: the droplet generator. A heated reservoir of tin on the left feeds a steel nozzle; drops leave
// it in a line toward the target spot on the right; a counter screen is bolted to the chamber wall; a
// vacuum pump draws out the air. Actions (params.moments[].do): pot, solid, heat, melt, flow, stream,
// streamon, squeeze, size, hair, speed, speedtag, endless, counter, spot, flash, flashnext, flashes, air,
// pump, beam, absorb, clear, dull, question, window, hint, car.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { Ask, Beam, DotGrid, EUV, LAB, Lines, PulseRing, q, r01, Screen, Shot, TinDrop, useBeat, Words, type Anchor } from "./kit";

const POT: V3 = [-5.2, 2.2, 0];
const NOZ: V3 = [-3.2, 2.2, 0];
const SPOT: V3 = [3.2, 2.2, 0];
const WALL: V3 = [0.2, 4.4, -2.2];
const PUMP: V3 = [5.6, 0.9, -1.6];
const RED = "#ff5a3c";

const Droplet: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const flashAt = (name: string, w = 6) => (has(name) ? Math.max(0, 1 - Math.abs(f - at(name) - 3) / w) : 0);
  const heat = Math.max(k("heat", 20), k("melt", 10), has("flow") || has("stream") || has("streamon") ? 1 : 0);
  const melt = Math.max(k("melt", 24), has("flow") || has("stream") || has("streamon") || has("speed") ? 1 : 0);
  const flowing = Math.max(k("flow", 16), k("stream", 6), k("streamon", 6), has("speed") || has("spot") || has("dull") ? 1 : 0);
  const dense = 1 + k("endless", 14);
  const speedy = k("speed", 14);
  // the drops: evenly spaced along the line nozzle → spot → past it, moving with time
  const len = SPOT[0] - NOZ[0] + 3;
  const n = Math.round(10 * dense);
  const run = Math.max(k("streamon", 8), k("stream", 8) * 0.25 + 0.75 * k("squeeze", 10), has("speed") || has("spot") || has("dull") || has("count") ? 1 : 0, has("stream") && !has("squeeze") ? 1 : 0);
  const drops = flowing > 0.5 && run > 0.05 ? Array.from({ length: n }, (_, i) => {
    const t = ((f * (0.02 + 0.02 * speedy) + i / n) % 1);
    return { x: NOZ[0] + 0.4 + t * len * Math.min(1, run * 1.2 + 0.1), i, t };
  }).filter((d) => d.x < SPOT[0] + 2.6) : [];
  const bead = 0.06 + 0.05 * Math.abs(Math.sin(f * 0.25)) + 0.06 * (has("squeeze") ? Math.max(0, 1 - Math.abs(f - at("squeeze")) / 8) : 0);
  // flashes at the spot
  const rhythm = has("flashes") && f >= at("flashes") ? Math.max(0, 1 - (((f - at("flashes")) % 9) / 9) * 3) : 0;
  const flash = Math.max(flashAt("flash"), flashAt("flashnext"), rhythm, has("count") && has("flash") ? 0 : 0);
  // the air: specks that stream out on "pump", gone on "clear"
  const pumped = Math.max(k("pump", 40), k("clear", 14));
  const specks = has("air") ? Array.from({ length: 70 }, (_, i) => {
    const x0 = -6 + 12 * r01("air", i * 3), y0 = 0.3 + 4.6 * r01("air", i * 3 + 1), z0 = -1.8 + 3.2 * r01("air", i * 3 + 2);
    const pull = Math.min(1, pumped * (0.6 + 0.6 * r01("airp", i)));
    return { pos: [x0 + (PUMP[0] - x0) * pull + 0.1 * Math.sin(f * 0.05 + i), y0 + (PUMP[1] - y0) * pull, z0 + (PUMP[2] - z0) * pull] as V3, o: 1 - pull };
  }) : [];
  const beamLen = has("absorb") ? 1.2 + 3.6 * k("clear", 16) : 4.8;
  const anchors: Record<string, Anchor> = {
    pot: { look: [POT[0] + 0.6, POT[1], POT[2]], dir: [0.3, 0.3, 1], d: 4.4 },
    nozzle: { look: [NOZ[0] + 0.3, NOZ[1], NOZ[2]], dir: [0.15, 0.12, 1], d: 2.6 },
    stream: { look: [0, 2.2, 0], dir: [0, 0.18, 1], d: 6.5 },
    drop: { look: [NOZ[0] + 1.7, NOZ[1], 0], dir: [0.05, 0.08, 1], d: 1.6 },
    hair: { look: [NOZ[0] + 1.7, NOZ[1], 0], dir: [0.05, 0.08, 1], d: 2.2 },
    screen: { look: WALL, dir: [0, 0.05, 1], d: 5.6 },
    spot: { look: SPOT, dir: [-0.2, 0.15, 1], d: 3 },
    pump: { look: [PUMP[0] - 1, PUMP[1] + 0.6, PUMP[2]], dir: [-0.4, 0.25, 1], d: 5 },
    all: { look: [0, 2.4, 0], dir: [0.1, 0.3, 1], d: 8.5 },
  };
  const pos = (on: string): V3 => on === "pot" ? [POT[0], POT[1] + 1.0, POT[2]] : on === "hair" ? [NOZ[0] + 1.7, NOZ[1] + 0.35, 0.1] : on === "spot" ? [SPOT[0], SPOT[1] + 0.4, SPOT[2]] : on === "pump" ? [PUMP[0], PUMP[1] + 1.1, PUMP[2]] : anchors[on]?.look ?? SPOT;
  const sized = has("size") && f >= at("size") ? Math.min(1, (f - at("size")) / 12) : 0;
  const heroX = NOZ[0] + 1.7;
  return (
    <Shot p={p} b={b} anchors={anchors} seed="droplet" backdrop={LAB} floor={false} bloom={1.25} dust={{ c: [0, 2.4, 0], r0: 6, r1: 16, size: 0.6, color: "#c8b6ff" }} fog={{ color: "#0b0814", near: 12, far: 36 }}>
      {/* the chamber: a back wall of steel panels with bolts, a floor grating */}
      <mesh position={[0, 3, -2.8]} material={mat("brushed", "#252832", { roughness: 0.5 })}><planeGeometry args={[30, 14]} /></mesh>
      <Lines from={-12} to={12} step={2} along="x" span={[-4, 10]} z={-2.75} color="#3b3f4d" r={0.03} />
      <DotGrid x0={-12} x1={12} y0={-3} y1={9} z={-2.74} gap={0.32} size={0.14} color="#a9aed2" />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.2, 0]} material={mat("brushed", "#1a1c23", { roughness: 0.6 })}><planeGeometry args={[30, 12]} /></mesh>
      <Lines from={-12} to={12} step={0.5} along="x" span={[-0.21, -0.19]} z={0} color="#2c2f39" r={0.02} />
      {/* the reservoir: a steel pot on a heater, tin inside */}
      <group position={POT}>
        <mesh position={[0, -1.3, 0]} material={mat("brushed", "#5d626e")}><cylinderGeometry args={[0.25, 0.4, 2.2, 12]} /></mesh>
        <mesh material={mat("brushed", "#a8aebb", { side: 2 })}><cylinderGeometry args={[0.9, 0.8, 1.4, 28, 1, true]} /></mesh>
        <mesh position={[0, -0.7, 0]} material={mat("brushed", "#80868f")}><cylinderGeometry args={[0.8, 0.8, 0.06, 28]} /></mesh>
        {[0, 1, 2].map((i) => <mesh key={i} position={[0, -0.45 + i * 0.4, 0]} rotation-x={Math.PI / 2} material={glow("#ff7a2a", q(0.15 + 0.75 * heat))}><torusGeometry args={[0.93, 0.035, 6, 32]} /></mesh>)}
        {/* the tin: a bar that slumps into a shining pool */}
        {has("solid") && <Block size={[0.9, 0.4 * (1 - 0.8 * melt) + 0.02, 0.4 + 0.9 * melt]} radius={0.05 + 0.1 * melt} material={mat("aluminium", "#cfd5df", { roughness: 0.35 - 0.25 * melt })} position={[0, -0.45 + 0.8 * (1 - k("solid", 16)) + 0.2 * (1 - melt), 0]} />}
        {melt > 0.05 && <mesh position={[0, -0.6 + 0.35 * melt, 0]} material={mat("aluminium", "#e3e8f0", { roughness: 0.05, emissive: "#ff8a3a", emissiveIntensity: 0.15 * heat })}><cylinderGeometry args={[0.78, 0.78, 0.2 + 0.4 * melt, 28]} /></mesh>}
        <pointLight position={[0, 0.2, 1]} intensity={4 * heat} distance={5} color="#ff8a3a" />
      </group>
      {/* the feed pipe and the nozzle */}
      <mesh position={[(POT[0] + NOZ[0]) / 2, POT[1] - 0.4, 0]} rotation-z={Math.PI / 2} material={mat("brushed", "#9aa0ad")}><cylinderGeometry args={[0.12, 0.12, 2, 12]} /></mesh>
      {flowing > 0.05 && <mesh position={[POT[0] + 0.9 + 1.0 * flowing, POT[1] - 0.4, 0]} rotation-z={Math.PI / 2} material={glow("#ffd2a0", q(0.5 * flowing))}><cylinderGeometry args={[0.05, 0.05, 2 * flowing, 8]} /></mesh>}
      <group position={NOZ}>
        <mesh rotation-z={-Math.PI / 2} position={[-0.3, 0, 0]} material={mat("brushed", "#b5bac6")}><cylinderGeometry args={[0.42, 0.42, 0.9, 20]} /></mesh>
        <mesh rotation-z={-Math.PI / 2} position={[0.35, 0, 0]} material={mat("brushed", "#c9ced8")}><coneGeometry args={[0.42, 0.5, 20]} /></mesh>
        {[0, 1, 2, 3].map((i) => <mesh key={i} position={[-0.3, 0.42 * Math.cos(i * 1.57), 0.42 * Math.sin(i * 1.57)]} material={mat("brushed", "#6d7280")}><sphereGeometry args={[0.05, 8, 6]} /></mesh>)}
        {flowing > 0.3 && <TinDrop position={[0.66, 0, 0]} r={bead} />}
      </group>
      {/* the stream */}
      {drops.map((d) => <TinDrop key={d.i} position={[d.x, NOZ[1], 0]} r={0.08} lit={has("flashes") || has("flash") ? (Math.abs(d.x - SPOT[0]) < 0.2 ? 0.8 : 0) : 0} />)}
      {speedy > 0.02 && drops.map((d) => <Beam key={`s${d.i}`} a={[d.x - 0.7 * speedy, NOZ[1], 0]} b={[d.x - 0.1, NOZ[1], 0]} r={0.018} color="#dfe6ff" o={0.45 * speedy} />)}
      {has("speedtag") && b.fig.speed && <FigLabel3D fig={b.fig.speed} at={[1 + 1.2 * ((f - at("speedtag")) / 60 % 1), NOZ[1] + 0.9, 0]} start={at("speedtag")} count={16} px={84} />}
      {/* one drop held still for its size: the ring, the scale bar, the hair */}
      {(has("size") || has("hair")) && (
        <group>
          <TinDrop position={[heroX, NOZ[1], 0.2]} r={0.11} />
          {sized > 0 && <mesh position={[heroX, NOZ[1], 0.2]} material={glow(TECH.cyan, q(0.9 * sized))}><torusGeometry args={[0.18, 0.008, 6, 40]} /></mesh>}
          {sized > 0 && <Beam a={[heroX - 0.11, NOZ[1] - 0.24, 0.2]} b={[heroX - 0.11 + 0.22 * sized, NOZ[1] - 0.24, 0.2]} r={0.008} color={TECH.cyan} />}
          {sized > 0.5 && b.fig.size && <FigLabel3D fig={b.fig.size} at={[heroX + 0.55, NOZ[1] - 0.25, 0.2]} start={at("size") + 6} count={14} px={80} />}
          {has("hair") && <mesh position={[heroX + 0.75 - 0.75 * k("hair", 14), NOZ[1] + 0.1, 0.05]} rotation-z={0.3} material={mat("clay", "#5a3b26", { roughness: 0.6 })}><cylinderGeometry args={[0.24, 0.24, 2.4, 16]} /></mesh>}
        </group>
      )}
      {/* the target spot, its flashes */}
      {(has("spot") || has("flash") || has("flashes") || has("dull") || has("beam")) && <mesh position={SPOT} material={glow(TECH.amber, q(0.25 + 0.35 * k("spot", 10)))}><torusGeometry args={[0.35, 0.02, 6, 40]} /></mesh>}
      {has("spot") && <PulseRing f={f} start={at("spot")} at={SPOT} r={0.5} flat={false} />}
      {flash > 0.02 && <mesh position={SPOT} material={glow(EUV, q(flash))}><sphereGeometry args={[0.15 + 0.4 * flash, 14, 10]} /></mesh>}
      {flash > 0.02 && <pointLight position={SPOT} intensity={14 * flash} distance={8} color={EUV} />}
      {has("dull") && <TinDrop position={[SPOT[0], SPOT[1], 0.2]} r={0.14 * (0.4 + 0.6 * k("dull", 10))} />}
      {/* the chamber window and the red hint of the laser */}
      {(has("window") || has("hint")) && <group position={[SPOT[0] + 2.4, SPOT[1] + 0.6, -2.6]}>
        <Block size={[1.4, 1.4, 0.2]} radius={0.06} preset="blackPlastic" />
        <mesh position={[0, 0, 0.11]} material={glow(RED, q(0.2 + 0.7 * k("window", 12)))}><circleGeometry args={[0.5, 24]} /></mesh>
      </group>}
      {has("hint") && <Beam a={[SPOT[0] + 2.4, SPOT[1] + 0.6, -2.4]} b={[SPOT[0] + 2.4 - 2.4 * k("hint", 18), SPOT[1] + 0.6 - 0.6 * k("hint", 18), -2.4 + 2.4 * k("hint", 18)]} r={0.025} color={RED} o={0.9} />}
      {/* the counter on the wall */}
      <group position={WALL}>
        <Screen b={b} fig={b.fig.rate} start={at("counter")} again={0} w={2.8} h={1.2} on={has("counter")} />
      </group>
      {/* the air and the pump */}
      {specks.map((s, i) => s.o > 0.03 && <mesh key={i} position={s.pos} material={glow("#9fd8ff", q(0.7 * s.o))}><sphereGeometry args={[0.04, 6, 4]} /></mesh>)}
      {(has("pump") || has("air")) && <group position={PUMP}>
        <Block size={[1.4, 1.8, 1.2]} radius={0.12} preset="aluminium" />
        <mesh position={[-0.75, 0.3, 0]} rotation-z={Math.PI / 2} material={mat("brushed", "#6d7280")}><cylinderGeometry args={[0.3, 0.3, 0.3, 16]} /></mesh>
        <mesh position={[0, 0.3, 0.62]} rotation-z={f * 0.4 * k("pump", 10)} material={mat("blackPlastic")}><boxGeometry args={[0.9, 0.12, 0.04]} /></mesh>
        <mesh position={[0.45, 0.75, 0.62]} material={glow(TECH.lime, q(0.3 + 0.7 * k("pump", 8)))}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
      </group>}
      {has("beam") && <Beam a={SPOT} b={[SPOT[0] - beamLen * k("beam", 12), SPOT[1] + 0.2, 0.4]} r={0.04} color={EUV} o={has("absorb") ? 0.4 + 0.6 * k("clear", 16) - 0.3 * k("absorb", 12) : 0.9} />}
      {has("car") && <group position={[-2 + 3.2 * k("car", 40), NOZ[1] - 1.3, 0.6]}>
        {([[-0.9, 0, 1.8, 0], [-0.9, 0, -0.6, 0.55], [-0.6, 0.55, 0.6, 0.55], [0.6, 0.55, 0.9, 0], [0.9, 0, 1.8, 0]] as number[][]).map(([x0, y0, x1, y1], i) => <Beam key={i} a={[x0!, y0!, 0]} b={[x1!, y1!, 0]} r={0.025} color={TECH.cyan} o={0.9} />)}
        {[-0.3, 1.3].map((x, i) => <mesh key={i} position={[x, -0.05, 0]} material={glow(TECH.cyan, 0.85)}><torusGeometry args={[0.2, 0.025, 6, 20]} /></mesh>)}
      </group>}
      <Ask b={b} at={[SPOT[0] - 0.8, SPOT[1] + 0.6, 0.2]} />
      <Words b={b} pos={pos} signAt={() => [POT[0] + 0.4, POT[1] + 2.2, POT[2] + 0.2]} signH={0.45} />
    </Shot>
  );
};
export default Droplet;
