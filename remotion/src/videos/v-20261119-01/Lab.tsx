// Lab: "In {fact1}, radar engineer Percy Spencer felt the chocolate in his pocket go soft."
// A wartime radar lab: a bench under a desk lamp, a radar dish turning, its scope sweeping (wide). The
// year hangs on the wall calendar from the start. "radar": the scope's sweep flares; "Percy": his name
// writes on beside the lab coat; "chocolate": the camera pushes to the coat's pocket, a candy bar poking
// out; "pocket": the pocket glows warm; "soft": the bar droops over the edge and drips (close).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { CandyBar, Coat, Lab, POCKET, Radar, WARM, k01 } from "./Parts";

type Params = { fig?: { year?: string } };
const COAT: [number, number, number] = [0.9, 0, 0.2];

const LabBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const inW = m.at("in", 2);
  const radar = m.at("radar", 30);
  const date = m.at("date", 40);
  const eng = m.at("engineer", 38);
  const percy = m.at("percy", 44);
  const choc = m.at("chocolate", 70);
  const pocket = m.at("pocket", 86);
  const soft = m.at("soft", 104);
  const end = Math.max(m.end, soft + 20);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const pk: [number, number, number] = [COAT[0] + POCKET[0], POCKET[1], COAT[2] + POCKET[2]];
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.0, 0], dir: [0.05, 0.35, 1], from: 8.2, to: 7.2, dur: Math.max(10, choc), fov: 35 },
    { at: choc, move: "push", look: [pk[0], pk[1] - 0.2, pk[2]], dir: [-0.2, 0.25, 1], to: 2.6, dur: Math.max(10, soft - choc) },
    { at: soft, move: "push", look: [pk[0], pk[1] - 0.15, pk[2]], dir: [-0.25, 0.2, 1], to: 1.5, dur: Math.max(10, end - soft) },
  ]);
  const droop = k01(f, soft - 4, 26);
  const warm = k01(f, pocket, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#14261f", bottom: "#05080a", glow: "rgba(124,242,166,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={4}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v1901-lab" />
        <Lab f={f} />
        <pointLight position={[0.2, 1.3, 0.6]} intensity={4 * m.pulse(eng + 5, 9)} color="#7cf2a6" distance={4} />
        <Radar position={[-1.4, 0, -0.1]} turn={f * 0.04 + 1.6 * k01(f, date, 16)} sweep={-f * 0.12 - 2 * k01(f, radar, 10)} />
        <Coat position={COAT} />
        {warm > 0.02 && (
          <mesh position={[pk[0], pk[1] - 0.05, pk[2] + 0.05]} material={glow(WARM, Math.round(warm * (0.35 + 0.15 * Math.sin(f / 4)) * 10) / 10)}>
            <sphereGeometry args={[0.16, 16, 12]} />
          </mesh>
        )}
        <group position={[pk[0], pk[1] + 0.02, pk[2] + 0.06]} rotation-z={Math.PI / 2 - 1.1 * droop} scale={0.62}>
          <CandyBar melt={0.15 + 0.85 * droop} f={f} />
        </group>
        <FigLabel3D fig={year} at={[-0.4, 1.25, -1.0]} start={inW} end={choc} count={0} px={Math.round(96 + 16 * m.pulse(date + 4, 8))} />
        <Label3D at={[COAT[0], 1.75, COAT[2]]} offset={[-1.0, -0.2, 0.2]} text="Percy Spencer" sub="radar engineer" start={percy} px={52} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default LabBeat;
