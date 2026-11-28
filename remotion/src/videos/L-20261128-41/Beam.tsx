// Beam (flat, the engineer's sheet on the investigator's desk): the physics in quick inserts. Modes (params.mode):
// force (the pendulum and its forces), load (a load gauge and its trace), cycles (tally of loads, the wall's
// thickness), water (rain seeping into the beam's cross-section), damp (condensation on the inner walls),
// thin (a new wall beside a rusted one, paint the same), strength (the same load on less steel), ultra (an
// ultrasonic probe: pulse, echo, thickness). Red only for the failure.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, LookBackground, Texture } from "../../disaster/index";
import { AMBER, ANTON, clamp, FlatTag, INK, MONO, moments, ramp, RECIPE, RED, sm, TypeText } from "./ui";

const BLUE = "#2f6fb0", STEEL = "#8d959d", PAINT = "#c9281c", RUST = "#8c4a20";

/** The sheet of drafting paper on the desk; the camera pushes about (cx, cy). */
const Paper: React.FC<{ t: number; zoom: number; cx?: number; cy?: number; children: React.ReactNode; tag?: string; tint?: string }> = ({ t, zoom, cx = 960, cy = 540, children, tag = "general principle", tint = "#f4efe2" }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs><pattern id="fb-grid" width={60} height={60} patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c4b48f" strokeWidth={3} /></pattern></defs>
        <g transform={`translate(960 540) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>
          <g transform="rotate(-1.2 960 540)">
            <rect x={130} y={70} width={1660} height={940} fill="rgba(0,0,0,0.25)" transform="translate(14 18)" />
            <rect x={130} y={70} width={1660} height={940} fill={tint} />
            <rect x={130} y={70} width={1660} height={940} fill="url(#fb-grid)" />
            {children}
          </g>
        </g>
      </svg>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 76%, rgba(28,20,12,0.7) 86%, rgba(28,20,12,0.82) 100%)" }} />
      <FlatTag t={t} tag={tag} at={0} />
      <Texture t={t} />
    </AbsoluteFill>
  </DisasterLookProvider>
);

const Arrow: React.FC<{ x: number; y: number; dx: number; dy: number; color?: string; w?: number; k?: number }> = ({ x, y, dx, dy, color = INK, w = 12, k = 1 }) => {
  if (k <= 0.01) return null;
  const ex = x + dx * k, ey = y + dy * k;
  const a = Math.atan2(dy, dx), h = w * 2.6;
  return (
    <g>
      <line x1={x} y1={y} x2={ex - Math.cos(a) * h * 0.6} y2={ey - Math.sin(a) * h * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${ex} ${ey} L ${ex - Math.cos(a - 0.45) * h} ${ey - Math.sin(a - 0.45) * h} L ${ex - Math.cos(a + 0.45) * h} ${ey - Math.sin(a + 0.45) * h} Z`} fill={color} />
    </g>
  );
};

/** The beam's square cross-section: outer paint, steel wall, rust inside (0..1), the wall thinning with it. */
const Section: React.FC<{ x: number; y: number; s: number; rust: number; thin?: number; water?: number; drops?: number; beads?: number; t: number; label?: string; stress?: number }> = ({ x, y, s, rust, thin = 0, water = 0, drops = 0, beads = 0, t, label, stress = 0 }) => {
  const wall = s * (0.12 - 0.08 * thin);
  const inner = s - 2 * wall;
  const steel = stress > 0.05 ? (stress > 0.6 ? RED : AMBER) : STEEL;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-s / 2 - 8} y={-s / 2 - 8} width={s + 16} height={s + 16} fill={PAINT} rx={6} />
      <rect x={-s / 2} y={-s / 2} width={s} height={s} fill={steel} />
      <rect x={-inner / 2} y={-inner / 2} width={inner} height={inner} fill="#2a2420" />
      {rust > 0 && <rect x={-inner / 2 - 2} y={-inner / 2 - 2} width={inner + 4} height={inner + 4} fill="none" stroke={RUST} strokeWidth={4 + 28 * rust} opacity={0.95} />}
      {water > 0 && <rect x={-inner / 2} y={inner / 2 - inner * 0.22 * water} width={inner} height={inner * 0.22 * water} fill={BLUE} opacity={0.85} />}
      {beads > 0 && Array.from({ length: 14 }, (_, i) => {
        const side = i % 4, u = ((i * 37) % 100) / 100 - 0.5;
        const px = side === 0 ? u * inner : side === 1 ? inner / 2 - 10 : side === 2 ? u * inner : -inner / 2 + 10;
        const py = side === 0 ? -inner / 2 + 10 : side === 2 ? inner / 2 - 10 : u * inner;
        return <circle key={i} cx={px} cy={py} r={9 * clamp(beads * 1.6 - i * 0.05)} fill={BLUE} opacity={0.9} />;
      })}
      {drops > 0 && Array.from({ length: 6 }, (_, i) => {
        const u = ((t * 0.04 + i / 6) % 1);
        return <ellipse key={i} cx={s / 2 - 30 + u * -(s / 2 - 40)} cy={-s / 2 - 120 + u * (s / 2 + 110)} rx={8} ry={13} fill={BLUE} opacity={drops * (u < 0.9 ? 1 : 0)} />;
      })}
      {label && <text x={0} y={s / 2 + 60} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill={INK}>{label}</text>}
    </g>
  );
};

const Beam: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const mode = (p.beat.params as { mode?: string }).mode ?? "force";
  const drift = 1.02 + 0.05 * sm(t / Math.max(30, m.end));

  if (mode === "force" || mode === "load" || mode === "cycles") {
    // the pendulum on the left, the loads on the right
    const th = mode === "force" ? 0.12 * Math.sin(t * 0.05) : 0.9 * Math.sin(t * 0.09);
    const px = 520, py = 180, L = 520;
    const gx = px + Math.sin(th) * L, gy = py + Math.cos(th) * L;
    const pullK = ramp(t, e("pull"), 14);
    const load = mode === "load" ? 0.5 + 0.45 * Math.cos(th * 2) : 0.5;
    const trace = mode === "load" ? ramp(t, e("again"), 60) : 0;
    const zoom = mode === "force" ? drift + 0.12 * ramp(t, e("pull"), 20) : mode === "cycles" ? drift + 0.12 * ramp(t, e("thickness"), 20) : drift;
    const tally = mode === "cycles" ? Math.floor(clamp((t - e("season")) / 90) * 60 + clamp((t - e("loads")) / 60) * 60) : 0;
    return (
      <Paper t={t} zoom={zoom} cx={mode === "cycles" ? 1150 : 760} cy={mode === "cycles" ? 560 : 500}>
        <TypeText x={mode === "cycles" ? 1000 : 190} y={150} t={t} at={0} text={mode === "cycles" ? "LOADS ADD UP" : "THE PENDULUM"} size={44} />
        <line x1={px - 120} y1={py} x2={px + 120} y2={py} stroke={INK} strokeWidth={8} />
        <circle cx={px} cy={py} r={14} fill={INK} />
        {(mode !== "force" || t >= e("bottom") - 20) && <path d={`M ${px - Math.sin(1) * L} ${py + Math.cos(1) * L} A ${L} ${L} 0 0 0 ${px + Math.sin(1) * L} ${py + Math.cos(1) * L}`} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="14 12" opacity={mode === "force" ? ramp(t, e("curve"), 16) * 0.8 + 0.2 : 0.5} />}
        <line x1={px} y1={py} x2={gx} y2={gy} stroke="#ef6a1d" strokeWidth={18} strokeLinecap="round" />
        <rect x={gx - 70} y={gy} width={140} height={70} rx={10} fill="#d4321f" />
        {mode === "force" && <Arrow x={gx} y={gy + 80} dx={0} dy={150} color={INK} k={ramp(t, e("weight"), 12)} />}
        {mode === "force" && <Arrow x={gx + 60} y={gy + 80} dx={0} dy={110} color={AMBER} k={ramp(t, e("extra"), 12)} />}
        {mode === "force" && <Arrow x={gx - 26} y={gy - 20} dx={(px - gx) * 0.6} dy={(py - gy) * (0.35 + 0.35 * pullK)} color={RED} w={16} k={ramp(t, e("pull"), 14)} />}
        {mode === "force" && t >= e("weight") && <TypeText x={gx + 110} y={gy + 200} t={t} at={e("weight")} text="WEIGHT" size={40} />}
        {mode === "force" && t >= e("extra") && <TypeText x={gx + 110} y={gy + 140} t={t} at={e("extra")} text="+ TURNING PULL" size={40} color="#9a5a10" />}
        {mode === "force" && t >= e("pull") && <TypeText x={px + 60} y={py + 260} t={t} at={e("pull")} text="ARM TENSION" size={40} color={RED} />}
        {mode === "load" && (
          <g transform="translate(1080 220)">
            <rect x={0} y={0} width={600} height={380} rx={16} fill="#1f1b16" />
            <path d="M 80 300 A 220 220 0 0 1 520 300" fill="none" stroke="#5a5148" strokeWidth={26} />
            <path d="M 430 140 A 220 220 0 0 1 520 300" fill="none" stroke={RED} strokeWidth={26} />
            <line x1={300} y1={300} x2={300 + Math.cos(Math.PI * (1 - load)) * 200} y2={300 - Math.sin(Math.PI * (1 - load)) * 200} stroke="#ffd27a" strokeWidth={10} strokeLinecap="round" />
            <circle cx={300} cy={300} r={18} fill="#ffd27a" />
            <text x={300} y={360} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill="#f4efe2">LOAD ON ONE ARM</text>
          </g>
        )}
        {mode === "load" && trace > 0 && (
          <polyline fill="none" stroke={INK} strokeWidth={6} points={Array.from({ length: Math.floor(120 * trace) + 1 }, (_, i) => `${1080 + i * 5},${860 - 120 * (0.5 + 0.45 * Math.cos(i * 0.32 + t * 0.09))}`).join(" ")} />
        )}
        {mode === "cycles" && (
          <g>
            {Array.from({ length: tally }, (_, i) => <line key={i} x1={1000 + (i % 30) * 22} y1={220 + Math.floor(i / 30) * 70} x2={1000 + (i % 30) * 22 + (i % 5 === 4 ? -80 : 0)} y2={270 + Math.floor(i / 30) * 70} stroke={INK} strokeWidth={5} />)}
            <g opacity={ramp(t, e("Steel"), 12)}>
              <rect x={1060} y={620} width={560} height={60} fill={PAINT} />
              <rect x={1060} y={640} width={560} height={110} fill={STEEL} />
              <rect x={1060} y={750} width={560} height={90} fill="#2a2420" />
              <TypeText x={1060} y={600} t={t} at={e("Steel")} text="THE ARM'S WALL" size={40} />
            </g>
            {t >= e("thickness") && (
              <g opacity={ramp(t, e("thickness"), 10)}>
                <line x1={1660} y1={640} x2={1660} y2={750} stroke={INK} strokeWidth={6} />
                <line x1={1640} y1={640} x2={1680} y2={640} stroke={INK} strokeWidth={6} /><line x1={1640} y1={750} x2={1680} y2={750} stroke={INK} strokeWidth={6} />
                <TypeText x={1500} y={900} t={t} at={e("thickness")} text="FULL THICKNESS" size={40} color="#1f6a3a" />
              </g>
            )}
          </g>
        )}
      </Paper>
    );
  }

  if (mode === "water" || mode === "damp") {
    const water = mode === "water" ? ramp(t, e("pool"), 30) : 0.15;
    const drops = mode === "water" ? ramp(t, e("Rain"), 10) : 0;
    const beads = mode === "damp" ? ramp(t, e("walls"), 30) : 0;
    const cool = mode === "damp" ? ramp(t, e("cool"), 20) : 0;
    const haze = mode === "damp" ? ramp(t, e("damp"), 20) : 0;
    return (
      <Paper t={t} zoom={drift + 0.14 * ramp(t, e(mode === "water" ? "pool" : "walls"), 20)} cx={900} cy={560} tint={cool > 0 ? "#e8ecf0" : "#f4efe2"}>
        <TypeText x={190} y={150} t={t} at={0} text="INSIDE THE BEAM" size={44} />
        <Section x={900} y={500} s={440} rust={0.05} water={water} drops={drops} beads={beads} t={t} label="CROSS-SECTION" />
        {mode === "water" && <g opacity={ramp(t, e("seep"), 10)}><line x1={1130} y1={300} x2={1130} y2={330} stroke={INK} strokeWidth={6} /><TypeText x={1190} y={300} t={t} at={e("seep")} text="A SEAM" size={40} /></g>}
        {mode === "water" && t >= e("pool") && <TypeText x={1240} y={760} t={t} at={e("pool")} text="WATER POOLS" size={44} color={BLUE} />}
        {mode === "water" && t >= e("Rain") && Array.from({ length: 30 }, (_, i) => { const u = (t * 0.03 + i / 30) % 1; return <line key={i} x1={300 + (i * 53) % 1300} y1={100 + u * 300} x2={290 + (i * 53) % 1300} y2={130 + u * 300} stroke={BLUE} strokeWidth={4} opacity={0.5} />; })}
        {mode === "damp" && <rect x={900 - 150} y={500 - 150} width={300} height={300} fill="#cfe0ee" opacity={0.35 * haze * (0.8 + 0.2 * Math.sin(t * 0.1))} />}
        {mode === "damp" && <g opacity={cool}><Arrow x={1360} y={300} dx={0} dy={220} color={BLUE} /><TypeText x={1410} y={420} t={t} at={e("cool")} text="COOLS AT NIGHT" size={40} color={BLUE} /></g>}
        {mode === "damp" && <g transform={`translate(${1500 - 200 * ramp(t, e("overnight"), 40)} 230)`} opacity={ramp(t, e("overnight"), 10)}><circle cx={0} cy={0} r={46} fill="#e9e3c8" stroke={INK} strokeWidth={4} /><circle cx={20} cy={-10} r={40} fill={cool > 0 ? "#e8ecf0" : "#f4efe2"} /></g>}
        {mode === "damp" && t >= e("walls") && <TypeText x={1240} y={800} t={t} at={e("walls")} text="WATER ON THE WALLS" size={42} color={BLUE} />}
      </Paper>
    );
  }

  if (mode === "thin" || mode === "strength") {
    const eat = mode === "thin" ? ramp(t, e("thinner"), 50) : 1;
    const press = mode === "strength" ? 0.5 + 0.5 * Math.sin(Math.max(0, t - e("swing")) * 0.2) : 0;
    const red = mode === "strength" ? ramp(t, e("less"), 20) : 0;
    return (
      <Paper t={t} zoom={drift + 0.12 * ramp(t, e(mode === "thin" ? "paint" : "less"), 20)} cx={mode === "thin" ? 960 : 1220} cy={560}>
        <TypeText x={mode === "thin" ? 190 : 860} y={150} t={t} at={0} text={mode === "thin" ? "NEW · AFTER YEARS" : "SAME LOAD · LESS STEEL"} size={44} />
        <Section x={620} y={500} s={380} rust={0} t={t} label="NEW" />
        <Section x={1300} y={500} s={380} rust={eat} thin={eat} t={t} label="AFTER YEARS" stress={red} />
        {mode === "thin" && t >= e("outside") && <TypeText x={960} y={790} t={t} at={e("outside")} text="SAME OUTSIDE" size={42} anchor="middle" />}
        {mode === "thin" && t >= e("paint") && (
          <g>
            <circle cx={620} cy={302} r={30} fill="none" stroke="#1f6a3a" strokeWidth={6} opacity={ramp(t, e("paint"), 10)} />
            <circle cx={1300} cy={302} r={30} fill="none" stroke="#1f6a3a" strokeWidth={6} opacity={ramp(t, e("paint"), 10)} />
            <TypeText x={1560} y={300} t={t} at={e("paint")} text="PAINT FINE" size={40} color="#1f6a3a" />
          </g>
        )}
        {mode === "strength" && [620, 1300].map((x, i) => <Arrow key={x} x={x} y={200 - 30 * press} dx={0} dy={120 + 30 * press} color={i ? RED : INK} w={14} k={ramp(t, e("same"), 12)} />)}
        {mode === "strength" && t >= e("less") && <TypeText x={1300} y={790} t={t} at={e("less")} text="HIGHER STRESS" size={44} anchor="middle" color={RED} />}
      </Paper>
    );
  }

  // ultra: the probe on the painted wall, a pulse into the steel, its echo off the rusted inner face
  const pk = ramp(t, e("test"), 12);
  const pulse = t >= e("pulse") ? ((t - e("pulse")) % 40) / 40 : -1;
  const back = t >= e("echo");
  const thick = ramp(t, e("thick"), 14);
  const y0 = 330, wall = 120, rustH = 70;
  return (
    <Paper t={t} zoom={drift + 0.14 * ramp(t, e("thick"), 20)} cx={960} cy={560}>
      <TypeText x={190} y={150} t={t} at={0} text="ULTRASONIC THICKNESS TEST" size={44} />
      <rect x={300} y={y0 - 30} width={1320} height={30} fill={PAINT} />
      <rect x={300} y={y0} width={1320} height={wall} fill={STEEL} />
      <path d={`M 300 ${y0 + wall} ${Array.from({ length: 34 }, (_, i) => `L ${300 + i * 40} ${y0 + wall + (i % 2 ? 18 : 4)}`).join(" ")} L 1620 ${y0 + wall} L 1620 ${y0 + wall + rustH} L 300 ${y0 + wall + rustH} Z`} fill={RUST} />
      <rect x={300} y={y0 + wall + rustH} width={1320} height={260} fill="#2a2420" />
      <TypeText x={320} y={y0 + wall + rustH + 70} t={t} at={0} text="INSIDE THE BEAM" size={36} color="#f4efe2" />
      <g transform={`translate(900 ${y0 - 30 - 150 + 150 * pk})`} opacity={pk}>
        <rect x={-50} y={0} width={100} height={150} rx={18} fill="#1f1b16" />
        <rect x={-10} y={-120} width={20} height={120} fill="#1f1b16" />
        <TypeText x={80} y={60} t={t} at={e("test")} text="PROBE" size={40} />
      </g>
      {pulse >= 0 && (
        <g>
          <circle cx={900} cy={y0 + (back ? (pulse < 0.5 ? pulse * 2 : 2 - pulse * 2) : Math.min(1, pulse * 2)) * wall} r={16} fill="#ffd27a" />
          <path d={`M 840 ${y0 + 10} Q 900 ${y0 + wall * Math.min(1, pulse * 2)} 960 ${y0 + 10}`} fill="none" stroke="#ffd27a" strokeWidth={5} opacity={0.7} />
        </g>
      )}
      {back && <TypeText x={1000} y={y0 + wall + 40} t={t} at={e("echo")} text="ECHO OFF THE INNER FACE" size={36} color="#ffd27a" />}
      {thick > 0 && (
        <g opacity={thick}>
          <line x1={1700} y1={y0} x2={1700} y2={y0 + wall} stroke={RED} strokeWidth={8} />
          <line x1={1675} y1={y0} x2={1725} y2={y0} stroke={RED} strokeWidth={8} /><line x1={1675} y1={y0 + wall} x2={1725} y2={y0 + wall} stroke={RED} strokeWidth={8} />
          <text x={1700} y={y0 + wall + 420} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill={RED}>TOO THIN</text>
        </g>
      )}
    </Paper>
  );
};

export default Beam;
