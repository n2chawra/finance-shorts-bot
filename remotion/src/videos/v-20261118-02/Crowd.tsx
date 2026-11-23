// Crowd (3D): the chip's surface, lit. One big glowing block cracks apart on "isn't", its pieces
// scatter across the surface on "brain", thousands of small cores light up in a grid on "small" with
// the count written on the chip's far edge, and a wave of light runs across every core on "working".
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import {
  Block, Camera3D, cue, dieTexture, direct, FigLabel3D, Focus, glow, InstancedField, mat, rnd, Stage3D, TECH, Top, type V3,
} from "../../three/index";
import { kitClock } from "./Hook";

type Params = { fig?: { cores?: string } };

const SLAB = 4.6;
const TOP = 0.1;
const FIELD = { cols: 44, rows: 44, spacing: 0.09 } as const;
const N = 4;                // the block is N×N pieces
const PIECE = 0.4;
const HEIGHT = 0.32;

const Crowd: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const cores = (p.beat.params as Params).fig?.cores ?? "";
  const ev = { isnt: m.at("isnt", 10), brain: m.at("brain", 24), small: m.at("small", 52), its: m.at("its", 40), ones: m.at("ones", 58), counting: m.at("counting", 50), counting2: m.at("counting2", 56), working: m.at("working", 66) };
  const end = Math.max(m.end, ev.working + 24);

  const crack = cue(t, ev.isnt, 7, Easing.out(Easing.back(2.2)));
  const scatter = cue(t, ev.brain, 20, Easing.out(Easing.cubic));
  const gone = cue(t, ev.small, 12);
  const breathe = 1 + Math.sin(t / 9) * 0.02 * (1 - crack);
  const core = 1 - cue(t, ev.brain, 10);

  const keys = direct(ev, [
    { at: 0, move: "push", look: [0, 0.25, 0], dir: [0.25, 0.95, 1], from: 3.6, to: 3.1, dur: Math.max(8, ev.isnt), fov: 38 },
    { at: "isnt", move: "pullback", look: [0, 0.22, 0], dir: [0.25, 0.95, 1], to: 3.7, dur: 12 },
    { at: "brain", move: "pullback", look: [0, 0.18, -0.1], dir: [0.25, 0.95, 1], to: 4.6, dur: Math.max(10, ev.small - ev.brain) },
    { at: "small", move: "pullback", look: [0, 0.1, -0.35], dir: [0.25, 0.95, 1], to: 6.2, dur: 22 },
    { at: ev.small + 22, move: "push", look: [0, 0.1, -0.35], dir: [0.25, 0.95, 1], to: 5.5, dur: Math.max(10, end - ev.small - 22) },
  ]);

  // the wave: a second field mounted on "working" whose clock puts the wave's band at the first core
  // then (fully revealed already); it crosses the grid in about a second, again and again
  const R = 30;
  const waveSpeed = ((FIELD.cols + FIELD.rows + 10) * p.fps) / R;
  const waving = t >= ev.working;
  const sweep = waving ? cue(t, ev.working, 26, Easing.inOut(Easing.quad)) : 0;
  const half = (FIELD.cols * FIELD.spacing) / 2;

  return (
    <Stage3D backdrop="void" floor="reflect" bloom={1} dof={2.5} blur={1} shadowBox={4}>
      <Camera3D keys={keys} frame={t} />
      <Focus at={t < ev.small ? [0, 0.2, 0] : [0, 0.1, -0.3]} range={t < ev.small ? 1.4 : 3} />

      {/* the chip's surface: a silicon slab, its floorplan faint, glowing edges */}
      <Block size={[SLAB, TOP, SLAB]} radius={0.03} preset="silicon" position={[0, TOP / 2, 0]} />
      <Top w={SLAB * 0.98} d={SLAB * 0.98} y={TOP + 0.001} map={dieTexture("v0218-crowd", [6, 6])} emissive="#ffffff" emissiveIntensity={0.12} metal={0.5} />
      {([[0, SLAB / 2], [0, -SLAB / 2], [SLAB / 2, 0], [-SLAB / 2, 0]] as const).map(([x, z], i) => (
        <mesh key={i} position={[x, TOP, z]} material={glow(TECH.cyan)}>
          <boxGeometry args={[x === 0 ? SLAB : 0.02, 0.02, z === 0 ? SLAB : 0.02]} />
        </mesh>
      ))}

      {/* the one big block: cracks, then its pieces scatter and fade into the surface */}
      {gone < 1 && (
        <group position={[0, TOP, 0]}>
          {core > 0 && (
            <mesh position={[0, HEIGHT / 2, 0]} scale={[core, core, core]} material={glow("#fff1d6")}>
              <boxGeometry args={[N * PIECE * 0.9, HEIGHT * 0.86, N * PIECE * 0.9]} />
            </mesh>
          )}
          {Array.from({ length: N * N }, (_, i) => {
            const ix = i % N, iz = Math.floor(i / N);
            const hx = (ix - (N - 1) / 2) * PIECE, hz = (iz - (N - 1) / 2) * PIECE;
            const gap = 1 + crack * 0.16;
            const ang = rnd("v0218-crowd-a", i) * Math.PI * 2;
            const dist = 1.0 + rnd("v0218-crowd-d", i) * 1.0;
            const tx = hx + Math.cos(ang) * dist, tz = hz + Math.sin(ang) * dist;
            const x = hx * gap + (tx - hx * gap) * scatter;
            const z = hz * gap + (tz - hz * gap) * scatter;
            const y = HEIGHT / 2 + Math.sin(scatter * Math.PI) * 0.6 + crack * (rnd("v0218-crowd-y", i) - 0.5) * 0.04;
            const s = (1 - 0.55 * scatter) * (1 - gone) * breathe;
            const spin = scatter * (rnd("v0218-crowd-s", i) - 0.5) * 5 + crack * (rnd("v0218-crowd-r", i) - 0.5) * 0.12;
            return (
              <group key={i} position={[x, y, z]} rotation={[spin * 0.6, spin, spin * 0.3]} scale={s || 1e-4}>
                <Block size={[PIECE * 0.98, HEIGHT, PIECE * 0.98]} radius={0.03} material={mat("white", "#7b55ff", { emissive: "#8b5cff", emissiveIntensity: 1.4, roughness: 0.3 })} />
              </group>
            );
          })}
          <pointLight position={[0, 0.8, 0]} intensity={(3 + 4 * crack) * (1 - scatter * 0.7) * (1 - gone)} distance={4} color="#a78bff" />
        </group>
      )}

      {/* thousands of small cores light up, then a wave runs across them all */}
      {t >= ev.small - 1 && !waving && (
        <InstancedField {...FIELD} shape="cell" position={[0, TOP, 0]} start={K(ev.its)} reveal={22} wave={0} color="#3b4470" seed="v0218-cores" />
      )}
      {waving && (
        <InstancedField {...FIELD} shape="cell" position={[0, TOP, 0]} start={K(ev.working) - R} reveal={20} wave={waveSpeed} waveColor={TECH.cyan} color="#3b4470" seed="v0218-cores" />
      )}
      {waving && sweep < 1 && (
        <mesh position={[-half + sweep * half * 2, TOP + 0.08, 0]} material={glow(TECH.cyan, 0.5)}>
          <boxGeometry args={[0.05, 0.02, FIELD.rows * FIELD.spacing]} />
        </mesh>
      )}
      {t >= ev.small && <pointLight position={[0, 1.2, 0]} intensity={2 + 3 * sweep * (1 - sweep) * 4} distance={6} color={TECH.cyan} />}

      {/* the count, written on the chip's far edge */}
      {cores && (
        <FigLabel3D fig={cores} caption="small cores, one chip" at={[0, TOP + 0.15, -SLAB / 2 + 0.1] as V3} start={K(ev.its + 4)} count={Math.max(22, ev.small - ev.its)} px={Math.round(120 * (1 + 0.14 * m.pulse(ev.ones, 10) + 0.1 * m.pulse(ev.counting, 8) + 0.1 * m.pulse(ev.counting2, 8)))} />
      )}
    </Stage3D>
  );
};

export default Crowd;
