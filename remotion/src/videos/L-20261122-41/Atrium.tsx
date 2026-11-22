// Atrium (3D, the shared world): every beat set inside the Hyatt Regency atrium. The beat's params pick
// the shot (`shot`: a camera move from a start pose to an end pose across the beat), the dance-floor light,
// what lights on which word (`lit` [{at, part}]: stack, second, third, fourth, rods, thirdrods, lowerrods),
// labels drawn to the walkways, the amber stress on the connections, the red failure chain along the
// fourth-floor walkway, the fallen state after the collapse with work lights, and readouts carrying
// the beat's figures (`counter`, `tag`, `toll`, `quote`). Figures come only from params.fig.
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, Debris, DisasterStage, Focus, Label3D, Smoke, type CamKey, type V3 } from "../../three/index";
import { Atrium as Lobby, LOWER_Y, ROD_Z, ROOF_Y, THIRD_Y, THIRD_Z, UPPER_Y, Walkways } from "./world";
import { AMBER, figOf, INK, kitClock, MonoCaption, moments, Overlay, RED, Readout } from "./ui";

type Shot = { a: V3; la: V3; b: V3; lb: V3; fov?: number };
const SHOTS: Record<string, Shot> = {
  hook: { a: [-12, 6.5, 14], la: [0, 4, -0.5], b: [-8, 5, 10], lb: [0, 3.8, 0] },
  loop: { a: [-7, 4.6, 9.4], la: [0, 3.8, 0], b: [-12, 6.5, 14], lb: [0, 4, -0.5] },
  side: { a: [10, 4.2, 11], la: [0, 3.8, -1], b: [6.5, 4.4, 10.5], lb: [-1, 3.8, -1] },
  third: { a: [4.5, 3.4, 4.2], la: [-1, 3.9, THIRD_Z], b: [-0.5, 3.4, 3.6], lb: [-4, 4, THIRD_Z] },
  stack: { a: [7.5, 1.4, 5.5], la: [0, 3.9, 0], b: [4.5, 1.2, 4.6], lb: [-1, 4, 0] },
  up: { a: [2.5, 0.8, 3.4], la: [0, 6, 0], b: [1.4, 0.8, 2.6], lb: [0, 7.2, -0.5] },
  roofrods: { a: [3.4, 6.2, 3.4], la: [0, 6.6, 0], b: [1.9, 6.6, 2.5], lb: [0, 7.3, 0] },
  floor: { a: [-3, 1.7, 9], la: [-3, 1, -3], b: [1, 1.9, 8], lb: [-2, 1.2, -3] },
  terrace: { a: [6, 2.5, 10], la: [0, 1.5, -2], b: [3, 2.7, 9], lb: [-1, 1.6, -2] },
  between: { a: [7.5, 3.9, 3.8], la: [0, 3.9, 0], b: [3.4, 3.9, 3.1], lb: [-1, 3.9, 0] },
  rail: { a: [8, 3.3, 1.9], la: [0, 2.9, 0.4], b: [-2, 3.3, 1.9], lb: [-8, 2.9, 0.4] },
  underfour: { a: [5.5, 4.2, 2.6], la: [0, 5.0, 0], b: [2, 4.4, 2], lb: [-1, 5.0, 0] },
  down: { a: [2.4, 7.3, 3.2], la: [0, 3.6, 0], b: [1.6, 7.2, 2.4], lb: [-0.5, 3.4, 0] },
  dive: { a: [-6, 7, 9], la: [0, 5, 0], b: [1.6, 5.0, 2.0], lb: [0.3, 4.9, 0.55] },
  along: { a: [7.5, 5.7, 2.7], la: [0, 5, 0], b: [5.5, 5.5, 2.8], lb: [-1, 5, 0] },
  afterrods: { a: [2.4, 1.5, 4.4], la: [0, 5, 0], b: [1.3, 3.4, 2], lb: [0, 6.2, 0.5] },
  rescue: { a: [-9.5, 3.2, 10.5], la: [0, 0.5, 0], b: [-8.2, 2.7, 9.2], lb: [0, 0.4, 0] },
  high: { a: [-6.5, 7.2, 8.5], la: [0, 0, 0], b: [-5, 7.3, 7], lb: [0, 0, 0] },
};
const TARGET: Record<string, V3> = { fourth: [-3, UPPER_Y + 0.55, 0.45], second: [-3.6, LOWER_Y + 0.55, 0.45], third: [-2, THIRD_Y + 0.55, THIRD_Z + 0.45] };

type Lit = { at: string; part: string };
type Lab = { at: string; text: string; target: string; sub?: string };
type Counter = { at: string; fig: string; figHigh?: string; label: string };
type Params = {
  shot?: string; dance?: number; lit?: Lit[]; labels?: Lab[]; counter?: Counter; tag?: Counter; quote?: { at: string; text: string };
  amber?: string; amberAll?: string; amberDeck?: string; amberThird?: string; ring?: string; chain?: string; sag?: string;
  after?: boolean; worklights?: string; toll?: boolean; ghostCols?: string; plumb?: string; band?: string; occupied?: string; caption?: string;
};

const Atrium: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (name?: string) => (name && ev[name] !== undefined ? ev[name]! : 1e9);
  const S = SHOTS[P.shot ?? "hook"] ?? SHOTS.hook!;
  const end = Math.max(m.end, 30);
  const keys: CamKey[] = [{ f: 0, pos: S.a, look: S.la, fov: S.fov ?? 42 }, { f: end + 10, pos: S.b, look: S.lb, fov: S.fov ?? 42 }];
  const lit: Record<string, number> = {};
  for (const l of P.lit ?? []) lit[l.part] = Math.max(lit[l.part] ?? 0, cue(t, e(l.at), 10));
  const after = !!P.after;
  const amberAll = cue(t, e(P.amberAll), 20) * 0.45;
  const amberMid = Math.max(amberAll, cue(t, e(P.amber), 14) * 0.4, P.ring ? cue(t, e(P.ring), 12) * 0.9 : 0, P.amberAll ? cue(t, e(P.amberAll) + 30, 20) * 0.6 : 0);
  const chain = cue(t, e(P.chain), 24);
  const hot4 = [Math.max(amberAll, chain > 0.5 ? 1 : chain * 0.9), Math.max(amberMid, P.chain ? 1 : 0), Math.max(amberAll, chain > 0.5 ? 1 : chain * 0.9)];
  const hot3 = [0, 1, 2].map(() => cue(t, e(P.amberThird), 16) * 0.5);
  const deck = cue(t, e(P.amberDeck), 16);
  const occ = P.occupied ? cue(t, e(P.occupied), 30) : (P.dance ?? 0) > 0.8 ? 0.6 : 0;
  const dim = after ? 0.75 : P.toll ? cue(t, e("died"), 20) * 0.5 : 0;
  const work = cue(t, e(P.worklights), 12);
  const ghostCols = P.ghostCols ? cue(t, e(P.ghostCols), 10) * (1 - cue(t, e(P.ghostCols) + 30, 10)) : 0;
  const plumb = cue(t, e(P.plumb), 12);
  const fig = (n?: string) => figOf(p, n);
  const deadT = e("died"), hurtT = e("injured");
  return (
    <DisasterStage look="nightGrid" floor="reflect" dof={1.2} shadowBox={11} fog={{ color: "#05080a", near: 18, far: 55 }}
      overlay={
        <Overlay t={t} marks={Object.values(ev)} text={after ? "3D reconstruction · after the collapse" : undefined}>
          {P.caption === "date" && <MonoCaption t={t} at={-80} text={`JULY ${fig("day")}, ${fig("year")} · KANSAS CITY, MISSOURI`} size={34} />}
          {P.caption === "date" && <MonoCaption t={t} at={e("hyatt")} text="HYATT REGENCY HOTEL · THE ATRIUM" top={164} size={30} color={INK} />}
          {P.counter && (
            <Readout x={1300} y={150} label={P.counter.label} k={cue(t, e(P.counter.at), 12)}
              value={P.counter.figHigh ? `${countText(fig(P.counter.fig), cue(t, e(P.counter.at), 24))}–${countText(fig(P.counter.figHigh), cue(t, e(P.counter.at) + 10, 24))}` : countText(fig(P.counter.fig), cue(t, e(P.counter.at), 24))} />
          )}
          {P.tag && <Readout x={1240} y={170} label={P.tag.label} k={cue(t, e(P.tag.at), 12)} value={countText(fig(P.tag.fig), cue(t, e(P.tag.at), 20))} color={AMBER} />}
          {P.quote && <MonoCaption t={t} at={e(P.quote.at)} text={P.quote.text} top={170} size={32} color={AMBER} />}
          {P.toll && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: "'Playfair Display', Georgia, serif", color: INK }}>
              <div style={{ fontSize: 76, opacity: cue(t, deadT, 16) }}>{fig("dead")} people died</div>
              <div style={{ fontSize: 56, marginTop: 18, opacity: cue(t, hurtT, 16) * 0.85 }}>{fig("hurt")} injured</div>
            </div>
          )}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.015} />
      <Focus at={S.lb} range={8} />
      <Lobby dance={P.dance ?? 0.35} frame={t} dim={dim} after={after} />
      {!after && <Walkways frame={t} lit={lit} occ={occ} hot4={hot4} hot3={hot3} sag={cue(t, e(P.sag), 20)} original={P.amberThird ? cue(t, e("original"), 12) : 0} />}
      {deck > 0 && <mesh position={[0, UPPER_Y + 0.06, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[12, 0.9]} /><meshBasicMaterial color={AMBER} transparent opacity={0.25 * deck + 0.15 * deck * Math.sin(t / 5)} /></mesh>}
      {after && (
        <>
          <Walkways frame={200 + t} fall={1} />
          <Debris at={[0, 0.2, 0]} count={50} spread={4.5} dir={[0, 1, 0]} speed={0.1} size={0.08} start={0} seconds={1} slow={1} gravity={3} floor={0.02} kind="concrete" seed="settled" progress={1} />
          <Smoke frame={t + 300} at={[0, 0, 0]} height={4} width={9} count={14} color="#9a8f80" opacity={0.18} wind={[0.1, 0, 0.05]} seed="haze" />
        </>
      )}
      {work > 0 && [[-5, 3.5], [5, 3.5], [0, -4]].map(([x, z], i) => (
        <group key={i} position={[x!, 0, z!]}>
          <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.03, 0.03, 2.4, 6]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh position={[0, 2.4, 0]}><boxGeometry args={[0.4, 0.25, 0.2]} /><meshBasicMaterial color="#fff6d8" /></mesh>
          <spotLight position={[0, 2.5, 0]} target-position={[0, 0, 0]} intensity={30 * work} distance={16} angle={0.9} penumbra={0.6} color="#fff1d0" />
        </group>
      ))}
      {ghostCols > 0 && [-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, LOWER_Y / 2, 0]}><cylinderGeometry args={[0.18, 0.18, LOWER_Y, 12]} /><meshBasicMaterial color={RED} transparent opacity={0.35 * ghostCols} /></mesh>
      ))}
      {plumb > 0 && <mesh position={[-5.5, (UPPER_Y + LOWER_Y) / 2, 0.5]}><boxGeometry args={[0.02, (UPPER_Y - LOWER_Y) * plumb, 0.02]} /><meshBasicMaterial color={AMBER} /></mesh>}
      {P.ring && t >= e(P.ring) && (
        <mesh position={[0, UPPER_Y - 0.33, ROD_Z]} rotation-x={Math.PI / 2}><torusGeometry args={[0.32 + 0.04 * Math.sin(t / 4), 0.025, 8, 40]} /><meshBasicMaterial color={RED} /></mesh>
      )}
      {(P.labels ?? []).map((l, i) => t >= e(l.at) && (
        <Label3D key={i} at={TARGET[l.target] ?? TARGET.fourth!} offset={l.target === "second" ? [-1.2, -0.9, 0.8] : [-1.2, 1.0, 0.6]} text={l.text} sub={l.sub}
          start={K(e(l.at) + i * 6)} color="#ffd84a" px={44} />
      ))}
      {P.ring && t >= e("east") && <Label3D at={[0, UPPER_Y - 0.3, ROD_Z]} offset={[1.0, 0.8, 0.6]} text="EAST END · MIDDLE BOX BEAM" start={K(e("east"))} color="#ff6a5c" px={44} />}
      {P.shot === "roofrods" && <pointLight position={[0, ROOF_Y - 0.5, 1]} intensity={3} distance={6} color="#ffe2b8" />}
    </DisasterStage>
  );
};

export default Atrium;
