// Unit (3D, the shared world): every beat set at the Texas City isomerization unit. Params pick the shot
// (`shot`: a camera move from a start pose to an end pose across the beat), the phase (`phase`: normal,
// geyser, cloud, blast, after, cleared, with the words that start them), what glows on which word
// (pipeFill, valvesOpen, drumFill, burners, spark), labels pinned to the parts, and readouts carrying the
// beat's figures (`tag`, `toll`, the date caption). Figures come only from params.fig.
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, Debris, DisasterStage, Focus, Label3D, type CamKey, type V3 } from "../../three/index";
import { Aftermath, Blast, Blowdown, Column, DRUM, Furnace, Geyser, Overhead, PIPE_X, Site, STACK_TOP, TOWER_H, TRUCK, Truck, Vapour, VALVE_Y } from "./refinery";
import { AMBER, figOf, INK, kitClock, MonoCaption, moments, Overlay, Readout } from "./ui";

type Shot = { a: V3; la: V3; b: V3; lb: V3; fov?: number };
const SHOTS: Record<string, Shot> = {
  hook: { a: [-14, 6, 20], la: [3, 7, 0], b: [-10, 7, 16], lb: [3, 8, 0] },
  loop: { a: [-10, 7, 16], la: [3, 8, 0], b: [-14, 6, 20], lb: [3, 7, 0] },
  aerial: { a: [-30, 40, 45], la: [4, 0, 0], b: [-22, 33, 37], lb: [4, 2, 0] },
  wide: { a: [-16, 8, 18], la: [2, 4, -2], b: [-12, 7, 15], lb: [3, 4, -2] },
  dawn: { a: [-15, 6, 17], la: [2, 5, -2], b: [-12, 6, 15], lb: [3, 5, -2] },
  trailerrow: { a: [0, 2.5, 22], la: [10, 1, 12], b: [4, 2.5, 22], lb: [12, 1, 12] },
  tilt: { a: [4.2, 1.6, 6.5], la: [0, 3, 0], b: [4.2, 1.6, 6.5], lb: [0, 15, 0], fov: 50 },
  furnace: { a: [-0.6, 2, 7.5], la: [-3.6, 1, 1.8], b: [-1.6, 1.8, 6.4], lb: [-3.6, 1, 1.8] },
  pipe: { a: [3.2, 17.5, 4.2], la: [PIPE_X, 17, 0], b: [3.4, 4.5, 4.6], lb: [PIPE_X, 3, 0] },
  valves: { a: [3.2, 2.9, 2.8], la: [1.35, VALVE_Y, 0], b: [2.6, 2.6, 2.1], lb: [1.35, VALVE_Y, 0] },
  drum: { a: [4, 3, 6.5], la: [8, 1.5, 0], b: [5, 2.6, 5.2], lb: [8, 1.6, 0] },
  stack: { a: [-2, 4, 15], la: [8, 8, 0], b: [0, 5, 12.5], lb: [8, 10, 0] },
  spray: { a: [5.6, 1.2, 4.5], la: [8, 3, 0], b: [6.2, 1.4, 3.8], lb: [8, 5, 0] },
  truck: { a: [13, 1.3, 6], la: [9.2, 0.6, 1.6], b: [12.2, 1.2, 5], lb: [9.4, 0.6, 1.8] },
  truckclose: { a: [11.4, 0.9, 3.9], la: [9.6, 0.5, 2.1], b: [10.8, 0.8, 3.2], lb: [9.6, 0.5, 2.1] },
  cloudhigh: { a: [-6, 16, 24], la: [8, 0, 5], b: [-4, 15, 20], lb: [8, 0, 6] },
  blast: { a: [-12, 6, 26], la: [8, 2, 6], b: [-12.6, 6.3, 26.8], lb: [8, 2.5, 6] },
  trailers: { a: [2, 3, 21], la: [10, 1, 12], b: [5, 3, 19.5], lb: [11, 1, 12] },
  high: { a: [-10, 22, 30], la: [7, 0, 6], b: [-8, 24, 28], lb: [7, 0, 6] },
  town: { a: [-6, 3, 40], la: [5, 6, 0], b: [-4, 3.5, 38], lb: [5, 7, 0] },
  cleared: { a: [0, 10, 27], la: [10, 0, 12], b: [2, 12, 26], lb: [10, 0, 11] },
};
const TARGET: Record<string, V3> = {
  tower: [0, TOWER_H * 0.75, 0], top: [0, TOWER_H + 0.3, 0], valves: [1.35, VALVE_Y, 0], drum: [DRUM[0], 2.2, 0], stack: [DRUM[0], STACK_TOP, 0],
  truck: [TRUCK[0], 0.9, TRUCK[2]], trailers: [10, 1.2, 12], furnace: [-3.6, 2.6, 1.8], unit: [2, 6, 0],
};

type Lab = { at: string; text: string; target: string; sub?: string };
type Tag = { at: string; fig: string; label: string };
type Params = {
  shot?: string; phase?: string; geyserAt?: string; blastAt?: string; fire?: boolean; toll?: boolean; caption?: string; tag?: Tag; labels?: Lab[];
  pipeFill?: string; valvesOpen?: string; drumFill?: string; burners?: string; spark?: string; flow?: string;
};

const Unit: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (name?: string) => (name && ev[name] !== undefined ? ev[name]! : 1e9);
  const S = SHOTS[P.shot ?? "wide"] ?? SHOTS.wide!;
  const end = Math.max(m.end, 30);
  const keys: CamKey[] = [{ f: 0, pos: S.a, look: S.la, fov: S.fov ?? 42 }, { f: end + 10, pos: S.b, look: S.lb, fov: S.fov ?? 42 }];
  const phase = P.phase ?? "normal";
  const after = phase === "after", cleared = phase === "cleared";
  const geyser = phase === "geyser" ? cue(t, e(P.geyserAt), 20) : 0;
  const cloud = phase === "cloud" ? 0.45 + 0.55 * cue(t, 0, Math.max(30, end), (x) => x) : phase === "blast" ? 1 - cue(t, e(P.blastAt), 6) : 0;
  const blastK = phase === "blast" ? cue(t, e(P.blastAt), 60, (x) => x) : 0;
  const fig = (n?: string) => figOf(p, n);
  const dawn = P.shot === "dawn";
  return (
    <DisasterStage look="storm" floor={false} dof={1.2} shadowBox={24} light={dawn ? 0.55 : after ? 0.6 : 0.9} fog={{ color: after ? "#2a2a2c" : "#3a434d", near: 30, far: 110 }}
      overlay={
        <Overlay t={t} marks={Object.values(ev)} text={after || cleared ? "3D reconstruction · after the explosion" : undefined}>
          {P.caption === "date" && <MonoCaption t={t} at={-80} text={`MARCH ${fig("day")}, ${fig("year")} · TEXAS CITY, TEXAS`} size={34} color={t >= e("march") && t < e("march") + 12 ? AMBER : "#ffd84a"} />}
          {P.caption === "date" && <MonoCaption t={t} at={e("refinery")} text="BP REFINERY · ISOMERIZATION UNIT" top={164} size={30} color={INK} />}
          {P.tag && <Readout x={1240} y={170} label={P.tag.label} k={cue(t, e(P.tag.at), 12)} value={countText(fig(P.tag.fig), cue(t, e(P.tag.at), 20))} />}
          {P.toll && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "'Playfair Display', Georgia, serif", color: INK }}>
              <div style={{ fontSize: 76, opacity: cue(t, e("died"), 16) }}>{fig("dead")} people died</div>
              <div style={{ fontSize: 56, marginTop: 18, opacity: cue(t, e("injured"), 16) * 0.85 }}>{fig("hurt")} injured</div>
            </div>
          )}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.02} />
      <Focus at={S.lb} range={14} />
      <directionalLight position={[-20, 30, 15]} intensity={dawn ? 0.6 : 1.4} color={dawn ? "#ffb070" : "#fff4e0"} castShadow />
      <ambientLight intensity={0.25} color="#8fa0b4" />
      <Site trailers={cleared ? 0 : 1} crush={after ? 1 : 0} town={P.shot === "town"} frame={t} />
      <Column />
      <Overhead fill={cue(t, e(P.pipeFill), 30)} valves={Math.max(cue(t, e(P.valvesOpen), 8), geyser > 0 ? 1 : 0)} flow={Math.max(cue(t, e(P.valvesOpen) + 6, 30), cue(t, e(P.drumFill), 30), geyser > 0 ? 1 : 0)} />
      <Blowdown fill={Math.max(cue(t, e(P.drumFill) + 10, 40), geyser > 0 || cloud > 0 ? 1 : 0)} />
      <Furnace burn={P.burners ? cue(t, e(P.burners), 20) : dawn ? 0 : 0.8} />
      {!after && !cleared && <Truck frame={t} spark={P.spark ? cue(t, e(P.spark), 4) * (0.6 + 0.4 * Math.sin(t)) : 0} />}
      <Geyser frame={t} k={geyser} />
      <Vapour frame={t} k={P.shot === "truck" || P.shot === "truckclose" || P.shot === "spray" ? cloud * 0.4 : cloud} />
      <Blast k={blastK} />
      {phase === "blast" && <Debris at={[DRUM[0] + 1, 1, 3]} count={60} spread={2} dir={[0, 1, 0]} speed={4} size={0.12} start={0.05} seconds={2} slow={0.6} gravity={4} floor={0} kind="metal" seed="blast" progress={blastK} />}
      {(after || (phase === "blast" && blastK > 0.5)) && <Aftermath frame={t + 200} fire={P.fire || phase === "blast" ? 1 : 0.5} />}
      {(P.labels ?? []).map((l, i) => t >= e(l.at) && (
        <Label3D key={i} at={TARGET[l.target] ?? TARGET.unit!} offset={[-1.5, 1.2, 0.8]} text={l.text} sub={l.sub} start={K(e(l.at))} color="#ffd84a" px={44} />
      ))}
    </DisasterStage>
  );
};

export default Unit;
