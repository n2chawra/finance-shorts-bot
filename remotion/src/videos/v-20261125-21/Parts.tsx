// Parts: the models, places and overlays this video's beats share (procedural, nothing downloaded; the
// real NV1 card and the old NVIDIA wordmark are freely licensed Commons files in public/real/).
// A smooth curved dome (one bent patch, the NV1's way) and the same dome cut into flat triangles (everyone
// else's way), a glowing drafting table, a game shelf of boxes with badges, an old beige PC with a CRT, a
// chip with a lifting lid, a big modern GPU module, and a balance. No figures here: every figure is a
// string from params.fig, passed in by the beat.
import React from "react";
import { Easing, Img, staticFile } from "remotion";
import { Block, ChipPackage, cue, glow, mat, rnd, TECH, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
/** quantise an animated value so materials stay cached */
export const q = (x: number, n = 10) => Math.round(x * n) / n;

export const AMBER = "#ffb340";
export const NV_GREEN = "#76b900";

// ------------------------------------------------------------------ the two ways to build a dome

/** One curved patch: a flat disc (rise 0) bending up into a smooth dome (rise 1). */
export const SmoothDome: React.FC<Group & { r?: number; rise?: number; lit?: number; color?: string; grid?: number }> = ({
  r = 1, rise = 1, lit = 0.4, color = AMBER, grid = 0.5, ...g
}) => (
  <group {...g}>
    <group scale={[1, Math.max(0.02, rise), 1]}>
      <mesh castShadow>
        <sphereGeometry args={[r, 72, 36, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} roughness={0.22} metalness={0.15} clearcoat={1} emissive={color} emissiveIntensity={q(0.15 + 0.6 * lit)} />
      </mesh>
      {grid > 0.02 && (
        <mesh scale={1.004}>
          <sphereGeometry args={[r, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#fff1d0" wireframe transparent opacity={q(0.35 * grid, 20)} toneMapped={false} />
        </mesh>
      )}
    </group>
    {/* the patch's rim */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
      <ringGeometry args={[r * 0.985, r * 1.03, 96]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={q(0.4 + 0.6 * lit)} />
    </mesh>
  </group>
);

/** The same dome cut into flat triangles: `detail` 0..1 = few big facets → many small ones. */
export const TriDome: React.FC<Group & { r?: number; detail?: number; lit?: number; cut?: number; one?: number }> = ({
  r = 1, detail = 0.4, lit = 0.6, cut = 1, one = 0, ...g
}) => {
  const seg = Math.round(5 + 11 * detail);
  const rings = Math.max(2, Math.round(seg / 2.5));
  return (
    <group {...g}>
      <mesh castShadow>
        <sphereGeometry args={[r, seg, rings, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5c6f99" roughness={0.45} metalness={0.2} flatShading emissive={TECH.cyan} emissiveIntensity={q(0.05 + 0.25 * lit * cut)} />
      </mesh>
      {cut > 0.02 && (
        <mesh scale={1.003}>
          <sphereGeometry args={[r, seg, rings, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color={TECH.cyan} wireframe transparent opacity={q(cut * (0.45 + 0.5 * lit), 20)} toneMapped={false} />
        </mesh>
      )}
      {one > 0.02 && (
        // one triangle lifted off the dome's side, lit amber
        <mesh position={[0, r * 0.62, r * 0.84]} rotation-x={-0.6} scale={q(0.4 + 0.6 * one, 20)}>
          <circleGeometry args={[r * 0.28, 3]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} side={2} transparent opacity={q(one, 20)} />
        </mesh>
      )}
    </group>
  );
};

// ------------------------------------------------------------------ places and things

/** A drafting table made of light: a dark slab with a glowing grid top and a lit edge. */
export const LightTable: React.FC<Group & { w?: number; d?: number; lit?: number }> = ({ w = 7, d = 4, lit = 1, ...g }) => (
  <group {...g}>
    <Block size={[w, 0.18, d]} radius={0.05} material={mat("glossy", "#0d1222")} position={[0, -0.09, 0]} />
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]}>
      <planeGeometry args={[w * 0.96, d * 0.94, 24, 14]} />
      <meshBasicMaterial color="#2f6fff" wireframe transparent opacity={q(0.22 * lit, 20)} toneMapped={false} />
    </mesh>
    <mesh position={[0, -0.02, d / 2 + 0.005]}>
      <planeGeometry args={[w, 0.05]} />
      <meshBasicMaterial color={TECH.cyan} toneMapped={false} transparent opacity={q(0.5 + 0.5 * lit)} />
    </mesh>
  </group>
);

/** A small seven-bar counter plate standing on the table (its text comes from the beat as a word label). */
export const Plinth: React.FC<Group & { w?: number; lit?: number; color?: string }> = ({ w = 1.4, lit = 1, color = AMBER, ...g }) => (
  <group {...g}>
    <Block size={[w, 0.5, 0.12]} radius={0.04} material={mat("glossy", "#0a0d18")} position={[0, 0.25, 0]} />
    <mesh position={[0, 0.25, 0.065]}>
      <planeGeometry args={[w * 0.9, 0.04]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={q(0.3 + 0.7 * lit)} />
    </mesh>
  </group>
);

/** A shelf of game boxes. `lit[i]` 0..1 lights box i cyan (a triangle game); `curve` lights one box amber. */
export const GameShelf: React.FC<Group & { lit?: (i: number) => number; curve?: number; curveIdx?: number; badge?: (i: number) => number; dim?: number }> = ({
  lit = () => 0, curve = 0, curveIdx = 5, badge = () => 0, dim = 0, ...g
}) => {
  const n = 9;
  return (
    <group {...g}>
      {[0, 1].map((row) => (
        <Block key={row} size={[6.2, 0.1, 1.1]} radius={0.02} material={mat("brushed", "#3a3f4c")} position={[0, row * 1.55, 0]} />
      ))}
      <Block size={[0.12, 3.3, 1.1]} radius={0.02} material={mat("brushed", "#3a3f4c")} position={[-3.1, 1.55, 0]} />
      <Block size={[0.12, 3.3, 1.1]} radius={0.02} material={mat("brushed", "#3a3f4c")} position={[3.1, 1.55, 0]} />
      {Array.from({ length: n * 2 }, (_, i) => {
        const row = i < n ? 0 : 1;
        const col = i % n;
        const x = -2.7 + col * 0.67;
        const isCurve = i === curveIdx;
        const k = isCurve ? curve : lit(i);
        const tone = isCurve ? AMBER : TECH.cyan;
        const h = 1.05 + rnd("box", i) * 0.25;
        return (
          <group key={i} position={[x, row * 1.55 + 0.05 + h / 2, 0.05]} rotation-z={(rnd("tilt", i) - 0.5) * 0.04}>
            <Block size={[0.5, h, 0.8]} radius={0.03} material={mat("glossy", k > 0.05 ? "#1a2a44" : `hsl(225, 12%, ${q(16 - 8 * dim, 1)}%)`)} />
            {/* the box's spine glows when the game is out */}
            <mesh position={[0, 0, 0.405]}>
              <planeGeometry args={[0.42, h * 0.86]} />
              <meshBasicMaterial color={tone} toneMapped={false} transparent opacity={q(0.06 + 0.8 * k, 20)} />
            </mesh>
            {/* a game pad printed on every box: a d-pad and two buttons */}
            <group position={[0, -h * 0.12, 0.41]}>
              <mesh><planeGeometry args={[0.22, 0.06]} /><meshBasicMaterial color={k > 0.05 ? "#ffffff" : "#8a93a8"} toneMapped={false} /></mesh>
              <mesh><planeGeometry args={[0.06, 0.22]} /><meshBasicMaterial color={k > 0.05 ? "#ffffff" : "#8a93a8"} toneMapped={false} /></mesh>
              <mesh position={[0.02, -0.22, 0]}><circleGeometry args={[0.045, 16]} /><meshBasicMaterial color={k > 0.05 ? TECH.pink : "#6d7488"} toneMapped={false} /></mesh>
              <mesh position={[0.13, -0.17, 0]}><circleGeometry args={[0.045, 16]} /><meshBasicMaterial color={k > 0.05 ? TECH.lime : "#6d7488"} toneMapped={false} /></mesh>
            </group>
            {badge(i) > 0.05 && (
              <mesh position={[0, h * 0.28, 0.41]} scale={q(badge(i), 10)}>
                <circleGeometry args={[0.15, 3]} />
                <meshBasicMaterial color={TECH.white} toneMapped={false} />
              </mesh>
            )}
            {isCurve && curve > 0.05 && (
              <mesh position={[0, h * 0.28, 0.41]} scale={q(curve, 10)}>
                <circleGeometry args={[0.15, 32, 0, Math.PI]} />
                <meshBasicMaterial color={TECH.white} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/** An old beige PC: a tower, a CRT monitor with a glowing screen, a keyboard. Screen content is a child. */
export const OldPC: React.FC<Group & { on?: number; children?: React.ReactNode }> = ({ on = 1, children, ...g }) => (
  <group {...g}>
    <Block size={[5, 0.12, 2.6]} radius={0.03} material={mat("glossy", "#2a2018")} position={[0, -0.06, 0]} />
    {/* tower */}
    <Block size={[0.9, 2.1, 1.8]} radius={0.05} material={mat("clay", "#cfc4a8")} position={[-1.9, 1.05, -0.2]} />
    <Block size={[0.6, 0.12, 0.02]} radius={0.01} material={mat("clay", "#a89f86")} position={[-1.9, 1.7, 0.71]} />
    <mesh position={[-1.75, 0.5, 0.71]}>
      <circleGeometry args={[0.05, 16]} />
      <meshBasicMaterial color={on > 0.5 ? TECH.lime : "#334"} toneMapped={false} />
    </mesh>
    {/* CRT */}
    <Block size={[2.2, 1.9, 1.7]} radius={0.12} material={mat("clay", "#d8ceb2")} position={[0.6, 1.35, -0.4]} />
    <Block size={[1.0, 0.25, 0.8]} radius={0.04} material={mat("clay", "#cfc4a8")} position={[0.6, 0.15, -0.4]} />
    <mesh position={[0.6, 1.4, 0.46]}>
      <planeGeometry args={[1.8, 1.4]} />
      <meshBasicMaterial color="#0b1a2e" toneMapped={false} />
    </mesh>
    <mesh position={[0.6, 1.4, 0.462]}>
      <planeGeometry args={[1.76, 1.36, 12, 9]} />
      <meshBasicMaterial color="#38a8ff" wireframe toneMapped={false} transparent opacity={q(0.08 + 0.3 * on, 20)} />
    </mesh>
    <pointLight position={[0.6, 1.4, 1.6]} intensity={q(2 + 6 * on)} color="#7fc8ff" distance={6} />
    {/* keyboard */}
    <Block size={[1.9, 0.08, 0.6]} radius={0.03} material={mat("clay", "#cdc2a6")} position={[0.4, 0.04, 0.85]} />
    <group position={[0.6, 1.4, 0.47]}>{children}</group>
  </group>
);

/** A low-poly race car built from triangles (the game on the CRT); `built` 0..1 fills it in. */
export const TriCar: React.FC<Group & { built?: number; flash?: number }> = ({ built = 1, flash = 0, ...g }) => (
  <group {...g} scale={[1, Math.max(0.02, built), 1]}>
    <mesh scale={[1, 0.32, 0.45]}>
      <icosahedronGeometry args={[0.6, 0]} />
      <meshBasicMaterial color={flash > 0.3 ? TECH.white : TECH.cyan} wireframe toneMapped={false} />
    </mesh>
    <mesh position={[0.05, 0.16, 0]} scale={[0.45, 0.22, 0.35]}>
      <icosahedronGeometry args={[0.6, 0]} />
      <meshBasicMaterial color={TECH.cyan} wireframe toneMapped={false} />
    </mesh>
    {[-0.38, 0.38].map((x) => (
      <mesh key={x} position={[x, -0.18, 0.1]}>
        <circleGeometry args={[0.13, 5]} />
        <meshBasicMaterial color={AMBER} wireframe toneMapped={false} />
      </mesh>
    ))}
  </group>
);

/** A chip whose brushed lid lifts off (`open` 0..1) to show the glowing die. */
export const OpenChip: React.FC<Group & { size?: number; open?: number; lit?: number; seed?: string }> = ({ size = 2, open = 0, lit = 0.5, seed = "nv1", ...g }) => (
  <group {...g}>
    <ChipPackage size={size} lid={false} seed={seed} lit={q(lit)} />
    <group position={[0, 0.15 + 3.2 * open, -1.6 * open]} rotation-x={-0.5 * open} visible={open < 0.6}>
      <Block size={[size * 0.82, 0.06, size * 0.82]} radius={0.03} preset="brushed" />
    </group>
  </group>
);

/** A big modern GPU module: a board, one huge package with a lit die, memory stacks around it. */
export const BigModule: React.FC<Group & { lit?: number; seed?: string }> = ({ lit = 0.6, seed = "rubin", ...g }) => (
  <group {...g}>
    <Block size={[5.2, 0.1, 3.6]} radius={0.04} preset="pcbDark" position={[0, 0.05, 0]} />
    <ChipPackage size={2.4} lid={false} seed={seed} lit={q(lit)} position={[0, 0.1, 0]} />
    {[-1, 1].map((sx) => [-0.7, 0, 0.7].map((z) => (
      <Block key={`${sx}${z}`} size={[0.42, 0.22, 0.55]} radius={0.02} material={mat("glossy", "#1c1f27")} position={[sx * 1.55, 0.21, z]} />
    )))}
    <mesh position={[0, 0.4, 0]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1.4, 1.4]} />
      <meshBasicMaterial color={NV_GREEN} toneMapped={false} transparent opacity={q(0.15 * lit, 20)} />
    </mesh>
  </group>
);

/** A balance beam on a post: `tip` -1..1 (positive = right side down). */
export const Balance: React.FC<Group & { tip?: number; show?: number; size?: number }> = ({ tip = 0, show = 1, size = 1, ...g }) => (
  <group {...g} scale={Math.max(0.01, show) * size}>
    <Block size={[0.14, 1.6, 0.14]} radius={0.03} material={mat("brushed", "#9aa3b5")} position={[0, 0.8, 0]} />
    <group position={[0, 1.65, 0]} rotation-z={-0.22 * tip}>
      <Block size={[3.6, 0.08, 0.12]} radius={0.03} material={mat("brushed", "#c3cad8")} />
      <mesh position={[-1.75, -0.1, 0]}><sphereGeometry args={[0.12, 16, 12]} /><meshBasicMaterial color={AMBER} toneMapped={false} /></mesh>
      <mesh position={[1.75, -0.1, 0]}><sphereGeometry args={[0.12, 16, 12]} /><meshBasicMaterial color={TECH.cyan} toneMapped={false} /></mesh>
    </group>
  </group>
);

/** A soft pool of spotlight on the floor. */
export const Pool: React.FC<Group & { r?: number; k?: number; color?: string }> = ({ r = 2.4, k = 1, color = "#fff3dc", ...g }) => (
  <mesh rotation-x={-Math.PI / 2} {...(g as object)}>
    <circleGeometry args={[r, 64]} />
    <meshBasicMaterial color={color} transparent opacity={q(0.18 * k, 20)} toneMapped={false} />
  </mesh>
);

/** Sparks of a shattering dome: seeded shards flying out from `at` over `k` 0..1. */
export const Shards: React.FC<{ at: V3; k: number; n?: number }> = ({ at, k, n = 26 }) => (
  <group position={at}>
    {k > 0 && k < 1 && Array.from({ length: n }, (_, i) => {
      const a = rnd("shard", i) * Math.PI * 2;
      const up = 0.4 + rnd("shard-u", i) * 1.4;
      const sp = 1 + rnd("shard-s", i) * 2.2;
      const p: V3 = [Math.cos(a) * sp * k, up * k * 2 - 4.9 * k * k, Math.sin(a) * sp * k];
      return (
        <mesh key={i} position={p} rotation={[a, a * 2, a * 3]}>
          <circleGeometry args={[0.09 + 0.06 * rnd("shard-r", i), 3]} />
          <meshBasicMaterial color={i % 3 ? AMBER : "#fff1d0"} toneMapped={false} side={2} transparent opacity={q(1 - k, 20)} />
        </mesh>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ overlays (DOM over the 3D)

/** The real NV1 card (Diamond Edge 3D, public domain photo), cut out, turning slowly in a spotlight. */
export const RealCard: React.FC<{ x: number; y: number; w: number; turn: number; tilt?: number; k?: number; glowK?: number }> = ({ x, y, w, turn, tilt = 0, k = 1, glowK = 0 }) => (
  <div style={{
    position: "absolute", left: x - w / 2, top: y, width: w, opacity: k,
    transform: `perspective(1800px) rotateY(${turn}deg) rotateX(${tilt}deg) scale(${0.85 + 0.15 * k})`,
    filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 ${Math.round(40 * glowK)}px rgba(118,185,0,${(0.7 * glowK).toFixed(2)}))`,
  }}>
    <Img src={staticFile("real/nv1board-cut.png")} style={{ width: "100%" }} />
  </div>
);

/** A 1990s wordmark (public domain: NVIDIA's or Microsoft's), writing on from the left (`k` 0..1). */
export const OldLogo: React.FC<{ x: number; y: number; w: number; k: number; file?: string }> = ({ x, y, w, k, file = "nvidiaold-cut.png" }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, clipPath: `inset(0 ${Math.round((1 - k) * 100)}% 0 0)`, opacity: Math.min(1, k * 3) }}>
    <Img src={staticFile(`real/${file}`)} style={{ width: "100%", filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))" }} />
  </div>
);

export { glow };

const Parts = { SmoothDome, TriDome, LightTable, Plinth, GameShelf, OldPC, TriCar, OpenChip, BigModule, Balance, Pool, Shards, RealCard, OldLogo };
export default Parts;
