// Route: the whole trip laid out on a long dark map table, six lit stations joined by a glowing track:
// a phone, a blade, a column of number bars, a glass tower of layers, a chip, a field of picker stalks; the
// track loops back. A lectern with the research paper stands at the head of the table. Actions: track,
// sphone, sblade, snum, stower, schip, spick, tiles, rise, grid, tile, loop, pulse, paper, pages, stamp, table, plate.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, ChipPackage, FigLabel3D, glow, mat, Phone as PhoneModel, TECH, type V3 } from "../../three/index";
import { Beam, Column, DotGrid, NIGHT, Pulse, q, Shot, Tile, TOK, useBeat, Words, type Anchor } from "./kit";

const ST: Record<string, V3> = { phone: [-7.5, 0, 0], cut: [-4.5, 0, 0], num: [-1.5, 0, 0], tower: [1.5, 0, 0], chip: [4.5, 0, 0], pick: [7.5, 0, 0] };
const PAPER: V3 = [-11.5, 0, 1.2];

const Route: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const lit = (name: string) => k(name, 12);
  const track = k("track", 30);
  const loop = k("loop", 24);
  const rise = has("rise") ? ((f - at("rise")) / 40) % 1 : -1;
  const tileT = has("tile") ? Math.min(1, Math.max(0, (f - at("tile")) / 45)) : -1;
  const pulse = has("pulse") ? (((f - at("pulse")) / 50) % 1) : -1;
  const anchors: Record<string, Anchor> = {
    all: { look: [0, 0.6, 0], dir: [0.1, 0.9, 1], d: 13 },
    cut: { look: ST.cut!, dir: [0.25, 0.8, 1], d: 6 },
    num: { look: ST.num!, dir: [0.25, 0.8, 1], d: 6 },
    tower: { look: [ST.tower![0], 1, 0], dir: [0.25, 0.7, 1], d: 6 },
    chip: { look: ST.chip!, dir: [0.25, 0.8, 1], d: 6 },
    pick: { look: [ST.pick![0], 0.6, 0], dir: [0.2, 0.8, 1], d: 6 },
    paper: { look: [PAPER[0] + 0.3, 1.5, PAPER[2]], dir: [0.3, 0.75, 1], d: 4.2 },
  };
  const pos = (on: string): V3 => on === "paper" ? [PAPER[0], 2.6, PAPER[2]] : ST[on] ? [ST[on]![0], 1.8, 0.6] : [0, 2, 0];
  const pts: V3[] = [ST.phone!, ST.cut!, ST.num!, ST.tower!, ST.chip!, ST.pick!].map((v) => [v[0], 0.12, 1.4] as V3);
  const n = pts.length - 1;
  return (
    <Shot p={p} b={b} anchors={anchors} seed="route" backdrop={NIGHT} floor={false} bloom={1.15} light={0.9} dust={{ c: [0, 1, 0], r0: 9, r1: 22, size: 0.4, color: "#a8c8ff" }}>
      {/* the map table */}
      <Block size={[26, 0.3, 6]} radius={0.06} material={mat("clay", "#121a2c", { roughness: 0.7 })} position={[-1.5, -0.15, 0.4]} />
      <DotGrid x0={-14} x1={11} y0={0.01} y1={0.02} z={-2.4} gap={0.5} size={0.06} color="#1d2a48" glowing />
      {/* the track, drawing on station to station, and the loop back under the table edge */}
      {pts.slice(1).map((pt, i) => {
        const t = Math.max(0, Math.min(1, track * n - i));
        const a = pts[i]!;
        return t > 0 ? <Beam key={i} a={a} b={[a[0] + (pt[0] - a[0]) * t, 0.12, 1.4]} r={0.05} color={TECH.cyan} o={0.9} /> : null;
      })}
      {loop > 0 && <><Beam a={pts[n]!} b={[pts[n]![0], 0.12, 2.8]} r={0.05} color={TECH.amber} o={q(loop)} /><Beam a={[pts[n]![0], 0.12, 2.8]} b={[pts[n]![0] + (pts[0]![0] - pts[n]![0]) * loop, 0.12, 2.8]} r={0.05} color={TECH.amber} o={0.9} /></>}
      {pulse >= 0 && <Pulse a={pts[0]!} b={pts[n]!} t={pulse} r={0.16} color={TECH.white} />}
      {/* the stations */}
      {Object.entries(ST).map(([name, v]) => (
        <mesh key={name} position={[v[0], 0.02, v[2]]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, q(0.1 + 0.35 * lit("s" + (name === "cut" ? "blade" : name === "num" ? "num" : name))))}>
          <circleGeometry args={[1.25, 40]} />
        </mesh>
      ))}
      <PhoneModel position={[ST.phone![0], 0.02, 0]} rotation-y={0.3} scale={0.55} glowScreen={0.3 + 0.6 * lit("sphone")} />
      <group position={[ST.cut![0], 0, 0]}>
        <Block size={[1.8, 0.12, 0.8]} radius={0.03} preset="brushed" position={[0, 0.06, 0]} />
        <mesh position={[0, 1.1 - 0.4 * lit("sblade"), 0]} material={mat("brushed", "#cfd6e2", { metalness: 1, roughness: 0.15 })}><boxGeometry args={[0.04, 0.7, 0.9]} /></mesh>
        {[0, 1, 2].map((i) => <Tile key={i} text="" color={TOK[i]!} w={0.5} position={[-0.6 + i * 0.6 + 0.3 * k("tiles", 14) * (i - 1), 0.45, 0.5]} scale={0.6} lit={lit("sblade")} />)}
      </group>
      <Column seed="rt-num" n={9} position={[ST.num![0] + 0.2, 0.2, 0]} color={TECH.lime} k={0.3 + 0.7 * lit("snum")} />
      <group position={[ST.tower![0], 0, 0]}>
        {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[0, 0.2 + i * 0.22, 0]} material={mat("glass", "#9fd8ff", { transparent: true, opacity: 0.35, emissive: TECH.cyan, emissiveIntensity: q(0.1 + 0.6 * lit("stower") * (rise >= 0 && Math.abs(rise * 12 - i) < 1.2 ? 2 : 0.5)) })}><boxGeometry args={[1.4, 0.04, 1.4]} /></mesh>)}
      </group>
      <ChipPackage position={[ST.chip![0], 0.02, 0]} scale={1.3} lid={false} lit={0.2 + 0.8 * Math.max(lit("schip"), k("grid", 20) * (0.6 + 0.4 * Math.sin(f * 0.5)))} seed="rt-chip" />
      <group position={[ST.pick![0], 0, 0]}>
        {Array.from({ length: 7 }, (_, i) => {
          const h = 0.3 + 0.9 * (i === 3 ? 1 : 0.6 * ((i * 37) % 7) / 7);
          const up = i === 3 ? lit("spick") * 0.8 : 0;
          return <mesh key={i} position={[-0.9 + i * 0.3, h / 2 + up / 2, 0]} material={glow(i === 3 ? TECH.amber : TECH.cyan, q(0.3 + 0.5 * lit("spick")))}><boxGeometry args={[0.16, h + up, 0.16]} /></mesh>;
        })}
      </group>
      {tileT >= 0 && <Tile text="" color={TECH.amber} w={0.5} scale={0.6} position={[pts[n]![0] + (pts[0]![0] - pts[n]![0]) * tileT, 0.5, 2.8 * Math.min(1, tileT * 6)]} lit={1} />}
      {/* the research paper on its lectern */}
      <group position={PAPER}>
        <Block size={[0.4, 1.2, 0.4]} radius={0.03} preset="brushed" position={[0, 0.6, 0]} />
        <group position={[0, 1.3, 0]} rotation-x={0.9}>
          <Block size={[2.1, 0.06, 1.45]} radius={0.02} preset="blackPlastic" />
          <mesh position={[-0.47, 0.04, 0]} rotation-x={-Math.PI / 2} rotation-z={k("pages", 20) * 0.4} material={mat("clay", "#f2efe6")}><planeGeometry args={[0.9, 1.2]} /></mesh>
          <mesh position={[0.47, 0.04, 0]} rotation-x={-Math.PI / 2} material={mat("clay", "#f2efe6", { emissive: "#fff1d0", emissiveIntensity: q(0.35 + 0.4 * k("paper", 12)) })}><planeGeometry args={[0.9, 1.2]} /></mesh>
          {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-0.47, 0.045, -0.45 + i * 0.1]} rotation-x={-Math.PI / 2} material={mat("clay", "#9a968c")}><planeGeometry args={[0.7, 0.025]} /></mesh>)}
          {has("stamp") && <mesh position={[0.75, 0.05, -0.45]} rotation-x={-Math.PI / 2} material={glow(TECH.amber, q(k("stamp", 8)))}><circleGeometry args={[0.1, 20]} /></mesh>}
        </group>
        {has("table") && b.fig.params && <FigLabel3D fig={b.fig.params} caption="parameters" at={[0.9, 2.3, 0.4]} start={at("table")} count={20} px={96} />}
        <pointLight position={[0.5, 2.6, 0.8]} intensity={4 + 3 * k("paper", 12) + 4 * k("glow", 10) + 3 * k("lamp", 8)} distance={5} color="#ffd9a0" />
      </group>
      <Words b={b} pos={pos} signAt={() => [PAPER[0], 0.75, PAPER[2] + 0.25]} signH={0.22} />
    </Shot>
  );
};
export default Route;
