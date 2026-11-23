// "After losing at Waterloo, Napoleon was locked away on Saint Helena, a speck of rock far from Europe." Europe and
// the Atlantic down to Saint Helena: crossed swords at Waterloo on "losing" break on "Waterloo" as Belgium traces;
// Napoleon (his real face) stands on the map on "Napoleon"; on "locked" a British ship takes him south down the
// Atlantic, reaching Saint Helena on "Saint"; the camera pushes in on "speck" where he stands behind a fence; on
// "Europe" it pulls back to show how far away Europe is.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { HELENA, Isle, Napoleon, Ocean, Ship, WATERLOO } from "./props";

const ROUTE: [number, number][] = [[-4.4, 50.0], [-12, 40], [-18, 20], [-14, 0], [-6.4, -15.4]];

const Swords: React.FC<{ k: number; brk: number }> = ({ k, brk }) => {
  const xy = useAt()(WATERLOO);
  if (!xy || k <= 0) return null;
  const s = Math.min(1.1, k), d = brk * 40;
  return (
    <g transform={`translate(${xy[0]} ${xy[1] - 20}) scale(${s})`} opacity={1 - 0.7 * brk}>
      <g transform={`translate(${-d} ${d}) rotate(${-brk * 30})`}><path d="M -60 60 L 50 -50" stroke={INK} strokeWidth={18} strokeLinecap="round" /><path d="M -60 60 L 50 -50" stroke="#d9d4cc" strokeWidth={9} strokeLinecap="round" /></g>
      <g transform={`translate(${d} ${d}) rotate(${brk * 30})`}><path d="M 60 60 L -50 -50" stroke={INK} strokeWidth={18} strokeLinecap="round" /><path d="M 60 60 L -50 -50" stroke="#d9d4cc" strokeWidth={9} strokeLinecap="round" /></g>
    </g>
  );
};

const Emperor: React.FC<{ at: [number, number]; k: number; s: number; face: "neutral" | "sad"; crown?: number }> = ({ at, k, s, face, crown = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Napoleon x={xy[0]} y={xy[1] - 10} s={s * Math.min(1, k)} face={face} armR={[20, 30]} />
      {crown > 0 ? <path transform={`translate(${xy[0]} ${xy[1] - 10 - s * 3.05}) scale(${Math.min(1.1, crown) * s / 100})`} d="M -40 0 L -46 -40 L -22 -18 L 0 -48 L 22 -18 L 46 -40 L 40 0 Z" fill="#f2b134" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
    </g>
  );
};

const Fence: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(HELENA);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      {[-120, -80, -40, 40, 80, 120].map((dx) => <rect key={dx} x={xy[0] + dx - 8} y={xy[1] - 70 * Math.min(1, k)} width={16} height={70 * Math.min(1, k)} fill="#7a5230" stroke={INK} strokeWidth={4} />)}
      <rect x={xy[0] - 132} y={xy[1] - 52} width={264} height={12} fill="#7a5230" stroke={INK} strokeWidth={3} />
    </g>
  );
};

const Prison: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ls = m.at("losing", 4), wl = m.at("waterloo", 16), np = m.at("napoleon", 30), em = m.at("emperor", 40), ru = m.at("ruled", 52), lk = m.at("locked", 44), st = m.at("saint", 70), sp = m.at("speck", 90), eu = m.at("europe", 110);
  const push = m.lerp([sp - 6, sp + 14], [0, 1]) * (1 - m.lerp([eu - 4, eu + 18], [0, 1]));
  const scale = 760 * Math.pow(2.6, push);
  const center: [number, number] = [0 - 5.7 * push, 8.5 - 24.4 * push];
  const sail = m.lerp([lk, st], [0.02, 1]);
  const onShip = m.t >= lk && m.t < st;
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + m.wave(90, 0.01)}>
        <Ocean center={center} scale={scale}
          colors={{ Belgium: { fill: "#f2b134", trace: m.lerp([wl, wl + 24], [0, 1]), flag: "Belgium" }, France: { fill: "#3b6fb8", k: m.lerp([ru, ru + 12], [0, 1]) }, Italy: { fill: "#3b6fb8", k: m.lerp([ru + 4, ru + 16], [0, 0.8]) }, Spain: { fill: "#3b6fb8", k: m.lerp([ru + 6, ru + 18], [0, 0.6]) }, Germany: { fill: "#3b6fb8", k: m.lerp([ru + 8, ru + 20], [0, 0.6]) }, Netherlands: { fill: "#3b6fb8", k: m.lerp([ru + 6, ru + 18], [0, 0.6]) }, "United Kingdom": { fill: "#c8352b", k: m.lerp([lk, lk + 12], [0, 0.8]) } }}>
          <MapLabel at={[24, 54]} text="EUROPE" size={58} k={1} />
          <Swords k={m.pop(ls, 11)} brk={m.lerp([wl, wl + 12], [0, 1])} />
          <MapLabel at={[WATERLOO[0] + 9, WATERLOO[1] - 3]} text="WATERLOO" size={50} type={m.lerp([wl, wl + 12], [0, 1])} />
          <Isle at={HELENA} r={30} t={m.t} name="SAINT HELENA" nameK={m.lerp([st - 10, st + 6], [0, 1])} size={54} below />
          {m.t >= lk ? <MapRoute via={ROUTE} k={sail} color="#f4efe4" width={8} mover={(x, y, a) => (
            <g>
              <Ship x={x} y={y - 12} s={100} angle={a} kind="sail" t={m.t} />
              {onShip ? <Napoleon x={x + 8} y={y - 22} s={44} /> : null}
            </g>
          )} /> : null}
          <Emperor at={[1.5, 45.5]} k={m.t < lk ? m.pop(np, 11) : 0} s={95} face="neutral" crown={m.pop(em, 10)} />
          <Emperor at={HELENA} k={m.t >= st ? m.pop(st, 11) : 0} s={60 + 40 * push} face="sad" />
          <Fence k={m.lerp([sp, sp + 12], [0, 1])} />
        </Ocean>
      </View>
    </Stage>
  );
};

export default Prison;
