// Operation3DDemo (2026-11-28): the "show it working" pieces (owner note on L-20261127-21). Left, a gear train:
// the motor's small gear turns the big one the other way, slower. Right, an operation: a card slides into a
// press, the press comes down, a changed card springs out the far side while the first one stays where it began.
import React from "react";
import { Camera3D, GearTrain, glow, mat, moves, Operation3D, Press3D, Stage3D, TECH, type CamKey } from "../index";

export const OPERATION3D_DEMO = { fps: 30, durationInFrames: 150, width: 1920, height: 1080 } as const;

const Card: React.FC<{ color: string; hot?: boolean }> = ({ color, hot }) => (
  <mesh material={hot ? glow(color) : mat("glossy", color)} castShadow>
    <boxGeometry args={[0.5, 0.34, 0.06]} />
  </mesh>
);

export const Operation3DDemo: React.FC = () => {
  const cam: CamKey[] = [...moves.pushIn(0, 150, [0, 0.9, 0], [0, 0.25, 1], 11, 9.5, 34)];
  return (
    <Stage3D shadowBox={6} vignette={0.45}>
      <Camera3D keys={cam} />
      <GearTrain at={[-3.2, 1.2, 0]} gears={[{ r: 0.45, hot: true, color: TECH.amber }, { r: 1.1, angle: 10 }, { r: 0.6, angle: -60 }]} speed={0.4} start={10} />
      <Operation3D from={[0.6, 0.5, 0]} at={[2.4, 0.5, 0]} to={[4.2, 0.5, 0]} inAt={20} actAt={60} outAt={78}
        input={<Card color={TECH.cyan} />} output={<Card color={TECH.lime} hot />} machine={(act) => <Press3D act={act} w={0.8} />} />
    </Stage3D>
  );
};
