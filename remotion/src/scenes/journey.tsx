/**
 * Story scenes (2026-10-19, after the owner's review of the card video: "a slide show", text on an
 * empty background, bars everywhere). Every frame is a lit, layered place with things moving all the
 * time, and the numbers live inside it as objects: a bill, road signs, finish lines.
 *
 *   bill   a room lit by a screen: a small payment on the phone, and a bill that unrolls out of it
 *          across the floor to what it really costs. A hook that shows the topic and the shock.
 *   road   a journey through time: the camera travels down a road past signposts (Year 1, Year 8 ...),
 *          roadside things sliding past at their own depths. For anything that takes years.
 *   fork   two roads from one spot: a short one to a finish arch, a long one winding into the haze.
 *          For any either/or with a cost and a time on each side.
 *
 * Where and when each happens comes from the script (`place`, `time`, `land`, `weather`; see
 * ./settings.ts), and what it leaves unset is picked per video, so videos don't repeat each other.
 * Constant motion is built in: dust or steam in the light, flickering windows, rain, snow or leaves,
 * clouds, road dashes rushing toward the camera. Figures are Python's strings.
 */
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Character } from "../cast/Character";
import { CAST } from "../cast/cast";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { idle, walkLegs } from "../cast/rig";
import { FONT } from "../design/fonts";
import { Actor, type ActorSpec, at, clamp, ease, pop, PROPS, type SceneProps, sec } from "./kit";
import { dim, LAND_LOOKS, LANDS, type Land, pick, PLACES, SKIES, type Time, TIMES, type Weather, weatherFor } from "./settings";

const UID = (p: SceneProps, k: string) => `${p.beat.id}-${k}`;

/** Floating specks in the light: something always moves, even in a held shot. */
const Dust: React.FC<{ t: number; seed: string; n?: number; color?: string; box: [number, number, number, number]; rise?: number }> =
  ({ t, seed, n = 40, color = "#ffe9b8", box, rise = 1 }) => (
    <g>{Array.from({ length: n }, (_, i) => {
      const r = (k: string) => random(`${seed}${k}${i}`);
      const x = box[0] + ((r("x") * box[2] + Math.sin(t * 0.4 + i) * 30 + t * (6 + r("s") * 10)) % box[2]);
      const y = box[1] + ((r("y") * box[3] - t * rise * (8 + r("v") * 14) + box[3] * 10) % box[3]);
      return <circle key={i} cx={x} cy={y} r={1.5 + r("r") * 3} fill={color} opacity={0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />;
    })}</g>
  );

/** The sky for a time of day: gradient, sun or moon, twinkling stars, drifting clouds. */
const SkyLayer: React.FC<{ id: string; time: Time; x: number; y: number; w: number; h: number; t: number; sunX?: number; sunY?: number; scale?: number }> =
  ({ id, time, x, y, w, h, t, sunX = 0.75, sunY = 0.35, scale = 1 }) => {
    const s = SKIES[time];
    return <g>
      <defs><linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.top} /><stop offset="0.6" stopColor={s.mid} /><stop offset="1" stopColor={s.bottom} /></linearGradient></defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}sky)`} />
      {s.stars && Array.from({ length: 40 }, (_, i) => <circle key={i} cx={x + random(`${id}sx${i}`) * w} cy={y + random(`${id}sy${i}`) * h * 0.7} r={1.2 + random(`${id}sr${i}`) * 1.8}
        fill="#ffffff" opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1 + random(`${id}st${i}`) * 3) + i))} />)}
      <circle cx={x + w * sunX} cy={y + h * sunY} r={(s.sunUp ? 90 : 60) * scale} fill={s.sun} opacity={0.95} />
      {Array.from({ length: 4 }, (_, i) => {
        const cx = x + ((random(`${id}c${i}`) * w + t * (12 + i * 5)) % (w + 400)) - 200, cy = y + h * (0.15 + random(`${id}cy${i}`) * 0.45);
        return <g key={i} opacity={s.cloudAlpha} transform={`translate(${cx},${cy}) scale(${scale * (0.8 + random(`${id}cs${i}`) * 0.6)})`}>
          <ellipse rx={110} ry={30} fill={s.cloud} /><ellipse cx={-55} cy={6} rx={60} ry={24} fill={s.cloud} /><ellipse cx={60} cy={8} rx={64} ry={22} fill={s.cloud} />
        </g>;
      })}
    </g>;
  };

/** Rain, snow or falling leaves over a box, always moving. */
const WeatherLayer: React.FC<{ weather: Weather; box: [number, number, number, number]; t: number; seed: string; n?: number }> = ({ weather, box, t, seed, n = 70 }) => {
  if (weather === "clear") return null;
  const [bx, by, bw, bh] = box;
  return <g>{Array.from({ length: n }, (_, i) => {
    const r = (k: string) => random(`${seed}${weather}${k}${i}`);
    if (weather === "rain") {
      const x = bx + ((r("x") * bw + t * 120) % bw), y = by + ((r("y") * bh + t * (900 + r("v") * 400)) % bh);
      return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke="#cfe3ff" strokeWidth={2.5} opacity={0.45} />;
    }
    if (weather === "snow") {
      const x = bx + ((r("x") * bw + Math.sin(t + i) * 30) % bw), y = by + ((r("y") * bh + t * (60 + r("v") * 50)) % bh);
      return <circle key={i} cx={x} cy={y} r={2.5 + r("r") * 4} fill="#ffffff" opacity={0.85} />;
    }
    const x = bx + ((r("x") * bw + t * 60 + Math.sin(t * 2 + i) * 40) % bw), y = by + ((r("y") * bh + t * (70 + r("v") * 40)) % bh);
    return <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill={["#e8913a", "#d4592c", "#f2c14e"][i % 3]} transform={`rotate(${(t * 120 + i * 40) % 360} ${x} ${y})`} opacity={0.85} />;
  })}</g>;
};

// ---------------- bill ----------------

interface BillParams {
  who?: string; screen?: { text: string; at?: string }[]; lines?: { text: string; at?: string }[];
  total: { label: string; text: string; at?: string }; acting?: ActorSpec["acting"];
  place?: string; time?: string; weather?: string;
}

/** The room behind the story: its walls, window, light and furniture change with the place and time. */
const Room: React.FC<{ p: SceneProps; place: string; time: Time; weather: Weather; ground: number; hx: number }> = ({ p, place, time, weather, ground, hx }) => {
  const { width: w, height: h } = p.tl;
  const v = h > w, t = sec(p), night = time === "night";
  const walls: Record<string, [string, string]> = {
    home: ["#2a2350", "#3a3070"], kitchen: ["#f3e3c9", "#e7cfa8"], office: ["#d9e2ec", "#bfccd9"], cafe: ["#5a3b2e", "#7a5440"],
  };
  const [w0, w1] = night ? ["#151532", walls[place]![0]] : walls[place]!;
  const win = v ? { x: w * 0.08, y: h * 0.08, ww: w * 0.84, wh: h * 0.26 } : { x: w * 0.56, y: h * 0.08, ww: w * 0.38, wh: h * 0.48 };
  const floor = night ? "#2f2338" : place === "office" ? "#8a95a6" : place === "cafe" ? "#4a2f24" : "#b98c63";
  const id = UID(p, "room");
  return <g>
    <defs>
      <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={w0} /><stop offset="1" stopColor={w1} /></linearGradient>
      <radialGradient id={`${id}lamp`}><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient>
      <clipPath id={`${id}clip`}><rect x={win.x} y={win.y} width={win.ww} height={win.wh} rx={10} /></clipPath>
    </defs>
    <rect width={w} height={h} fill={`url(#${id}w)`} />
    {/* the window: the sky of the time of day, a skyline with lights at night, the weather */}
    <g clipPath={`url(#${id}clip)`}>
      <SkyLayer id={`${id}s`} time={time} x={win.x} y={win.y} w={win.ww} h={win.wh} t={t} sunX={0.78} sunY={0.25} scale={0.5} />
      {Array.from({ length: 9 }, (_, i) => {
        const bw = win.ww / 9, bh = win.wh * (0.3 + random(`${id}b${i}`) * 0.45), top = win.y + win.wh - bh;
        return <g key={i}>
          <rect x={win.x + i * bw + 4} y={top} width={bw - 8} height={bh} fill={night ? "#1c2452" : "#8fa3c0"} />
          {night && Array.from({ length: 10 }, (_, j) => random(`${id}l${i}${j}${Math.floor(t * 1.5 + random(`${i}${j}`) * 5)}`) > 0.45
            ? <rect key={j} x={win.x + i * bw + 12 + (j % 2) * (bw / 2 - 6)} y={top + 14 + Math.floor(j / 2) * 26} width={bw / 2 - 18} height={12} fill="#ffd27a" opacity={0.75} /> : null)}
        </g>;
      })}
      <WeatherLayer weather={weather} box={[win.x, win.y, win.ww, win.wh]} t={t} seed={`${id}wx`} n={40} />
    </g>
    <rect x={win.x} y={win.y} width={win.ww} height={win.wh} rx={10} fill="none" stroke={night ? "#3a3466" : "#ffffff"} strokeWidth={14} />
    {/* the light: a lamp's pool at night, a beam of sun through the window by day */}
    {night
      ? <ellipse cx={v ? w * 0.18 : w * 0.1} cy={ground - 250} rx={v ? 420 : 520} ry={v ? 520 : 460} fill={`url(#${id}lamp)`} />
      : <path d={`M${win.x},${win.y} L${win.x + win.ww * 0.5},${win.y} L${hx + 200},${h} L${hx - 300},${h}Z`} fill="#fff6d8" opacity={0.18 + 0.04 * Math.sin(t)} />}
    <rect x={0} y={ground} width={w} height={h - ground} fill={floor} />
    {/* furniture for the place */}
    {place === "home" && <g transform={`translate(${hx - (v ? 300 : 260)},${ground - 230})`}>
      <rect x={0} y={60} width={v ? 600 : 520} height={170} rx={30} fill={night ? "#4a4a9a" : "#5f7fc7"} />
      <rect x={20} y={0} width={v ? 560 : 480} height={120} rx={40} fill={night ? "#5757ad" : "#7091d6"} />
    </g>}
    {place === "home" && <g transform={`translate(${v ? w * 0.14 : w * 0.08},${ground})`}>
      <rect x={-6} y={-470} width={12} height={470} fill="#c9a36b" /><path d="M-90,-470 L90,-470 L60,-560 L-60,-560Z" fill="#ffd994" />
    </g>}
    {place === "kitchen" && <g>
      <rect x={0} y={ground - 260} width={v ? w : w * 0.5} height={260} fill="#ffffff" stroke="#e2d2b6" strokeWidth={4} />
      <rect x={0} y={ground - 290} width={v ? w : w * 0.52} height={34} fill="#9c7a54" />
      <g transform={`translate(${v ? w * 0.18 : w * 0.12},${ground - 290})`}>
        <path d="M-40,0 L-34,-80 L34,-80 L40,0Z" fill="#e8613c" />
        {Array.from({ length: 3 }, (_, i) => { const k = (t * 0.6 + i / 3) % 1; return <path key={i} d={`M${-10 + i * 10},-90 q${12 * Math.sin(t * 2 + i)},-30 0,-60`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.5 * (1 - k)} transform={`translate(0,${-k * 60})`} />; })}
      </g>
    </g>}
    {place === "office" && <g transform={`translate(${v ? w * 0.08 : w * 0.04},${ground - 300})`}>
      <rect x={0} y={170} width={v ? 520 : 480} height={30} fill="#7a6a5a" /><rect x={30} y={200} width={20} height={100} fill="#5a4a3a" /><rect x={v ? 470 : 430} y={200} width={20} height={100} fill="#5a4a3a" />
      <rect x={80} y={0} width={260} height={160} rx={10} fill="#1d2433" /><rect x={92} y={12} width={236} height={136} rx={6} fill="#4dd0e1" opacity={0.55 + 0.15 * Math.sin(t * 4)} />
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={104} y={26 + i * 28} width={(80 + ((i * 53 + Math.floor(t * 3) * 17) % 120))} height={10} rx={5} fill="#ffffff" opacity={0.7} />)}
    </g>}
    {place === "cafe" && <g>
      <rect x={v ? w * 0.05 : w * 0.03} y={ground - 150} width={v ? 360 : 320} height={24} rx={12} fill="#c49a6c" />
      <rect x={(v ? w * 0.05 : w * 0.03) + 150} y={ground - 126} width={20} height={126} fill="#8a6a4a" />
      <g transform={`translate(${(v ? w * 0.05 : w * 0.03) + 220},${ground - 150})`}>
        <path d="M-26,0 L-22,-50 L22,-50 L26,0Z" fill="#ffffff" />
        {Array.from({ length: 2 }, (_, i) => { const k = (t * 0.6 + i / 2) % 1; return <path key={i} d={`M${-6 + i * 12},-56 q${10 * Math.sin(t * 2 + i)},-24 0,-48`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.5 * (1 - k)} transform={`translate(0,${-k * 50})`} />; })}
      </g>
      {/* people passing outside */}
      {Array.from({ length: 3 }, (_, i) => { const px = win.x + ((t * (40 + i * 25) + i * 300) % (win.ww + 120)) - 60; return <g key={i} transform={`translate(${px},${win.y + win.wh})`} opacity={0.55}>
        <circle cy={-150} r={22} fill="#2b2b3a" /><rect x={-24} y={-128} width={48} height={128} rx={20} fill="#2b2b3a" /></g>; })}
    </g>}
    <Dust t={t} seed={`${id}d`} box={[0, 0, v ? w : w * 0.55, ground]} color={night ? "#ffe9b8" : "#ffffff"} />
  </g>;
};

export const BillScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as BillParams;
  const v = h > w, t = sec(p), dur = p.beat.frames / p.fps;
  const place = pick(p.tl, "place", PLACES, P.place);
  const time = pick(p.tl, "room-time", ["night", "night", "dawn", "noon", "sunset"] as const, P.time) as Time;
  const weather = pick(p.tl, "room-weather", ["clear", "clear", "rain"] as const, P.weather) as Weather;
  const ground = v ? h * 0.62 : h * 0.8;
  const who = P.who ?? "rohan";
  const totalAt = at(p, P.total.at, dur * 0.6);
  // the bill unrolls from the phone toward the camera until the total lands
  const u = p.beat.from === 0 && totalAt < 0.05 ? 1 : ease(clamp((t - 0.4) / Math.max(0.6, totalAt - 0.4)));
  const hx = v ? w * 0.3 : w * 0.3, hy = ground - (v ? 560 : 430);       // about where the phone is
  const billTop = { x: hx + (v ? 90 : 110), y: hy + 30 };
  const billEnd = { x: v ? w * 0.5 : hx + 560, y: v ? h * 0.9 : h * 0.92 };
  const by = billTop.y + (billEnd.y - billTop.y) * u, bx = billTop.x + (billEnd.x - billTop.x) * u;
  const halfW0 = v ? 70 : 46, halfW1 = v ? 470 : 400, halfW = halfW0 + (halfW1 - halfW0) * u;
  const lines = P.lines ?? [];
  const fs = v ? 46 : 38, fsTotal = v ? 92 : 84;
  return (
    <AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id={UID(p, "glow")}><stop offset="0" stopColor="#9fe8ff" stopOpacity={0.6} /><stop offset="1" stopColor="#9fe8ff" stopOpacity={0} /></radialGradient>
          <linearGradient id={UID(p, "paper")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9e4d8" /><stop offset="1" stopColor="#fffdf7" /></linearGradient>
        </defs>
        <Room p={p} place={place} time={time} weather={weather} ground={ground} hx={hx} />
        {/* the phone's glow on his face */}
        <circle cx={hx} cy={hy} r={v ? 260 : 230} fill={`url(#${UID(p, "glow")})`} opacity={(time === "night" ? 0.8 : 0.35) + 0.2 * Math.sin(t * 3)} />
        <Actor p={p} ground={ground} index={0} spec={{ who, x: hx / w, scale: v ? 1.5 : 1.15,
          acting: P.acting ?? [{ sec: 0, pose: "phone", prop: "phone", expression: "happy" }, { sec: Math.max(0, totalAt - 0.2), pose: "worried", expression: "shock" }] }} />
        {/* the bill, a trapezoid widening toward the camera, its lines appearing as it unrolls */}
        {u > 0 && <g>
          <path d={`M${billTop.x - halfW0},${billTop.y} L${billTop.x + halfW0},${billTop.y} L${bx + halfW},${by} L${bx - halfW},${by}Z`} fill={`url(#${UID(p, "paper")})`} stroke="#cfc6b3" strokeWidth={3} />
          <ellipse cx={bx} cy={by} rx={halfW} ry={v ? 22 : 18} fill="#f5f0e4" stroke="#cfc6b3" strokeWidth={3} />
          {lines.map((l, i) => {
            const f = v ? 0.46 + 0.24 * (i / Math.max(1, lines.length - 1)) : 0.3 + 0.32 * (i / Math.max(1, lines.length - 1));
            if (u < f + 0.05) return null;
            const ly = billTop.y + (billEnd.y - billTop.y) * f, lx = billTop.x + (billEnd.x - billTop.x) * f, lw = halfW0 + (halfW1 - halfW0) * f;
            const size = Math.min(fs * (0.65 + 0.35 * f), (lw * 1.7) / Math.max(1, l.text.length * 0.55));
            return <text key={i} x={lx} y={ly} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={Math.max(v ? 44 : 30, size)} fill="#4a4336">{l.text}</text>;
          })}
          {u > 0.98 && <g opacity={clamp((t - totalAt) * 4)}>
            <text x={bx - (v ? 20 : 30)} y={by - (v ? 150 : 128)} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={fs} fill="#4a4336">{P.total.label}</text>
            <text x={bx} y={by - (v ? 46 : 36)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fsTotal} fill={pal.danger}
              transform={`rotate(-3 ${bx} ${by - 40})`}>{P.total.text}</text>
          </g>}
        </g>}
      </svg>
      {/* the phone screen, big, beside him: what he thinks he is paying (there from the first frame) */}
      {(P.screen ?? []).length > 0 && (() => {
        const k = p.beat.from === 0 ? 1 : pop(p, 0.1, 12, 140);
        return <div style={{ position: "absolute", left: v ? w * 0.5 : hx + 150, top: v ? h * 0.3 : hy - 300, width: v ? 400 : 340, padding: v ? 30 : 26, borderRadius: 34,
          background: "#0e1426", border: "8px solid #2c3550", boxShadow: "0 0 70px rgba(120,220,255,0.35)", opacity: clamp(k * 2), transform: `scale(${0.8 + 0.2 * k}) rotate(4deg)` }}>
          {P.screen!.map((s, i) => {
            const start = at(p, s.at, i * 0.4);
            const kk = p.beat.from === 0 && start < 0.05 ? 1 : pop(p, start, 12, 160);
            return <div key={i} style={{ fontFamily: FONT, fontWeight: i ? 700 : 600, fontSize: i ? (v ? 64 : 54) : (v ? 44 : 36), color: i ? "#7cf0b2" : "#9fb0d0", opacity: clamp(kk * 2), lineHeight: 1.2 }}>{s.text}</div>;
          })}
        </div>;
      })()}
    </AbsoluteFill>
  );
};

// ---------------- road ----------------

interface RoadParams {
  who?: string; signs: { label: string; text?: string; at?: string; good?: boolean }[]; title?: string; expression?: Expression;
  land?: string; time?: string; weather?: string;
}

/** What stands beside the road in each land, drawn at the origin and scaled by depth. */
const Roadside: React.FC<{ land: Land; i: number; time: Time; t: number }> = ({ land, i, time, t }) => {
  const c = (hex: string) => dim(hex, time);
  switch (land) {
    case "desert": return <g fill={c("#4f9a5a")}><rect x={-14} y={-200} width={28} height={200} rx={14} /><rect x={-60} y={-150} width={20} height={70} rx={10} /><rect x={-60} y={-100} width={60} height={20} rx={10} />{i % 2 ? <><rect x={40} y={-170} width={20} height={80} rx={10} /><rect x={0} y={-110} width={60} height={20} rx={10} /></> : null}</g>;
    case "snow": return <g><rect x={-10} y={-80} width={20} height={80} fill={c("#6b4f3a")} /><path d="M0,-300 L-90,-80 L90,-80Z" fill={c("#2f6b4f")} /><path d="M0,-300 L-50,-190 L50,-190Z" fill="#ffffff" /></g>;
    case "city": return <g>
      <rect x={-8} y={-300} width={16} height={300} fill={c("#4a4f5c")} /><rect x={-8} y={-300} width={70} height={14} fill={c("#4a4f5c")} />
      <circle cx={58} cy={-282} r={time === "night" ? 26 : 12} fill="#ffe9a8" opacity={time === "night" ? 0.9 : 0.6} />
      {time === "night" && <circle cx={58} cy={-282} r={70} fill="#ffe9a8" opacity={0.15 + 0.05 * Math.sin(t * 3 + i)} />}
    </g>;
    case "coast": return <g><path d="M0,0 Q10,-150 -10,-300" stroke={c("#8a6a3a")} strokeWidth={22} fill="none" />
      {[-0.9, -0.3, 0.3, 0.9].map((a, j) => <ellipse key={j} cx={-10 + Math.sin(a) * 70} cy={-300 + Math.abs(a) * 20} rx={80} ry={18} fill={c("#3f9a5a")} transform={`rotate(${a * 45 + Math.sin(t * 1.5 + i) * 4} -10 -300)`} />)}</g>;
    default: return <g><rect x={-12} y={-120} width={24} height={120} fill={c("#7a5a3a")} /><circle cy={-190} r={90} fill={c(i % 3 ? "#4e9a5a" : "#5fae68")} /></g>;
  }
};

/** The far distance for a land: hills, dunes, mountains, a skyline or the sea. */
const FarLand: React.FC<{ land: Land; time: Time; w: number; hz: number; t: number; id: string }> = ({ land, time, w, hz, t, id }) => {
  const L = LAND_LOOKS[land], c = (hex: string) => dim(hex, time);
  if (land === "city") return <g>{Array.from({ length: 14 }, (_, i) => {
    const bw = w / 14, bh = 80 + random(`${id}cb${i}`) * 220;
    return <g key={i}><rect x={i * bw} y={hz - bh} width={bw - 6} height={bh} fill={c(i % 2 ? L.far : L.far2)} />
      {time === "night" && Array.from({ length: 6 }, (_, j) => random(`${id}cw${i}${j}${Math.floor(t * 1.2 + j)}`) > 0.5 ? <rect key={j} x={i * bw + 10 + (j % 2) * 30} y={hz - bh + 16 + Math.floor(j / 2) * 34} width={18} height={14} fill="#ffd27a" opacity={0.8} /> : null)}</g>;
  })}</g>;
  if (land === "coast") return <g>
    <rect x={0} y={hz - 60} width={w} height={60} fill={c(L.far)} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${((i * w) / 6 + t * 20) % w},${hz - 30 + (i % 2) * 14} q30,-10 60,0`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.6} />)}
  </g>;
  const peak = land === "snow" ? 260 : land === "desert" ? 70 : 110;
  return <g>
    <path d={`M0,${hz} ${Array.from({ length: 9 }, (_, i) => `Q${i * w / 8 + w / 16 - (t * 6) % (w / 8)},${hz - peak - 50 * random(`${id}h${i}`)} ${(i + 1) * w / 8 - (t * 6) % (w / 8)},${hz}`).join(" ")} L${w},${hz} Z`} fill={c(L.far2)} opacity={0.75} />
    <path d={`M0,${hz} ${Array.from({ length: 7 }, (_, i) => `Q${i * w / 6 + w / 12},${hz - peak * 0.55 - 40 * random(`${id}k${i}`)} ${(i + 1) * w / 6},${hz}`).join(" ")} L${w},${hz} Z`} fill={c(L.far)} />
  </g>;
};

export const RoadScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const P = p.beat.params as unknown as RoadParams;
  const v = h > w, t = sec(p), dur = p.beat.frames / p.fps;
  const land = pick(p.tl, "land", LANDS, P.land), time = pick(p.tl, "road-time", TIMES, P.time), weather = weatherFor(p.tl, land, P.weather);
  const L = LAND_LOOKS[land], c = (hex: string) => dim(hex, time);
  const hz = v ? h * 0.38 : h * 0.42;            // horizon
  const vx = w * 0.52;                           // vanishing point x
  const speed = 0.9;                             // the camera's forward speed
  const Y = (z: number) => hz + (h - hz) * Math.pow(1 - z, 2.2);
  const roadHalf = (z: number) => (v ? w * 0.75 : w * 0.42) * Math.pow(1 - z, 2.2) + 6;
  const signs = P.signs ?? [];
  const id = UID(p, "road");
  return (
    <AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <SkyLayer id={id} time={time} x={0} y={0} w={w} h={hz + 4} t={t} sunX={0.66} sunY={0.62} scale={v ? 0.9 : 1.1} />
        <FarLand land={land} time={time} w={w} hz={hz} t={t} id={id} />
        <rect x={0} y={hz} width={w} height={h - hz} fill={c(L.ground)} />
        <rect x={0} y={hz} width={w} height={(h - hz) * 0.25} fill={c(L.near)} />
        {/* the road and its dashes rushing toward the camera */}
        <path d={`M${vx - 6},${hz} L${vx + 6},${hz} L${vx + roadHalf(0)},${h} L${vx - roadHalf(0)},${h}Z`} fill={c(L.road)} />
        {Array.from({ length: 14 }, (_, i) => {
          const z = ((i / 14 - t * speed * 0.35) % 1 + 1) % 1, z2 = Math.min(1, z + 0.025);
          return <path key={i} d={`M${vx - roadHalf(z) * 0.03},${Y(z)} L${vx + roadHalf(z) * 0.03},${Y(z)} L${vx + roadHalf(z2) * 0.03},${Y(z2)} L${vx - roadHalf(z2) * 0.03},${Y(z2)}Z`} fill={L.line} />;
        })}
        {/* roadside things passing by, far ones first */}
        {Array.from({ length: 16 }, (_, i) => ({ i, z: ((i / 16 - t * speed * 0.35 + random(`${id}t${i}`) * 0.05) % 1 + 1) % 1 }))
          .sort((a, b) => b.z - a.z)
          .map(({ i, z }) => {
            if (z < 0.02) return null;
            const side = i % 2 ? 1 : -1, s = Math.pow(1 - z, 2.2), x = vx + side * (roadHalf(z) + 60 * s + 40), y = Y(z);
            return <g key={i} transform={`translate(${x},${y}) scale(${Math.max(0.05, s * (v ? 2 : 1.6)) * (side < 0 && land === "city" ? -1 : 1)},${Math.max(0.05, s * (v ? 2 : 1.6))})`}>
              <Roadside land={land} i={i} time={time} t={t} />
            </g>;
          })}
        {/* the signposts: each appears on its event far away and comes toward the camera, fast enough
            to be close and readable before the beat ends */}
        {signs.map((s, i) => {
          const start = at(p, s.at, 0.3 + i * (dur / Math.max(1, signs.length)));
          const age = t - start;
          if (age < 0) return null;
          const board = (k: number, x: number, y: number) => <g key={i} transform={`translate(${x},${y}) scale(${k})`} opacity={clamp(age * 3)}>
            <rect x={-6} y={-260} width={12} height={260} fill="#6b7280" />
            <rect x={v ? -220 : -170} y={v ? -420 : -380} width={v ? 440 : 340} height={v ? 190 : 150} rx={14} fill={s.good ? "#1f8f55" : "#14532d"} stroke="#ffffff" strokeWidth={8} />
            <text x={0} y={v ? -348 : -322} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={v ? 62 : 46} fill="#ffffff">{s.label}</text>
            {s.text && <text x={0} y={v ? -272 : -262} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={v ? 54 : 38} fill={s.good ? "#d9ffe9" : "#ffd36e"}>{s.text}</text>}
          </g>;
          if (v) {
            // a tall frame has no room for a sign to grow from the horizon: it springs up beside the
            // road at a readable size, inside the frame, and keeps drifting toward the camera
            const next = signs[i + 1] ? at(p, signs[i + 1]!.at, 0.3 + (i + 1) * (dur / signs.length)) : Infinity;
            const leave = clamp((t - next) / 0.4);
            if (leave >= 1) return null;
            const k = (0.7 + 0.3 * pop(p, start, 11, 150)) * (1 + Math.min(0.12, age * 0.03)) * (1 - 0.3 * leave);
            return <g key={i} opacity={1 - leave}>{board(k, w * 0.5, hz + (h - hz) * 0.4)}</g>;
          }
          const travel = Math.max(0.32, 0.6 / Math.max(0.6, dur - start - 0.4));
          const z = clamp(0.92 - age * travel, 0.12, 0.92), sc = Math.pow(1 - z, 2.2), x = vx + (i % 2 ? 1 : -1) * (roadHalf(z) + 30 * sc + 10), y = Y(z);
          return board(2.1 * sc + 0.08, x, y);
        })}
        {/* the cast member walking the road */}
        {(() => {
          const member = CAST[P.who ?? "rohan"]!;
          const pose = idle({ ...POSES.worried, ...walkLegs(t * 1.6), turn: -0.15 }, t);
          const x = vx - (v ? 200 : 330), y = h - (v ? 120 : 30), sc = v ? 1.35 : 1.0;
          return <Character id={`${p.beat.id}-walker`} look={member.look} pose={pose} expression={P.expression ?? "worried"} x={x} y={y} scale={sc} gaze={[0, -0.2]} holdL={PROPS.card} />;
        })()}
        <WeatherLayer weather={weather} box={[0, 0, w, h]} t={t} seed={`${id}wx`} />
      </svg>
      {P.title && <div style={{ position: "absolute", left: 0, top: v ? 120 : 50, width: w, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: v ? 72 : 64,
        color: time === "night" ? "#ffffff" : "#3b1f12", textShadow: time === "night" ? "0 3px 12px rgba(0,0,0,0.6)" : "0 3px 0 rgba(255,255,255,0.6)", opacity: clamp(pop(p, 0.1) * 2) }}>{P.title}</div>}
    </AbsoluteFill>
  );
};

// ---------------- fork ----------------

interface ForkSide { label: string; time: string; cost: string; at?: string }
interface ForkParams { who?: string; short: ForkSide; long: ForkSide; expression?: Expression; pose?: PoseName; land?: string; time?: string; weather?: string }

export const ForkScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as ForkParams;
  const v = h > w, t = sec(p), dur = p.beat.frames / p.fps;
  const land = pick(p.tl, "land", LANDS, P.land), time = pick(p.tl, "fork-time", ["dawn", "noon", "sunset"] as const, P.time) as Time;
  const weather = weatherFor(p.tl, land, P.weather);
  const L = LAND_LOOKS[land], c = (hex: string) => dim(hex, time);
  const hz = h * 0.3;
  const kS = pop(p, at(p, P.short.at, 0.5), 12, 140), kL = pop(p, at(p, P.long.at, dur * 0.45), 12, 140);
  const fx = w * 0.5, fy = h - (v ? 260 : 120);     // where the roads split
  const shortEnd = { x: v ? w * 0.22 : w * 0.24, y: hz + (h - hz) * 0.42 };
  const longPath = `M${fx + 30},${fy} C${w * 0.85},${fy - 120} ${w * 0.6},${hz + 220} ${w * 0.8},${hz + 140} S${w * 0.62},${hz + 40} ${w * 0.7},${hz + 6}`;
  const id = UID(p, "fork");
  return (
    <AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <SkyLayer id={id} time={time} x={0} y={0} w={w} h={hz + 4} t={t} sunX={0.2} sunY={0.4} scale={0.9} />
        <FarLand land={land} time={time} w={w} hz={hz} t={t} id={id} />
        <rect x={0} y={hz} width={w} height={h - hz} fill={c(L.ground)} />
        <rect x={0} y={hz} width={w} height={(h - hz) * 0.3} fill={c(L.near)} />
        {/* the long road and the haze it disappears into */}
        <path d={longPath} fill="none" stroke={c(L.road)} strokeWidth={v ? 70 : 80} strokeLinecap="round" />
        <path d={longPath} fill="none" stroke={L.line} strokeWidth={6} strokeDasharray="30 30" strokeDashoffset={-t * 40} />
        <filter id={`${id}blur`}><feGaussianBlur stdDeviation={40} /></filter>
        <g filter={`url(#${id}blur)`} opacity={0.85}>
          {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={w * (0.6 + i * 0.09) + Math.sin(t * 0.5 + i) * 30} cy={hz + 40 + (i % 2) * 40} rx={w * 0.12} ry={70} fill="#ffffff" />)}
        </g>
        {/* the short road and its finish arch */}
        <path d={`M${fx - 30},${fy} L${shortEnd.x},${shortEnd.y}`} stroke={c(L.road)} strokeWidth={v ? 90 : 100} strokeLinecap="round" />
        <path d={`M${fx - 30},${fy} L${shortEnd.x},${shortEnd.y}`} stroke={L.line} strokeWidth={6} strokeDasharray="30 30" strokeDashoffset={-t * 40} />
        <g transform={`translate(${shortEnd.x},${shortEnd.y})`}>
          <rect x={-130} y={-200} width={16} height={200} fill="#ffffff" /><rect x={114} y={-200} width={16} height={200} fill="#ffffff" />
          <rect x={-140} y={-240} width={280} height={60} rx={10} fill="#1f8f55" />
          <text x={0} y={-198} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={v ? 48 : 40} fill="#ffffff">FINISH</text>
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-120 + i * 24} y={-180 + Math.sin(t * 6 + i) * 6} width={14} height={20} fill={["#ff5d5d", "#ffd34d", "#4dabf7"][i % 3]} transform={`rotate(${(i * 37 + t * 200) % 360} ${-113 + i * 24} -170)`} opacity={kS} />)}
        </g>
        {/* the two price boards */}
        {[{ s: P.short, k: kS, x: v ? w * 0.28 : w * 0.24, y: v ? h * 0.58 : hz + 560, good: true },
          { s: P.long, k: kL, x: v ? w * 0.72 : w * 0.8, y: v ? h * 0.44 : hz + 520, good: false }].map(({ s, k, x, y, good }, i) => (
          <g key={i} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp(k * 2)}>
            <rect x={-200} y={-120} width={400} height={240} rx={22} fill="#ffffff" stroke={good ? "#1f8f55" : pal.danger} strokeWidth={10} />
            <text x={0} y={-58} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={v ? 44 : 38} fill="#3f4656">{s.label}</text>
            <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={v ? 70 : 62} fill={good ? "#1f8f55" : pal.danger}>{s.time}</text>
            <text x={0} y={82} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={v ? 54 : 48} fill="#1d2433">{s.cost}</text>
          </g>
        ))}
        <Actor p={p} ground={h - (v ? 40 : 10)} index={0} spec={{ who: P.who ?? "rohan", x: 0.5, scale: v ? 0.95 : 0.85,
          acting: [{ sec: 0, pose: P.pose ?? "think", expression: P.expression ?? "thinking" }] }} />
        <WeatherLayer weather={weather} box={[0, 0, w, h]} t={t} seed={`${id}wx`} />
      </svg>
    </AbsoluteFill>
  );
};
