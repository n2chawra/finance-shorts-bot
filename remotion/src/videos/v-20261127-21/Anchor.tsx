// Anchor: "But down here, what keeps breaking them? Mostly fishing gear and ship anchors dragged across the
// cable."
// The seabed in murky green light, the cable with its pulses (wide). "keeps": a crack mark flickers on it;
// "breaking": the pulses stutter; "fishing" (medium): a trawl net sweeps in over the sand; "gear": its boards
// scrape; "ship": a hull's shadow passes overhead; "anchors" (close): a huge anchor drops into the sand;
// "dragged": it drags toward the cable, sand flying; "cable" (close): it snags the cable, which snaps, the
// light dying at the break.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { Anchor as AnchorModel, Cable, R, Seabed, Snow, Trawl, k01, q } from "./Parts";

const MURK = { top: "#10392f", bottom: "#020c0a", glow: "rgba(120,220,170,0.08)" };

const AnchorBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const down = m.at("down", 6);
  const keeps = m.at("keeps", 20);
  const breaking = m.at("breaking", 28);
  const fishing = m.at("fishing", 50);
  const gear = m.at("gear", 60);
  const ship = m.at("ship", 68);
  const anchors = m.at("anchors", 76);
  const dragged = m.at("dragged", 88);
  const cable = m.at("cable", 104);
  const end = Math.max(m.end, cable + 24);
  const net = 0.25 + 0.75 * cue(f, fishing - 4, Math.max(20, anchors - fishing), Easing.inOut(Easing.quad));
  const drop = cue(f, anchors - 6, 12, Easing.in(Easing.quad));
  const drag = cue(f, dragged, Math.max(10, cable - dragged), Easing.inOut(Easing.quad));
  const snapped = f >= cable;
  const gap = snapped ? 0.35 * cue(f, cable, 10, Easing.out(Easing.cubic)) : 0;
  const anchorZ = -2.2 + 1.9 * drag + (snapped ? 0.3 * k01(f, cable, 12) : 0);
  const stutter = f >= breaking && f < breaking + 20 ? (Math.floor(f / 3) % 2 ? 0.2 : 1) : 1;
  const keys = direct({}, [
    { at: 0, move: "push", look: [-3.4, 0.5, -0.9], dir: [0.6, 0.35, 1], from: 5.6, to: 5.0, dur: Math.max(8, fishing), fov: 35 },
    { at: fishing, move: "push", look: [-1.2, 0.6, -0.7], dir: [0.6, 0.35, 1], to: 5.0, dur: Math.max(8, anchors - fishing) },
    { at: anchors, move: "push", look: [0.4, 0.2, -0.8], dir: [0.5, 0.25, 1], from: 5.0, to: 4.2, dur: Math.max(8, cable - anchors) },
    { at: cable, move: "push", look: [0.4, R - 0.55, 0], dir: [0.4, 0.3, 1], to: 3.0, dur: Math.max(10, end - cable) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={MURK} floor={false} fog={{ color: "#071f19", near: 5, far: 20 }} bloom={1.1} dof={0} blur={1} shadowBox={6}>
        <Camera3D keys={keys} seed="v2721-anchor" />
        <Seabed tint="#3a4a42" seed="bed2" />
        <Snow f={f} center={[0, 2.5, 0]} n={300} speed={0.004} seed="silt" />
        <Cable x0={-20} x1={20} f={f} pulse={stutter * (f >= down ? 1 : 0.9)} breakAt={snapped ? 0.4 : undefined} gap={gap} />
        {/* the crack mark */}
        {f >= keeps && !snapped && <mesh position={[0.4, R * 2 + 0.01, 0.02]} material={glow("#ff4d4d", q(0.4 + 0.6 * m.pulse(keeps + 2, 10)))}><boxGeometry args={[0.12, 0.03, 0.5]} /></mesh>}
        {/* the trawl, sweeping in from the left */}
        {f < anchors + 30 && <Trawl position={[-3.2 + 3.4 * (net - 0.25), 0, -0.9]} scale={1.2} />}
        {/* a ship's hull passing far above */}
        {(
          <mesh position={[-5 + 0.05 * f, 3.2, -4]} material={glow("#020605", 1)}>
            <boxGeometry args={[7, 0.8, 1.6]} />
          </mesh>
        )}
        {/* the anchor: drops in, then drags toward the cable */}
        {f >= anchors - 8 && (
          <group position={[0.4, 6 * (1 - drop), anchorZ]} rotation-x={-0.35 * drag} rotation-z={0.15}>
            <AnchorModel scale={0.7} dark />
          </group>
        )}
        {f >= anchors && f < anchors + 16 && <Snow f={f - anchors} center={[0.4, 0.4, -2.2]} box={[2, 0.8, 1]} n={80} speed={-0.02} seed="puff" />}
        {snapped && <pointLight position={[0.4, R + 0.3, 0.3]} intensity={6 * (1 - k01(f, cable + 6, 14))} color="#ff6a4d" distance={3} />}
        <directionalLight position={[2, 10, 3]} intensity={1.0} color="#bfe8d0" />
        <pointLight position={[0, 3, 3]} intensity={4} color="#8fd6b8" distance={10} />
        {f < anchors && <Label3D at={[-3.2 + 3.4 * (net - 0.25), 0.6, -0.9]} offset={[-0.2, 0.7, 0]} text="fishing gear" start={4} px={54} color={TECH.white} align="center" />}
        {f >= dragged && <Label3D at={[0.4, 1.0, anchorZ]} offset={[0.8, 1.0, 0]} text="ship anchor" start={dragged} px={54} color={TECH.white} align="center" />}
      </Stage3D>
    </Freeze>
  );
};
export default AnchorBeat;
