// Hook (3D): a graphics card stood up big on a dark studio stage (STAND/OPEN, shared with Back for the loop), fans already spinning at frame 0; its parts
// lift apart on "NVIDIA", the bare chip rises out and its edges glow on "chip", a bank card slides in
// beside it on "card", the camera pushes onto the chip's surface on "small" and dives to one cell that
// flares amber on "switch".
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import {
  Block, Camera3D, canvasTexture, ChipPackage, cue, direct, Focus, GPUCard, glow, glowTexture, Label3D, rnd, Stage3D, TECH, type V3,
} from "../../three/index";

/** The kit's components run on the video's own frames (useCurrentFrame), a beat's events on the story
 * clock (tempo-scaled, from the beat's start). This maps a story frame of the beat to the kit's frame. */
export function kitClock(p: SceneProps, now: number): (story: number) => number {
  const tempo = p.tl.tempo || 1;
  const base = now - p.frame / tempo;
  return (story: number) => base + story / tempo;
}

/** The opening framing (frame 0 of the Hook = the last frame of Back, the loop): the graphics card stood
 * nearly upright on the reflective floor, its fans facing the camera, leaning back and rolled onto a
 * diagonal, turning slowly about the vertical; the camera on a slow orbit around LOOK. */
export const STAND = { center: [0, 1.95, -0.9] as V3, lean: 0.32, roll: 1.2 } as const;
export const OPEN = { center: [0.12, 1.33, -0.9] as V3, radius: 7.2, height: 1.5, angle: 0.18, fov: 38, rot: 0.32, spin: 0.004 } as const;

const rotX = (v: V3, a: number): V3 => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const rotZ = (v: V3, a: number): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
/** a point in the standing card's own space (GPUCard's) → world, the card turned `yaw` */
export const cardPoint = (yaw: number, l: V3): V3 => {
  const w = rotY(rotX(rotZ(rotX(l, Math.PI / 2), STAND.roll), -STAND.lean), yaw);
  return [STAND.center[0] + w[0], STAND.center[1] + w[1], STAND.center[2] + w[2]];
};
/** the graphics card stood up (STAND), turned `yaw` about the vertical */
export const StandingCard: React.FC<{ yaw: number; open?: number; lit: number; rps: number; shift?: V3 }> = ({ yaw, open = 0, lit, rps, shift = [0, 0, 0] }) => (
  <group position={[STAND.center[0] + shift[0], STAND.center[1] + shift[1], STAND.center[2] + shift[2]]} rotation-y={yaw}>
    {/* the fans' glow on the studio behind the card */}
    <sprite position={[0, 0.1, -0.9]} scale={[4.2, 5.2, 1]} renderOrder={-1}>
      <Soft color={TECH.cyan} opacity={0.1 + 0.14 * lit} />
    </sprite>
    <pointLight position={[0, 0.4, -0.8]} intensity={2 * lit} distance={4} color={TECH.cyan} />
    <group rotation-x={-STAND.lean}>
      <group rotation-z={STAND.roll}>
        <group rotation-x={Math.PI / 2}>
          <GPUCard open={open} lit={lit} rps={rps} accent={TECH.cyan} />
        </group>
      </group>
    </group>
  </group>
);

/** The stage around the card (shared with Back so the loop frame matches): the void studio's glossy
 * floor darker, a rim-lit back wall of panels with glowing seams, haze and a light cone from above,
 * dust drifting up through the light and slow light streaks running along the wall. Everything moves
 * on `phase` (story frames, 0 at the Hook's first frame; Back passes negative values up to it). */
export const STAGE = { backdrop: "void", floor: { reflect: true, grid: true, color: "#020308" }, bloom: 0.9, shadowBox: 4 } as const;

const wallTexture = () => canvasTexture("v0218-wall", 1024, 1024, (g) => {
  const lin = g.createLinearGradient(0, 0, 0, 1024);
  lin.addColorStop(0, "#020309"); lin.addColorStop(0.6, "#050914"); lin.addColorStop(1, "#08101e");
  g.fillStyle = lin; g.fillRect(0, 0, 1024, 1024);
  const rim = g.createRadialGradient(512, 700, 20, 512, 700, 520);
  rim.addColorStop(0, "rgba(70,190,255,0.22)"); rim.addColorStop(0.45, "rgba(110,80,230,0.1)"); rim.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rim; g.fillRect(0, 0, 1024, 1024);
  // panel seams: tall panels, faint
  g.strokeStyle = "rgba(120,170,255,0.22)"; g.lineWidth = 3;
  for (let x = 32; x < 1024; x += 128) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 1024); g.stroke(); }
  for (let y = 120; y < 1024; y += 236) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  // small status lights in some panels
  for (let i = 0; i < 40; i++) {
    const x = 32 + 128 * Math.floor(rnd("v0218-led", i) * 8) + 18, y = 140 + 236 * Math.floor(rnd("v0218-led", i + 99) * 4) + 20 + rnd("v0218-led", i + 7) * 30;
    g.fillStyle = i % 3 ? "rgba(90,220,255,0.75)" : "rgba(190,120,255,0.7)";
    g.fillRect(x, y, 22, 6);
  }
});

// three.js constants, as plain values (beat code imports only the kit)
const ADDITIVE = 2;     // THREE.AdditiveBlending
const DOUBLE = 2;       // THREE.DoubleSide
/** a hex colour × k as an (HDR) rgb triple, so it blooms */
const hdr = (hex: string, k: number): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => Math.pow(c / 255, 2.2) * k;   // sRGB → linear, as three's Color.set does
  return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)];
};
const Glow: React.FC<{ color: string; k: number }> = ({ color, k }) => <meshBasicMaterial color={hdr(color, k)} toneMapped={false} />;
const Soft: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <spriteMaterial map={glowTexture()} color={color} transparent opacity={opacity} blending={ADDITIVE} depthWrite={false} toneMapped={false} />
);
const SEAMS: { x: number; h: number; c: string }[] = [
  { x: -4.6, h: 9, c: TECH.cyan }, { x: -2.3, h: 7, c: "#8f6bff" }, { x: 2.9, h: 8, c: TECH.cyan }, { x: 5.2, h: 6, c: "#8f6bff" },
];
const DUST = 46;
const wrap = (v: number, n: number) => ((v % n) + n) % n;

export const StudioSet: React.FC<{ phase: number }> = ({ phase }) => {
  const wall = wallTexture();
  return (
    <group userData={{ noClip: true, noFade: true }}>
      {/* the glossy floor darkened (its reflections and grid still show through) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0015, 0]} renderOrder={1}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* the back wall, rim-lit behind the card */}
      <mesh position={[0, 6.5, -7]}>
        <planeGeometry args={[26, 13]} />
        <meshBasicMaterial map={wall} toneMapped={false} />
      </mesh>
      {SEAMS.map((s, i) => (
        <mesh key={i} position={[s.x, s.h / 2, -6.95]}>
          <planeGeometry args={[0.05, s.h]} />
          <Glow color={s.c} k={1.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.03, -6.9]}>
        <planeGeometry args={[26, 0.035]} />
        <Glow color={TECH.cyan} k={1.6} />
      </mesh>
      {/* light streaks running along the wall */}
      {[0, 1, 2].map((i) => {
        const x = wrap(rnd("v0218-streak", i) * 18 + phase * (0.05 + 0.02 * i), 18) - 9;
        return (
          <mesh key={i} position={[x, 2.2 + i * 2.1 + rnd("v0218-streak", i + 5), -6.9]}>
            <planeGeometry args={[1.6 + i * 0.5, 0.025]} />
            <Glow color="#bfeaff" k={2.2} />
          </mesh>
        );
      })}
      {/* haze behind the card and a cone of light from above */}
      <sprite position={[-1.6, 3.6, -4.5]} scale={[7, 7, 1]}><Soft color="#3b6cff" opacity={0.025} /></sprite>
      <sprite position={[2.2, 1.4, -4]} scale={[6, 4, 1]}><Soft color="#3b6cff" opacity={0.025} /></sprite>
      <mesh position={[0.1, 5.2, -1.4]}>
        <coneGeometry args={[2.4, 6.4, 40, 1, true]} />
        <meshBasicMaterial color="#7fd8ff" transparent opacity={0.015} blending={ADDITIVE} depthWrite={false} side={DOUBLE} toneMapped={false} />
      </mesh>
      {/* dust drifting up through the light */}
      {Array.from({ length: DUST }, (_, i) => {
        const r = (k: number) => rnd("v0218-dust", i * 7 + k);
        const y = wrap(r(1) * 5.5 + phase * (0.004 + 0.006 * r(2)), 5.5);
        const x = (r(3) - 0.5) * 6.5 + Math.sin(phase / 40 + r(4) * 6) * 0.15;
        const z = -5 + r(5) * 4.4;
        const s = (0.025 + 0.045 * r(6)) * Math.min(1, y / 0.6, (5.5 - y) / 0.8);
        return <sprite key={i} position={[x, y, z]} scale={[s, s, 1]}><Soft color="#9fe6ff" opacity={0.85} /></sprite>;
      })}
    </group>
  );
};

const TILT = 1.15;                      // the chip and the card face the camera: their tops turn toward +z
const CHIP_AT: V3 = [0, 0.95, 1.2];
const CARD_AT: V3 = [0, 1.66, 0.95];
const CELL_LOCAL: V3 = [0.07, 0.1, -0.05];     // one cell on the die's top, in the chip's own space
const DIE_LOCAL: V3 = [-0.2, 0.1, 0];          // where the GPU die sits on the card

/** a point in the tilted chip's space → world */
const tilted = (c: V3, l: V3): V3 => [
  c[0] + l[0],
  c[1] + l[1] * Math.cos(TILT) - l[2] * Math.sin(TILT),
  c[2] + l[1] * Math.sin(TILT) + l[2] * Math.cos(TILT),
];
const FACE: V3 = [0, Math.cos(TILT), Math.sin(TILT)];

const BankCard: React.FC = () => (
  <group>
    <Block size={[0.856, 0.01, 0.54]} radius={0.004} preset="glossy" color="#1d3f9e" />
    <Block size={[0.856, 0.002, 0.12]} radius={0.001} preset="glossy" color="#2f63d8" position={[0, 0.006, 0.17]} />
    <Block size={[0.11, 0.004, 0.085]} radius={0.002} preset="gold" position={[-0.27, 0.007, -0.04]} />
    <Block size={[0.12, 0.003, 0.08]} radius={0.002} preset="brushed" position={[0.3, 0.006, -0.15]} />
    {[0, 1, 2, 3].map((i) => (
      <Block key={i} size={[0.13, 0.003, 0.03]} radius={0.001} preset="white" color="#c9d4f2" position={[-0.27 + i * 0.16, 0.006, 0.08]} />
    ))}
  </group>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const ev = {
    nvidia: m.at("nvidia", 6), chip: m.at("chip", 18), card: m.at("card", 50), small: m.at("small", 75), switch: m.at("switch", 95),
  };
  const end = Math.max(m.end, ev.switch + 20);

  // the card turns the whole time; its shroud and fins lift off on "NVIDIA"
  const turn = OPEN.rot + t * OPEN.spin;
  const open = cue(t, ev.nvidia, 18) * 0.55;

  // the chip rises out of the card, from where its die sits, and turns to face the camera
  const rise = cue(t, ev.chip, 20, Easing.out(Easing.cubic));
  const dieWorld: V3 = cardPoint(turn, [DIE_LOCAL[0], DIE_LOCAL[1] + 0.05, DIE_LOCAL[2]]);
  const chipPos: V3 = [
    dieWorld[0] + (CHIP_AT[0] - dieWorld[0]) * rise,
    dieWorld[1] + (CHIP_AT[1] - dieWorld[1]) * rise + Math.sin(t / 14) * 0.012 * rise,
    dieWorld[2] + (CHIP_AT[2] - dieWorld[2]) * rise,
  ];
  const back = cue(t, ev.chip + 4, 22, Easing.inOut(Easing.cubic));
  const chipScale = 0.83 + 0.17 * rise;
  const edge = cue(t, ev.chip + 6, 12);
  const edgePulse = 1 + 0.25 * Math.max(0, 1 - Math.abs(t - ev.chip - 14) / 8);

  // the bank card slides in beside it on "card"
  const slide = cue(t, ev.card, 16, Easing.out(Easing.back(1.2)));
  const cardPos: V3 = [CARD_AT[0] + (1 - slide) * 2.8, CARD_AT[1] + Math.sin(t / 17) * 0.01, CARD_AT[2]];

  // one cell flares on "switch"
  const flare = t < ev.switch ? 0 : cue(t, ev.switch, 6, Easing.out(Easing.back(2)));
  const ring = t < ev.switch ? 0 : ((t - ev.switch) % 24) / 24;
  const cell = tilted(CHIP_AT, CELL_LOCAL);
  const chipLow = tilted(CHIP_AT, [0, 0.1, 0.12]);   // a little below the chip's centre: the chip sits above the captions

  const keys = direct(ev, [
    { at: 0, move: "orbit", center: OPEN.center, radius: OPEN.radius, height: OPEN.height, from: OPEN.angle, to: OPEN.angle - 0.3, dur: ev.chip + 6, fov: OPEN.fov },
    { at: "chip", move: "push", look: [0, 0.9, 1.05], dir: [0.12, 0.5, 1], to: 3.5, dur: Math.max(12, ev.card - ev.chip) },
    { at: "card", move: "push", look: [0, 1.0, 1.05], dir: [0, 0.42, 1], to: 3.3, dur: 16 },
    { at: ev.card + 16, move: "push", look: [0, 0.98, 1.06], dir: [0, 0.42, 1], to: 3.1, dur: Math.max(8, ev.small - ev.card - 16) },
    { at: "small", move: "push", look: chipLow, dir: FACE, to: 1.05, dur: Math.max(10, ev.switch - ev.small) },
    { at: "switch", move: "dive", look: cell, dir: FACE, to: 0.17, dur: 16 },
    { at: ev.switch + 16, move: "push", look: cell, dir: FACE, to: 0.13, dur: Math.max(8, end - ev.switch - 16) },
  ]);
  const focusAt: V3 = t < ev.chip ? STAND.center : t < ev.switch ? chipPos : cell;

  return (
    <Stage3D {...STAGE} dof={3} blur={1}>
      <Camera3D keys={keys} frame={t} />
      <StudioSet phase={t} />
      <Focus at={focusAt} range={t < ev.switch ? 1.6 : 0.25} />

      {/* once the chip is out, the card backs away behind it, a dark blurred backdrop */}
      <StandingCard yaw={turn} open={open} lit={0.45 + 0.4 * rise} rps={1.6} shift={[0.8 * back, -1.4 * back, -5 * back]} />

      {/* the bare chip, out of the card */}
      <group position={chipPos} rotation-x={TILT} scale={chipScale}>
        <ChipPackage size={0.6} lid={false} seed="v0218-hook-chip" lit={0.5 + 0.4 * edge} />
        {edge > 0 && ([[0, 0.31], [0, -0.31], [0.31, 0], [-0.31, 0]] as const).map(([x, z], i) => (
          <mesh key={i} position={[x, 0.065, z]} scale={[x === 0 ? edge * edgePulse : 1, edgePulse, z === 0 ? edge * edgePulse : 1]} material={glow(TECH.cyan)}>
            <boxGeometry args={[x === 0 ? 0.62 : 0.012, 0.012, z === 0 ? 0.62 : 0.012]} />
          </mesh>
        ))}
        {flare > 0 && (
          <group position={CELL_LOCAL}>
            <mesh position={[0, 0.002, 0]} scale={[flare, 1, flare]} material={glow(TECH.amber)}>
              <boxGeometry args={[0.014, 0.003, 0.014]} />
            </mesh>
            <mesh position={[0, 0.003, 0]} rotation-x={-Math.PI / 2} scale={0.6 + ring * 2.4} material={glow(TECH.amber, 0.6)}>
              <ringGeometry args={[0.012, 0.014, 40]} />
            </mesh>
            <pointLight position={[0, 0.03, 0]} intensity={1.5 * flare} distance={0.4} color={TECH.amber} />
          </group>
        )}
      </group>

      {/* the bank card, beside it */}
      {slide > 0 && (
        <group position={cardPos} rotation-x={TILT} rotation-z={(1 - slide) * -0.5}>
          <BankCard />
        </group>
      )}
      {slide > 0 && t < ev.switch && (
        <>
          <Label3D at={[0.43, CARD_AT[1] + 0.12, CARD_AT[2] + 0.05]} offset={[0.25, 0.35, 0]} text="a bank card" start={K(ev.card + 10)} end={K(ev.switch)} color={TECH.amber} px={50} />
          <Label3D at={[-0.3, CHIP_AT[1] - 0.1, CHIP_AT[2] + 0.1]} offset={[-0.2, -0.35, 0]} text="the chip" start={K(ev.card + 16)} end={K(ev.switch)} px={50} />
        </>
      )}
    </Stage3D>
  );
};

export default Hook;
