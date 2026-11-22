// Panel (flat, the story's live instrument): the ISOM control board. The heart of it is two towers side by
// side: on the left WHAT THE BOARD SHOWED (the transmitter's reading, always in the bottom band, green), on
// the right WHAT WAS IN THE TOWER (the real level from the figures, climbing amber to red). Modes
// (params.mode): hook, alarms, three, supervisor, splitpre, split, splitlast, procedure, meeting, clock.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { MissionClock, MonoLabel, useDisasterLook } from "../../disaster/index";
import { ramp, Sheet, Stamp } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

const Lamp: React.FC<{ x: number; y: number; on: number; color: string; label: string; t: number }> = ({ x, y, on, color, label, t }) => (
  <g>
    <circle cx={x} cy={y} r={46} fill="#0b0f0c" stroke="#39ff9a" strokeOpacity={0.4} strokeWidth={4} />
    <circle cx={x} cy={y} r={34} fill={color} opacity={0.15 + 0.85 * on} />
    {on > 0 && <circle cx={x} cy={y} r={62} fill={color} opacity={0.2 * on} />}
    <MonoLabel x={x} y={y + 100} t={t} at={0} text={label} size={34} anchor="middle" />
  </g>
);

/** A tower outline with a fill to `v` (0..1) and its label. */
const TowerGauge: React.FC<{ x: number; v: number; color: string; label: string; t: number; at?: number; dim?: boolean }> = ({ x, v, color, label, t, at = 0, dim }) => {
  const L = useDisasterLook();
  const top = 190, h = 720, w = 190;
  return (
    <g opacity={dim ? 0.35 : 1}>
      <rect x={x} y={top} width={w} height={h} rx={w / 2 > 40 ? 40 : 20} fill="#0b0f0c" stroke={L.line} strokeWidth={5} />
      <rect x={x + 10} y={top + h - 10 - (h - 20) * v} width={w - 20} height={(h - 20) * v} rx={14} fill={color} opacity={0.85} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={x + w} y1={top + (h * (i + 1)) / 10} x2={x + w + 24} y2={top + (h * (i + 1)) / 10} stroke={L.line} strokeOpacity={0.5} strokeWidth={3} />)}
      <MonoLabel x={x + w / 2} y={top - 36} t={t} at={at} text={label} size={36} anchor="middle" />
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps }> = ({ t, e, mode, p }) => {
  const L = useDisasterLook();
  const f = (n: string) => figOf(p, n);
  const ratio = (Number(f("actual")) || 0) / (Number(f("tower")) || 1);
  if (["split", "splitpre", "splitlast", "hook"].includes(mode)) {
    const showRight = mode === "split" || mode === "splitlast" ? 1 : mode === "splitpre" ? ramp(t, e("climbing"), 14) : 0;
    const realV = mode === "splitpre" ? 0.2 + 0.25 * ramp(t, e("climbing"), 40) : ratio * ramp(t, Math.min(e("real"), e("before"), e("early"), e("then"), e("tower"), 30) - 10, 24);
    const lowV = mode === "splitlast" ? 0.055 - 0.01 * ramp(t, e("falling"), 20) : 0.055;
    const red = realV > 0.85;
    const cx = mode === "hook" ? 960 - 95 : 520;
    return (
      <g>
        <TowerGauge x={cx} v={lowV} color={L.ok} label="WHAT THE BOARD SHOWED" t={t} />
        <text x={cx + 95} y={1000} textAnchor="middle" fontFamily={L.fonts.value} fontSize={64} fill={L.ok} opacity={mode === "hook" ? ramp(t, e("bottom"), 10) : 1}>NORMAL</text>
        {mode === "splitlast" && t >= e("falling") && <text x={cx + 260} y={860} fontFamily={L.fonts.value} fontSize={110} fill={L.ok}>▼</text>}
        {showRight > 0 && (
          <g opacity={showRight}>
            <TowerGauge x={1210} v={realV} color={red ? L.fail : realV > 0.5 ? "#ffb23e" : L.label} label="WHAT WAS IN THE TOWER" t={t} />
            {mode !== "splitpre" && <text x={1450} y={560} fontFamily={L.fonts.value} fontSize={120} fill={red ? L.fail : L.label}>{countText(f("actual"), ramp(t, Math.min(e("real"), e("before"), e("early"), e("then"), 30) - 10, 20))}</text>}
            {mode !== "splitpre" && <text x={1450} y={640} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} fill={L.ink}>FEET</text>}
          </g>
        )}
      </g>
    );
  }
  if (mode === "clock") {
    const hour = Number(f("hour") || "0"), minute = Number(f("minute") || "0");
    const red = ramp(t, e("ignition"), 6);
    return (
      <g>
        <MissionClock x={160} y={260} size={760} seconds={(hour + 12) * 3600 + minute * 60} label="local time" t={t} />
        {[0, 1, 2, 3].map((i) => <Lamp key={i} x={1180 + (i % 2) * 300} y={330 + Math.floor(i / 2) * 300} on={red} color={L.fail} label={["UNIT", "TRAILERS", "FURNACE", "STACK"][i]!} t={t} />)}
      </g>
    );
  }
  if (mode === "procedure") {
    const sheet = ramp(t, e("procedure"), 14);
    return (
      <g>
        <TowerGauge x={300} v={0.05} color={L.ok} label="GAUGE SCALE" t={t} dim={sheet > 0.5} />
        <g opacity={sheet} transform={`translate(${(1 - sheet) * 300} 0)`}>
          <rect x={720} y={170} width={980} height={760} rx={10} fill="#f1efe6" />
          <text x={770} y={260} fontFamily={L.fonts.mono} fontWeight={700} fontSize={44} fill="#1d2b2a">RAFFINATE SECTION START-UP</text>
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={770} y={320 + i * 60} width={820 - (i % 2) * 160} height={16} fill="#c9c6bb" />)}
          <rect x={760} y={560} width={880 * ramp(t, e("fill"), 16)} height={90} fill="#ffe14d" opacity={0.7} />
          <text x={780} y={625} fontFamily={L.fonts.body} fontSize={52} fill="#1d2b2a">{`Fill the tower to ${f("pct")} on the gauge.`}</text>
          {Array.from({ length: 3 }, (_, i) => <rect key={i} x={770} y={720 + i * 60} width={760 - (i % 2) * 200} height={16} fill="#c9c6bb" />)}
        </g>
        <Stamp x={420} y={950} t={t} at={e("gauge")} text={`TARGET ${f("pct")}`} color={L.label} size={56} rot={-4} />
      </g>
    );
  }
  // the console lamps: alarms, three units, supervisor, meeting
  const lamps: { label: string; on: number; color: string }[] =
    mode === "alarms" ? [{ label: "FEED", on: 1 - ramp(t, e("stopped"), 8), color: L.ok }, { label: "HIGH ALARM", on: t >= e("alarm") ? (Math.floor(t / 8) % 2 ? 1 : 0.3) : 0, color: L.label }, { label: "BACKUP ALARM", on: 0, color: L.fail }]
    : mode === "three" ? [{ label: "UNIT A", on: ramp(t, e("three"), 8), color: L.ok }, { label: "ISOM", on: ramp(t, e("three") + 8, 8), color: L.label }, { label: "UNIT C", on: ramp(t, e("three") + 16, 8), color: L.ok }]
    : mode === "supervisor" ? [{ label: "SUPERVISOR", on: 1 - ramp(t, e("supervisor"), 10), color: L.ok }, { label: "DOOR", on: t >= e("emergency") ? (Math.floor(t / 8) % 2 ? 1 : 0.2) : 0, color: L.label }, { label: "STAND-IN", on: 0, color: L.ok }]
    : [{ label: "MEETING", on: ramp(t, e("safety"), 10), color: L.label }, { label: "BOARD", on: 0.3, color: L.ok }, { label: "TOWER LEVEL", on: 0.15, color: L.ok }];
  return (
    <g>
      <rect x={100} y={140} width={1720} height={820} rx={24} fill="none" stroke={L.line} strokeOpacity={0.35} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${180 + i * 420} 600)`}>
          <rect width={360} height={200} rx={10} fill="#0b120e" stroke={L.line} strokeOpacity={0.6} strokeWidth={3} />
          <polyline points={Array.from({ length: 12 }, (_, j) => `${20 + j * 29},${140 - 60 * Math.abs(Math.sin(j * 0.7 + i + t / 40))}`).join(" ")} fill="none" stroke={i === 1 ? L.label : L.ok} strokeWidth={4} />
          <text x={20} y={34} fontFamily={L.fonts.mono} fontWeight={700} fontSize={30} fill={L.ink}>{["FEED", "TOWER", "FURNACE", "PRESSURE"][i]}</text>
        </g>
      ))}
      {lamps.map((l, i) => <Lamp key={i} x={420 + i * 540} y={420} on={l.on} color={l.color} label={l.label} t={t} />)}
      {mode === "alarms" && <circle cx={1500} cy={420} r={110} fill="none" stroke={L.fail} strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(t, e("never"), 14)} />}
                  {mode === "three" && <MonoLabel x={960} y={900} t={t} at={e("console")} text="ONE OPERATOR" size={44} anchor="middle" color={L.label} />}
      {mode === "supervisor" && <MonoLabel x={960} y={900} t={t} at={e("place")} text="NO TRAINED STAND-IN" size={52} anchor="middle" color={L.fail} box />}
      {mode === "meeting" && <MonoLabel x={960} y={900} t={t} at={e("room")} text="SAFETY MEETING · CONTROL ROOM" size={48} anchor="middle" color={L.label} box />}
    </g>
  );
};

const Panel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "split";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.04 * (t / Math.max(1, m.end))} cx={960} cy={560}>
      <Inner t={t} e={e} mode={mode} p={p} />
    </Sheet>
  );
};

export default Panel;
