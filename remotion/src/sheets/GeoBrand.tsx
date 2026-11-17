/**
 * The geography channel's avatar (800×800) and banner (2560×1440, text inside YouTube's 1546×423 safe
 * area), drawn with the map kit. No channel name on them, so they fit whichever name the owner picks.
 */
import React from "react";
import { AbsoluteFill } from "remotion";

import { INK } from "../flat/kit";
import { MapPin, MapRoute, WorldMap } from "../flat/map";

export const GeoAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#1f4e74" }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <defs><clipPath id="disc"><circle cx={400} cy={400} r={330} /></clipPath></defs>
      <circle cx={400} cy={400} r={348} fill={INK} />
      <g clipPath="url(#disc)">
        <WorldMap w={800} h={800} center={[20, 5]} scale={260} colors={{ Chile: { fill: "#e8453c" }, Gambia: { fill: "#e8453c" }, India: { fill: "#ffc43d" } }}>
          <MapPin at={[78, 22]} r={46} />
        </WorldMap>
      </g>
      <circle cx={400} cy={400} r={330} fill="none" stroke={INK} strokeWidth={14} />
    </svg>
  </AbsoluteFill>
);

export const GeoBanner: React.FC = () => (
  <AbsoluteFill style={{ background: "#1f4e74" }}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <WorldMap w={2560} h={1440} center={[15, 10]} scale={560} colors={{ Chile: { fill: "#e8453c" }, Gambia: { fill: "#e8453c" }, Kazakhstan: { fill: "#5fae6a" }, India: { fill: "#ffc43d" }, Lesotho: { fill: "#e8453c" } }}>
        <MapRoute via={[[121.5, 31.2], [103.8, 1.3], [43.4, 12.6], [32.5, 30], [4.5, 51.9]]} color="#ffffff" width={12} />
        <MapPin at={[32.5, 30]} r={30} />
      </WorldMap>
      {/* the tagline inside the safe area every device shows (1546×423, centred) */}
      <rect x={507} y={590} width={1546} height={260} rx={40} fill={INK} opacity={0.82} />
      {/* 76 px keeps the line inside the 1546 px safe area (96 px ran past both ends) */}
      <text x={1280} y={705} fontFamily="Poppins" fontWeight={800} fontSize={76} textAnchor="middle" fill="#ffffff">Why the world looks the way it does</text>
      <text x={1280} y={800} fontFamily="Poppins" fontWeight={600} fontSize={54} textAnchor="middle" fill="#ffc43d">Maps · borders · what if</text>
    </svg>
  </AbsoluteFill>
);
