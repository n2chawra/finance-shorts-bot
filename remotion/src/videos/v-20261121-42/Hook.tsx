// Hook: "A train with no one aboard reached Lac-Mégantic. How?"
// Frame 0: beside the line at night, the runaway's headlights coming at the camera, LAC-MÉGANTIC and the
// dated caption on screen; cut inside the cab on "aboard" (the lamp on, the seat empty, NO ONE ABOARD types
// on, the trees streaming past the window, "reached"); cut low by the rails on "How" as the tank cars streak by.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { AMBER, CAB, Consist, DateCaption, Line, MONO, Shot3D, TownLights, Trees, vehX } from "./World";

type Params = { fig?: { year?: string } };
export const V = 0.22;          // the runaway's speed, units a frame
export const X0 = -4;           // the train's front at frame 0

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const aboard = m.at("aboard", 20), hit = m.at("how", 60);
  const inCab = f >= aboard && f < hit;
  const travelled = X0 + V * f;
  const cabX = vehX(0) + CAB[0];
  const keys = inCab
    ? direct({}, [
        { at: 0, move: "hold", pos: [cabX + 0.55, 1.26, 0.95], look: [cabX - 0.05, 1.02, 0.12], fov: 46 },
        { at: aboard, move: "cut", pos: [cabX + 0.55, 1.26, 0.95], look: [cabX - 0.05, 1.02, 0.12], fov: 46 },
        { at: aboard + 1, move: "push", look: [cabX - 0.05, 1.0, 0.12], dir: [0.55, 0.22, 0.8], from: 1.18, to: 0.9, dur: Math.max(8, hit - aboard) },
      ])
    : f < aboard
      ? direct({}, [
          { at: 0, move: "push", look: [-4.6, 0.85, 0], dir: [0.95, 0.06, 0.45], from: 7.4, to: 6.6, dur: Math.max(8, aboard), fov: 42 },
        ])
      : direct({}, [
          { at: 0, move: "hold", pos: [2.6, 0.32, 1.25], look: [-6, 0.75, -0.1], fov: 40 },
          { at: hit, move: "cut", pos: [2.6, 0.32, 1.25], look: [-6, 0.75, -0.1], fov: 40 },
          { at: hit + 1, move: "pullback", look: [-6, 0.8, -0.1], dir: [0.8, 0.12, 0.3], from: 9.3, to: 10.2, dur: Math.max(10, m.end - hit) },
        ]);
  // inside the cab the train stays put and the world streams past instead
  const worldShift = inCab ? -(V * f) % 40 : 0;
  return (
    <Shot3D f={f}
      overlay={
        <>
          <DateCaption t={f} at={0} title="LAC-MÉGANTIC" titleAt={-60} line={`JULY ${fig.year ?? ""} · QUEBEC`} />
          {inCab ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center" }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, letterSpacing: 5, color: AMBER, background: "rgba(8,10,14,0.74)", padding: "8px 22px" }}>
                {"NO ONE ABOARD".slice(0, Math.max(0, Math.floor((f - aboard - 3) * 1.6)))}
              </span>
            </div>
          ) : null}
          <SourceLine p={p} y={1290} />
        </>
      }>
      <Camera3D keys={keys} seed="lm-hook" drift={inCab ? 0.004 : 0.012} />
      <Focus at={inCab ? [cabX, 1.0, 0.15] : [-4, 0.8, 0]} range={inCab ? 0.6 : 6} />
      <group position={[worldShift, 0, 0]}>
        <Line length={120} x={-20} />
        <Trees from={-70} to={50} seed="hook-trees" clear={[-2, 12]} />
        <TownLights at={[40, 0, -14]} spread={[30, 10]} n={110} seed="hook-town" />
      </group>
      <Consist cars={14} travelled={inCab ? 0 : travelled} loco={{ lamp: 1, head: 1 }} />
      {!inCab && f >= hit ? <pointLight position={[0, 0.25, 0.4]} intensity={1.2 + 0.8 * Math.abs(Math.sin(f * 1.7))} distance={2.5} color="#ffb060" /> : null}
    </Shot3D>
  );
};
export default Hook;
