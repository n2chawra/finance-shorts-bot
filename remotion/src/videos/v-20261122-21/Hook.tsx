// Hook: "Crossrail dug a brand new railway under London, right through a city already full of Tube tunnels. How?"
// London's ground cut open at night, seen three-quarter from ahead: the spinning cutterhead nosing in,
// the street and buildings on top. "railway": the new tunnel's line glows behind it; "London": the
// windows and lamps light along the street; "right": the camera sinks into the clay; "full": the old
// Tube tunnels light one by one, trains sliding through; "Tube": the one in the machine's path glows;
// "How": close on the wheel, a few metres from it.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { Section, k01 } from "./Parts";

export const OPEN_LOOK: [number, number, number] = [2.5, 0.9, 0];
export const OPEN_DIR: [number, number, number] = [0.55, 0.3, 0.78];
export const OPEN_FROM = 15;
export const OPEN_TO = 13.2;
export const FRONT = 4.2;
export const BACK = { top: "#0b1226", bottom: "#030409", glow: "rgba(255,180,80,0.10)" };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const railway = m.at("railway", 14);
  const london = m.at("london's", 26);
  const right = m.at("between", 34);
  const full = m.at("between", 40);
  const tube = m.at("tube", 54);
  const how = m.at("tube", 54);
  const end = Math.max(m.end, how + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, from: OPEN_FROM, to: OPEN_TO, dur: Math.max(8, right), fov: 42 },
    { at: right, move: "push", look: [5.2, 0.3, 0], dir: [0.5, 0.25, 0.83], to: 9, dur: Math.max(10, how - right) },
    { at: how, move: "dive", look: [5.8, 0.2, 0], dir: [0.45, 0.2, 0.87], to: 5.2, dur: Math.max(12, end - how) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={10} fog={{ color: "#05070f", near: 16, far: 40 }}>
        <Camera3D keys={keys} seed="v2221-hook" />
        <Section f={f} front={FRONT} spin={f * 0.05} wheelLit={0.5 + 0.6 * m.pulse(how + 2, 12)} newLine={0.2 + 0.8 * k01(f, railway, 20)}
          lamps={0.25 + 0.75 * k01(f, london, 18)} tubes={0.05 + 0.95 * k01(f, full, Math.max(8, tube - full + 6))} />
        <Label3D at={[FRONT - 1, 1.1, 0]} offset={[-0.6, 1.0, 0]} text="Crossrail" sub="tunnel machine" start={-20} px={66} color={TECH.white} align="center" />
        <Label3D at={[7, 0.8, 0]} offset={[0.1, 1.2, 0]} text="Tube tunnel" start={tube} px={56} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
