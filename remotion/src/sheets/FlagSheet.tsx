/**
 * A test sheet for the flag table (src/flat/flags.tsx), 1080×1920: frame 0 shows every flag in a grid with its
 * name; frame 30 shows countries in a colour with their whole flag fitted inside (Chile, India; the UK, Denmark, France and
 * Germany; the USA, Canada and Mexico). For checking the flags in stills; not part of any video.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

import { FLAG_NAMES, FlagArt } from "../flat/flags";
import { WorldMap } from "../flat/map";

const W = 1080, H = 1920;
const COLS = 6, CW = 160, CH = 107;

export const FlagSheet: React.FC = () => {
  const f = useCurrentFrame();
  const TONES: Record<string, string> = { Chile: "#e8a44a", India: "#f2c14e", "United Kingdom": "#7aa6d8", Denmark: "#e8857a", France: "#9fb7e0",
    Germany: "#f2c14e", "United States of America": "#8fb3e0", Canada: "#e8857a", Mexico: "#8cc7a1" };
  const fill = (n: string) => ({ fill: TONES[n] ?? "#e8a44a", flag: n });
  return (
    <AbsoluteFill style={{ background: "#2b2b3a" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {f < 30 ? FLAG_NAMES.map((n, i) => {
          const x = 18 + (i % COLS) * (CW + 16), y = 20 + Math.floor(i / COLS) * (CH + 34);
          return (
            <g key={n}>
              <FlagArt name={n} x={x} y={y} w={CW} h={CH} />
              <rect x={x} y={y} width={CW} height={CH} fill="none" stroke="#000" strokeWidth={2} />
              <text x={x + CW / 2} y={y + CH + 20} fill="#fff" fontSize={16} fontFamily="Poppins" textAnchor="middle">{n}</text>
            </g>
          );
        }) : (
          <g>
            <svg x={0} y={0} width={540} height={960}><WorldMap w={540} h={960} fit={["Chile"]} pad={40} kind="flat" colors={{ Chile: fill("Chile") }} /></svg>
            <svg x={540} y={0} width={540} height={960}><WorldMap w={540} h={960} fit={["India"]} pad={40} kind="flat" colors={{ India: fill("India") }} /></svg>
            <svg x={0} y={960} width={540} height={960}><WorldMap w={540} h={960} center={[2, 51]} scale={1500} kind="flat" colors={{ "United Kingdom": fill("United Kingdom"), Denmark: fill("Denmark"), France: fill("France"), Germany: fill("Germany") }} /></svg>
            <svg x={540} y={960} width={540} height={960}><WorldMap w={540} h={960} center={[-98, 42]} scale={520} kind="flat" colors={{ "United States of America": fill("United States of America"), Canada: fill("Canada"), Mexico: fill("Mexico") }} /></svg>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
