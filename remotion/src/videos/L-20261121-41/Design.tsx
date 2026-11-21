// Design (2D blueprint): the original drawing. The side elevation draws on "design" (roof framing, then the
// fourth-floor beam), both walkway decks fill on "both", the one continuous rod draws from the roof through both
// beams with a nut under each on "rod"; a load gauge slides in on "Even", its bar climbs to the figure on
// "reached", stopping short of the code line, which flashes on "code".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { LoadGauge, MonoLabel, useDisasterLook } from "../../disaster/index";
import { Elev, ramp, Sheet } from "./elev";

type Params = { fig?: { pct?: string } };

const Inner: React.FC<{ t: number; ev: Record<string, number>; pct: number }> = ({ t, ev, pct }) => {
  const L = useDisasterLook();
  const g = ramp(t, ev.even!, 14);
  const climb = ramp(t, ev.reached!, 26);
  const flash = t >= ev.code! ? 0.5 + 0.5 * Math.cos((t - ev.code!) / 3) : 0;
  return (
    <g>
      <MonoLabel x={1070} y={150} t={t} at={ev.design! - 30} text="the original design" size={48} color={L.ink} />
      <g>
        <Elev t={t} cx={560} at={{ roof: ev.design, upper: ev.design! + 10, lower: ev.both, rod: ev.rod, nuts: ev.rod! + 16 }} />
      </g>
      <MonoLabel x={1070} y={290} t={t} at={ev.rod! + 6} text="one rod" sub="roof to second floor" size={52} color={L.label} />
      {g > 0 && (
        <g opacity={g} transform={`translate(${(1 - g) * 120} 0)`}>
          <LoadGauge x={1070} y={560} size={740} value={pct * climb} limit={100} unit="%" label="strength" limitLabel="code expects" />
          {flash > 0 && <rect x={1070 + 740 * (100 / 150) - 10} y={520} width={20} height={200} fill={L.fail} opacity={0.35 * flash} />}
          <MonoLabel x={1070} y={850} t={t} at={ev.code} text="short of the code" size={48} color={L.fail} />
        </g>
      )}
    </g>
  );
};

const Design: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pct = Number(((p.beat.params as Params).fig?.pct ?? "0").replace(/[^\d.]/g, ""));
  const ev = { design: m.at("design", 4), both: m.at("both", 24), rod: m.at("rod", 50), even: m.at("even", 80), reached: m.at("reached", 95), code: m.at("code", 140) };
  const t = m.t;
  const toRod = ramp(t, ev.rod, 30), toGauge = ramp(t, ev.reached, 30);
  const zoom = 1 + 0.04 * toRod - 0.04 * toGauge + 0.02 * (t / Math.max(1, m.end));
  const cx = 960 - 60 * toRod * (1 - toGauge) + 30 * toGauge;
  const cy = 540;
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy}>
      <Inner t={t} ev={ev} pct={pct} />
    </Sheet>
  );
};

export default Design;
