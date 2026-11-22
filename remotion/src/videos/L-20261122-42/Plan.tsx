// Plan (flat, site plan from above): the unit, the blowdown drum, the truck and the contractors' trailers
// on a drafting grid. Modes (params.mode): close (a distance line from the drum to the nearest trailer, its
// figure), damage (damaged trailers amber, destroyed red, counts from the figures), ring (a ring out from the
// drum to the farthest injury), question (a question mark between trailers and drum), move (the trailers
// slide out of a red zone, AGREED stamp, the alert banner).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { MonoLabel, useDisasterLook } from "../../disaster/index";
import { DrawLine, ramp, Sheet, Stamp } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };
const DRUM = { x: 760, y: 420 };

const TrailerIcon: React.FC<{ x: number; y: number; c: string; k?: number }> = ({ x, y, c, k = 1 }) => (
  <g opacity={k} transform={`translate(${x} ${y})`}>
    <rect x={-46} y={-18} width={92} height={36} rx={4} fill={c} fillOpacity={0.3} stroke={c} strokeWidth={4} />
    <line x1={-30} y1={-18} x2={-30} y2={18} stroke={c} strokeWidth={2} />
  </g>
);

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps }> = ({ t, e, mode, p }) => {
  const L = useDisasterLook();
  const f = (n: string) => figOf(p, n);
  const move = mode === "move" ? ramp(t, e("trailers"), 30) : 0;
  const near = Array.from({ length: 8 }, (_, i) => ({ x: 640 + (i % 4) * 130 + move * 520, y: 680 + Math.floor(i / 4) * 80 + move * 120 }));
  const dropIn = mode === "close" ? ramp(t, e("placed"), 14) : 1;
  return (
    <g>
      {/* the unit block, the tower, the drum, the truck */}
      <rect x={220} y={300} width={440} height={240} fill="rgba(57,255,154,0.08)" stroke={L.line} strokeWidth={4} />
      <MonoLabel x={240} y={290} t={t} at={0} text="ISOM UNIT" size={36} />
      <circle cx={330} cy={420} r={34} fill="#1d2226" stroke={L.line} strokeWidth={4} />
      <MonoLabel x={330} y={500} t={t} at={0} text="TOWER" size={32} anchor="middle" />
      <circle cx={DRUM.x} cy={DRUM.y} r={30} fill="#2a1c10" stroke={L.label} strokeWidth={5} />
      <MonoLabel x={DRUM.x} y={DRUM.y - 50} t={t} at={0} text="BLOWDOWN DRUM" size={32} anchor="middle" color={L.label} />
      {mode !== "move" && <rect x={DRUM.x + 40} y={DRUM.y + 30} width={50} height={26} fill="#d9d6cc" />}
      {(mode === "move" || mode === "question") && <circle cx={DRUM.x} cy={DRUM.y} r={360} fill={L.fail} opacity={0.08 + 0.04 * Math.sin(t / 10)} stroke={L.fail} strokeWidth={4} strokeDasharray="18 12" />}
      {/* trailers */}
      {near.map((n, i) => {
        const destroyed = mode === "damage" && i < 5 && t >= e("destroyed");
        const damaged = mode === "damage" && t >= e("damaged");
        return <TrailerIcon key={i} x={n.x} y={n.y - (1 - dropIn) * 200} k={dropIn} c={destroyed ? L.fail : damaged ? "#ffb23e" : L.ink} />;
      })}
      {mode === "close" && (
        <g>
          <DrawLine x1={DRUM.x} y1={DRUM.y + 30} x2={near[0]!.x} y2={near[0]!.y - 18} k={ramp(t, e("close"), 16)} color={L.label} w={6} dash="14 10" />
          <Stamp x={480} y={600} t={t} at={e("drum")} text={`${f("dist")} FT`} color={L.label} size={80} rot={-4} />
        </g>
      )}
      {mode === "damage" && (
        <g>
          <text x={1320} y={420} fontFamily={L.fonts.value} fontSize={110} fill="#ffb23e" opacity={ramp(t, e("damaged"), 10)}>{countText(f("damaged"), ramp(t, e("damaged"), 18))}+</text>
          <MonoLabel x={1320} y={470} t={t} at={e("damaged")} text="TRAILERS DAMAGED" size={40} color="#ffb23e" />
          <text x={1320} y={640} fontFamily={L.fonts.value} fontSize={110} fill={L.fail} opacity={ramp(t, e("destroyed"), 10)}>{countText(f("destroyed"), ramp(t, e("destroyed"), 18))}</text>
          <MonoLabel x={1320} y={690} t={t} at={e("destroyed")} text="DESTROYED" size={40} color={L.fail} />
        </g>
      )}
      {mode === "ring" && (
        <g>
          <circle cx={DRUM.x} cy={DRUM.y} r={760 * ramp(t, e("injured"), 30)} fill="none" stroke={L.label} strokeWidth={6} strokeDasharray="20 14" />
          <TrailerIcon x={1560} y={760} c={L.label} k={ramp(t, e("person"), 10)} />
          <Stamp x={1400} y={300} t={t} at={e("away")} text={`${f("far")} FT`} color={L.label} size={80} rot={-4} />
        </g>
      )}
      {mode === "question" && <text x={760} y={760} textAnchor="middle" fontFamily={L.fonts.value} fontSize={220} fill={L.fail} opacity={ramp(t, e("close"), 10)}>?</text>}
      {mode === "question" && <Stamp x={1450} y={300} t={t} at={e("too")} text="CSB · TRAILER SITING" color={L.label} size={56} rot={-4} />}
      {mode === "move" && (
        <g>
          <Stamp x={1400} y={260} t={t} at={e("agreed")} text="AGREED" color={L.ok} size={90} rot={-6} />
          <rect x={160} y={860} width={1600 * ramp(t, e("alert"), 16)} height={90} fill="#ffb000" opacity={0.9} />
          {t >= e("alert") + 8 && <text x={200} y={922} fontFamily={L.fonts.mono} fontWeight={700} fontSize={46} fill="#0b0f0c">SAFETY ALERT · PLACE TRAILERS SAFELY</text>}
        </g>
      )}
    </g>
  );
};

const Plan: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "close";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.04 * (t / Math.max(1, m.end))} cx={960} cy={560}>
      <Inner t={t} e={e} mode={mode} p={p} />
    </Sheet>
  );
};

export default Plan;
