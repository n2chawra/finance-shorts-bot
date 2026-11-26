// Map (flat): the United States at night on the flat kit's map (Natural Earth outlines), with airport pins,
// a route that draws on its word, a small plane flying it, a moon for the overnight commute. Modes
// (params.mode): route (Newark to Buffalo), commute (Seattle, Memphis, Newark), fatigue (the commute again,
// with the board's finding pinned and stamped). No figures.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Stage, View } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, WorldMap } from "../../flat/map";
import { AMBER, ChapterCard, FlatTag, ICE, moments, ramp, RED, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };
const NEWARK: [number, number] = [-74.17, 40.69], BUFFALO: [number, number] = [-78.73, 42.94], SEATTLE: [number, number] = [-122.33, 47.6], MEMPHIS: [number, number] = [-89.98, 35.04];

const Plane: React.FC<{ x: number; y: number; a: number; s?: number }> = ({ x, y, a, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI}) scale(${s})`}>
    <path d="M 26 0 L -18 -6 L -22 -2 L -22 2 L -18 6 Z" fill="#ffffff" />
    <path d="M 4 0 L -6 -26 L -12 -26 L -6 0 L -12 26 L -6 26 Z" fill="#ffffff" />
    <path d="M -16 0 L -22 -10 L -26 -10 L -22 0 L -26 10 L -22 10 Z" fill="#ffffff" />
  </g>
);

const MapBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "route";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  const W = p.tl.width, H = p.tl.height;
  const route = mode === "route";
  const center: [number, number] = route ? [-76.4, 42.2] : [-97, 41];
  const scale = route ? 6200 : 1350;
  const zIn = route ? ramp(t, e("Newark"), 20) * (1 - ramp(t, e("Buffalo"), 24)) : mode === "commute" ? ramp(t, e("Newark"), 24) : ramp(t, e("likely"), 20);
  const zOut = mode === "commute" ? ramp(t, e("overnight"), 24) * 0 : mode === "fatigue" ? ramp(t, e("probable"), 20) : 0;
  const zoom = 1.02 + 0.16 * zIn - 0.08 * zOut + 0.02 * (t / end);
  const moonK = mode === "route" ? 0 : ramp(t, mode === "commute" ? e("overnight") : e("Fatigue"), 20);
  const k1 = route ? ramp(t, e("Buffalo"), 40) : ramp(t, e("Memphis") - 10, 34);
  const k2 = route ? 0 : ramp(t, e("Newark") - 10, 34);
  const fatigue = mode === "fatigue";
  const leg1Start = route ? 0 : fatigue ? 0 : 1;
  void leg1Start;
  return (
    <AbsoluteFill>
    <Stage p={p} bg="#0b1520" vignette={0.5}>
      <View zoom={zoom} cx={W / 2 + (route ? 60 * zIn : 0)} cy={H / 2}>
        <WorldMap w={W} h={H} kind="flat" center={center} scale={scale} land="#2c3a47" sea="#0e1c29" border="#4a5b6b" only={["United States of America", "Canada", "Mexico"]} detail="50m"
          colors={{ "United States of America": { fill: "#34485a", k: 1, trace: ramp(t, 0, 40), traceColor: "#9fd3ff" } }}>
          {route && <>
            <MapPin at={NEWARK} k={ramp(t, e("Newark"), 10)} color={AMBER} r={20} />
            <MapLabel at={NEWARK} text="NEWARK" k={ramp(t, e("Newark"), 10)} dy={50} size={40} fill="#ffffff" />
            <MapLabel at={[-74.0, 40.95]} text="NEW YORK CITY" k={ramp(t, e("York"), 10)} dy={-46} size={34} fill="#ffd27a" />
            <MapRoute via={[NEWARK, BUFFALO]} k={k1} color={AMBER} width={8} dash mover={(x, y, a) => <Plane x={x} y={y} a={a} s={1.4} />} />
            <MapPin at={BUFFALO} k={ramp(t, e("Buffalo"), 10)} color={RED} r={20 + 4 * Math.max(0, Math.sin((t - e("west")) * 0.3)) * (t >= e("west") ? 1 : 0)} />
            <MapLabel at={BUFFALO} text="BUFFALO" k={ramp(t, e("Buffalo"), 10)} dy={-50} size={40} fill="#ffffff" />
          </>}
          {!route && <>
            <MapPin at={SEATTLE} k={ramp(t, fatigue ? 0 : e("Seattle"), 10)} color={ICE} r={18} />
            <MapLabel at={SEATTLE} text="SEATTLE" k={ramp(t, fatigue ? 0 : e("Seattle"), 10)} dy={-44} size={38} fill="#ffffff" />
            <MapRoute via={[SEATTLE, MEMPHIS]} k={fatigue ? 1 : k1} color={ICE} width={6} dash mover={fatigue ? undefined : (x, y, a) => (k1 < 1 ? <Plane x={x} y={y} a={a} /> : null)} />
            <MapPin at={MEMPHIS} k={ramp(t, fatigue ? 0 : e("Memphis"), 10)} color={ICE} r={16} />
            <MapLabel at={MEMPHIS} text="MEMPHIS" k={ramp(t, fatigue ? 0 : e("Memphis"), 10)} dy={46} size={36} fill="#ffffff" />
            <MapRoute via={[MEMPHIS, NEWARK]} k={fatigue ? 1 : k2} color={ICE} width={6} dash mover={fatigue ? undefined : (x, y, a) => (k2 < 1 ? <Plane x={x} y={y} a={a} /> : null)} />
            <MapPin at={NEWARK} k={ramp(t, fatigue ? 0 : e("Newark"), 10)} color={AMBER} r={18} />
            <MapLabel at={NEWARK} text="NEWARK" k={ramp(t, fatigue ? 0 : e("Newark"), 10)} dy={-44} size={38} fill="#ffffff" />
          </>}
        </WorldMap>
      </View>
      {/* the moon over the overnight legs, the dawn at Newark */}
      {moonK > 0 && <g opacity={moonK} transform={`translate(${520 + 40 * Math.sin(t * 0.01)} ${170 - 20 * moonK})`}><circle cx={0} cy={0} r={46} fill="#f4f1e4" /><circle cx={18} cy={-10} r={42} fill="#0b1520" /></g>}
      {mode === "commute" && t >= e("Newark") && <rect x={1500} y={0} width={420} height={1080} fill="url(#cg-dawn)" opacity={0.35 * ramp(t, e("Newark"), 30)} />}
      <defs><linearGradient id="cg-dawn" x1="0" x2="1"><stop offset="0" stopColor="#ff9d2e" stopOpacity="0" /><stop offset="1" stopColor="#ff9d2e" stopOpacity="1" /></linearGradient></defs>
      {mode === "commute" && <TypeText x={200} y={880} t={t} at={e("overnight")} text="OVERNIGHT · TWO FLIGHTS" size={40} color="#ffd27a" />}
      {fatigue && <g>
        <g transform="translate(1180 160)" opacity={ramp(t, e("likely"), 10)}><rect x={0} y={0} width={600} height={120} rx={10} fill="rgba(8,12,18,0.9)" stroke={AMBER} strokeWidth={5} /><TypeText x={24} y={76} t={t} at={e("likely")} text="FATIGUE: LIKELY IMPAIRED" size={40} color={AMBER} /></g>
        <g transform="translate(1180 320)" opacity={ramp(t, e("much"), 10)}><rect x={0} y={0} width={600} height={120} rx={10} fill="rgba(8,12,18,0.9)" stroke={ICE} strokeWidth={5} /><TypeText x={24} y={76} t={t} at={e("much")} text="HOW MUCH: UNKNOWN" size={40} color={ICE} /></g>
        <Stamp x={1480} y={560} t={t} at={e("probable")} text="NOT IN THE PROBABLE CAUSE" size={42} />
      </g>}
    </Stage>
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
      <FlatTag t={t} tag="reported" at={0} sub="from the NTSB report" />
    </AbsoluteFill>
  );
};

export default MapBeat;
