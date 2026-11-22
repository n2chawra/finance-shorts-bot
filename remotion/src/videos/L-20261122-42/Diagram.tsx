// Diagram (flat, drafting sheet): the splitter and its relief system drawn as a side elevation. Modes
// (params.mode): howitworks (furnace loop, vapour up, heavy liquid out at the base), inout (feed arrows in,
// the outlet valve CLOSED), pressure (the overhead pipe filling, a pressure gauge swinging between the
// figures), blowdown (the drum and open stack, the vent arrow), flare (a dashed line to a ghost flare,
// NOT CONNECTED).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Arrow, HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { BigGauge, DrawBox, DrawLine, ramp, Sheet, Stamp } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };
const TX = 560, TTOP = 140, TBOT = 940, TW = 150;   // the tower on the sheet
const DX = 1380;                                   // the drum

const TowerDrawing: React.FC<{ t: number; fill?: number; color?: string }> = ({ t, fill = 0.08, color }) => {
  const L = useDisasterLook();
  return (
    <g>
      <DrawBox x={TX} y={TTOP} w={TW} h={TBOT - TTOP} k={ramp(t, 0, 16)} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={TX + 10} y1={TTOP + 50 + i * 62} x2={TX + TW - 10} y2={TTOP + 50 + i * 62} stroke={L.line} strokeOpacity={0.5} strokeWidth={3} />)}
      <rect x={TX + 6} y={TBOT - 6 - (TBOT - TTOP - 12) * fill} width={TW - 12} height={(TBOT - TTOP - 12) * fill} fill={color ?? L.label} opacity={0.75} />
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps }> = ({ t, e, mode, p }) => {
  const L = useDisasterLook();
  const f = (n: string) => figOf(p, n);
  if (mode === "howitworks") {
    return (
      <g>
        <TowerDrawing t={t} />
        <DrawBox x={220} y={760} w={220} h={160} k={ramp(t, e("furnace"), 14)} fill="#2a1c10" color={L.label} />
        <MonoLabel x={330} y={720} t={t} at={e("furnace")} text="FURNACE" size={40} anchor="middle" color={L.label} />
        <DrawLine x1={440} y1={860} x2={TX} y2={860} k={ramp(t, e("furnace") + 6, 12)} color={L.label} w={10} />
        {[0, 1, 2].map((i) => <Arrow key={i} x1={TX + 40 + i * 35} y1={820} x2={TX + 40 + i * 35} y2={220} k={ramp(t, e("light") + i * 4, 24)} color="#7fb6ff" w={7} />)}
        <MonoLabel x={TX + TW + 40} y={260} t={t} at={e("light")} text="LIGHT PART · UP" size={42} color="#7fb6ff" />
        <Arrow x1={TX + TW} y1={910} x2={TX + TW + 380} y2={910} k={ramp(t, e("heavy"), 16)} color={L.label} w={10} />
        <MonoLabel x={TX + TW + 40} y={870} t={t} at={e("bottom")} text="HEAVY PART · OUT AT THE BASE" size={42} color={L.label} />
      </g>
    );
  }
  if (mode === "inout") {
    return (
      <g>
        <TowerDrawing t={t} fill={0.08 + 0.3 * ramp(t, e("flowing"), 60)} />
        {[0, 1].map((i) => <Arrow key={i} x1={180} y1={520 + i * 80} x2={TX - 10} y2={520 + i * 80} k={ramp(t, e("flowing") + i * 6, 16)} color={L.label} w={10} />)}
        <MonoLabel x={180} y={480} t={t} at={e("flowing")} text="FEED IN" size={44} color={L.label} />
        <DrawLine x1={TX + TW} y1={910} x2={TX + TW + 500} y2={910} k={1} color={L.line} w={10} />
        <g transform={`translate(${TX + TW + 250} 910)`} opacity={ramp(t, e("valve"), 10)}>
          <path d="M -40 -30 L 40 30 L 40 -30 L -40 30 Z" fill="#0b0f0c" stroke={L.fail} strokeWidth={6} />
        </g>
        <MonoLabel x={TX + TW + 120} y={850} t={t} at={e("valve")} text="OUTLET VALVE" size={42} />
        <Stamp x={TX + TW + 300} y={760} t={t} at={e("shut")} text="CLOSED" color={L.fail} size={90} rot={-6} />
      </g>
    );
  }
  if (mode === "pressure") {
    const v = ramp(t, e("rose"), 30);
    const lo = Number(f("from")) || 0, hi = Number(f("to")) || 1;
    return (
      <g>
        <TowerDrawing t={t} fill={0.96} />
        <DrawLine x1={TX + TW / 2} y1={TTOP} x2={TX + TW + 120} y2={TTOP} k={1} color={L.line} w={12} />
        <DrawLine x1={TX + TW + 120} y1={TTOP} x2={TX + TW + 120} y2={TBOT - 90} k={1} color={L.line} w={12} />
        <DrawLine x1={TX + TW + 120} y1={TTOP} x2={TX + TW + 120} y2={TBOT - 90} k={ramp(t, e("pipe"), 40)} color={L.label} w={16} />
        <MonoLabel x={TX + TW + 150} y={300} t={t} at={e("pipe")} text="OVERHEAD PIPE FILLING" size={40} color={L.label} />
        <BigGauge x={1000} y={720} w={780} v={((lo + (hi - lo) * v) / (hi * 1.25)) * ramp(t, e("pressure"), 10)} label="pressure at the valves, psi"
          value={v > 0.02 ? countText(String(Math.round(lo + (hi - lo) * v)), 1) : f("from")} />
      </g>
    );
  }
  // the blowdown drum and stack (blowdown, flare)
  const flare = mode === "flare";
  return (
    <g>
      <DrawBox x={DX - 110} y={700} w={220} h={240} k={ramp(t, flare ? 0 : e("drum"), 14)} fill="#2a1c10" color={L.label} />
      <DrawBox x={DX - 30} y={180} w={60} h={520} k={ramp(t, flare ? 0 : e("stack"), 20)} fill="#2a1c10" color={L.label} />
      <MonoLabel x={DX - 140} y={820} t={t} at={flare ? 0 : e("drum")} text="BLOWDOWN DRUM" size={42} anchor="end" />
      <MonoLabel x={DX + 80} y={300} t={t} at={flare ? 0 : e("stack")} text="OPEN STACK" size={42} />
      <DrawLine x1={300} y1={880} x2={DX - 110} y2={880} k={1} color={L.line} w={12} />
      <MonoLabel x={300} y={950} t={t} at={0} text="FROM THE RELIEF VALVES" size={38} />
      <Arrow x1={DX} y1={200} x2={DX} y2={60} k={flare ? 1 : ramp(t, e("vented"), 14)} color={L.fail} w={10} />
      {!flare && <circle cx={DX} cy={180} r={70} fill="none" stroke={L.fail} strokeWidth={7} opacity={ramp(t, e("air"), 10)} />}
      {flare && (
        <g>
          <DrawLine x1={DX + 110} y1={760} x2={1760} y2={760} k={ramp(t, e("never"), 20)} color={L.ink} w={6} dash="22 16" />
          <g opacity={0.3 + 0.7 * ramp(t, e("flare"), 10) * (1 - 0.6 * ramp(t, e("flare") + 20, 14))}>
            <rect x={1730} y={260} width={40} height={500} fill="#1d2226" stroke={L.line} strokeWidth={4} />
            <path d="M 1750 250 C 1720 200 1760 170 1750 120 C 1790 170 1780 210 1750 250 Z" fill="#ff8a2a" />
          </g>
          <MonoLabel x={1700} y={830} t={t} at={e("flare")} text="FLARE" size={42} anchor="middle" />
          <Stamp x={1540} y={680} t={t} at={e("safely")} text="NOT CONNECTED" color={L.fail} size={64} rot={-5} />
        </g>
      )}
    </g>
  );
};

const Diagram: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "howitworks";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.03 + 0.03 * (t / Math.max(1, m.end))} cx={960} cy={545} html={<HonestyTag t={t} tag="principle" at={0} sub="simplified drawing" />}>
      <Inner t={t} e={e} mode={mode} p={p} />
    </Sheet>
  );
};

export default Diagram;
