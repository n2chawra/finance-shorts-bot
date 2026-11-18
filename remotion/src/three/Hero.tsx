// Hero models, procedural and detailed enough to hold a close-up: a graphics card (shroud, fans,
// fin stack, board with GPU die and memory chips, backplate, gold fingers), a silicon wafer of dies,
// a server rack with blinking drive lights, and a phone logic board (SoC with stacked memory, RF
// shields, connectors, hundreds of parts). Units: the GPU card is 3 long. All seeded, all frame-driven.
import type { ThreeElements } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rnd, TECH, type V3 } from "./core";
import { Block, Board, ChipPackage, Die, glow, mat, Scatter, Top } from "./Proc";
import { dieTexture, fanTexture, pcbTexture } from "./textures";

type Group = ThreeElements["group"];

// ------------------------------------------------------------------ graphics card

export const GPU = { l: 3, w: 1.15, board: 0.06 } as const;

/** A fan seen from above: hub, blades (an alpha texture on a disc), a frame ring. `rps` turns per second. */
export const Fan: React.FC<Group & { r?: number; rps?: number; phase?: number }> = ({ r = 0.42, rps = 1.2, phase = 0, ...g }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = ((frame / fps) * rps + phase) * Math.PI * 2;
  return (
    <group {...g}>
      <mesh rotation-x={-Math.PI / 2} rotation-z={-a} position={[0, 0.01, 0]}>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial map={fanTexture()} alphaTest={0.5} transparent={false} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} material={mat("glossy")}>
        <ringGeometry args={[r * 1.01, r * 1.12, 48]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={mat("glossy", "#1a1c22")}>
        <cylinderGeometry args={[r * 0.24, r * 0.26, 0.04, 32]} />
      </mesh>
    </group>
  );
};

/** The fin stack under the shroud: many thin aluminium plates, instanced, with heat pipes. */
export const FinStack: React.FC<Group & { length?: number; width?: number; height?: number; n?: number }> = ({ length = GPU.l * 0.86, width = GPU.w * 0.9, height = 0.26, n = 90, ...g }) => {
  const mesh = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.008, height, width), mat("aluminium"), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      m.makeTranslation(-length / 2 + (i + 0.5) * (length / n), height / 2, 0);
      im.setMatrixAt(i, m);
    }
    im.castShadow = true; im.receiveShadow = true;
    return im;
  }, [length, width, height, n]);
  return (
    <group {...g}>
      <primitive object={mesh} />
      {[-0.28, -0.1, 0.1, 0.28].map((z, i) => (
        <mesh key={i} position={[0, height * 0.35, z * width]} rotation-z={Math.PI / 2} material={mat("copper")} castShadow>
          <cylinderGeometry args={[0.025, 0.025, length * 1.02, 12]} />
        </mesh>
      ))}
    </group>
  );
};

/** The card's board: PCB, GPU die on its substrate, memory chips around it, power stages, gold fingers. */
export const GPUBoard: React.FC<Group & { seed?: string; lit?: number }> = ({ seed = "gpu", lit = 0.5, ...g }) => {
  const vram: V3[] = [];
  for (let i = 0; i < 4; i++) { vram.push([-0.2 + (i - 1.5) * 0.24, 0, -0.38]); vram.push([-0.2 + (i - 1.5) * 0.24, 0, 0.38]); }
  vram.push([0.38, 0, -0.13], [0.38, 0, 0.13], [-0.78, 0, -0.13], [-0.78, 0, 0.13]);
  return (
    <group {...g}>
      <Board size={[GPU.l, GPU.w]} thick={GPU.board} seed={`${seed}-pcb`} dark parts={160} avoid={[[-0.2, 0, 1.4, 1.0], [1.1, 0, 0.7, 0.9]]} />
      {/* the GPU: substrate + bare die */}
      <group position={[-0.2, GPU.board / 2, 0]}>
        <Block size={[0.5, 0.03, 0.5]} radius={0.01} preset="pcbDark" color="#2a2416" position={[0, 0.015, 0]} />
        <Die size={0.32} seed={`${seed}-die`} cores={[4, 6]} lit={lit} thick={0.02} position={[0, 0.04, 0]} />
      </group>
      {/* memory chips */}
      {vram.map((p, i) => (
        <group key={i} position={[p[0], GPU.board / 2, p[2]]}>
          <Block size={[0.15, 0.025, 0.11]} radius={0.006} preset="glossy" position={[0, 0.0125, 0]} />
          <mesh position={[0, 0.026, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.04, 0.04]} /><meshBasicMaterial color="#3a3d46" /></mesh>
        </group>
      ))}
      {/* power stages: a row of chokes */}
      {Array.from({ length: 10 }, (_, i) => (
        <Block key={`ch${i}`} size={[0.07, 0.06, 0.07]} radius={0.01} preset="glossy" color="#24262c" position={[1.0 + (i % 5) * 0.09, GPU.board / 2 + 0.03, i < 5 ? -0.3 : 0.3]} />
      ))}
      {/* gold fingers along one long edge, under the board */}
      {Array.from({ length: 40 }, (_, i) => (
        <mesh key={`gf${i}`} position={[-1.1 + i * 0.035, -GPU.board / 2 - 0.002, GPU.w / 2 - 0.06]} material={mat("gold")}>
          <boxGeometry args={[0.022, 0.004, 0.1]} />
        </mesh>
      ))}
      {/* power connector */}
      <Block size={[0.3, 0.12, 0.1]} radius={0.01} preset="blackPlastic" position={[1.25, GPU.board / 2 + 0.06, -GPU.w / 2 + 0.07]} />
    </group>
  );
};

/** The shroud: a glossy cover with fan openings, an accent light strip (it blooms), and a brushed
 * side plate with the vent slots. */
export const GPUShroud: React.FC<Group & { fans?: number; accent?: string; rps?: number }> = ({ fans = 3, accent = TECH.cyan, rps = 1.4, ...g }) => {
  const span = GPU.l * 0.86;
  const r = Math.min(0.42, span / fans / 2 - 0.04);
  return (
    <group {...g}>
      {/* the cover as a frame around the fan holes: top plate pieces between the fans */}
      {Array.from({ length: fans + 1 }, (_, i) => {
        const x0 = -span / 2 + (i * span) / fans;
        const wbar = i === 0 || i === fans ? 0.22 : 0.08;
        const cx = i === 0 ? x0 - wbar / 2 + 0.06 : i === fans ? x0 + wbar / 2 - 0.06 : x0;
        return <Block key={i} size={[wbar, 0.08, GPU.w]} radius={0.03} preset="glossy" position={[cx, 0.04, 0]} />;
      })}
      <Block size={[span, 0.08, 0.08]} radius={0.03} preset="glossy" position={[0, 0.04, -GPU.w / 2 + 0.04]} />
      <Block size={[span, 0.08, 0.08]} radius={0.03} preset="glossy" position={[0, 0.04, GPU.w / 2 - 0.04]} />
      {Array.from({ length: fans }, (_, i) => (
        <Fan key={i} r={r} rps={rps} phase={i * 0.27} position={[-span / 2 + ((i + 0.5) * span) / fans, 0.0, 0]} />
      ))}
      {/* accent light strip along the front edge */}
      <mesh position={[0, 0.06, GPU.w / 2 + 0.002]} material={glow(accent)}>
        <boxGeometry args={[span * 0.9, 0.012, 0.006]} />
      </mesh>
      {/* brushed side plate */}
      <Block size={[GPU.l, 0.12, 0.02]} radius={0.008} preset="brushed" position={[0, 0.0, GPU.w / 2 + 0.012]} />
    </group>
  );
};

/** A whole graphics card, fans up. `open` (0..1) lifts the shroud and fins off the board (an
 * exploded view on a cue); `lit` lights the die. */
export const GPUCard: React.FC<Group & { open?: number; lit?: number; seed?: string; accent?: string; rps?: number }> = ({ open = 0, lit = 0.5, seed = "gpu", accent, rps, ...g }) => (
  <group {...g}>
    <Block size={[GPU.l, 0.02, GPU.w]} radius={0.008} preset="brushed" color="#3a3e48" position={[0, 0.01, 0]} />
    <GPUBoard seed={seed} lit={lit} position={[0, 0.05, 0]} />
    <FinStack position={[0, 0.09 + open * 0.55, 0]} />
    <GPUShroud accent={accent} rps={rps} position={[0, 0.38 + open * 1.15, 0]} />
  </group>
);

// ------------------------------------------------------------------ wafer

/** A silicon wafer: a disc of dies (instanced, each a little raised, colour drifting across the
 * wafer like thin-film interference), a notch, and an optional glowing die (`pick`). */
export const Wafer: React.FC<Group & { r?: number; die?: number; seed?: string; pick?: number; pickColor?: string }> = ({ r = 1.5, die = 0.12, seed = "wafer", pick = -1, pickColor = TECH.amber, ...g }) => {
  const { mesh, count } = useMemo(() => {
    const cells: [number, number][] = [];
    const n = Math.floor((r * 2) / die);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = (i - (n - 1) / 2) * die, z = (j - (n - 1) / 2) * die;
      if (Math.hypot(Math.abs(x) + die / 2, Math.abs(z) + die / 2) < r * 0.96) cells.push([x, z]);
    }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(die * 0.9, 0.012, die * 0.9),
      new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.15, metalness: 0.7, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 700], map: dieTexture(`${seed}-cell`, [2, 2], 256) }), cells.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    cells.forEach(([x, z], k) => {
      m.makeTranslation(x, 0.006, z);
      im.setMatrixAt(k, m);
      const h = 0.62 + (x / r) * 0.06 + (z / r) * 0.05 + (rnd(seed, k) - 0.5) * 0.02;
      im.setColorAt(k, c.setHSL(h, 0.45, 0.62));
    });
    im.receiveShadow = true; im.castShadow = true;
    return { mesh: im, count: cells.length };
  }, [r, die, seed]);
  const pickAt = useMemo(() => {
    if (pick < 0 || pick >= count) return null;
    const m = new THREE.Matrix4();
    mesh.getMatrixAt(pick, m);
    return new THREE.Vector3().setFromMatrixPosition(m);
  }, [mesh, pick, count]);
  const notch = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, r, -Math.PI / 2 + 0.03, Math.PI * 1.5 - 0.03, false);
    s.lineTo(0, -r + 0.05);
    return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 96 });
  }, [r]);
  return (
    <group {...g}>
      <mesh geometry={notch} rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} material={mat("silicon", "#4a4f7a", { iridescence: 0.9, roughness: 0.08 })} castShadow receiveShadow />
      <primitive object={mesh} />
      {pickAt && (
        <mesh position={[pickAt.x, 0.016, pickAt.z]} material={glow(pickColor)}>
          <boxGeometry args={[die * 0.92, 0.006, die * 0.92]} />
        </mesh>
      )}
    </group>
  );
};

/** Where die `i` of a Wafer sits (for labels, pointers, a dive target). */
export function waferDieAt(i: number, r = 1.5, die = 0.12): V3 | null {
  const n = Math.floor((r * 2) / die);
  let k = 0;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    const x = (a - (n - 1) / 2) * die, z = (b - (n - 1) / 2) * die;
    if (Math.hypot(Math.abs(x) + die / 2, Math.abs(z) + die / 2) < r * 0.96) {
      if (k === i) return [x, 0.012, z];
      k++;
    }
  }
  return null;
}

// ------------------------------------------------------------------ server rack

export const RACK = { w: 0.75, d: 1.1, h: 2.2, units: 14 } as const;

/** A server rack: frame posts, `units` servers with drive bays and seeded blinking LEDs (instanced,
 * recoloured each frame). `lod="low"` drops the drive bays (for an aisle of many racks). */
export const ServerRack: React.FC<Group & { seed?: string; lod?: "high" | "low"; ledColor?: string; units?: number }> = ({ seed = "rack", lod = "high", ledColor = TECH.cyan, units = RACK.units, ...g }) => {
  const frame = useCurrentFrame();
  const { w, d, h } = RACK;
  const uh = (h - 0.2) / units;
  const leds = useMemo(() => {
    const per = 6;
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.012, 0.004), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), units * per);
    const m = new THREE.Matrix4();
    for (let u = 0; u < units; u++) for (let k = 0; k < per; k++) {
      m.makeTranslation(-w * 0.38 + k * 0.03, 0.1 + (u + 0.5) * uh - uh * 0.25, d / 2 + 0.012);
      im.setMatrixAt(u * per + k, m);
    }
    return im;
  }, [units, uh, w, d]);
  const led = useMemo(() => new THREE.Color(ledColor).multiplyScalar(3), [ledColor]);
  const off = useMemo(() => new THREE.Color("#0a1220"), []);
  const amber = useMemo(() => new THREE.Color(TECH.amber).multiplyScalar(3), []);
  useLayoutEffect(() => {
    const n = leds.count;
    for (let i = 0; i < n; i++) {
      // each LED blinks on its own seeded rhythm (2–9 frames a flicker): disk activity
      const period = 2 + Math.floor(rnd(seed, i) * 8);
      const on = rnd(`${seed}-b${i}`, Math.floor(frame / period)) > 0.45;
      leds.setColorAt(i, i % 6 === 5 ? (rnd(seed, i + 999) > 0.85 ? amber : off) : on ? led : off);
    }
    if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
  });
  return (
    <group {...g}>
      {/* frame */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <Block key={i} size={[0.05, h, 0.05]} radius={0.01} preset="blackPlastic" position={[(sx! * (w - 0.05)) / 2, h / 2, (sz! * (d - 0.05)) / 2]} />
      ))}
      <Block size={[w, 0.06, d]} radius={0.01} preset="blackPlastic" position={[0, h - 0.03, 0]} />
      <Block size={[w, 0.08, d]} radius={0.01} preset="blackPlastic" position={[0, 0.04, 0]} />
      {/* servers */}
      {Array.from({ length: units }, (_, u) => (
        <group key={u} position={[0, 0.1 + (u + 0.5) * uh, 0]}>
          <Block size={[w * 0.9, uh * 0.9, d * 0.96]} radius={0.008} preset="glossy" color={u % 4 === 3 ? "#1d2130" : "#14161d"} />
          <mesh position={[w * 0.12, 0, d * 0.481]} material={mat("brushed", u % 4 === 3 ? "#7d8594" : "#596070")}>
            <boxGeometry args={[w * 0.5, uh * 0.62, 0.01]} />
          </mesh>
          {lod === "high" && Array.from({ length: 8 }, (_, k) => (
            <mesh key={k} position={[-w * 0.05 + k * 0.05, 0, d * 0.485]} material={mat("brushed", "#5a606c")}>
              <boxGeometry args={[0.042, uh * 0.6, 0.01]} />
            </mesh>
          ))}
        </group>
      ))}
      <primitive object={leds} />
    </group>
  );
};

// ------------------------------------------------------------------ phone logic board

/** A phone's logic board, detailed: the SoC with memory stacked on it, storage, power chip, RF
 * shields (tin cans with vent holes), flex connectors, test pads and a few hundred small parts. */
export const LogicBoard: React.FC<Group & { seed?: string; lit?: number; shields?: boolean }> = ({ seed = "logic", lit = 0.5, shields = true, ...g }) => {
  const w = 1.25, d = 1.1, t = 0.05;
  const shield = (pos: V3, size: [number, number], k: number) => (
    <group key={`sh${k}`} position={pos}>
      <Block size={[size[0], 0.05, size[1]]} radius={0.008} preset="brushed" color="#c5cad3" position={[0, 0.025, 0]} />
      <Top w={size[0] * 0.92} d={size[1] * 0.92} y={0.0505} map={pcbTexture(`${seed}-shield${k}`, "rough", "#888", 256)} metal={1} />
    </group>
  );
  return (
    <group {...g}>
      <Board size={[w, d]} thick={t} seed={`${seed}-pcb`} dark parts={260} avoid={[[0.05, -0.1, 0.5, 0.5], [-0.42, 0.25, 0.3, 0.42], [0.45, 0.32, 0.3, 0.3]]} />
      {/* SoC with its memory stacked on top (package-on-package) */}
      <group position={[0.05, t / 2, -0.1]}>
        <ChipPackage size={0.42} lid={false} seed={`${seed}-soc`} lit={lit} />
        <Block size={[0.38, 0.05, 0.38]} radius={0.01} preset="glossy" position={[0, 0.16, 0]} />
        <mesh position={[0, 0.186, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.2, 0.06]} /><meshBasicMaterial color="#2b2e38" /></mesh>
      </group>
      {/* storage and power chips */}
      <Block size={[0.26, 0.035, 0.36]} radius={0.008} preset="glossy" position={[-0.42, t / 2 + 0.018, 0.25]} />
      <Block size={[0.18, 0.03, 0.18]} radius={0.008} preset="glossy" color="#202330" position={[0.45, t / 2 + 0.015, 0.32]} />
      {shields && [shield([-0.4, t / 2, -0.32], [0.32, 0.3], 0), shield([0.45, t / 2, -0.38], [0.26, 0.22], 1)]}
      {/* flex connectors on the edge */}
      {[[-0.15, d / 2 - 0.06], [0.25, d / 2 - 0.06], [w / 2 - 0.08, 0]].map(([x, z], i) => (
        <group key={`fpc${i}`} position={[x!, t / 2 + 0.012, z!]} rotation-y={i === 2 ? Math.PI / 2 : 0}>
          <Block size={[0.2, 0.024, 0.06]} radius={0.006} preset="blackPlastic" />
          <Scatter area={[0.18, 0.02]} count={10} seed={`${seed}-fpc${i}`} part={[0.008, 0.026, 0.02]} preset="gold" color="#f2c45a" />
        </group>
      ))}
      {/* gold test pads */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={`tp${i}`} position={[-w / 2 + 0.1 + (i % 7) * 0.05, t / 2 + 0.001, -d / 2 + 0.08 + Math.floor(i / 7) * 0.05]} material={mat("gold")}>
          <cylinderGeometry args={[0.014, 0.014, 0.004, 16]} />
        </mesh>
      ))}
    </group>
  );
};
