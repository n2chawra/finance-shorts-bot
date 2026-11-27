// "Then the Second World War ended, and the winners drew a line straight across East Prussia." The dial ticks on a
// notch; smoke drifts over East Prussia and clears; Germany's colour fades; a treaty paper unrolls at the top and a
// giant pen draws the 1945 line straight across the land, which glows from end to end.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Limb, Stage, Txt, View, motion, rng } from "../../flat/kit";
import { MapRoute } from "../../flat/map";
import { CUT, Dial, Map, On, Prussia, SEPIA } from "./props";

const Pen: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y}) rotate(-35)`}>
    <Limb a={[0, -40]} b={[0, -240]} w={32} color="#2b2b3a" />
    <path d="M-16,-40 L0,0 L16,-40 Z" fill="#c9a227" stroke="#1d1a2b" strokeWidth={4} />
  </g>
);

const PUFFS = (() => { const r = rng("kal-smoke"); return Array.from({ length: 9 }).map(() => [19.6 + r() * 3.2, 53.5 + r() * 1.6, 50 + r() * 40] as [number, number, number]); })();

const Line: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const th = m.at("then", 2), wa = m.at("war", 14), en = m.at("ended", 26), wi = m.at("winners", 44), li = m.at("line", 62), ac = m.at("across", 80);
  const smoke = m.lerp([wa, wa + 10], [0, 1]) * (1 - m.lerp([en, en + 18], [0, 1]));
  const pen = m.lerp([li - 4, ac + 6], [0, 1]);
  const push = m.lerp([li - 6, li + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.4}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[21.2, 53.75 + 0.25 * push]} scale={10500 + 2000 * push} colors={{ Russia: { fill: "#e8d4a2", k: 0 } }}>
          <Prussia k={1} flagK={1 - m.lerp([en, en + 20], [0, 1])} />
          {smoke > 0 ? PUFFS.map(([lon, lat, r], i) => <On key={i} at={[lon, lat]} draw={(x, y) => <Ball x={x + m.wave(70 + i * 7, 12)} y={y - m.t * 0.6} r={r * (1 + 0.3 * smoke)} fill="#8c8478" sw={0} shadow={false} />} />) : null}
          <MapRoute via={CUT} k={1} color="#ffe08a" width={pen >= 1 ? 12 + 8 * m.pulse(ac + 6, 16) : 0.01} dash={false} />
          <MapRoute via={CUT} k={pen} color="#c8102e" width={12} dash={false} mover={(x, y) => (pen > 0 && pen < 1 ? <Pen x={x} y={y} /> : null)} />
        </Map>
        <rect x={-200} y={-200} width={1480} height={2320} fill={SEPIA} opacity={0.2} />
      </View>
      {(() => {
        const k = m.lerp([wi, wi + 14], [0, 1]);
        if (k <= 0) return null;
        return (
          <g>
            <Block x={300} y={440} w={480} h={230 * k} fill="#f4e6c4" r={12} />
            {k > 0.6 ? <g opacity={(k - 0.6) / 0.4}><Txt x={540} y={520} size={52} fill="#5a3a1a">TREATY</Txt>{[0, 1, 2].map((i) => <rect key={i} x={360} y={555 + i * 30} width={360 - i * 60} height={10} rx={5} fill="#b59a6a" />)}</g> : null}
          </g>
        );
      })()}
      <Dial pos={0.5 * m.lerp([th, th + 16], [0, 1])} />
    </Stage>
  );
};
export default Line;
