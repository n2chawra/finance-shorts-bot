// Shift (flat): two records laid out on the drafting sheet. Modes (params.mode): days (a calendar strip,
// each day filling with a long shift bar, the run of days counted from the figure), startups (a grid of
// the earlier start-up cards the board studied, the ones whose level went past the gauge's range turning
// amber, counts from the figures).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { MonoLabel, useDisasterLook } from "../../disaster/index";
import { ramp, Sheet } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps }> = ({ t, e, mode, p }) => {
  const L = useDisasterLook();
  const f = (n: string) => figOf(p, n);
  if (mode === "startups") {
    const all = Number(f("all")) || 0, over = Number(f("over")) || 0;
    const shown = Math.round(all * ramp(t, e("startups"), 30));
    return (
      <g>
        <MonoLabel x={160} y={150} t={t} at={e("unusual")} text="RAFFINATE SPLITTER START-UPS STUDIED" size={42} />
        {Array.from({ length: all }, (_, i) => {
          const x = 150 + (i % 8) * 170, y = 220 + Math.floor(i / 8) * 230;
          const amber = i < over && t >= e("range");
          return (
            <g key={i} opacity={i < shown ? 1 : 0.45}>
              <rect x={x} y={y} width={150} height={190} rx={12} fill={amber ? "rgba(255,176,0,0.25)" : "#0b0f0c"} stroke={amber ? L.label : L.line} strokeWidth={4} />
              <rect x={x + 50} y={y + 30} width={50} height={130} fill="none" stroke={amber ? L.label : L.line} strokeWidth={3} />
              <rect x={x + 53} y={y + 157 - (amber ? 110 : 20)} width={44} height={amber ? 110 : 20} fill={amber ? L.label : L.ok} />
            </g>
          );
        })}
        <text x={1710} y={560} textAnchor="middle" fontFamily={L.fonts.value} fontSize={150} fill={L.label} opacity={ramp(t, e("range"), 10)}>{countText(f("over"), ramp(t, e("range"), 16))}</text>
        <MonoLabel x={1710} y={620} t={t} at={e("range")} text={`OF ${f("all")} · PAST THE RANGE`} size={36} anchor="middle" color={L.label} />
      </g>
    );
  }
  const days = Number(f("days")) || 0;
  const k = ramp(t, e("shifts"), 50);
  return (
    <g>
      <MonoLabel x={160} y={150} t={t} at={e("operators")} text="ISOM OPERATORS · SHIFT CALENDAR" size={42} />
      {Array.from({ length: days }, (_, i) => {
        const x = 170 + (i % 10) * 160, y = 230 + Math.floor(i / 10) * 230;
        const on = i / days < k;
        return (
          <g key={i}>
            <rect x={x} y={y} width={140} height={190} rx={8} fill="#0b0f0c" stroke={L.line} strokeOpacity={0.6} strokeWidth={3} />
            <rect x={x + 14} y={y + 40} width={112} height={on ? 120 : 0} fill={L.label} opacity={0.8} />
          </g>
        );
      })}
      <text x={1640} y={980} textAnchor="end" fontFamily={L.fonts.value} fontSize={110} fill={L.label} opacity={ramp(t, e("row"), 10)}>{`${countText(f("days"), ramp(t, e("row"), 16))}+ DAYS`}</text>
    </g>
  );
};

const Shift: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "days";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.04 * (t / Math.max(1, m.end))} cx={960} cy={560}>
      <Inner t={t} e={e} mode={mode} p={p} />
    </Sheet>
  );
};

export default Shift;
