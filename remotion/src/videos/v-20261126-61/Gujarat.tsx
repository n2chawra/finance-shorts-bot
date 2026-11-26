// Gujarat: "सबसे लंबा तट गुजरात का, पूरे {gj}।" Gujarat lifts off the sheet on "सबसे", its coast traces round the Gulf of
// Kutch and the Gulf of Khambhat on "तट", the camera pushes in on "गुजरात", and a buoy sign bobs up in the sea with
// Gujarat's length on "पूरे".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, STROKE, Stage, Txt, View, motion, Block } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { COAST, COLOUR, F, MapView, OnMap, UTS, lerpFrame, painted } from "./props";

type Params = { fig?: { gj?: string } };

const Buoy: React.FC<{ x: number; y: number; k: number; bob: number; value: string }> = ({ x, y, k, bob, value }) => {
  if (k <= 0) return null;
  const up = (1 - Math.min(1, k)) * 200;
  return (
    <g transform={`translate(${x} ${y + up + bob})`} opacity={Math.min(1, k * 2)}>
      <ellipse cx={0} cy={30} rx={120} ry={22} fill="#e9f8ff" opacity={0.5} data-probe="skip" />
      <path d="M -70 20 L 70 20 L 50 -40 L -50 -40 Z" fill="#e8453c" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={-8} y={-180} width={16} height={140} fill="#8a8f98" stroke={INK} strokeWidth={4} />
      <Block x={-270} y={-370} w={540} h={200} r={24} fill="#f2a93b" sw={STROKE} shadow={false} />
      <Txt x={0} y={-305} size={50} fill={INK} weight={800}>गुजरात का तट</Txt>
      <Txt x={0} y={-225} size={68} fill={INK} weight={900}>{value}</Txt>
    </g>
  );
};

const Gujarat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const gj = (p.beat.params as Params).fig?.gj ?? "";
  const stn = m.at("steton", 0), sb = m.at("sabse", 6), tt = m.at("tat", 12), gu = m.at("gujarat", 22), po = m.at("poore", 32);
  const base = lerpFrame(F.west, F.gujarat, m.lerp([0, sb + 10], [0.3, 0.7]) + 0.3 * m.lerp([gu, gu + 18], [0, 1]));
  const drift = m.lerp([po + 14, m.end], [0, 1]);
  const frame = { center: [base.center[0] + 0.5 * drift, base.center[1] - 0.4 * drift] as [number, number], scale: base.scale };
  const states: Record<string, StateFx> = { ...painted([...COAST, ...UTS], 0.55 - 0.25 * m.lerp([stn, stn + 10], [0, 1])), Gujarat: { fill: COLOUR.Gujarat!, lift: m.lerp([sb, sb + 12], [0, 1]) } };
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(60, 0.012)}>
        <MapView frame={frame} states={states}>
          <SeaRipples t={m.t} k={1} />
          <CoastSurf t={m.t} />
          <CoastLine name="Gujarat" k={m.lerp([tt, tt + 22], [0, 1])} width={13 + 5 * m.pulse(gu + 4, 8) + 6 * m.pulse(po + 56, 10)} color="#ffffff" />
          <OnMap at={[68.2, 20.4]}>{(x, y) => <Buoy x={Math.max(310, Math.min(770, x))} y={Math.min(1250, Math.max(620, y))} k={m.pop(po, 12)} bob={m.wave(34, 6)} value={gj} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Gujarat;
