// Character3D: our own stylised 3D presenter for skit Shorts ("Byte"): a big round head, a hoodie
// body, two-part arms, a drawn-style face (ellipse eyes with a highlight, bar brows, a shaped mouth)
// and a short list of poses and expressions that blend on cues. Blinks come from a seed.
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import { random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { lerp, TECH } from "./core";
import { mat } from "./Proc";

export type CharPose = "idle" | "point" | "pointLeft" | "shrug" | "surprised" | "wave" | "think";
export type CharFace = "neutral" | "happy" | "surprised" | "worried" | "smug" | "talk";

export type CharCue = { f: number; pose?: CharPose; face?: CharFace; /** head turn, radians (+ = to their left) */ look?: number };

type Joints = { lean: number; tilt: number; lift: number; lSh: [number, number]; lEl: number; rSh: [number, number]; rEl: number; bounce: number };

// shoulder = [swing forward (x), raise sideways (z)]; elbow = bend
const POSES: Record<CharPose, Joints> = {
  idle: { lean: 0, tilt: 0, lift: 0, lSh: [0.1, 0.18], lEl: 0.25, rSh: [0.1, -0.18], rEl: 0.25, bounce: 1 },
  // points up and out with their left hand (screen right when facing the camera)
  point: { lean: 0.03, tilt: 0.1, lift: 0, lSh: [-0.45, 2.05], lEl: 0.05, rSh: [0.1, -0.2], rEl: 0.3, bounce: 0.5 },
  // the same with the right hand (screen left)
  pointLeft: { lean: 0.03, tilt: -0.1, lift: 0, lSh: [0.1, 0.2], lEl: 0.3, rSh: [-0.45, -2.05], rEl: 0.05, bounce: 0.5 },
  shrug: { lean: 0, tilt: 0.16, lift: 0.07, lSh: [-0.2, 0.75], lEl: -1.3, rSh: [-0.2, -0.75], rEl: -1.3, bounce: 0.4 },
  surprised: { lean: -0.12, tilt: 0, lift: 0.04, lSh: [-0.5, 1.25], lEl: -1.1, rSh: [-0.5, -1.25], rEl: -1.1, bounce: 0.2 },
  wave: { lean: 0, tilt: 0.06, lift: 0, lSh: [0.1, 0.2], lEl: 0.3, rSh: [-0.2, -2.3], rEl: -0.6, bounce: 1 },
  think: { lean: 0.04, tilt: 0.12, lift: 0, lSh: [0.1, 0.2], lEl: 0.3, rSh: [-0.9, -0.3], rEl: -2.0, bounce: 0.4 },
};

type Face = { brow: number; browTilt: number; eyeH: number; mouth: "smile" | "o" | "flat" | "frown" | "smirk" | "open"; mouthW: number };
const FACES: Record<CharFace, Face> = {
  neutral: { brow: 0, browTilt: 0, eyeH: 1, mouth: "flat", mouthW: 1 },
  happy: { brow: 0.03, browTilt: 0, eyeH: 0.85, mouth: "smile", mouthW: 1.2 },
  surprised: { brow: 0.09, browTilt: 0, eyeH: 1.25, mouth: "o", mouthW: 1 },
  worried: { brow: 0.03, browTilt: 0.35, eyeH: 1.05, mouth: "frown", mouthW: 0.9 },
  smug: { brow: -0.02, browTilt: -0.25, eyeH: 0.7, mouth: "smirk", mouthW: 1 },
  talk: { brow: 0.02, browTilt: 0, eyeH: 1, mouth: "open", mouthW: 1 },
};

function blend(a: Joints, b: Joints, t: number): Joints {
  return {
    lean: lerp(a.lean, b.lean, t), tilt: lerp(a.tilt, b.tilt, t), lift: lerp(a.lift, b.lift, t), bounce: lerp(a.bounce, b.bounce, t),
    lSh: [lerp(a.lSh[0], b.lSh[0], t), lerp(a.lSh[1], b.lSh[1], t)], lEl: lerp(a.lEl, b.lEl, t),
    rSh: [lerp(a.rSh[0], b.rSh[0], t), lerp(a.rSh[1], b.rSh[1], t)], rEl: lerp(a.rEl, b.rEl, t),
  };
}

const arcs = new Map<string, THREE.TorusGeometry>();
/** an arc of a torus (a drawn mouth line), cached by shape */
const arc = (r: number, a0: number, a1: number, tube: number) => {
  const k = `${r.toFixed(3)}|${(a1 - a0).toFixed(3)}|${tube}`;
  let g = arcs.get(k);
  if (!g) { g = new THREE.TorusGeometry(r, tube, 8, 24, a1 - a0); arcs.set(k, g); }
  return g;
};

export type Character3DProps = ThreeElements["group"] & {
  cues: CharCue[];
  /** hoodie colour */
  color?: string;
  skin?: string;
  hair?: string;
  seed?: string;
  /** mouth flaps while talking: frames [from, to) */
  talk?: [number, number][];
};

export const Character3D: React.FC<Character3DProps> = ({ cues, color = TECH.violet, skin = "#f2c7a5", hair = "#1d1b2b", seed = "byte", talk = [], ...g }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sorted = [...cues].sort((a, b) => a.f - b.f);

  // pose: spring from the previous pose to the latest cue's pose
  let pose: Joints = POSES.idle, prevPose: Joints = POSES.idle, poseAt = 0;
  let face: CharFace = "neutral", look = 0, prevLook = 0, lookAt = 0;
  for (const c of sorted) {
    if (c.f > frame) break;
    if (c.pose) { prevPose = pose; pose = POSES[c.pose]; poseAt = c.f; }
    if (c.face) face = c.face;
    if (c.look !== undefined) { prevLook = look; look = c.look; lookAt = c.f; }
  }
  const pk = spring({ frame: frame - poseAt, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const J = blend(prevPose, pose, pk);
  const headTurn = lerp(prevLook, look, spring({ frame: frame - lookAt, fps, config: { damping: 14 } }));
  const breathe = Math.sin((frame / fps) * Math.PI * 1.1) * 0.012 * J.bounce;

  // seeded blinks: one roughly every 2.2–3.8 s, 5 frames long
  const blink = useMemo(() => {
    const at: number[] = [];
    let f = 20 + random(`${seed}-b0`) * 40;
    for (let i = 1; f < 20000; i++) { at.push(Math.round(f)); f += fps * (2.2 + random(`${seed}-b${i}`) * 1.6); }
    return at;
  }, [seed, fps]);
  const sinceBlink = Math.min(...blink.map((b) => (frame >= b ? frame - b : 99)));
  const lid = sinceBlink < 5 ? Math.sin((sinceBlink / 5) * Math.PI) : 0;
  const talking = talk.some(([a, b]) => frame >= a && frame < b);
  const F = FACES[talking && face === "neutral" ? "talk" : face];
  const open = talking ? 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.9)) : 1;

  const skinM = mat("white", skin, { roughness: 0.6, sheen: 0.4 });
  const hoodM = mat("white", color, { roughness: 0.75 });
  const darkM = mat("blackPlastic", "#14121c", { roughness: 0.3 });
  const whiteM = mat("white", "#ffffff", { roughness: 0.25 });
  const hairM = mat("white", hair, { roughness: 0.55 });
  const pantsM = mat("white", "#2a3350", { roughness: 0.8 });

  const arm = (side: 1 | -1) => {
    const sh = side === 1 ? J.lSh : J.rSh;
    const el = side === 1 ? J.lEl : J.rEl;
    return (
      <group key={`arm${side}`} position={[0.36 * side, 1.18 + J.lift, 0]} rotation={[sh[0], 0, sh[1]]}>
        <mesh position={[0, -0.2, 0]} material={hoodM} castShadow><capsuleGeometry args={[0.085, 0.26, 6, 12]} /></mesh>
        <group position={[0, -0.4, 0]} rotation={[el, 0, 0]}>
          <mesh position={[0, -0.17, 0]} material={hoodM} castShadow><capsuleGeometry args={[0.075, 0.22, 6, 12]} /></mesh>
          <mesh position={[0, -0.36, 0]} material={skinM} castShadow><sphereGeometry args={[0.095, 16, 12]} /></mesh>
        </group>
      </group>
    );
  };

  const eyeY = 0.04, eyeX = 0.16, eyeZ = 0.43;
  const mouth = (() => {
    const w = 0.09 * F.mouthW;
    switch (F.mouth) {
      case "smile": return <mesh rotation={[0, 0, Math.PI + 0.35]} geometry={arc(w, 0, Math.PI - 0.7, 0.018)} material={darkM} />;
      case "frown": return <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0.35]} geometry={arc(w, 0, Math.PI - 0.7, 0.018)} material={darkM} />;
      case "smirk": return <mesh rotation={[0, 0, Math.PI + 0.6]} geometry={arc(w * 0.9, 0, Math.PI * 0.55, 0.018)} material={darkM} position={[0.03, 0, 0]} />;
      case "o": return <mesh scale={[0.055, 0.075, 0.03]} material={darkM}><sphereGeometry args={[1, 20, 14]} /></mesh>;
      case "open": return <mesh scale={[0.075, 0.03 + 0.04 * open, 0.03]} material={darkM}><sphereGeometry args={[1, 20, 14]} /></mesh>;
      default: return <mesh rotation={[0, 0, Math.PI / 2]} material={darkM}><capsuleGeometry args={[0.016, w * 1.3, 4, 8]} /></mesh>;
    }
  })();

  return (
    <group {...g}>
      <group rotation={[J.lean, 0, 0]} position={[0, breathe, 0]}>
        {/* legs */}
        {[1, -1].map((s) => (
          <group key={s} position={[0.13 * s, 0.42, 0]}>
            <mesh material={pantsM} castShadow><capsuleGeometry args={[0.1, 0.42, 6, 12]} /></mesh>
            <mesh position={[0, -0.33, 0.06]} scale={[1, 0.6, 1.5]} material={darkM} castShadow><sphereGeometry args={[0.11, 16, 12]} /></mesh>
          </group>
        ))}
        {/* hoodie body */}
        <mesh position={[0, 0.98, 0]} scale={[1, 1.05, 0.78]} material={hoodM} castShadow receiveShadow><capsuleGeometry args={[0.33, 0.32, 8, 20]} /></mesh>
        {/* a glowing round badge on the chest */}
        <mesh position={[0.12, 1.08, 0.255]} rotation-x={Math.PI / 2 - 0.1} material={mat("white", "#ffffff", { emissive: TECH.cyan, emissiveIntensity: 0.9 })}>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 24]} />
        </mesh>
        {arm(1)}
        {arm(-1)}
        {/* head */}
        <group position={[0, 1.72 + J.lift, 0]} rotation={[0, headTurn, J.tilt]}>
          <mesh material={skinM} castShadow><sphereGeometry args={[0.46, 40, 30]} /></mesh>
          {/* hair cap */}
          <mesh position={[0, 0.07, -0.03]} rotation={[-0.35, 0, 0]} scale={[1.04, 1, 1.04]} material={hairM} castShadow>
            <sphereGeometry args={[0.46, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
          <mesh position={[0.12, 0.38, 0.22]} rotation={[0.9, 0.2, -0.4]} material={hairM}><coneGeometry args={[0.09, 0.22, 10]} /></mesh>
          {/* ears */}
          {[1, -1].map((s) => (
            <mesh key={s} position={[0.45 * s, -0.02, 0]} scale={[0.5, 1, 0.8]} material={skinM}><sphereGeometry args={[0.09, 14, 10]} /></mesh>
          ))}
          {/* face, on the front of the sphere */}
          {[1, -1].map((s) => (
            <group key={`eye${s}`} position={[eyeX * s, eyeY, eyeZ - Math.abs(eyeX) * 0.12]} rotation={[0, s * 0.33, 0]}>
              <mesh scale={[0.075, 0.1 * F.eyeH * (1 - lid * 0.95), 0.03]} material={darkM}><sphereGeometry args={[1, 20, 14]} /></mesh>
              <mesh position={[0.022, 0.035 * F.eyeH * (1 - lid), 0.026]} scale={[0.022, 0.022 * (1 - lid), 0.01]} material={whiteM}><sphereGeometry args={[1, 10, 8]} /></mesh>
              <mesh position={[0, 0.15 + F.brow, 0.01]} rotation={[0, 0, (Math.PI / 2) + s * F.browTilt]} material={hairM}>
                <capsuleGeometry args={[0.022, 0.09, 4, 8]} />
              </mesh>
            </group>
          ))}
          {/* cheeks */}
          {[1, -1].map((s) => (
            <mesh key={`ch${s}`} position={[0.26 * s, -0.1, 0.35]} scale={[0.06, 0.035, 0.02]} material={mat("white", "#ff8fa3", { transparent: true, opacity: 0.6 })}>
              <sphereGeometry args={[1, 12, 8]} />
            </mesh>
          ))}
          <group position={[0, -0.17, 0.445]}>{mouth}</group>
        </group>
      </group>
    </group>
  );
};
