// Station: the ground under Tottenham Court Road, shared by the Checked and Payoff beats. The Northern
// line's tunnel crosses the section at the origin; the station's platform tunnels stand either side;
// the new machine rides just above the Northern line with its front at `front`.
import React from "react";
import { Ground, Machine, R, Street, TubeTunnel } from "./Parts";

/** the Northern line tunnel's radius and the clay left between it and the new tunnel (world units) */
export const NR = 0.6;
export const GAP = 0.32;
export const NEW_Y = NR + GAP + R;

export const Station: React.FC<{ f: number; front: number; northern: number; spin: number; lamps?: number }> = ({ f, front, northern, spin, lamps = 0.8 }) => (
  <group>
    <Ground />
    <Street lamps={lamps} />
    <TubeTunnel position={[0, 0, 0]} r={NR} f={f} lit={northern} />
    <TubeTunnel position={[-5, -0.6, 0]} r={0.8} f={f} lit={0.3} train={0} />
    <TubeTunnel position={[5.2, -0.6, 0]} r={0.8} f={f} lit={0.3} train={0} />
    <Machine f={f} position={[front, NEW_Y, 0]} spin={spin} see={0} fill={1} flow={0.6} beltLit={0.5} rings={6} wheelLit={0.7} />
  </group>
);
export default Station;
