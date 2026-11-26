// Payoff: "जर्मनी है {area}। राजस्थान उसका {pct} है, बस ज़रा सा पीछे।" Germany drops onto Rajasthan with a thud, its area
// on a sign; on "राजस्थान" a second sign shows Rajasthan's share of Germany; on "बस" the strip of Germany left over glows
// red round Rajasthan's edge, and on "ज़रा" two fingers pinch the gap.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { SeaRipples, StateUnion } from "../../flat/india";
import { Board, F, Laid, MapView, OnMap, RJ, SAND, lerpFrame, rj } from "./props";

type Params = { fig?: { area?: string; pct?: string } };

const Pinch: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const g = 40 - 22 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, k * 2)} data-probe="skip">
      <path d={`M ${-g} -10 L ${-g - 30} -120 L ${-g - 6} -124 L ${-g + 14} -12 Z`} fill="#f2c39b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${g} -10 L ${g + 30} -120 L ${g + 6} -124 L ${g - 14} -12 Z`} fill="#f2c39b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const ge = m.at("germany", 2), hai = m.at("hai", 10), ra = m.at("rajasthan", 60), bas = m.at("bas", 90), za = m.at("zara", 98);
  const frame = lerpFrame(lerpFrame(F.rj, F.nw, m.lerp([ra - 4, ra + 16], [0, 0.8])), F.rj, m.lerp([za - 2, za + 16], [0, 0.9]));
  const glow = m.lerp([bas, bas + 10], [0, 1]);
  return (
    <Stage p={p} bg="#1a1222" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012) + 0.03 * m.pulse(ge + 4, 6)}>
        <MapView frame={frame} states={rj({ lift: 0.4 + 0.3 * m.pulse(ge + 4, 8) })}>
          <SeaRipples t={m.t} />
          <g opacity={1 - 0.35 * glow}><Laid name="Germany" k={1} fill="#dd0000" flagK={0.6} /></g>
          <g opacity={glow * (0.6 + 0.4 * Math.sin(m.t / 5))}><Laid name="Germany" k={1} fill="#ff4a3a" flagK={0} /></g>
          <StateUnion names={[RJ]} fill={SAND} k={glow} />
          <OnMap at={[70.2, 27.6]}>{(x, y) => <Pinch x={x} y={y} k={m.pop(za, 10)} />}</OnMap>
        </MapView>
        <Board x={540} y={330} k={m.pop(hai, 12)} title="जर्मनी" value={fig.area ?? ""} bg="#2b2b33" />
        <Board x={540} y={590} k={m.pop(ra, 12)} title="राजस्थान = जर्मनी का" value={fig.pct ?? ""} bg="#8a4b1f" w={560} />
      </View>
    </Stage>
  );
};
export default Payoff;
