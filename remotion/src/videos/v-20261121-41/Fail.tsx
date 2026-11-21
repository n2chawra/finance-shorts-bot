// Fail (no voice: the drop to silence, then the failure; the long video's cutaway): inside the 4th-floor
// box beam, the nut, washer and flange go amber to red ("strain"); on the sub-boom the welded seam tears,
// the flange folds open and the beam slides down past the nut, slowed, sparks falling ("reveal"); cut wide
// on "wide": the upper walkway drops onto the lower one and both fall to the lobby floor. No people.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, direct, Focus } from "../../three/index";
import { Shot3D } from "./World";
import { BeamCutaway, NUT } from "./Cut";
import { Atrium, Walkways } from "./Hall";

const Fail: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const strain = m.at("strain", 10), reveal = m.at("reveal", 25), wideAt = m.at("wide", 48);
  const wide = t >= wideAt;
  const stress = Math.min(1, 0.62 + cue(t, 0, Math.max(8, reveal), (x) => x) * 0.4 + 0.1 * m.pulse(strain + 4, 8));
  const fold = cue(t, reveal, 10, Easing.out(Easing.cubic)) * 0.95;
  const drop = cue(t, reveal + 2, 22, Easing.in(Easing.quad)) * 1.6;
  const fall = cue(t, wideAt, 24, (x) => x);
  const keys = wide
    ? direct(p.beat.events, [
        { at: 0, move: "hold", pos: [9.8, 6.4, 12.6], look: [0, 2.8, 0], fov: 56 },
        { at: wideAt, move: "cut", pos: [9.8, 6.4, 12.6], look: [0, 2.8, 0], fov: 56 },
        { at: wideAt + 1, move: "push", look: [0, 2.4, 0], dir: [0.6, 0.3, 0.75], from: 16.2, to: 15.2, dur: Math.max(10, m.end - wideAt) },
      ])
    : direct(p.beat.events, [
        { at: 0, move: "push", look: NUT, dir: [1, -0.3, 0.75], from: 2.0, to: 1.7, dur: Math.max(8, reveal), fov: 48 },
        { at: reveal, move: "pullback", look: [0, -0.8, -0.12], dir: [1, -0.2, 0.75], to: 2.6, dur: Math.max(10, wideAt - reveal) },
      ]);
  return (
    <Shot3D f={t} tag={wide ? "reconstruction" : "paused"} floor={wide}>
      <Camera3D keys={keys} seed="hyatt-fail" drift={wide ? 0.01 : 0.003} />
      {wide ? (
        <>
          <Focus at={[0, 2.5, 0]} range={8} />
          <Atrium dance={1} frame={t} dim={0.5 * cue(t, wideAt, 20)} />
          <Walkways frame={t} fall={fall} />
          <Debris at={[0, 0.2, 0]} count={46} spread={4} dir={[0, 1, 0]} speed={1.6} size={0.08} start={0.6} seconds={2} slow={0.5} gravity={3} floor={0}
            kind="concrete" seed="hyatt-floor" progress={cue(t, wideAt, 40, (x) => x)} />
        </>
      ) : (
        <>
          <Focus at={NUT} range={0.8} />
          <pointLight position={[1.5, 1.5, 2]} intensity={2.2} distance={8} color="#ffcf9a" />
          <group rotation-y={0.3}>
            <BeamCutaway t={t} stress={stress} fold={fold} drop={drop} debris={cue(t, reveal, 40, (x) => x)} />
          </group>
        </>
      )}
    </Shot3D>
  );
};
export default Fail;
