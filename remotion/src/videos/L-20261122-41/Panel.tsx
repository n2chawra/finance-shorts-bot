// Panel (flat, the story's live instrument): the reconstruction clock panel for the last minutes. A dark
// console with the mission clock, a crowd meter, a band lamp, a dispatch lamp and a load gauge. Modes
// (params.mode): arrive (the date reel rolls to Friday, the crowd meter starts to climb, the sun lamp glows),
// band (the clock ticks to the band's return, the band lamp lights, the floor meter pulses), redout (the
// second hand sweeps, every lamp goes red), call (the dispatch lamp, FIRST CALL types on), gauge (the load at
// collapse against the code's strength).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { LoadGauge, MissionClock, MonoLabel, useDisasterLook } from "../../disaster/index";
import { ramp, Sheet } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

const Lamp: React.FC<{ x: number; y: number; on: number; color: string; label: string; t: number }> = ({ x, y, on, color, label, t }) => (
  <g>
    <circle cx={x} cy={y} r={46} fill="#0b0f0c" stroke="#39ff9a" strokeOpacity={0.4} strokeWidth={4} />
    <circle cx={x} cy={y} r={34} fill={color} opacity={0.15 + 0.85 * on} />
    {on > 0 && <circle cx={x} cy={y} r={60} fill={color} opacity={0.18 * on} />}
    <MonoLabel x={x} y={y + 100} t={t} at={0} text={label} size={32} anchor="middle" />
  </g>
);

const Meter: React.FC<{ x: number; y: number; v: number; label: string; t: number; color: string }> = ({ x, y, v, label, t, color }) => (
  <g>
    <rect x={x} y={y} width={90} height={380} fill="#0b0f0c" stroke="#39ff9a" strokeOpacity={0.4} strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={x + 12} y={y + 348 - i * 30} width={66} height={22} fill={color} opacity={i / 12 < v ? 0.9 : 0.1} />)}
    <MonoLabel x={x + 45} y={y + 440} t={t} at={0} text={label} size={32} anchor="middle" />
  </g>
);

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps }> = ({ t, e, mode, p }) => {
  const L = useDisasterLook();
  const hour = Number(figOf(p, "hour") || "0"), minute = Number(figOf(p, "minute") || "0");
  const red = mode === "redout" ? ramp(t, e("way"), 6) : 0;
  const lampC = (c: string) => (red > 0.5 ? L.fail : c);
  const crowd = mode === "arrive" ? 0.15 + 0.5 * ramp(t, e("arriving"), 60) : 0.9;
  const pulse = mode === "band" ? 0.75 + 0.25 * Math.sin(t / 3) * ramp(t, e("contest"), 8) : crowd;
  const sweep = mode === "redout" ? (t / 30) * 60 : 0;
  const showClock = mode !== "arrive" && mode !== "gauge";
  const pct = parseFloat(figOf(p, "pct")) || 0;
  return (
    <g>
      <rect x={70} y={70} width={1780} height={940} rx={24} fill="#0a0d0b" stroke={L.line} strokeOpacity={0.35} strokeWidth={4} />
      {showClock && <MissionClock x={160} y={150} size={560} seconds={(hour + 12) * 3600 + minute * 60 + sweep} label="local time" t={t} />}
      {mode === "arrive" && (
        <g>
          <rect x={160} y={260} width={620} height={200} rx={12} fill="#0b0f0c" stroke={L.line} strokeWidth={4} />
          <text x={470} y={340} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={44} fill={L.ink} opacity={ramp(t, e("friday"), 10)}>FRIDAY</text>
          <text x={470} y={420} textAnchor="middle" fontFamily={L.fonts.value} fontSize={64} fill={L.label} opacity={ramp(t, e("friday"), 10)}>{`JULY ${figOf(p, "day")}`}</text>
          <Lamp x={470} y={640} on={ramp(t, e("afternoon"), 12)} color="#ffd84a" label="AFTERNOON" t={t} />
        </g>
      )}
      {mode === "gauge" && (
        <g>
          <LoadGauge x={200} y={140} size={640} value={(pct / 100) * ramp(t, e("load"), 30)} limit={1} unit="%" label="load at collapse" limitLabel="code strength" />
          <text x={1150} y={560} fontFamily={L.fonts.value} fontSize={200} fill={L.label} opacity={ramp(t, e("reached"), 10)}>{countText(figOf(p, "pct"), ramp(t, e("reached"), 16))}</text>
          <MonoLabel x={1150} y={650} t={t} at={e("code")} text="OF A CODE-BUILT CONNECTION" size={40} />
        </g>
      )}
      {mode !== "gauge" && (
        <g>
          <Meter x={980} y={220} v={pulse} label="CROWD" t={t} color={lampC(L.ok)} />
          <Lamp x={1300} y={330} on={mode === "arrive" ? 0 : ramp(t, e(mode === "band" ? "returns" : "moments"), 8) || (mode !== "band" ? 1 : 0)} color={lampC(L.label)} label="BAND" t={t} />
          <Lamp x={1560} y={330} on={mode === "call" ? ramp(t, e("call"), 6) : red} color={lampC(L.fail)} label="DISPATCH" t={t} />
          <Lamp x={1300} y={620} on={red || (mode === "band" ? ramp(t, e("contest"), 8) : 0.2)} color={lampC(L.ok)} label="FLOOR" t={t} />
          <Lamp x={1560} y={620} on={red} color={L.fail} label="WALKWAYS" t={t} />
          {mode === "call" && <MonoLabel x={980} y={900} t={t} at={e("call")} text="FIRST CALL FOR HELP" size={52} color={L.fail} box />}
        </g>
      )}
    </g>
  );
};

const Panel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "band";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const close = mode === "call" ? ramp(t, e("call"), 30) : mode === "band" ? ramp(t, e("contest"), 30) : 0;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1 + 0.15 * close + 0.03 * (t / Math.max(1, m.end))} cx={960 + 200 * close} cy={540}>
      <Inner t={t} e={e} mode={mode} p={p} />
    </Sheet>
  );
};

export default Panel;
