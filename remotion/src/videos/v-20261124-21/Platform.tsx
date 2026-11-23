// Platform: "Paris first tried it in {fact1}. So what keeps it on the track?"
// A white-tiled Paris station, a train standing at the platform (medium, drifting along the wall).
// "first": an enamel plaque on the wall writes on the year; "tried": the year pulses and the train's
// lights brighten; "So": the train pulls away; "keeps": the camera drops over the platform edge to the
// empty track (wide); "track": the two flat running tracks light up amber (close).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Block, Camera3D, cue, direct, FigLabel3D, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { CAR_LEN, MetroCar, MSign, ParisStation, TYRE_R, Track, k01 } from "./Parts";

type Params = { fig?: { year?: string } };
const PLAQUE: [number, number, number] = [1.4, 2.9, -4.9];

const Platform: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const first = m.at("first", 10);
  const tried = m.at("tried", 22);
  const inW = m.at("in", 30);
  const so = m.at("so", 50);
  const keeps = m.at("keeps", 62);
  const track = m.at("track", 84);
  const end = Math.max(m.end, track + 24);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const go = cue(f, so, Math.max(20, end - so), Easing.in(Easing.quad));
  const tx = -0.5 + 14 * go;
  const plaque = k01(f, first - 2, 8);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.6, 2.2, -3.0], dir: [0.35, 0.12, 1], from: 9.5, to: 8.4, dur: Math.max(8, keeps), fov: 35 },
    { at: keeps, move: "push", look: [-1.2, 0.0, 0], dir: [0.25, 1.1, 0.75], from: 7.5, to: 6.6, dur: Math.max(8, track - keeps) },
    { at: track, move: "push", look: [-1.6, 0.0, 0.7], dir: [0.35, 0.8, 0.9], to: 3.4, dur: Math.max(10, end - track) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#1a1f2a", bottom: "#07080c", glow: "rgba(255,240,210,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={6}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2421-platform" />
        <ParisStation f={f} />
        {tx < 12 && <MetroCar position={[tx, 0, 0]} rotation-y={0} spin={(14 * go) / TYRE_R} lights={0.6 + 0.4 * k01(f, tried, 8)} />}
        {tx < 18 && <MetroCar position={[tx - CAR_LEN - 0.3, 0, 0]} spin={(14 * go) / TYRE_R} cab={false} />}
        {/* the enamel plaque and the M sign on the wall */}
        <group position={PLAQUE} scale={[1, Math.max(0.02, plaque), 1]} visible={plaque > 0.02}>
          <Block size={[1.9, 0.9, 0.06]} radius={0.06} material={mat("glossy", "#1c3a7a")} />
        </group>
        <MSign position={[-2.2, 3.0, -4.85]} rotation-y={-Math.PI / 2} lit={0.25 + 0.75 * k01(f, inW, 8)} />
        <FigLabel3D fig={year} at={[PLAQUE[0], PLAQUE[1], PLAQUE[2] + 0.06]} face="front" height={0.55} start={first} count={0} plate={false}
          color={Math.round(m.pulse(tried + 3, 8) * 10) > 4 ? TECH.amber : "#f4f7ff"} />
        <Label3D at={[-1.6, 0.02, 0.7]} offset={[0.4, 0.9, 0.4]} text="flat running track" start={track + 4} px={52} color={TECH.amber} align="center" />
        <Track length={26} runLit={k01(f, track, 8)} sweep={k01(f, track, 24)} />
      </Stage3D>
    </Freeze>
  );
};
export default Platform;
