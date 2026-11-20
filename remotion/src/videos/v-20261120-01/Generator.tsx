// Generator: "The spin sweeps magnets past copper coils, sending electricity out to about {fact2} people."
// Inside the generator: the shaft turns the rotor ("spin", medium); its ring rolls into view ("ring");
// the magnets glow ("magnets", close); the copper coils shine ("copper"); each flashes as a magnet passes
// ("coils"); current runs out along a cable ("electricity"). Cut to the desert at night: the current races
// along the power lines ("flows", wide); a city lights up and its sign counts up the figure ("people").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { City, Generator as Gen, PowerLine, k01 } from "./Parts";

type Params = { fig?: { people?: string } };

const GeneratorBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const spin = m.at("spin", 4);
    const magnets = m.at("magnets", 24);
  const past = m.at("past", 30);
  const copper = m.at("copper", 34);
  const coils = m.at("coils", 42);
  const elec = m.at("sending", 52);
  const flows = m.at("to", 70);
  const mid = m.at("mid", 86);
  const people = m.at("people", 96);
  const end = Math.max(m.end, people + 24);
  const fig = (p.beat.params as Params).fig ?? {};
  const outside = f >= flows;
  const turn = 0.04 * f + 0.04 * Math.max(0, f - spin) + 0.05 * Math.max(0, f - past);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, -0.2, 0], dir: [0.2, 0.75, 1], from: 6.6, to: 5.6, dur: Math.max(8, magnets), fov: 40 },
    { at: magnets, move: "push", look: [0.9, 0, 1.0], dir: [0.6, 0.35, 1], to: 3.6, dur: Math.max(8, elec - magnets) },
    { at: flows, move: "cut", pos: [0, 4.2, 10.5], look: [0, 0.6, -1] },
    { at: flows + 1, move: "push", look: [0, 0.6, -1], dir: [0, 0.38, 1], from: 11.5, to: 9.5, dur: Math.max(14, end - flows) },
  ]);
  const flash = m.pulse(flows, 6);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={outside ? { top: "#120f2a", bottom: "#05040a", glow: "rgba(255,196,107,0.14)" } : { top: "#160d18", bottom: "#05040a", glow: "rgba(255,120,90,0.12)" }}
        floor={outside ? false : "reflect"} bloom={1.1} dof={0} blur={1} shadowBox={6}>
        <Camera3D keys={keys} seed="v2001-gen" />
        {!outside && (
          <group position={[0, 0.2 * k01(f, spin - 4, 12), 0]}>
            <Gen turn={turn} magnets={k01(f, magnets, 8)} coils={0.6 + 0.4 * k01(f, copper, 8)} live={k01(f, coils, 6)} scale={1} />
            {/* the cable carrying the current away */}
            <mesh position={[2.9, 0, 0]} rotation-z={Math.PI / 2} material={glow("#ffe08a", Math.round((0.1 + 1.2 * k01(f, elec, 8)) * 20) / 20)}>
              <cylinderGeometry args={[0.06, 0.06, 2.4 * Math.max(0.02, k01(f, elec, 10)), 10]} />
            </mesh>
            <Label3D at={[1.2, 0.3, 0.2]} offset={[-0.4, 1.4, 0]} text="magnets" start={magnets + 2} end={coils + 4} px={54} color="#ff8a95" align="center" />
            <Label3D at={[1.6, -0.2, 0.6]} offset={[0.2, -1.2, 0]} text="copper coils" start={copper + 2} px={54} color={TECH.amber} align="center" />
          </group>
        )}
        {outside && (
          <group>
            <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} material={glow("#3a2a24", 0.35)}><planeGeometry args={[40, 40]} /></mesh>
            {[-3, -1, 1, 3].map((x) => <mesh key={x} position={[x * 1.2, 0.3, 4 + Math.abs(x)]} material={glow("#7a5a44", 0.25)}><coneGeometry args={[0.6, 0.6, 5]} /></mesh>)}
            <City position={[0, 0, -3]} on={0.35 * k01(f, mid, 10) + 0.65 * k01(f, people - 4, 20)} f={f} />
            <PowerLine a={[-7, 0, 10]} b={[-1.5, 0, 0.5]} n={6} k={k01(f, flows + 2, 26)} f={f} h={1.4} />
            <PowerLine a={[7, 0, 10]} b={[1.5, 0, 0.5]} n={6} k={k01(f, flows + 6, 26)} f={f} h={1.4} />
            <mesh position={[0, 6, -12]} material={glow("#fff6dc", 0.9)}><sphereGeometry args={[0.35, 16, 12]} /></mesh>
            <FigLabel3D fig={fig.people ?? ""} caption="people" at={[0, 3.0, -2]} start={people} count={20} px={120} />
          </group>
        )}
        {flash > 0.02 && <mesh position={[0, 0, 0]} material={glow("#ffffff", Math.round(flash * 10) / 10)}><sphereGeometry args={[40, 8, 6]} /></mesh>}
      </Stage3D>
    </Freeze>
  );
};
export default GeneratorBeat;
