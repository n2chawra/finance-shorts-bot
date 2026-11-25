// Rubin: "It sold, and NVIDIA never looked back. Today its newest chip, Rubin, packs {fact5} transistors."
// The RIVA chip glows on the dark stage, boxes stacking behind it (medium); "NVIDIA"/"never"/"back": a row
// of chips, each bigger than the last, runs into the dark and the camera follows; "today": a server hall
// lights round a huge modern GPU module (wide); "chip"/"Rubin": rise over its chip, labelled (close);
// "packs": its die lights in a wave; "transistors": the count rolls up, the tiny first chip beside it (wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, ChipPackage, direct, FigLabel3D, glow, InstancedField, Label3D, Place3D, Stage3D, TECH } from "../../three/index";
import { BigModule, GameShelf, NV_GREEN, k01, q } from "./Parts";

type Params = { fig?: { transistors?: string } };

const Rubin: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const it = m.at("it", 1);
  const sold = m.at("sold", 6);
  const nvidia = m.at("nvidia", 14);
  const never = m.at("never", 22);
  const back = m.at("back", 28);
  const today = m.at("today", 36);
  const newest = m.at("newest", 44);
  const chip = m.at("chip", 50);
  const rubin = m.at("rubin", 56);
  const packs = m.at("packs", 64);
  const count = m.at("count", 70);
  const count2 = m.at("count2", 76);
  const count3 = m.at("count3", 82);
  const tr = m.at("transistors", 74);
  const end = Math.max(m.end, tr + 24);
  const fig = (p.beat.params as Params).fig?.transistors ?? "";
  const hall = f >= today;
  const keys = hall
    ? direct({}, [
        { at: today, move: "pullback", look: [0, 0.6, 0], dir: [0.3, 0.6, 1], from: 8.5, to: 9.5, dur: Math.max(8, chip - today), fov: 35 },
        { at: chip, move: "push", look: [0, 0.5, 0.3], dir: [0.2, 0.9, 0.7], to: 4.6, dur: Math.max(8, tr - chip) },
        { at: tr, move: "pullback", look: [0.6, 0.6, 0.6], dir: [0.3, 0.6, 1], from: 5.5, to: 8.2, dur: Math.max(10, end - tr) },
      ])
    : direct({}, [
        { at: 0, move: "push", look: [-0.2, 0.6, -0.5], dir: [0.3, 0.45, 1], from: 4.8, to: 4.3, dur: Math.max(8, nvidia), fov: 35 },
        { at: nvidia, move: "fly", path: [[1, 2.6, 5], [5, 2.6, 5.5], [9, 2.8, 6], [12, 3, 6.5]], look: [9, 0.4, 0], dur: Math.max(10, today - nvidia) },
      ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0f1a1a", bottom: "#030607", glow: "rgba(118,185,0,0.12)" }} floor="reflect" bloom={1.1} dof={0} blur={1}>
        <Camera3D keys={keys} seed="v2521-rubin" />
        {!hall && (
          <group>
            <ChipPackage size={1.0} lid seed="riva" lit={0.5 + 0.4 * m.pulse(it + 4, 8)} />
            {/* boxes stacking up behind it: it sold */}
            {/* games built on it fill a store shelf behind it: it sold */}
            <GameShelf position={[0, 0, -1.8]} scale={0.55} lit={(i) => k01(f, sold + (i % 9) * 1.2 + (i >= 9 ? 4 : 0), 6)} badge={(i) => k01(f, sold + 4 + (i % 9), 6)} curve={0} curveIdx={-1} />
            {/* a row of chips, each bigger than the last, running into the dark */}
            {[1, 2, 3, 4, 5].map((i) => {
              const k = k01(f, nvidia + i * 3, 8);
              return <ChipPackage key={i} size={1.2 + i * 0.35} lid={i > 2} seed={`gen${i}`} lit={q(0.3 + 0.4 * k + 0.2 * m.pulse(never + i * 2, 6))} position={[i * 2.6, 0, 0]} scale={Math.max(0.02, k)} />;
            })}
          </group>
        )}
        {hall && (
          <group>
            <Place3D kind="serverHall" seed="v2521-hall" position={[0, 0, -2]} />
            <BigModule scale={1.25} lit={0.4 + 0.4 * k01(f, newest, 8) + 0.2 * m.pulse(packs + 4, 10) + 0.25 * m.pulse(count2 + 3, 8) + 0.25 * m.pulse(count3 + 3, 8)} />
            {f >= packs && <InstancedField cols={22} rows={22} spacing={0.06} start={packs} reveal={12} wave={20} waveColor={NV_GREEN} position={[0, 0.14, 0]} seed="rubin-field" />}
            <FigLabel3D fig={fig} caption="transistors" at={[0, 1.7, 0.4]} start={Math.min(count, tr)} count={28} px={120} />
            <Label3D at={[0, 0.3, -0.6]} offset={[0.2, 1.2, -0.2]} text="Rubin" start={rubin} px={66} color={NV_GREEN} align="center" />
            {/* the tiny first chip beside it */}
            <group position={[1.0, 0.12, 2.0]} visible={f >= tr - 10}>
              <ChipPackage size={0.45} lid={false} seed="nv1-die" lit={0.9} />
            </group>
            <Label3D at={[1.0, 0.2, 2.0]} offset={[-0.2, 0.7, 0.2]} text="the first chip" start={tr - 6} px={50} color={TECH.white} align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Rubin;
