// Loop: "Solid plates or an open truss: which would you drive across? Gertie had the plates."
// Two deck sections side by side over the water: the solid-plate deck lights amber ("Solid"); the open-truss deck
// lights with wind passing through it ("open"); a car's headlights on each ("drive"); cut back to the hook's
// picture, the green bridge starting to twist ("Gertie").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DeckSection, useDLook } from "../../three/index";
import { AMBER, Cam, CREAM, Gertie, k01, Narrows, PHASE, Shot3D, Tag, TEAL, WindStreaks } from "./World";
import { hookPose } from "./Hook";

const Pair: React.FC<{ solidK: number; openK: number; cars: boolean }> = ({ solidK, openK, cars }) => {
  const { paint } = useDLook();
  const deck = paint("concrete", "#3c4043");
  return (
    <group>
      <DeckSection position={[0, 1.2, -1.1]} len={4} width={1.4} girder="plate" steel={paint("steel", solidK > 0.5 ? AMBER : "#5d7466")} deck={deck} car={cars} />
      <DeckSection position={[0, 1.2, 1.1]} len={4} width={1.4} girder="truss" steel={paint("steel", openK > 0.5 ? TEAL : "#6d7f74")} deck={deck} car={cars} />
    </group>
  );
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const open = m.at("truss", 30), drive = m.at("drive", 60), gertie = m.at("gertie", 90);
  if (f >= gertie) {
    const g = f - gertie;
    const H = hookPose(0);
    const u = k01(g / 30);
    const pos: [number, number, number] = [H.cam[0] - 2 * (1 - u), H.cam[1] + 0.6 * (1 - u), H.cam[2] + 3 * (1 - u)];
    return (
      <Shot3D f={f}>
        <Cam pos={pos} look={H.look} fov={40} seed="tac-loop" range={6} />
        <Narrows f={f} />
        <Gertie twist={0.36 * u} phase={PHASE(0) - 0.3 * (1 - u)} hot={0.5 * u} />
      </Shot3D>
    );
  }
  const pos: [number, number, number] = f >= drive ? [-6.2 + 0.01 * (f - drive), 1.9, 0] : [-5.4 + 0.008 * f, 1.5, 0.2];
  return (
    <Shot3D f={f}
      overlay={
        <>
          <Tag t={f} at={0} top={420} text="SOLID PLATES" color={AMBER} size={52} left={60} />
          {f >= open ? <Tag t={f} at={open} top={420} text="OPEN TRUSS" color={TEAL} size={52} left={620} /> : null}
          <WindStreaks f={f} k={k01((f - open) / 8)} y0={950} y1={1150} seed={11} />
          {f >= drive ? <Tag t={f} at={drive} top={1180} text="WHICH WOULD YOU CROSS?" color={CREAM} size={48} /> : null}
        </>
      }>
      <Cam pos={pos} look={[0, 1.05, 0]} fov={46} seed="tac-pair" range={6} />
      <Narrows f={f} />
      <Pair solidK={1} openK={k01((f - open) / 6) * 1} cars={f >= drive} />
    </Shot3D>
  );
};
export default Loop;
