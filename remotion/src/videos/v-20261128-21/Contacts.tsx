// Contacts: "Then the plunger bridges two copper contacts, and the battery's current floods the motor."
// Close on the solenoid's back end, its cap cut open. "plunger": the plunger slides its last few millimetres;
// "bridges": the copper disc slams across the two posts with a spark; "contacts": labelled; "battery's"
// (medium): the battery beside the starter, its terminals lighting; "current": a glowing current rushes along
// the heavy cable; "floods": it pours into the motor's windings; "motor": the armature spins hard.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Battery, Cable, Starter, k01, q } from "./Parts";

const Contacts: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const plunger = m.at("plunger", 4);
  const bridges = m.at("bridges", 14);
  const contacts = m.at("contacts", 24);
  const battery = m.at("battery", 34);
  const current = m.at("current", 44);
  const floods = m.at("floods", 54);
  const motor = m.at("motor", 62);
  const end = Math.max(m.end, motor + 18);
  const engage = 0.88 + 0.12 * k01(f, plunger, Math.max(4, bridges - plunger));
  const contact = k01(f, bridges, 3);
  const flow = k01(f, current, Math.max(8, floods - current));
  const wind = k01(f, floods, 10);
  const spin = Math.max(0, f - floods) * 0.08 * (1 + 3 * k01(f, motor, 12));
  const keys = direct({}, [
    { at: 0, move: "push", look: [1.55, 0.5, 0], dir: [0.6, 0.3, 0.74], from: 2.4, to: 2.1, dur: Math.max(8, battery), fov: 40 },
    { at: battery, move: "pullback", look: [1.9, 0.0, 0.7], dir: [0.4, 0.3, 0.87], to: 4.4, dur: Math.max(10, floods - battery) },
    { at: floods, move: "push", look: [1.3, 0.1, 0.4], dir: [0.4, 0.3, 0.86], to: 3.4, dur: Math.max(10, end - floods) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={6} fog={{ color: "#05070f", near: 10, far: 30 }}>
        <Camera3D keys={keys} seed="v2821-contacts" />
        <Starter engage={engage} contact={contact} coil={0.8} windings={wind} spin={spin} see={1} />
        {f >= bridges && f < bridges + 9 && (
          <mesh position={[1.82, 0.5, 0.12]} material={glow("#ffe7a8", q(1 - (f - bridges) / 9))}>
            <sphereGeometry args={[0.1, 12, 10]} />
          </mesh>
        )}
        <Battery position={[2.5, -0.9, 1.3]} lit={k01(f, battery, 8)} />
        <Cable points={[[2.18, 0.05, 1.3], [2.3, 0.7, 0.8], [2.1, 0.75, 0.15], [1.7, 0.5, 0.08]]} k={flow} lit={flow} color={TECH.amber} />
        <Label3D at={[1.75, 0.55, 0.08]} offset={[0.15, 0.6, 0.2]} text="copper contacts" start={contacts} end={battery + 4} px={56} color={TECH.amber} align="center" />
        <Label3D at={[2.5, 0.0, 1.3]} offset={[0.5, 0.5, 0.2]} text="battery" start={battery + 2} px={58} color={TECH.white} align="center" />
        <Label3D at={[1.0, 0, 0]} offset={[-0.5, -0.7, 0.3]} text="motor" start={motor} px={58} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Contacts;
