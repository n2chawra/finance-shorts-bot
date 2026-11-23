// Hook: "Why did Britain hide a whole power station inside a mountain in Wales?" Zoom from space: the
// night Earth among the stars, Britain's border already tracing itself in light at frame 0. On "Britain"
// the trace closes and the Union flag fills it; on "power" a gold pin drops on north Wales; on "mountain"
// the camera dives to a dark mountain with light leaking out of its side; on "Wales" its name writes on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, WorldMap, useAt } from "../../flat/map";
import { ELIDIR, GOLD, NIGHT_LAND, NIGHT_SEA, Stars, ZAP } from "./props";

const NEAR_UK = ["United Kingdom", "Ireland", "France", "Belgium", "Netherlands", "Norway", "Denmark", "Germany"];

const Leak: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(ELIDIR);
  if (!xy || k <= 0) return null;
  return (
    <g>
      <Glow x={xy[0]} y={xy[1]} r={90 + 260 * k} color={ZAP} o={(0.5 + 0.1 * Math.sin(t / 4)) * k} />
      <path d={`M${xy[0] - 70 * k},${xy[1] + 30 * k} L${xy[0]},${xy[1] - 80 * k} L${xy[0] + 80 * k},${xy[1] + 34 * k} Z`} fill="#2a3352" stroke="#1d1a2b" strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${xy[0] - 10 * k},${xy[1] - 30 * k} L${xy[0] + 6 * k},${xy[1]} L${xy[0] - 8 * k},${xy[1] + 26 * k}`} fill="none" stroke={ZAP} strokeWidth={10 * k} strokeLinecap="round" />
    </g>
  );
};

/** The hook's night globe; the loop ends on it at its frame-0 values. */
export const HookMap: React.FC<{ t: number; scale: number; center: [number, number]; trace: number; flag: number; pin: number; leak: number; wales: number }> = ({ t, scale, center, trace, flag, pin, leak, wales }) => (
  <g>
    <Stars t={t} o={Math.max(0, 1 - (scale - 1500) / 3000)} />
    <WorldMap w={1080} h={1920} center={center} scale={scale} kind="world" look="flat" land={NIGHT_LAND} sea={NIGHT_SEA} border="#7d8db8"
      detail={scale > 3000 ? "50m" : "110m"} only={scale > 3000 ? NEAR_UK : undefined}
      colors={{ "United Kingdom": { fill: "#3d4f7d", trace: Math.max(0.001, trace), traceColor: ZAP, k: flag, flag: flag > 0.05 ? "United Kingdom" : undefined } }}>
      <MapPin at={ELIDIR} k={pin} color={GOLD} r={26 + scale / 2500} />
      <Leak k={leak} t={t} />
      <MapLabel at={[-3.4, 52.45]} text="WALES" size={84} type={wales} fill="#ffffff" />
      <MapLabel at={[-1.6, 56.2]} text="BRITAIN" size={64} type={flag > 0 ? 1 : 0} k={Math.max(0, 1 - (scale - 6000) / 6000)} />
    </WorldMap>
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const br = m.at("britain", 8), pw = m.at("power", 40), mt = m.at("mountain", 70), wl = m.at("wales", 95);
  const dive = m.lerp([br, mt + 16], [0, 1]);
  const scale = 1500 * Math.pow(26000 / 1500, dive);
  return (
    <Stage p={p} bg="#060a18" vignette={0.4}>
      <View zoom={1.02 + m.wave(70, 0.01)}>
        <HookMap t={m.t} scale={scale}
          center={[-3.2 - 0.9 * dive, 50 + 3 * dive]}
          trace={m.lerp([0, br + 20], [0.35, 1])}
          flag={m.lerp([br + 10, br + 26], [0, 1]) * (1 - m.lerp([mt, mt + 14], [0, 0.6]))}
          pin={m.pop(pw, 11)}
          leak={m.lerp([mt, mt + 16], [0, 1])}
          wales={m.lerp([wl, wl + 14], [0, 1])} />
      </View>
    </Stage>
  );
};

export default Hook;
