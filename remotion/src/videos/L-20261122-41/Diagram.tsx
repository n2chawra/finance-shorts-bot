// Diagram (flat, instrument-panel sheet): the hanger detail drawn as a side elevation, the load path in
// arrows. Modes (params.mode): original, original-loads, original-rod (the design: one continuous rod, a nut
// under each beam); built-upper, built-lower, built-path (as built: two offset rods, the lower walkway hung
// from the upper beam); compare (both details side by side); gap (the connection between the designer's and
// the fabricator's sheets, now signed by the engineer of record).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Arrow, HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { BEAM_H, DrawLine, Elev, LB_Y, ramp, ROOF_Y, Sheet, Stamp, UB_Y } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; inch: string }> = ({ t, e, mode, inch }) => {
  const L = useDisasterLook();
  const cx = 960;
  if (mode === "compare") {
    return (
      <g>
        <g transform={`translate(${-430 * ramp(t, e("paper"), 16)} 0) scale(1)`}><g transform="translate(960 540) scale(0.62) translate(-960 -540)"><Elev t={t} cx={cx} split={0} /></g></g>
        <g transform={`translate(${430 * ramp(t, e("paper"), 16)} 0)`}><g transform="translate(960 540) scale(0.62) translate(-960 -540)"><Elev t={t} cx={cx} split={ramp(t, e("moved"), 18)} /></g></g>
        <MonoLabel x={360} y={120} t={t} at={e("paper")} text="CONTRACT DRAWING" size={40} />
        <MonoLabel x={1200} y={120} t={t} at={e("paper") + 8} text="SHOP DRAWING" size={40} color={L.label} />
        <Stamp x={1400} y={900} t={t} at={e("inches")} text={`${inch} IN`} color={L.label} size={70} rot={-4} />
      </g>
    );
  }
  if (mode === "gap") {
    const d = ramp(t, e("designer"), 18), f = ramp(t, e("fabricator"), 18);
    return (
      <g>
        <rect x={160 + 300 * d} y={200} width={560} height={680} fill="rgba(57,255,154,0.06)" stroke={L.line} strokeWidth={4} />
        <MonoLabel x={190 + 300 * d} y={260} t={t} at={0} text="DESIGNER" size={44} />
        <rect x={1200 - 300 * f} y={200} width={560} height={680} fill="rgba(255,176,0,0.06)" stroke={L.label} strokeWidth={4} />
        <MonoLabel x={1230 - 300 * f} y={260} t={t} at={0} text="FABRICATOR" size={44} color={L.label} />
        <g transform="translate(960 560) scale(0.45) translate(-960 -540)"><Elev t={t} cx={cx} split={1} hot={0.5 * ramp(t, e("connection"), 10) * (1 - f)} /></g>
        <Stamp x={960} y={940} t={t} at={e("fabricator") + 14} text="ENGINEER OF RECORD" color={L.ok} size={54} rot={-3} />
      </g>
    );
  }
  const built = mode.startsWith("built");
  const at = mode === "original" ? { roof: e("original"), upper: e("fourth") - 6, lower: e("second") - 6, rod: e("rod"), nuts: e("second") + 6 }
    : mode === "built-upper" ? { rod: e("rod"), upper: e("fourth") - 4, lower: 1e9 }
    : {};
  const hot = mode === "original-rod" ? 0.35 * ramp(t, e("one"), 10) : mode === "built-path" ? 0.6 * ramp(t, e("path"), 20) : 0;
  return (
    <g>
      <Elev t={t} cx={cx} at={at} split={built ? 1 : 0} hot={hot} labels={mode === "original" ? e("fourth") : undefined} />
      <MonoLabel x={120} y={110} t={t} at={0} text={built ? "AS BUILT · SHOP DRAWING" : "ORIGINAL DETAIL · CONTRACT DRAWING"} size={40} color={built ? L.label : L.line} />
      {mode === "original-loads" && (
        <g>
          <Arrow x1={cx + 300} y1={UB_Y - 160} x2={cx + 300} y2={UB_Y - 30} k={ramp(t, e("carried"), 14)} color={L.ok} w={9} />
          <Arrow x1={cx + 300} y1={LB_Y - 160} x2={cx + 300} y2={LB_Y - 30} k={ramp(t, e("carried") + 6, 14)} color={L.ok} w={9} />
          <MonoLabel x={cx + 340} y={UB_Y - 90} t={t} at={e("walkway")} text="ONE WALKWAY" size={42} color={L.ok} />
          <MonoLabel x={cx + 340} y={LB_Y - 90} t={t} at={e("walkway") + 6} text="ONE WALKWAY" size={42} color={L.ok} />
        </g>
      )}
      {mode === "original-rod" && (
        <g>
          <DrawLine x1={cx} y1={ROOF_Y} x2={cx} y2={UB_Y} k={ramp(t, e("rod"), 16)} color={L.label} w={30} />
          <MonoLabel x={cx + 60} y={300} t={t} at={e("both")} text="ROD: BOTH WALKWAYS" size={42} color={L.label} />
          <circle cx={cx} cy={UB_Y + BEAM_H + 14} r={70} fill="none" stroke={L.ok} strokeWidth={7} opacity={ramp(t, e("one"), 10)} />
          <MonoLabel x={cx - 640} y={UB_Y + BEAM_H + 30} t={t} at={e("one")} text="THIS NUT: ONE WALKWAY" size={42} color={L.ok} />
        </g>
      )}
      {mode === "built-lower" && (
        <g>
          <DrawLine x1={cx - 46} y1={UB_Y + BEAM_H + 110} x2={cx + 46} y2={UB_Y + BEAM_H + 110} k={ramp(t, e("inward"), 12)} color={L.label} w={5} />
          <MonoLabel x={cx + 80} y={UB_Y + BEAM_H + 125} t={t} at={e("inward")} text={`${inch} IN OFFSET`} size={44} color={L.label} />
          <Arrow x1={cx + 46} y1={LB_Y - 20} x2={cx + 46} y2={UB_Y + BEAM_H + 40} k={ramp(t, e("hung"), 16)} color={L.fail} w={8} />
        </g>
      )}
      {mode === "built-path" && (
        <g>
          <Arrow x1={cx + 330} y1={LB_Y - 170} x2={cx + 330} y2={LB_Y - 30} k={ramp(t, e("weight"), 12)} color={L.label} w={9} />
          <Arrow x1={cx + 120} y1={LB_Y - 10} x2={cx + 120} y2={UB_Y + BEAM_H + 20} k={ramp(t, e("path"), 22)} color={L.fail} w={12} />
          <MonoLabel x={cx + 160} y={640} t={t} at={e("path")} text="UP INTO THE UPPER BEAM" size={42} color={L.fail} />
        </g>
      )}
    </g>
  );
};

const Diagram: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "original";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const drift = t / Math.max(1, m.end);
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.06 * drift} cx={960 + 20 * drift} cy={540} html={<HonestyTag t={t} tag="principle" at={0} sub="forces simplified" />}>
      <Inner t={t} e={e} mode={mode} inch={figOf(p, "inch")} />
    </Sheet>
  );
};

export default Diagram;
