/**
 * A test reel for the map component (src/flat/map.tsx), 1080×1920, 6 s: the world map with Chile
 * recoloured, a route from Shanghai to Rotterdam drawing through Suez, Chile lifted onto India for
 * scale, and Gambia framed inside Senegal. For checking the look in stills; not part of any video.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import { INK } from "../flat/kit";
import { Lift, MapLabel, MapPin, MapRoute, WorldMap } from "../flat/map";

const W = 1080, H = 1920;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const MapSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#2d5f86" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {f < 60 ? (
          <WorldMap w={W} h={H} center={[20, 10]} scale={330} colors={{ Chile: { fill: "#e8453c", k: k(f, 10, 30) }, India: { fill: "#ffc43d", k: k(f, 20, 40) } }}>
            <MapLabel at={[-71, -30]} text="Chile" k={k(f, 25, 35)} />
            <MapRoute via={[[121.5, 31.2], [103.8, 1.3], [43.4, 12.6], [32.5, 30], [4.5, 51.9]]} k={k(f, 20, 58)} color="#ffffff"
              mover={(x, y, a) => <g transform={`translate(${x},${y}) rotate(${a})`}><rect x={-22} y={-12} width={44} height={24} rx={6} fill="#ffc43d" stroke={INK} strokeWidth={4} /></g>} />
            <MapPin at={[32.5, 30]} k={k(f, 40, 52)} />
          </WorldMap>
        ) : f < 120 ? (
          <WorldMap w={W} h={H} fit={["India", "Pakistan", "Bangladesh", "Nepal"]} pad={120} kind="flat" colors={{ India: { fill: "#ffc43d" } }}>
            <Lift name="Chile" to={[78, 22]} k={k(f, 60, 100)} rot={0} label={f > 100 ? "Chile" : undefined} />
          </WorldMap>
        ) : (
          <WorldMap w={W} h={H} fit={["Gambia", "Senegal"]} pad={140} kind="flat" colors={{ Gambia: { fill: "#e8453c", k: k(f, 125, 140) }, Senegal: { fill: "#5fae6a" } }}>
            <MapLabel at={[-15.4, 13.45]} text="Gambia" k={k(f, 135, 145)} dy={-90} />
            <MapLabel at={[-14.5, 15.3]} text="Senegal" k={k(f, 130, 140)} />
          </WorldMap>
        )}
      </svg>
    </AbsoluteFill>
  );
};
