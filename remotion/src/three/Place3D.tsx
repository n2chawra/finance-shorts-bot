// Place3D: dark places to stand a story in and fly through. Each place is built around its own
// origin (floor at y = 0, the open side toward +z) so a beat can put several side by side and fly
// the camera between them (moves.fly / direct({ move: "fly" })). Lit by emissive panels (they
// bloom) and a few unshadowed lights; pair with Stage3D `fog` for depth.
//
//   studio     a curved sweep (cyclorama) and a soft overhead panel: the hero-object void
//   serverHall an aisle between two rows of racks, light strips, cable trays, tiled floor
//   cleanRoom  a fab bay in amber light: filter ceiling, tools with windows, wafer pods on a rail
//   desk       a desk at night: monitor glow, keyboard, lamp, a window over a lit city
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rnd, TECH } from "./core";
import { RACK, ServerRack } from "./Hero";
import { Block, glow, mat } from "./Proc";
import { canvasTexture } from "./textures";

type Group = ThreeElements["group"];
export type PlaceKind = "studio" | "serverHall" | "cleanRoom" | "desk";

const tiles = (base: string, line: string, n = 8) => canvasTexture(`tiles|${base}|${line}|${n}`, 512, 512, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = line; g.lineWidth = 3;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * 512;
    g.beginPath(); g.moveTo(u, 0); g.lineTo(u, 512); g.stroke();
    g.beginPath(); g.moveTo(0, u); g.lineTo(512, u); g.stroke();
  }
  g.fillStyle = "rgba(0,0,0,0.25)";
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
    g.beginPath(); g.arc(((i + 0.2 + a * 0.2) / n) * 512, ((j + 0.2 + b * 0.2) / n) * 512, 2.2, 0, Math.PI * 2); g.fill();
  }
});

const city = (seed: string) => canvasTexture(`city|${seed}`, 512, 384, (g) => {
  const sky = g.createLinearGradient(0, 0, 0, 384);
  sky.addColorStop(0, "#0b1030"); sky.addColorStop(1, "#2a1c40");
  g.fillStyle = sky; g.fillRect(0, 0, 512, 384);
  for (let b = 0; b < 26; b++) {
    const x = rnd(seed, b) * 512, bw = 20 + rnd(seed, b + 50) * 50, bh = 80 + rnd(seed, b + 99) * 240;
    g.fillStyle = `hsl(235, 30%, ${8 + rnd(seed, b + 150) * 8}%)`;
    g.fillRect(x, 384 - bh, bw, bh);
    for (let y = 384 - bh + 8; y < 380; y += 12) for (let xx = x + 4; xx < x + bw - 4; xx += 9) {
      if (rnd(seed, Math.floor(xx * 7 + y * 13)) > 0.6) {
        g.fillStyle = rnd(seed, Math.floor(xx + y)) > 0.5 ? "#ffd27a" : "#9fd8ff";
        g.fillRect(xx, y, 4, 6);
      }
    }
  }
});

const codeScreen = (seed: string) => canvasTexture(`code|${seed}`, 512, 320, (g) => {
  g.fillStyle = "#0a0f1c"; g.fillRect(0, 0, 512, 320);
  const cols = ["#7aa2ff", "#9dff5c", "#ffb340", "#e6e9f2", "#ff7ab0"];
  for (let l = 0; l < 22; l++) {
    let x = 16 + Math.floor(rnd(seed, l) * 4) * 18;
    const words = 2 + Math.floor(rnd(seed, l + 40) * 6);
    for (let k = 0; k < words; k++) {
      const w = 14 + rnd(seed, l * 13 + k) * 60;
      g.fillStyle = cols[Math.floor(rnd(seed, l * 7 + k) * cols.length)]!;
      g.fillRect(x, 14 + l * 13.5, w, 6);
      x += w + 8;
    }
  }
});

// ---------------------------------------------------------------------- places

const Studio: React.FC = () => {
  return (
    <group>
      {/* back wall curve: a quarter cylinder joining floor and wall */}
      <mesh position={[0, 3, -3]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <cylinderGeometry args={[3, 3, 30, 48, 1, true, Math.PI, Math.PI / 2]} />
        <meshStandardMaterial color="#0f131c" roughness={0.85} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 10, -6]} receiveShadow>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color="#0f131c" roughness={0.85} />
      </mesh>
      {/* soft overhead panel (blooms a little) */}
      <mesh position={[0, 7, 0.5]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[6, 2.5]} />
        <meshBasicMaterial color="#cfe0ff" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 5.5, 1]} intensity={14} distance={16} decay={1.6} color="#dfe8ff" />
    </group>
  );
};

const ServerHall: React.FC<{ length?: number; seed?: string }> = ({ length = 10, seed = "hall" }) => {
  const n = Math.floor(length / (RACK.w + 0.02));
  const aisle = 1.6;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, -length / 2 + 1]} receiveShadow>
        <planeGeometry args={[aisle + RACK.d * 2 + 2, length + 2]} />
        <meshStandardMaterial map={tiles("#2a3242", "#11151d")} roughness={0.45} metalness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: n }, (_, i) => (
            <ServerRack key={i} lod="low" units={12} seed={`${seed}-${side}-${i}`} ledColor={i % 5 === 2 ? TECH.lime : TECH.cyan}
              position={[side * (aisle / 2 + RACK.d / 2), 0, 0.5 - i * (RACK.w + 0.02)]} rotation-y={-side * Math.PI / 2} />
          ))}
          {/* cable tray above each row */}
          <Block size={[0.5, 0.08, length]} radius={0.01} preset="brushed" color="#5a616e" position={[side * (aisle / 2 + RACK.d / 2), RACK.h + 0.45, -length / 2 + 1]} />
        </group>
      ))}
      {/* light strips over the aisle */}
      {Array.from({ length: Math.ceil(length / 2.2) }, (_, i) => (
        <mesh key={i} position={[0, RACK.h + 0.9, 0.6 - i * 2.2]} material={glow("#bfe6ff")}>
          <boxGeometry args={[0.5, 0.03, 1.4]} />
        </mesh>
      ))}
      {Array.from({ length: Math.max(2, Math.ceil(length / 3)) }, (_, i) => (
        <pointLight key={`pl${i}`} position={[0, 2.5, 0.5 - i * 3]} intensity={28} distance={10} decay={1.4} color="#a8d8ff" />
      ))}
      <hemisphereLight args={["#8fb8ff", "#0a0e18", 0.6]} />
    </group>
  );
};

const CleanRoom: React.FC<{ seed?: string; length?: number }> = ({ seed = "fab", length = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const amber = "#ffcf6b";
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, -length / 2 + 1]} receiveShadow>
        <planeGeometry args={[7, length + 2]} />
        <meshStandardMaterial map={tiles("#cfc6b0", "#a59c88", 10)} roughness={0.6} />
      </mesh>
      {/* filter ceiling: glowing amber panels in a grid */}
      {Array.from({ length: 3 * Math.ceil(length / 1.4) }, (_, i) => (
        <mesh key={i} position={[-1.6 + (i % 3) * 1.6, 3.4, 0.6 - Math.floor(i / 3) * 1.4]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[1.45, 1.25]} />
          <meshBasicMaterial color={amber} toneMapped={false} />
        </mesh>
      ))}
      {/* tools: white machines with dark windows along both walls */}
      {[-1, 1].map((side) => Array.from({ length: Math.floor(length / 2.2) }, (_, i) => (
        <group key={`${side}-${i}`} position={[side * 2.4, 0, 0.2 - i * 2.2]} rotation-y={-side * Math.PI / 2}>
          <Block size={[1.8, 2.0 + rnd(seed, i * 3 + side) * 0.5, 1.2]} radius={0.06} preset="white" color="#e9e4d8" position={[0, 1.05, 0]} />
          <Block size={[0.9, 0.5, 0.02]} radius={0.02} preset="glossy" color="#1a1d26" position={[-0.2, 1.4, 0.61]} />
          <mesh position={[0.6, 1.6, 0.61]} material={glow(i % 2 ? TECH.lime : TECH.cyan)}><boxGeometry args={[0.08, 0.08, 0.01]} /></mesh>
        </group>
      )))}
      {/* overhead rail with wafer pods moving along it */}
      <Block size={[0.12, 0.08, length]} radius={0.02} preset="aluminium" position={[0, 3.05, -length / 2 + 1]} />
      {[0, 0.37, 0.71].map((ph, i) => {
        const u = ((frame / fps) * 0.12 + ph) % 1;
        return <Block key={i} size={[0.35, 0.3, 0.35]} radius={0.05} preset="white" color="#f4f1e8" position={[0, 2.85, 1 - u * length]} />;
      })}
      <pointLight position={[0, 3, -1]} intensity={22} distance={10} decay={1.4} color={amber} />
      <pointLight position={[0, 3, -length + 3]} intensity={22} distance={10} decay={1.4} color={amber} />
    </group>
  );
};

const Desk: React.FC<{ seed?: string }> = ({ seed = "desk" }) => {
  const keys = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.02, 0.05), mat("blackPlastic", "#23252c"), 60);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 60; i++) { m.makeTranslation(-0.36 + (i % 15) * 0.052, 0, -0.08 + Math.floor(i / 15) * 0.055); im.setMatrixAt(i, m); }
    im.castShadow = true;
    return im;
  }, []);
  return (
    <group>
      {/* back wall with a window over the city */}
      <mesh position={[0, 2, -1.6]} receiveShadow><planeGeometry args={[8, 4]} /><meshStandardMaterial color="#141826" roughness={0.9} /></mesh>
      <mesh position={[0.9, 2.1, -1.58]}><planeGeometry args={[2.4, 1.6]} /><meshBasicMaterial map={city(seed)} toneMapped={false} /></mesh>
      <Block size={[2.5, 0.04, 0.06]} radius={0.01} preset="blackPlastic" position={[0.9, 1.28, -1.55]} />
      {/* desk */}
      <Block size={[2.4, 0.06, 1.0]} radius={0.02} preset="white" color="#5b4632" position={[0, 0.75, -0.6]} />
      {[[-1.1, -1.0], [1.1, -1.0], [-1.1, -0.2], [1.1, -0.2]].map(([x, z], i) => (
        <Block key={i} size={[0.05, 0.75, 0.05]} radius={0.01} preset="blackPlastic" position={[x!, 0.375, z!]} />
      ))}
      {/* monitor */}
      <group position={[0, 0.78, -0.85]}>
        <Block size={[0.1, 0.3, 0.06]} radius={0.01} preset="brushed" position={[0, 0.15, 0]} />
        <Block size={[1.0, 0.6, 0.04]} radius={0.02} preset="glossy" position={[0, 0.55, 0]} />
        <mesh position={[0, 0.55, 0.021]}><planeGeometry args={[0.94, 0.55]} /><meshBasicMaterial map={codeScreen(seed)} toneMapped={false} /></mesh>
      </group>
      <group position={[0, 0.79, -0.35]}><primitive object={keys} /></group>
      {/* lamp */}
      <group position={[-0.85, 0.78, -0.75]}>
        <mesh material={mat("blackPlastic")}><cylinderGeometry args={[0.08, 0.1, 0.03, 24]} /></mesh>
        <mesh position={[0.08, 0.25, 0]} rotation-z={-0.35} material={mat("blackPlastic")}><cylinderGeometry args={[0.012, 0.012, 0.5, 8]} /></mesh>
        <mesh position={[0.2, 0.48, 0]} rotation-z={0.6} material={mat("blackPlastic")}><coneGeometry args={[0.1, 0.14, 24, 1, true]} /></mesh>
        <mesh position={[0.22, 0.44, 0]} material={glow("#ffd9a0")}><sphereGeometry args={[0.035, 16, 12]} /></mesh>
        <pointLight position={[0.25, 0.4, 0]} intensity={4} distance={3} color="#ffcf8a" />
      </group>
      {/* mug */}
      <mesh position={[0.75, 0.84, -0.45]} material={mat("white", "#d9573f")} castShadow><cylinderGeometry args={[0.06, 0.055, 0.12, 24]} /></mesh>
      <pointLight position={[0, 1.4, -0.4]} intensity={2.5} distance={3} color="#7aa2ff" />
    </group>
  );
};

/** One place, built around its own origin; position it anywhere. */
export const Place3D: React.FC<Group & { kind: PlaceKind; seed?: string; length?: number }> = ({ kind, seed, length, ...g }) => (
  <group {...g}>
    {kind === "studio" && <Studio />}
    {kind === "serverHall" && <ServerHall seed={seed} length={length} />}
    {kind === "cleanRoom" && <CleanRoom seed={seed} length={length} />}
    {kind === "desk" && <Desk seed={seed} />}
  </group>
);
