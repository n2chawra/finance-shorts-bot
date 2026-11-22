// Lab (3D): the investigators' places. Modes (params.mode):
//   original  — the test lab: a steel test frame (two columns, a crosshead, a hydraulic ram) over a box-beam
//               mock-up on its hanger rod; the ram lowers on "tested", the lab lights come up on "lab";
//   test      — a mock-up slides in, the ram presses and the gauge climbs, the flange folds and the gauge drops;
//   warehouse — the debris warehouse: a walkway span lowers onto a platform scale, a beam section and a rod
//               lift away, a nut drops into an evidence tray;
//   scale     — close on the scale: the readout counts, the drawings' estimate beside it, the gap tag.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, Debris, DisasterStage, Focus, glow, type CamKey } from "../../three/index";
import { DisasterLookProvider, LoadGauge } from "../../disaster/index";
import { BeamCutaway } from "./cutaway";
import { figOf, MonoCaption, moments, Overlay, Readout, RECIPE } from "./ui";
import { useMats } from "./world";

type Params = { mode?: string };

const Lab: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const M = useMats();
  const mode = (p.beat.params as Params).mode ?? "original";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(m.end, 30);
  const store = mode === "warehouse" || mode === "scale";
  const keys: CamKey[] = mode === "scale"
    ? [{ f: 0, pos: [2.6, 1.6, 3.4], look: [0, 0.6, 0], fov: 38 }, { f: end + 10, pos: [1.8, 1.3, 2.6], look: [0, 0.6, 0], fov: 38 }]
    : store
      ? [{ f: 0, pos: [-7, 4.5, 9], look: [0, 1, 0], fov: 42 }, { f: end + 10, pos: [-5, 3.6, 7], look: [0.5, 0.8, 0], fov: 42 }]
      : [{ f: 0, pos: [5, 3, 6], look: [0, 1.8, 0], fov: 40 }, { f: end + 10, pos: [3.4, 2.4, 4.4], look: [0, 1.5, 0], fov: 40 }];
  const lights = mode === "original" ? 0.4 + 0.6 * cue(t, e("lab"), 14) : 1;
  const press = mode === "original" ? cue(t, e("tested"), 30) : mode === "test" ? cue(t, e("loaded"), 40) : 0;
  const broke = mode === "test" ? cue(t, e("failed"), 10, Easing.out(Easing.cubic)) : 0;
  const slideIn = mode === "test" ? cue(t, e("copies") - 10, 20) : 1;
  const gauge = mode === "test" ? Math.min(1, press * 0.95) * (1 - 0.7 * broke) : 0;
  const span = mode === "warehouse" ? 1 - cue(t, e("weighed"), 30) : 0;
  return (
    <DisasterStage look="nightGrid" floor="reflect" dof={0.9} shadowBox={8} fog={{ color: "#05080a", near: 10, far: 40 }}
      overlay={
        <Overlay t={t} marks={Object.values(ev)} text={store ? "3D reconstruction · the evidence warehouse" : "3D reconstruction · laboratory test"}>
          {mode === "test" && (
            <DisasterLookProvider value={RECIPE}>
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <LoadGauge x={1380} y={140} size={420} value={gauge} limit={1} unit="" label="ram load" limitLabel="" />
              </svg>
            </DisasterLookProvider>
          )}
          {mode === "scale" && <Readout x={1220} y={150} label="WEIGHED VS DRAWINGS" value={`+${countText(figOf(p, "pct"), cue(t, e("difference"), 18))}`} k={cue(t, e("weighed"), 12)} />}
          {mode === "scale" && <MonoCaption t={t} at={e("estimated")} text="DRAWING ESTIMATE · NOMINAL DEAD LOAD" top={420} size={30} />}
          {mode === "warehouse" && <MonoCaption t={t} at={e("nuts")} text="EVIDENCE · NUT AND WASHER" top={110} />}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.01} />
      <Focus at={[0, 1.2, 0]} range={4} />
      <mesh rotation-x={-Math.PI / 2} material={M.stone} receiveShadow><planeGeometry args={[40, 30]} /></mesh>
      {[-3, 0, 3].map((x) => (
        <group key={x}>
          <mesh position={[x, 5, 0]} material={glow("#e8fff2", Math.round(lights * 8) / 10)}><boxGeometry args={[1.6, 0.06, 0.3]} /></mesh>
          <pointLight position={[x, 4.6, 0]} intensity={5 * lights} distance={9} color="#eafff4" />
        </group>
      ))}
      <mesh position={[0, 2.5, -4]} material={M.wall} receiveShadow><boxGeometry args={[20, 5, 0.2]} /></mesh>
      {!store && (
        <group>
          {/* the test frame */}
          {[-1.3, 1.3].map((x) => <mesh key={x} position={[x, 1.8, 0]} material={M.steel} castShadow><boxGeometry args={[0.3, 3.6, 0.4]} /></mesh>)}
          <mesh position={[0, 3.7, 0]} material={M.steel} castShadow><boxGeometry args={[3.2, 0.4, 0.5]} /></mesh>
          <mesh position={[0, 0.1, 0]} material={M.dark} receiveShadow><boxGeometry args={[3.4, 0.2, 1.2]} /></mesh>
          <mesh position={[0, 3.2 - 0.6 * press, 0]} material={M.brass} castShadow><cylinderGeometry args={[0.28, 0.28, 0.8, 24]} /></mesh>
          <mesh position={[0, 2.75 - 0.6 * press, 0]} material={M.rod}><cylinderGeometry args={[0.12, 0.12, 0.2, 16]} /></mesh>
          {/* the mock-up: the box beam on its rod, scaled into the frame */}
          <group position={[(1 - slideIn) * 4, 1.4, 0]} scale={0.55} rotation-y={Math.PI / 2}>
            <BeamCutaway t={t} stress={mode === "test" ? press * 0.8 : 0} fold={broke * 0.8} drop={broke * 0.5} debris={broke} lowerRod={false} />
          </group>
        </group>
      )}
      {store && (
        <group>
          {/* racks of debris along the back */}
          {[-6, -3, 3, 6].map((x) => (
            <group key={x} position={[x, 0, -2.6]}>
              {[0.4, 1.2, 2.0].map((y) => <mesh key={y} position={[0, y, 0]} material={M.slab} castShadow><boxGeometry args={[2.4, 0.18, 1]} /></mesh>)}
              {[-1.2, 1.2].map((dx) => <mesh key={dx} position={[dx, 1.1, 0]} material={M.steel}><boxGeometry args={[0.06, 2.2, 1]} /></mesh>)}
            </group>
          ))}
          {/* the platform scale and a walkway span on it */}
          <mesh position={[0, 0.12, 0]} material={M.steel} receiveShadow castShadow><boxGeometry args={[5, 0.24, 1.6]} /></mesh>
          <group position={[0, 0.45 + span * 2, 0]}>
            <mesh material={M.deck} castShadow><boxGeometry args={[4.6, 0.14, 1.1]} /></mesh>
            {[-1.5, 0, 1.5].map((x) => <mesh key={x} position={[x, -0.14, 0]} material={M.beam}><boxGeometry args={[0.2, 0.16, 1.3]} /></mesh>)}
          </group>
          <mesh position={[3.2, 1.0, 0.8]} material={M.dark}><boxGeometry args={[0.6, 1.2, 0.3]} /></mesh>
          <mesh position={[3.2, 1.25, 0.96]} material={glow("#39ff9a", 0.9)}><planeGeometry args={[0.46, 0.22]} /></mesh>
          {mode === "warehouse" && (
            <>
              <mesh position={[-3.6, 0.5 + cue(t, e("beams"), 24) * 1.4, 1.6]} material={M.beam} castShadow><boxGeometry args={[0.6, 0.3, 0.3]} /></mesh>
              <mesh position={[-2.6, 0.5 + cue(t, e("rods"), 24) * 1.4, 1.8]} rotation-z={Math.PI / 2} material={M.rod} castShadow><cylinderGeometry args={[0.03, 0.03, 1.6, 8]} /></mesh>
              <mesh position={[2.2, 0.12, 2]} material={M.dark}><boxGeometry args={[0.9, 0.1, 0.6]} /></mesh>
              <mesh position={[2.2, 1.2 - cue(t, e("nuts"), 14, Easing.in(Easing.quad)) * 1.0, 2]} material={M.dark} castShadow><cylinderGeometry args={[0.08, 0.08, 0.08, 6]} /></mesh>
            </>
          )}
        </group>
      )}
      <Debris at={[0, 1.2, 0]} count={24} spread={0.2} dir={[0, -0.5, 0]} speed={1} size={0.02} start={0} seconds={1.4} slow={0.5} gravity={3} floor={0.2} kind="metal" seed="lab" progress={broke} />
    </DisasterStage>
  );
};

export default Lab;
