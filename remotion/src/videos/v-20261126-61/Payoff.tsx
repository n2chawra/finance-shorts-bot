// Payoff: "ज़मीन नहीं बढ़ी, नाप बदली। अब बड़े मैप पर हर खाड़ी और मोड़ नापा गया, छोटे द्वीप भी जोड़े गए, और तट हो गया {new}।"
// The ruled line holds over Gujarat's coast on "ज़मीन"; a measuring wheel starts rolling and the old paper turns to
// today's map on "नाप"; the camera dives into the Gulf of Khambhat on "मैप" and the detailed coast runs in and out of the
// bay on "खाड़ी"; the shore's small bends flash on "मोड़"; the camera pulls back on "द्वीप" and the islands' coasts light,
// rings pulse on "जोड़े"; the whole new coastline blazes on "तट" and the atlas sign drops in with the new length.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { Board, COAST, F, MapView, OnMap, Ruled, UTS, UT_COLOUR, Wheel, lerpFrame, painted, type LL } from "./props";

type Params = { fig?: { new?: string } };

/** Small bends of the gulf's shore that flash one after another. */
const BENDS: LL[] = [[72.15, 21.0], [72.1, 21.6], [72.3, 22.2], [72.6, 22.25], [72.62, 21.66], [72.62, 21.12], [72.55, 20.8]];

const Ring: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 40 }) =>
  k <= 0 ? null : <circle cx={x} cy={y} r={r * (0.6 + 0.6 * Math.min(1, k))} fill="none" stroke="#ffffff" strokeWidth={7} opacity={Math.max(0, 1 - k * 0.7)} data-probe="skip" />;

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const now = (p.beat.params as Params).fig?.new ?? "";
  const za = m.at("zameen", 2), na = m.at("naap", 20), mp = m.at("map", 36), kh = m.at("khadi", 46), md = m.at("mod", 56), dw = m.at("dweep", 80), jo = m.at("jode", 92), tt = m.at("tat", 110), ho = m.at("ho", 116);
  const dive = m.lerp([mp - 2, kh + 12], [0, 1]), back = m.lerp([dw - 4, dw + 22], [0, 1]);
  const settle = m.lerp([ho + 14, m.end], [0, 1]);
  const wide = { center: [F.peninsula.center[0] + 1.5, F.peninsula.center[1] + 0.8 * settle] as LL, scale: F.peninsula.scale * (0.86 + 0.04 * settle) };
  const frame = lerpFrame(lerpFrame(F.gujarat, F.khambhat, dive), wide, back);
  const sepia = 1 - m.lerp([na, na + 16], [0, 1]);
  const states: Record<string, StateFx> = { ...painted([...COAST, ...UTS], 0.7 + 0.3 * back), ...Object.fromEntries(UTS.map((u) => [u, { fill: UT_COLOUR, k: 0.3 + 0.7 * back, lift: m.pulse(jo + 4, 10) }])) };
  const roll = m.lerp([na, dw], [0, 1]);
  const path: LL[] = [[72.55, 20.8], [72.62, 21.12], [72.62, 21.66], [72.6, 22.25]];
  const seg = Math.min(path.length - 2, Math.floor(roll * (path.length - 1)));
  const f = roll * (path.length - 1) - seg;
  const ll: LL = [path[seg]![0] + (path[seg + 1]![0] - path[seg]![0]) * f, path[seg]![1] + (path[seg + 1]![1] - path[seg]![1]) * f];
  const wheelK = m.pop(na, 12) * (1 - back);
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.01) + 0.03 * m.pulse(tt + 4, 8)}>
        <MapView frame={frame} states={states} sheet={sepia > 0.5 ? "#ead9b0" : undefined}>
          <SeaRipples t={m.t} k={1 - sepia} />
          <CoastSurf t={m.t} k={1 - sepia} />
          <Ruled k={1 - m.lerp([kh, kh + 14], [0, 1])} width={9 + 3 * m.pulse(za + 6, 10)} />
          <CoastLine k={m.lerp([mp, kh + 20], [0, 1])} width={10 + 8 * m.pulse(tt + 6, 12) + 6 * m.pulse(ho + 50, 10)} color={back > 0.5 ? "#ffffff" : "#5fd3ff"} />
          {UTS.slice(2).map((u) => <CoastLine key={u} name={u} k={m.lerp([dw, dw + 14], [0, 1])} width={10} color="#ffffff" />)}
          {BENDS.map((b, i) => <OnMap key={i} at={b}>{(x, y) => <Ring x={x} y={y} k={m.lerp([md + i * 3, md + i * 3 + 12], [0, 1]) * (1 - back)} />}</OnMap>)}
          <OnMap at={[72.7, 10.6]}>{(x, y) => <Ring x={x} y={y} k={m.lerp([jo, jo + 14], [0, 1])} r={60} />}</OnMap>
          <OnMap at={[92.8, 11.0]}>{(x, y) => <Ring x={x} y={y} k={m.lerp([jo + 3, jo + 17], [0, 1])} r={70} />}</OnMap>
          <OnMap at={ll}>{(x, y) => <Wheel x={x} y={y} r={44} spin={m.t * 9} k={wheelK} />}</OnMap>
        </MapView>
        <Board x={540} y={360 + m.lerp([ho + 16, m.end], [0, 24])} k={m.pop(ho, 12)} title="नई नाप में तट" value={now} bg="#1d5f8a" w={680} />
        <Flash k={m.pulse(tt + 2, 6) * 0.6} />
      </View>
    </Stage>
  );
};
export default Payoff;
