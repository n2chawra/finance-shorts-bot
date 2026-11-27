// Promise: "{count} स्टेट समुद्र से लगे हैं। पर इनकी लकीर में छिपा राज़ क्या है?" Every coastal state flashes pale blue
// on "स्टेट"; a lighthouse rises in the Arabian Sea with the count on its board; the camera pulls back on "लकीर" as the
// coast pulses white, the lighthouse beam sweeps, and a magnifying glass slides onto Gujarat's coast on "राज़".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, STROKE, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples } from "../../flat/india";
import { COAST, F, MapView, OnMap, lerpFrame } from "./props";

type Params = { fig?: { count?: string } };

const Lighthouse: React.FC<{ x: number; y: number; k: number; beam: number; count: string }> = ({ x, y, k, beam, count }) => {
  if (k <= 0) return null;
  const up = (1 - Math.min(1, k)) * 240;
  const a = -150 + beam * 120;
  return (
    <g transform={`translate(${x} ${y + up})`} opacity={Math.min(1, k * 2)}>
      <path d={`M 0 -330 L ${1400 * Math.cos((a - 10) * Math.PI / 180)} ${-330 + 1400 * Math.sin((a - 10) * Math.PI / 180)} L ${1400 * Math.cos((a + 10) * Math.PI / 180)} ${-330 + 1400 * Math.sin((a + 10) * Math.PI / 180)} Z`}
        fill="#fff3b0" opacity={0.22} data-probe="skip" />
      <path d="M -60 0 L -38 -300 L 38 -300 L 60 0 Z" fill="#ffffff" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M -52 -110 L -46 -180 L 46 -180 L 52 -110 Z" fill="#e8453c" />
      <path d="M -44 -230 L -40 -280 L 40 -280 L 44 -230 Z" fill="#e8453c" />
      <rect x={-46} y={-350} width={92} height={56} rx={8} fill="#ffd84a" stroke={INK} strokeWidth={STROKE * 0.8} />
      <path d="M -54 -350 L 0 -400 L 54 -350 Z" fill={INK} />
      <Block x={-130} y={-560} w={260} h={170} r={22} fill="#1d5f8a" sw={STROKE} shadow={false} />
      <Txt x={0} y={-475} size={110} fill="#ffffff" weight={900}>{count}</Txt>
      <rect x={-90} y={-8} width={180} height={22} rx={10} fill={INK} opacity={0.3} />
    </g>
  );
};

const Glass: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x + (1 - k) * 500} ${y})`} data-probe="skip">
      <line x1={70} y1={70} x2={170} y2={170} stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <circle r={100} fill="#cfeeff" fillOpacity={0.25} stroke={INK} strokeWidth={14} />
      <circle r={88} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.7} />
    </g>
  );
};

const PromiseBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const count = (p.beat.params as Params).fig?.count ?? "";
  const st = m.at("state", 4), lg = m.at("lage", 14), lk = m.at("lakeer", 34), ch = m.at("chhipa", 42), rz = m.at("raaz", 52);
  const frame = lerpFrame(F.south, F.india, 0.55 + 0.45 * m.lerp([lk, lk + 22], [0, 1]));
  const flash = m.lerp([st, st + 6], [0, 1]) * (1 - 0.6 * m.lerp([lg + 10, lg + 30], [0, 1]));
  const states = Object.fromEntries(COAST.map((n) => [n, { fill: "#9fd8f5", k: flash }]));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#123049" vignette={0.3}>
        <View zoom={1.02 + m.wave(80, 0.01)}>
          <MapView frame={frame} states={states}>
            <SeaRipples t={m.t} k={1} />
            <CoastSurf t={m.t} />
            <CoastLine k={1} color={m.pulse(lk + 6, 10) > 0.3 ? "#ffffff" : "#5fd3ff"} width={10 + 6 * m.pulse(lk + 6, 10)} />
            <OnMap at={[77.2, 8.3]}>{(x, y) => <Lighthouse x={x - 60} y={y} k={m.pop(lg, 12)} beam={m.lerp([ch, ch + 30], [0, 1])} count={count} />}</OnMap>
            <OnMap at={[70.0, 21.5]}>{(x, y) => <Glass x={x} y={y} k={m.lerp([rz, rz + 12], [0, 1])} />}</OnMap>
          </MapView>
        </View>
      </Stage>
      <SourceLine p={p} y={190} />
    </AbsoluteFill>
  );
};
export default PromiseBeat;
