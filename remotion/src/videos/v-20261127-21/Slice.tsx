// Slice: "Slice it open. Deep inside, past its protective layers, sit glass fibres, each about as thin as a
// human hair."
// The cable's cut end in dark water (medium). "Slice": a glowing cut ring sweeps along it; "open": the
// jacket peels back into a stepped cutaway; "Deep": push in on the cut face (close); "inside"/"protective":
// the rings light up from the outside in; "layers": they slide further apart; "glass": the fibre bundle at
// the centre lights up (extreme); "fibres": a label writes on; "thin": one fibre slides forward; "human":
// a strand of hair slides in beside it; "hair": its label writes on (close).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { BUNDLE_X, CableCut, FIBRE_R, Hair, PULL_X, R, Seabed, Snow, k01, q } from "./Parts";
import { SEA_BACK, SEA_FOG } from "./Hook";

const Slice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const slice = m.at("slice", 2);
  const open = m.at("open", 12);
  const deep = m.at("past", 24);
  const inside = deep;
  const layers = m.at("layers", 52);
  const glass = m.at("glass", 66);
  const fibres = m.at("fibres", 74);
  const thin = m.at("thin", 88);
  const human = m.at("human", 100);
  const hair = m.at("hair", 108);
  const end = Math.max(m.end, hair + 20);
  const openK = 0.08 + 0.75 * k01(f, open, 16) + 0.17 * k01(f, layers, 12);
  const lit = [0, 1, 2, 3, 4].map((i) => (i === 0 ? 0 : cue(f, inside + (i - 1) * 6, 8) * (1 - k01(f, glass, 10))));
  const pull = k01(f, thin, 16);
  const hairIn = cue(f, human - 2, 14, Easing.out(Easing.cubic));
  const tipX = BUNDLE_X * openK + PULL_X * pull;
  const sweep = k01(f, slice, Math.max(8, open - slice + 6));
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.9, R, 0], dir: [0.7, 0.45, 1], from: 4.6, to: 4.0, dur: Math.max(8, deep), fov: 35 },
    { at: deep, move: "push", look: [1.2, R, 0], dir: [0.8, 0.35, 1], to: 2.4, dur: Math.max(8, glass - deep) },
    { at: glass, move: "push", look: [BUNDLE_X * 0.92, R, 0], dir: [0.9, 0.3, 0.8], to: 0.75, dur: Math.max(8, thin - glass) },
    { at: thin, move: "push", look: [tipX - 0.25, R, 0.03], dir: [0.25, 0.35, 1], from: 0.95, to: 0.85, dur: Math.max(10, end - thin) },
  ]);
  const showHair = f >= human - 2;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={SEA_BACK} floor={false} fog={SEA_FOG} bloom={1.15} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v2721-slice" />
        <Seabed position={[0, -0.02, 0]} />
        <Snow f={f} center={[0, 2, 0]} n={160} />
        <CableCut open={openK} lit={lit} fibres={k01(f, glass, 10)} pull={pull} f={f} />
        {/* the cut ring sweeping along the jacket */}
        {sweep > 0 && sweep < 1 && (
          <mesh position={[-1.5 + 1.5 * sweep, R, 0]} rotation-y={Math.PI / 2} material={glow(TECH.cyan, q(1 - sweep))}>
            <ringGeometry args={[R * 1.0, R * 1.12, 40]} />
          </mesh>
        )}
        {showHair && (
          <Hair x0={tipX - 1.6 - 0.8 * (1 - hairIn)} x1={tipX - 0.05 - 0.8 * (1 - hairIn)} position={[0, R + FIBRE_R * 3.2, 0.045]} />
        )}
        <pointLight position={[2.6, R + 0.6, 1.2]} intensity={5} color="#bfe6ff" distance={6} />
        <directionalLight position={[3, 6, 5]} intensity={1.2} color="#cfe8ff" />
        {f >= fibres && f < thin + 4 && <Label3D at={[BUNDLE_X * openK, R, 0]} offset={[0.05, 0.22, 0.1]} text="glass fibres" start={fibres} px={56} color={TECH.cyan} align="center" />}
        {f >= thin + 4 && <Label3D at={[tipX, R, 0]} offset={[-0.1, -0.12, 0.05]} text="one fibre" start={thin + 4} px={50} color={TECH.cyan} align="center" />}
        {f >= hair && <Label3D at={[tipX - 0.5, R + FIBRE_R * 3.2, 0.045]} offset={[-0.1, 0.14, 0.05]} text="human hair" start={hair} px={50} color={TECH.white} align="center" />}
      </Stage3D>
    </Freeze>
  );
};
export default Slice;
