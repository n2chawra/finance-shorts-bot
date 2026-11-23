// Hook: "What if the Suez Canal, one thin ditch in Egypt, closed for a whole year?" Egypt between two seas
// on the channel's old map. In frame 0 the canal is already drawing itself south through the desert with a
// cargo ship in it; Egypt paints in from the canal on "Egypt" and its name writes on; on "closed" the
// camera closes in and a red barrier swings shut across the water; on "year" a calendar drops onto it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { Barrier, CANAL, Calendar, Canal, GOLD, SUEZ_MID, World, rider } from "./props";
import { useAt } from "../../flat/map";

const BarrierAt: React.FC<{ k: number; cal: number; s: number }> = ({ k, cal, s }) => {
  const xy = useAt()(SUEZ_MID);
  if (!xy) return null;
  return (
    <g>
      {k > 0 ? <Barrier x={xy[0] + 30} y={xy[1]} s={s} k={k} /> : null}
      {cal > 0.01 ? <g transform={`translate(0 ${(1 - cal) * -200})`}><Calendar x={xy[0] + 150} y={xy[1] - 120} s={s * 0.9} label="YEAR" /></g> : null}
    </g>
  );
};

/** The hook's map, also the loop's last frame. */
export const EgyptMap: React.FC<{ t: number; canal: number; ship: number; egypt: number; label: number; scale: number; center: [number, number]; barrier: number; cal: number }> = ({
  canal, ship, egypt, label, scale, center, barrier, cal,
}) => (
  <World center={center} scale={scale} colors={{ Egypt: { fill: "#e2a45f", paint: egypt > 0 ? egypt : 0.001, from: SUEZ_MID, draw: egypt > 0 ? 1 : 0.001 } }}>
    <Canal k={canal} width={12 + scale / 2000} />
    <MapRoute via={CANAL} k={ship} color="rgba(0,0,0,0)" width={1} dash={false} mover={rider(46 + scale / 600)} />
    <MapLabel at={[31.2, 27.6]} text="EGYPT" size={72} type={label} k={Math.max(0, 1 - (scale - 8500) / 3000)} />
    <MapLabel at={[32.9, 31.75]} text="SUEZ CANAL" size={50} fill={GOLD} />
    <BarrierAt k={barrier} cal={cal} s={90 + scale / 300} />
  </World>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const suez = m.at("suez", 6), egypt = m.at("egypt", 40), closed = m.at("closed", 60), year = m.at("year", 80);
  const push = m.lerp([closed - 4, closed + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <EgyptMap t={m.t}
          canal={m.lerp([0, suez + 24], [0.35, 1])}
          ship={m.lerp([0, m.end], [0.12, 0.55])}
          egypt={m.lerp([egypt, egypt + 20], [0, 1])}
          label={m.lerp([egypt, egypt + 12], [0, 1])}
          scale={8500 + 9000 * push}
          center={[32.6 - 0.3 * push, 29.9 + 0.55 * push]}
          barrier={m.lerp([closed + 2, closed + 12], [0, 1])}
          cal={m.pop(year, 11)} />
      </View>
    </Stage>
  );
};

export default Hook;
