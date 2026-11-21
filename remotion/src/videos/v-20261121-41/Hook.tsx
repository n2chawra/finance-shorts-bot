// Hook: "One phone call dropped the Hyatt Regency walkways. How?"
// Frame 0: inside the 4th-floor box beam (the long video's cutaway), the nut and washer under the bottom
// flange already amber, HYATT REGENCY and the dated caption on screen; a glow pulses round the nut
// ("phone"); the camera pulls back as the stress climbs ("call"); cut to the night atrium on "walkways":
// both walkways stacked over the lit dance floor; the camera rises toward them ("how").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, Label3D } from "../../three/index";
import { DateCaption, Shot3D } from "./World";
import { BeamCutaway, NUT } from "./Cut";
import { Atrium, LOWER_Y, UPPER_Y, Walkways } from "./Hall";

type Params = { fig?: { year?: string; day?: string } };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const call = m.at("call", 12), two = m.at("walkways", 60), how = m.at("how", 80);
  const atrium = f >= two;
  const stress = 0.42 + 0.2 * m.lerp([call, two], [0, 1]);
  const keys = atrium
    ? direct(p.beat.events, [
        { at: 0, move: "hold", pos: [8.6, 2.0, 9.4], look: [0, 4.0, 0], fov: 56 },
        { at: two, move: "cut", pos: [8.6, 2.0, 9.4], look: [0, 4.0, 0], fov: 56 },
        { at: two + 1, move: "push", look: [0, 4.2, 0], dir: [0.62, -0.12, 0.78], from: 12.4, to: 10.8, dur: Math.max(10, m.end - two) },
      ])
    : direct(p.beat.events, [
        { at: 0, move: "push", look: [0, -0.35, -0.12], dir: [1, -0.3, 0.75], from: 2.3, to: 2.05, dur: Math.max(8, call), fov: 48 },
        { at: call, move: "pullback", look: [0, -0.1, -0.12], dir: [1, -0.2, 0.8], to: 3.0, dur: Math.max(12, two - call) },
      ]);
  return (
    <Shot3D f={f} floor={atrium}
      overlay={<DateCaption t={f} at={0} title="HYATT REGENCY" titleAt={-60} line={`${fig.day ?? ""} JULY ${fig.year ?? ""} · KANSAS CITY`} />}>
      <Camera3D keys={keys} seed="hyatt-hook" drift={0.008} />
      {atrium ? (
        <>
          <Focus at={[0, UPPER_Y, 0]} range={6} />
          <Atrium dance={1} frame={f} />
          <Walkways frame={f} stress={0.3} lit={0.6} />
          <Label3D at={[3.5, UPPER_Y + 0.5, 0.5]} offset={[0.6, 0.8, 0.6]} text="4th-floor walkway" start={two + 4} px={48} color="#ffd84a" />
          <Label3D at={[3.5, LOWER_Y + 0.2, 0.5]} offset={[0.6, -0.8, 0.6]} text="2nd-floor walkway" start={how - 6} px={48} color="#ffd84a" />
        </>
      ) : (
        <>
          <Focus at={NUT} range={0.7} />
          <pointLight position={[1.5, 1.5, 2]} intensity={2.2} distance={8} color="#ffcf9a" />
          <group rotation-y={0.3}>
            <BeamCutaway t={f} stress={stress} fold={0} drop={0} debris={0} />
          </group>
        </>
      )}
    </Shot3D>
  );
};
export default Hook;
