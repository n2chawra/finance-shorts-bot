// Loop: "The old turbines would be damaged running that low, so new ones should win back at least {fact5}
// megawatts. Until then, as Lake Mead falls, so does Hoover Dam's power."
// The powerhouse floor: the old runner in its pit ("old", medium), sparks and pits flash on its blades
// ("damaged"); a crane lowers a gleaming new runner ("new"); a tag swings on the hook ("should") and counts
// up ("least"); the new runner turns ("megawatts"); the roof light opens ("then"); the camera pulls up and
// out ("until"); cut to the dam at night ("Lake", wide); the waterline slides down ("falls"); the floodlit
// dam fills the frame ("Hoover"); the windows dim on the hook's opening pose ("power").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { Crane, DamScene, FULL, Hall, LOW, Runner, k01 } from "./Parts";
import { OPEN_DIR, OPEN_FROM, OPEN_LOOK } from "./Hook";

type Params = { fig?: { back?: string } };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const old = m.at("old", 4);
  const damaged = m.at("damaged", 22);
  const nw = m.at("new", 40);
  const should = m.at("should", 50);
  const least = m.at("least", 60);
  const mw = m.at("megawatts", 84);
  const until = m.at("until", 96);
  const then = m.at("then", 104);
  const lake = m.at("lake", 114);
  const falls = m.at("falls", 126);
  const hoover = m.at("hoover", 140);
  const power = m.at("power", 156);
  const end = Math.max(m.end, power + 16);
  const fig = (p.beat.params as Params).fig ?? {};
  const dam = f >= lake;
  const lower = k01(f, nw, Math.max(10, mw - nw));
  const hookY = 3.6 - 2.2 * lower;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.9, 0.6], dir: [0.25, 0.55, 1], from: 8.5, to: 7.2, dur: Math.max(8, nw), fov: 40 },
    { at: nw, move: "push", look: [1.3, 1.8, 0.6], dir: [0.1, 0.25, 1], to: 7.5, dur: Math.max(8, until - nw) },
    { at: until, move: "pullback", look: [0.6, 2.4, 0.6], dir: [0.05, 0.9, 0.5], to: 11, dur: Math.max(8, lake - until) },
    { at: lake, move: "cut", pos: [0, 2.2 + 0.45 * 16.5, -2 + 16.5], look: [0, 2.6, -4] },
    { at: lake + 1, move: "push", look: [0, 2.6, -4], dir: [0, 0.45, 1], from: 16.5, to: 15.5, dur: Math.max(8, hoover - lake) },
    { at: hoover, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, to: OPEN_FROM, dur: Math.max(10, end - hoover) },
  ]);
  const level = FULL - (FULL - LOW) * 0.75 * k01(f, falls, Math.max(20, end - falls));
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={dam ? { top: "#0b1430", bottom: "#04060c", glow: "rgba(90,160,255,0.12)" } : { top: "#1a1712", bottom: "#060504", glow: "rgba(255,196,107,0.12)" }}
        floor={false} bloom={1} dof={0} blur={1} shadowBox={8} fog={dam ? { color: "#070b18", near: 18, far: 42 } : undefined}>
        <Camera3D keys={keys} seed="v2001-loop" />
        {!dam && (
          <group>
            <Hall f={f} />
            <Runner position={[0, 0.25, 0.6]} turn={0.01 * f} worn={0.6 + 0.4 * m.pulse(damaged + 3, 10)} scale={0.9} />
            <Crane position={[0, 0, 0.6]} hook={2.4} top={4.6} drop={hookY + 0.45} />
            <Runner position={[2.4, hookY, 0.6]} turn={0.004 * f + 0.08 * Math.max(0, f - mw)} color="#e6edf5" lit={k01(f, mw, 10) * 0.999} scale={0.85} />
            {f >= then && <mesh position={[0, 5.4, 0.6]} rotation-x={Math.PI / 2} material={glow("#fff3d6", Math.round(0.9 * k01(f, then, 8) * 20) / 20)}><planeGeometry args={[6, 2]} /></mesh>}
            <Label3D at={[-0.5, 0.6, 0.6]} offset={[-0.9, 1.2, 0]} text="old turbine" start={old + 2} end={nw + 4} px={52} color="#ff9a6b" align="center" />
            <FigLabel3D fig={fig.back ?? ""} caption="megawatts back" at={[2.4, hookY + 1.25, 0.9]} start={least} count={20} px={120} />
          </group>
        )}
        {dam && <DamScene f={f} level={level} lights={1 - 0.6 * k01(f, power, 10)} />}
        {dam && <Label3D at={[0, 4.1, -0.6]} offset={[-0.6, 1.0, 0]} text="Hoover Dam" start={hoover} end={power + 4} px={58} color={TECH.white} align="center" />}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
