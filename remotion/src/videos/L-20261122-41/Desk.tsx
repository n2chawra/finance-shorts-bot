// Desk (flat): the drawing office, top-down. A drafting sheet under a swinging lamp on a dark desk. Modes
// (params.mode): unroll (the walkway drawing unrolls), erase (a red pencil rings the connection, an eraser
// wipes the long rod), shop (a stack of shop drawings drops, the title block types), tworods (the long rod
// is struck through, two short rods drawn), phone (the desk phone rings, a typed line: approved, as
// reported), dispute (the receiver goes down, DISPUTED), stamps (three review stamps land), circle (the
// connection detail under a red circle, close).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { DrawLine, Elev, Phone, ramp, Sheet, Stamp, UB_Y, BEAM_H } from "./elev";
import { moments } from "./ui";

type Params = { mode?: string };

const Paper: React.FC<{ x: number; y: number; w: number; h: number; k: number; children?: React.ReactNode; rot?: number }> = ({ x, y, w, h, k, children, rot = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 10} y={y + 14} width={w * k} height={h} fill="#000" opacity={0.4} />
      <rect x={x} y={y} width={w * k} height={h} fill="#0e1a14" stroke="#39ff9a" strokeOpacity={0.5} strokeWidth={3} />
      <clipPath id={`pc${x}${y}`}><rect x={x} y={y} width={w * k} height={h} /></clipPath>
      <g clipPath={`url(#pc${x}${y})`}>{children}</g>
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; end: number }> = ({ t, e, mode, end }) => {
  const L = useDisasterLook();
  const lamp = 0.5 + 0.5 * Math.sin(t / 30 + (mode === "circle" ? 1 : 0));
  const paperK = mode === "unroll" ? ramp(t, e("drawings") - 20, 24) : 1;
  const split = mode === "tworods" ? ramp(t, e("two"), 18) : ["erase", "unroll", "shop"].includes(mode) ? 0 : 1;
  const drop = mode === "shop" ? ramp(t, e("decides"), 12) : 1;
  return (
    <g>
      {/* the lamp's pool of light */}
      <ellipse cx={900 + 120 * lamp} cy={500} rx={760} ry={520} fill="#ffe8b0" opacity={0.06 + 0.04 * lamp} />
      {mode === "shop" && [3, 2, 1].map((i) => <rect key={i} x={360 + i * 14} y={130 + i * 12 - (1 - drop) * 300} width={1200} height={800} fill="#0e1a14" stroke="#39ff9a" strokeOpacity={0.25} strokeWidth={2} opacity={drop} />)}
      <Paper x={360} y={130} w={1200} h={800} k={paperK}>
        <g transform="translate(960 540) scale(0.7) translate(-960 -560)">
          <Elev t={t} cx={960} split={split} hot={mode === "circle" ? 0.4 : 0} rodColor={mode === "erase" ? `rgba(255,176,0,${1 - ramp(t, e("changed"), 20)})` : undefined} />
        </g>
        {/* the title block */}
        <rect x={1180} y={800} width={360} height={110} fill="none" stroke={L.line} strokeWidth={3} />
        <MonoLabel x={1200} y={845} t={t} at={mode === "shop" ? e("shop") : 0} text={mode === "erase" || mode === "unroll" ? "WALKWAY HANGER" : "SHOP DRAWING"} size={32} />
        <MonoLabel x={1200} y={890} t={t} at={mode === "shop" ? e("fabricator") : 0} text={mode === "erase" || mode === "unroll" ? "CONTRACT DWG" : "STEEL FABRICATOR"} size={28} color={L.label} />
      </Paper>
      {mode === "unroll" && <rect x={380} y={230} width={1160} height={18} fill={L.label} opacity={0.5 * ramp(t, e("watched"), 12)} />}
      {mode === "erase" && (
        <g>
          <circle cx={960} cy={540 + (UB_Y + BEAM_H - 560) * 0.7} r={110} fill="none" stroke={L.fail} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(t, e("margin"), 16)} />
          {t >= e("changed") && <rect x={930} y={180 + ramp(t, e("changed"), 20) * 520} width={70} height={140} rx={12} fill="#e9a0a8" stroke="#fff" strokeWidth={3} />}
        </g>
      )}
      {mode === "tworods" && (
        <g>
          <DrawLine x1={860} y1={330} x2={1060} y2={760} k={ramp(t, e("long"), 10)} color={L.fail} w={10} />
          <MonoLabel x={1190} y={300} t={t} at={e("two")} text="TWO RODS" size={48} color={L.label} />
        </g>
      )}
      {(mode === "phone" || mode === "dispute") && (
        <g>
          <Phone x={250} y={600} t={t} k={1} ring={mode === "phone" ? e("asked") : undefined} s={1.5} />
          {mode === "phone" && <DrawLine x1={380} y1={560} x2={880} y2={470} k={ramp(t, e("phone"), 16)} color={L.label} w={7} dash="18 12" />}
          {mode === "phone" && <MonoLabel x={120} y={860} t={t} at={e("approved")} text="APPROVED · VERBALLY" size={52} color={L.label} box />}
          {mode === "dispute" && <Stamp x={300} y={340} t={t} at={e("disputed")} text="DISPUTED" color={L.fail} size={90} rot={-10} />}
        </g>
      )}
      {mode === "stamps" && (
        <g>
          <Stamp x={1240} y={300} t={t} at={e("contractor")} text="REVIEWED · CONTRACTOR" color={L.label} size={46} rot={-6} />
          <Stamp x={1240} y={460} t={t} at={e("engineer")} text="REVIEWED · ENGINEER" color={L.label} size={46} rot={4} />
          <Stamp x={1240} y={620} t={t} at={e("architect")} text="REVIEWED · ARCHITECT" color={L.label} size={46} rot={-3} />
        </g>
      )}
      {mode === "circle" && <circle cx={960} cy={540 + (UB_Y + BEAM_H - 560) * 0.7} r={120} fill="none" stroke={L.fail} strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(t, e("connection"), 16)} />}
      {/* the lamp head, top right */}
      <g transform={`rotate(${-8 + 16 * lamp} 1700 -40)`}>
        <line x1={1700} y1={-40} x2={1700} y2={90} stroke="#5c636b" strokeWidth={10} />
        <path d="M 1640 90 L 1760 90 L 1730 150 L 1670 150 Z" fill="#2a2f33" stroke={L.line} strokeWidth={3} />
        <ellipse cx={1700} cy={150} rx={34} ry={10} fill="#fff1c8" />
      </g>
      {end > 0 && null}
    </g>
  );
};

const Desk: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "unroll";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const close = mode === "circle" ? ramp(t, e("connection"), 30) : mode === "tworods" ? ramp(t, e("two"), 30) * 0.5 : 0;
  const ny = 540 + (UB_Y + BEAM_H - 560) * 0.7;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.25 * close + 0.03 * (t / Math.max(1, m.end))} cx={960} cy={540 + (ny - 540) * close}
      html={mode === "phone" || mode === "dispute" ? <HonestyTag t={t} tag="reported" at={0} /> : undefined}>
      <Inner t={t} e={e} mode={mode} end={m.end} />
    </Sheet>
  );
};

export default Desk;
