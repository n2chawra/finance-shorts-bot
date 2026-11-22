// Capacity (flat): strength against load as instruments. Modes (params.mode): orig (the code's expected
// strength bar against the original connection's figure), double (the load needle swings from one walkway to
// double), design (the crowd's load far below the design mark), kncode / kntested (the code's minimum in
// kilonewtons, then the tested average rising beside it and stopping far short, red).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { BigGauge, ramp, Sheet, Stamp } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

const Bar: React.FC<{ x: number; y: number; h: number; v: number; color: string; label: string; value: string; t: number; at: number }> = ({ x, y, h, v, color, label, value, t, at }) => {
  const L = useDisasterLook();
  return (
    <g>
      <rect x={x} y={y} width={220} height={h} fill="#0b0f0c" stroke={L.line} strokeOpacity={0.4} strokeWidth={4} />
      <rect x={x + 14} y={y + h - (h - 28) * v - 14} width={192} height={(h - 28) * v} fill={color} opacity={0.85} />
      <text x={x + 110} y={y + h - (h - 28) * v - 40} textAnchor="middle" fontFamily={L.fonts.value} fontSize={72} fill={color} opacity={v > 0.02 ? 1 : 0}>{value}</text>
      <MonoLabel x={x + 110} y={y + h + 60} t={t} at={at} text={label} size={36} anchor="middle" />
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps }> = ({ t, e, mode, p }) => {
  const L = useDisasterLook();
  const f = (n: string) => figOf(p, n);
  if (mode === "orig") {
    const v = (parseFloat(f("orig")) || 0) / 100;
    const k = ramp(t, e("expected"), 24);
    return (
      <g>
        <Bar x={560} y={200} h={640} v={ramp(t, e("strength"), 20)} color={L.ok} label="CODE EXPECTED" value="" t={t} at={e("strength")} />
        <Bar x={1140} y={200} h={640} v={v * k} color={L.label} label="ORIGINAL DETAIL" value={countText(f("orig"), k)} t={t} at={e("expected")} />
        <MonoLabel x={120} y={110} t={t} at={0} text="ULTIMATE STRENGTH · ONE CONNECTION" size={40} />
      </g>
    );
  }
  if (mode === "kncode" || mode === "kntested") {
    const code = parseFloat(f("code")) || 1, tested = parseFloat(f("tested")) || 0;
    const kc = mode === "kncode" ? ramp(t, e("code"), 24) : 1;
    const kt = mode === "kntested" ? ramp(t, e("tests"), 30) : 0;
    return (
      <g>
        <Bar x={560} y={200} h={640} v={kc} color={L.ok} label="CODE MINIMUM" value={`${countText(f("code"), kc)} kN`} t={t} at={0} />
        {mode === "kntested" && <Bar x={1140} y={200} h={640} v={(tested / code) * kt} color={L.fail} label="TESTED AVERAGE" value={`${countText(f("tested"), kt)} kN`} t={t} at={e("tests")} />}
        <MonoLabel x={120} y={110} t={t} at={0} text="FOURTH-FLOOR CONNECTION · ULTIMATE LOAD" size={40} />
        {mode === "kncode" && <Stamp x={1350} y={520} t={t} at={e("held")} text="AT LEAST" color={L.ok} size={80} rot={-6} />}
      </g>
    );
  }
  // gauge modes
  const val = mode === "double" ? 0.4 + 0.4 * ramp(t, e("load"), 20) : 0.12 + 0.06 * ramp(t, e("people"), 20);
  const lim = mode === "double" ? 0.95 : 0.85;
  return (
    <g>
      <BigGauge x={200} y={330} w={1500} v={val} mark={mode === "double" ? undefined : lim} label={mode === "double" ? "load on the fourth-floor nut" : "crowd load on the walkways"} markLabel={mode === "double" ? undefined : "design load"} />
      {mode === "double" && <Stamp x={1400} y={720} t={t} at={e("load")} text={`×${f("times")}`} color={L.fail} size={160} rot={-6} />}
      {mode === "double" && <MonoLabel x={200} y={720} t={t} at={e("more")} text="VS THE ORIGINAL DESIGN" size={44} />}
      {mode === "design" && <MonoLabel x={200} y={720} t={t} at={e("designed")} text="FAR BELOW THE DESIGN LOAD" size={56} color={L.ok} box />}
    </g>
  );
};

const Capacity: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "orig";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.05 * (t / Math.max(1, m.end))} cx={960} cy={540} html={<HonestyTag t={t} tag="as reported" at={0} sub="NBS laboratory estimates" />}>
      <Inner t={t} e={e} mode={mode} p={p} />
    </Sheet>
  );
};

export default Capacity;
