/**
 * A test reel for the India layer (src/flat/india.tsx), 1080×1920, 8 s, for checking the look in stills;
 * not part of any video. 0-2 s: all India, states filling one by one (the every-state move);
 * 2-4 s: the camera on Andhra Pradesh and Telangana, Telangana drawn, painted and lifted out (a state
 * formed); 4-6 s: the north, Ladakh traced round its border on India's official outline; 6-8 s: the whole map
 * filled, every state its own colour, with Devanagari tags.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import { IndiaMap, stateColours, StateTag, type StateFx } from "../flat/india";

const W = 1080, H = 1920;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const TONES = ["#e8453c", "#ffc43d", "#5fae6a", "#3d8bd9", "#b467c9", "#f08a3c", "#2fb5a5", "#e66aa0", "#9bc24a"];
const FILL_ORDER = ["Rajasthan", "Gujarat", "Maharashtra", "Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Odisha", "West Bengal", "Bihar", "Uttar Pradesh"];

export const IndiaSheet: React.FC = () => {
  const f = useCurrentFrame();
  let body: React.ReactNode;
  if (f < 60) {
    const states: Record<string, StateFx> = {};
    FILL_ORDER.forEach((s, i) => { states[s] = { fill: TONES[i % TONES.length]!, paint: k(f, 4 + i * 4, 12 + i * 4), lift: k(f, 4 + i * 4, 10 + i * 4) * (1 - k(f, 14 + i * 4, 20 + i * 4)) }; });
    const last = FILL_ORDER[Math.min(FILL_ORDER.length - 1, Math.max(0, Math.floor((f - 4) / 4)))]!;
    body = <IndiaMap w={W} h={H} focus={["India"]} pad={70} states={states} neighbourNames><StateTag state={last} k={1} /></IndiaMap>;
  } else if (f < 120) {
    body = (
      <IndiaMap w={W} h={H} focus={["Andhra Pradesh", "Telangana"]} pad={120} names
        states={{ "Andhra Pradesh": { fill: "#3d8bd9", k: k(f, 62, 72) }, Telangana: { fill: "#ffc43d", draw: k(f, 70, 92), lift: k(f, 92, 104) } }}>
        <StateTag state="Telangana" k={k(f, 95, 105)} />
        <StateTag state="Andhra Pradesh" k={k(f, 66, 76)} />
      </IndiaMap>
    );
  } else if (f < 180) {
    body = (
      <IndiaMap w={W} h={H} focus={["Ladakh", "Jammu and Kashmir", "Himachal Pradesh"]} pad={90} neighbourNames
        states={{ Ladakh: { fill: "#5fae6a", trace: k(f, 122, 160), k: k(f, 150, 165) }, "Jammu and Kashmir": { fill: "#e8453c", k: k(f, 130, 140) } }}>
        <StateTag state="Ladakh" k={k(f, 160, 170)} />
        <StateTag state="Jammu and Kashmir" k={k(f, 140, 150)} dy={-40} />
      </IndiaMap>
    );
  } else {
    const states = Object.fromEntries(Object.entries(stateColours(TONES)).map(([s, c]) => [s, { fill: c } satisfies StateFx]));
    body = (
      <IndiaMap w={W} h={H} focus={["India"]} pad={60} states={states}>
        {["Uttar Pradesh", "Rajasthan", "Maharashtra", "Ladakh", "Arunachal Pradesh"].map((s, i) => <StateTag key={s} state={s} k={k(f, 182 + i * 6, 192 + i * 6)} size={38} dy={-40} />)}
      </IndiaMap>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#16354d" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{body}</svg>
    </AbsoluteFill>
  );
};
