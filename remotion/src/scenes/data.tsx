/**
 * Data and metaphor scenes: numbers that land, a card statement, the interest monster, a
 * snowball, a calendar, a split, a chart that draws itself and towers. Every figure shown is a
 * string Python formatted; count-ups only fill the frames before it lands.
 */
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { evolvePath } from "@remotion/paths";
import { Sikka } from "../cast/Sikka";
import { blinkAt, settle } from "../cast/acting";
import { FONT } from "../design/fonts";
import { Actor, type ActorSpec, at, Chip, clamp, counted, DataSet, ease, easeOut, Kinetic, num, pop, type SceneProps, sec, str } from "./kit";

interface Line { text: string; at?: string; style?: "hero" | "sub" | "danger" | "good" | "kicker"; value?: number }

function lineStyle(p: SceneProps, style: Line["style"]): { size: number; color: string; weight: number } {
  const pal = p.tl.palette;
  const v = p.tl.height > p.tl.width;           // a Short: read on a phone, small text at 44 px and up
  switch (style) {
    case "hero": return { size: 150, color: pal.accent, weight: 800 };
    case "danger": return { size: 150, color: pal.danger, weight: 800 };
    case "good": return { size: 150, color: pal.cast[0]!, weight: 800 };
    case "kicker": return { size: v ? 52 : 44, color: pal.muted, weight: 600 };
    default: return { size: v ? 66 : 58, color: pal.text, weight: 700 };
  }
}

/** Rows a line wraps to at this width (Poppins is about 0.6 em a character at these weights). */
const rows = (text: string, size: number, width: number) => Math.max(1, Math.ceil((text.length * size * 0.6) / width));

/** Stacked lines that arrive on their events; big ones count up to their figure. */
const Lines: React.FC<{ p: SceneProps; lines: Line[]; x: number; width: number; top: number; align: "left" | "center" }> = ({ p, lines, x, width, top, align }) => {
  let y = top;
  return (
    <>
      {lines.map((l, i) => {
        const st = lineStyle(p, l.style);
        const start = at(p, l.at, 0.2 + i * 0.5);
        // the video's first frame is its thumbnail in the feed: lines due at the start are already there
        const k = p.beat.from === 0 && start < 0.05 ? 1 : pop(p, start, 10, 160);
        const text = l.value !== undefined ? counted(p, l.value, l.text, start, start + 0.9) : l.text;
        const el = (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width, textAlign: align, fontFamily: FONT, fontWeight: st.weight,
            fontSize: st.size, color: st.color, lineHeight: 1.05, letterSpacing: st.size > 100 ? -3 : -0.5,
            opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 60}px) scale(${0.7 + 0.3 * k})`, transformOrigin: align === "left" ? "left center" : "center",
            textShadow: st.size > 100 ? `0 0 60px ${st.color}55` : "0 6px 20px rgba(0,0,0,0.3)",
          }}>{text}</div>
        );
        y += st.size * 1.05 * rows(l.text, st.size, width) + 0.15 * st.size + 14;
        return el;
      })}
    </>
  );
};

export const BigNumberScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const lines = (p.beat.params.lines as Line[]) ?? [];
  const actor = p.beat.params.actor as ActorSpec | undefined;
  const v = h > w;                                // a Short: text centred above the captions, actor below
  const x = v ? 70 : actor ? 120 : 0, width = v ? w - 140 : actor ? w * 0.62 : w;
  const total = lines.reduce((s, l) => { const st = lineStyle(p, l.style); return s + st.size * 1.05 * rows(l.text, st.size, width) + 0.15 * st.size + 14; }, 0);
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={sec(p)} seed={p.beat.id} />
      <Lines p={p} lines={lines} x={x} width={width} top={v ? h * 0.3 - total / 2 : (h - total) / 2} align={v || !actor ? "center" : "left"} />
      {actor && <svg width={w} height={h} style={{ position: "absolute" }}><Actor p={p} spec={actor} ground={h * 0.98} index={0} /></svg>}
    </AbsoluteFill>
  );
};

export const RevealScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const lines = (p.beat.params.lines as Line[]) ?? [];
  const actor = p.beat.params.actor as ActorSpec | undefined;
  const t = sec(p);
  const hit = at(p, lines.find((l) => l.style === "danger" || l.style === "hero")?.at, 0.3);
  const k = t - hit;
  const shake = k > 0 ? Math.exp(-k * 6) * 18 : 0;
  const burst = clamp(k / 0.8);
  const v = h > w, x = v ? 70 : 0, width = v ? w - 140 : w;
  const total = lines.reduce((s, l) => { const st = lineStyle(p, l.style); return s + st.size * 1.05 * rows(l.text, st.size, width) + 0.15 * st.size + 14; }, 0);
  return (
    <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 70) * shake}px, ${Math.cos(t * 60) * shake}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${pal.danger}55, ${pal.bg} 60%)` }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {k > 0 && Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2 + random(`${p.beat.id}a${i}`) * 0.3;
          const r = 120 + easeOut(burst) * (380 + random(`${p.beat.id}r${i}`) * 300);
          return <circle key={i} cx={w / 2 + Math.cos(a) * r} cy={h * 0.42 + Math.sin(a) * r * 0.6} r={6 + (i % 4) * 3} fill={i % 3 ? pal.accent : pal.danger} opacity={1 - burst} />;
        })}
      </svg>
      <Lines p={p} lines={lines} x={x} width={width} top={v ? h * 0.3 - total / 2 : (h - total) / 2 - 40} align="center" />
      {actor && <svg width={w} height={h} style={{ position: "absolute" }}><Actor p={p} spec={actor} ground={h * (h > w ? 1.0 : 1.18)} index={0} /></svg>}
    </AbsoluteFill>
  );
};

export const StatementScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as { total: string; min: string; totalAt?: string; minAt?: string; pick?: string; pickAt?: string };
  const t = sec(p);
  const inK = pop(p, 0, 13, 120);
  const totalOn = pop(p, at(p, P.totalAt, 0.6)), minOn = pop(p, at(p, P.minAt, 1.4));
  const pickT = P.pick ? at(p, P.pickAt, 1.2) : 1e9;
  const tap = t - pickT;
  const cw = 760, ch = 760, cx = w / 2 - cw / 2, cy = h / 2 - ch / 2 + (1 - inK) * 200;
  const fingerX = cx + cw / 2 + 120 * (1 - easeOut(tap / 0.5)), fingerY = cy + 620 + 80 * (1 - easeOut(tap / 0.5));
  const row = (label: string, value: string, y: number, on: number, color: string) => (
    <div style={{ position: "absolute", left: 50, top: y, width: cw - 100, height: 130, borderRadius: 22,
      background: on > 0 ? `${color}22` : "transparent", border: `4px solid ${on > 0 ? color : "transparent"}`,
      transform: `scale(${1 + 0.04 * Math.sin(Math.min(1, on) * Math.PI)})`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px" }}>
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: "#475569" }}>{label}</span>
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, color: "#0f172a" }}>{value}</span>
    </div>
  );
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <AbsoluteFill style={{ transform: h > w ? "translateY(-330px) scale(1.3)" : undefined }}>
      <div style={{ position: "absolute", left: cx, top: cy, width: cw, height: ch, borderRadius: 40, background: "#ffffff",
        boxShadow: "0 40px 80px rgba(0,0,0,0.4)", opacity: clamp(inK * 2), transform: `rotate(${(1 - inK) * -4}deg)` }}>
        <div style={{ height: 120, borderRadius: "40px 40px 0 0", background: "#3b5bdb", display: "flex", alignItems: "center", padding: "0 40px" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#ffffff" }}>Card statement</span>
        </div>
        {row("Total due", P.total, 170, totalOn, pal.cast[0]!)}
        {row("Minimum due", P.min, 330, minOn, pal.danger)}
        <div style={{ position: "absolute", left: 50, top: 520, width: cw - 100, display: "flex", gap: 30 }}>
          {[["Pay total", pal.cast[0]!], ["Pay minimum", pal.danger]].map(([label, c], i) => {
            const chosen = P.pick === (i === 0 ? "total" : "min") && tap > 0.45;
            return (
              <div key={i} style={{ flex: 1, height: 120, borderRadius: 60, background: chosen ? c : "#f1f5f9", border: `4px solid ${c}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 38,
                color: chosen ? "#ffffff" : "#0f172a", transform: `scale(${chosen ? 1 + 0.08 * Math.exp(-(tap - 0.45) * 6) : 1})` }}>{label}</div>
            );
          })}
        </div>
      </div>
      {P.pick && tap > -0.3 && (
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {tap > 0.45 && <circle cx={cx + cw / 2 + (P.pick === "min" ? 190 : -190)} cy={cy + 580} r={30 + (tap - 0.45) * 220} fill="none" stroke={pal.danger} strokeWidth={6} opacity={clamp(1 - (tap - 0.45) * 2)} />}
          <g transform={`translate(${fingerX + (P.pick === "min" ? 190 : -190) - w * 0},${fingerY})`}>
            <ellipse cx={0} cy={0} rx={34} ry={44} fill="#c98a5e" />
            <rect x={-14} y={-90} width={28} height={80} rx={14} fill="#c98a5e" />
          </g>
        </svg>
      )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MonsterScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const t = sec(p);
  const label = str(p.beat.params.label);
  const mx = w * 0.62, my = h * 0.55;
  const chomp = Math.abs(Math.sin(t * 5));
  const grow = 1 + Math.min(0.25, t * 0.03);
  const coins = Array.from({ length: 7 }, (_, i) => {
    const ph = ((t * 0.8 + i / 7) % 1);
    const sx = w * 0.12, sy = h * 0.75;
    const x = sx + (mx - 60 - sx) * ph, y = sy + (my - sy) * ph - Math.sin(ph * Math.PI) * 260;
    return { x, y, s: 1 - ph * 0.5, o: ph < 0.92 ? 1 : 0 };
  });
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {coins.map((c, i) => <g key={i} opacity={c.o}><Sikka x={c.x} y={c.y} size={70 * c.s} expression="shock" spin={t * 6 + i} /></g>)}
        <g transform={`translate(${mx},${my}) scale(${grow})`}>
          <ellipse cx={0} cy={210} rx={200} ry={26} fill="#000" opacity={0.25} />
          <path d="M-190,190 C-230,-40 -120,-200 0,-200 C120,-200 230,-40 190,190 Q150,150 110,190 Q70,150 30,190 Q-10,150 -50,190 Q-90,150 -130,190 Q-160,150 -190,190Z" fill="#7c3aed" />
          <path d="M-150,0 C-160,-120 -60,-170 0,-170" stroke="#a78bfa" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
          <ellipse cx={-60} cy={-80} rx={38} ry={44} fill="#ffffff" /><ellipse cx={60} cy={-80} rx={38} ry={44} fill="#ffffff" />
          <circle cx={-52 + Math.sin(t) * 8} cy={-72} r={20} fill="#1e1b4b" /><circle cx={52 + Math.sin(t) * 8} cy={-72} r={20} fill="#1e1b4b" />
          <path d="M-100,-140 L-30,-115 M100,-140 L30,-115" stroke="#1e1b4b" strokeWidth={14} strokeLinecap="round" />
          <path d={`M-110,10 Q0,${40 + chomp * 110} 110,10 Q0,${30 - chomp * 10} -110,10Z`} fill="#2e1065" />
          {[-80, -40, 0, 40, 80].map((x, i) => <path key={i} d={`M${x - 15},${12 + Math.abs(x) * 0.05} l15,28 l15,-28Z`} fill="#ffffff" />)}
        </g>
      </svg>
      <div style={{ position: "absolute", top: 70, left: 0, width: w, textAlign: "center" }}>
        <Chip text={label} k={pop(p, at(p, str(p.beat.params.labelAt) || undefined, 0.4))} bg={pal.danger} fg="#ffffff" size={52} />
      </div>
      <div style={{ position: "absolute", left: mx - 140, top: my + 260, width: 280, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: "#c4b5fd", opacity: clamp(t / 0.6) }}>
        {str(p.beat.params.name, "INTEREST")}
      </div>
    </AbsoluteFill>
  );
};

export const SnowballScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const t = sec(p);
  const dur = p.beat.frames / p.fps;
  const prog = clamp(t / dur);
  const x = w * 0.08 + prog * w * 0.82;
  const slope = 0.32;
  const groundY = (gx: number) => h * 0.28 + gx * slope;
  const r = 40 + prog * prog * 190;
  const y = groundY(x) - r;
  const bumps = Math.floor(t * 1.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #9ec9f0, #e6f1fb)` }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {[0.2, 0.55, 0.85].map((fx, i) => <path key={i} d={`M${w * fx - 260},${h * 0.5} L${w * fx},${h * 0.15 + i * 30} L${w * fx + 260},${h * 0.5}Z`} fill="#c7dbef" />)}
        <path d={`M0,${groundY(0)} L${w},${groundY(w)} L${w},${h} L0,${h}Z`} fill="#ffffff" />
        <path d={`M0,${groundY(0)} L${x},${groundY(x)}`} stroke="#dbe7f3" strokeWidth={r * 0.9} strokeLinecap="round" opacity={0.6} />
        <g transform={`translate(${x},${y}) rotate(${t * 180})`}>
          <circle r={r} fill="#ffffff" stroke="#cbd5e1" strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={Math.cos(i * 1.3) * r * 0.55} cy={Math.sin(i * 1.3) * r * 0.55} r={r * 0.13} fill="#e2e8f0" />)}
          <text textAnchor="middle" y={r * 0.25} fontFamily={FONT} fontWeight={800} fontSize={r * 0.7} fill="#94a3b8">₹</text>
        </g>
        {Array.from({ length: bumps }, (_, i) => {
          const bt = t - i / 1.6;
          const bx = w * 0.08 + clamp((i / 1.6) / dur) * w * 0.82;
          return <text key={i} x={bx} y={groundY(bx) - 80 - easeOut(bt) * 120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44}
            fill={pal.danger} opacity={clamp(1 - bt / 1.6)}>{str(p.beat.params.tick, "+ interest")}</text>;
        })}
      </svg>
      <div style={{ position: "absolute", top: 70, left: 0, width: w, textAlign: "center" }}>
        <Chip text={str(p.beat.params.label)} k={pop(p, 0.3)} bg="#0f172a" fg="#ffffff" size={48} />
      </div>
    </AbsoluteFill>
  );
};

export const CalendarScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const t = sec(p);
  const pages = (p.beat.params.pages as string[]) ?? ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const loops = num(p.beat.params.loops, 1);
  const dur = p.beat.frames / p.fps;
  const flipEnd = Math.max(1.2, dur - 1.6);
  const total = pages.length * loops;
  const idx = Math.min(total - 1, Math.floor(Math.pow(clamp(t / flipEnd), 0.8) * total));
  const frac = (Math.pow(clamp(t / flipEnd), 0.8) * total) % 1;
  const page = pages[idx % pages.length]!;
  const next = pages[(idx + 1) % pages.length]!;
  const done = t > flipEnd;
  const fast = total / flipEnd > 6;           // more than six pages a second blurs into two names: cut instead
  const vertical = h > w;
  const cw = 520, ch = 560, cx = vertical ? w / 2 - cw / 2 : w * 0.3 - cw / 2, cy = vertical ? 170 : h / 2 - ch / 2 + 20;
  const tx = vertical ? 60 : w * 0.5, ty = vertical ? cy + ch + 50 : h * 0.36, tw = vertical ? w - 120 : w * 0.45;
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <div style={{ position: "absolute", left: cx, top: cy, width: cw, height: ch, perspective: 1200 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30, background: "#ffffff", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: cw, height: 120, borderRadius: "30px 30px 0 0", background: pal.danger }} />
        <div style={{ position: "absolute", top: 180, width: cw, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: "#0f172a" }}>{done || fast ? page : next}</div>
        {!done && !fast && (
          <div style={{ position: "absolute", left: 0, top: 120, width: cw, height: ch - 120, background: "#ffffff", borderRadius: "0 0 30px 30px",
            transformOrigin: "top center", transform: `rotateX(${-frac * 100}deg)`, backfaceVisibility: "hidden", opacity: 1 - frac * 0.5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ position: "absolute", top: 60, width: cw, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: "#0f172a", opacity: clamp(1 - frac * 1.8) }}>{page}</div>
          </div>
        )}
        {[0.25, 0.5, 0.75].map((f, i) => <div key={i} style={{ position: "absolute", left: cw * f - 12, top: -26, width: 24, height: 60, borderRadius: 12, background: "#334155" }} />)}
      </div>
      <Kinetic text={str(p.beat.params.label)} p={p} start={at(p, str(p.beat.params.labelAt) || undefined, flipEnd)} size={96} color={pal.accent} x={tx} y={ty} width={tw} align={vertical ? "center" : "left"} />
      <Kinetic text={str(p.beat.params.sub)} p={p} start={at(p, str(p.beat.params.subAt) || undefined, flipEnd + 0.4)} size={48} color={pal.text} weight={600} x={tx} y={ty + 130} width={tw} align={vertical ? "center" : "left"} />
    </AbsoluteFill>
  );
};

export const SplitScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as { left: { label: string; text: string; value?: number; at?: string }; right: { label: string; text: string; value?: number; at?: string } };
  const t = sec(p);
  const side = (s: typeof P.left, i: number) => {
    const start = at(p, s.at, 0.3 + i * 1.2);
    const k = pop(p, start, 12, 130);
    const color = i === 0 ? pal.cast[0]! : pal.danger;
    return (
      <div key={i} style={{ position: "absolute", borderRadius: 40,
        ...(h > w ? { left: 80, top: 150 + i * 470, width: w - 160, height: 420 } : { left: i === 0 ? 80 : w / 2 + 20, top: 160, width: w / 2 - 100, height: h - 320 }),
        background: `${color}22`, border: `5px solid ${color}`, opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 120}px)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: pal.text }}>{s.label}</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 130, color, letterSpacing: -3 }}>{s.value !== undefined ? counted(p, s.value, s.text, start, start + 1) : s.text}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      {side(P.left, 0)}{side(P.right, 1)}
    </AbsoluteFill>
  );
};

export const ChartScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as {
    series: { x: number[]; y: number[] }; series2?: { x: number[]; y: number[] }; ticks: { y: number[]; labels: string[] };
    xticks: { x: number[]; labels: string[] }; xLabel: string; label1: string; label2?: string;
    marks?: { x: number; text: string; at?: string }[]; drawFrom?: string; drawTo?: string;
  };
  const t = sec(p);
  const v = h > w, small = v ? 44 : 34;    // a Short: text at 44 px and up, plot above the captions
  const L = v ? 170 : 220, R = w - (v ? 90 : 260), T = v ? 300 : 170, B = v ? h * 0.5 : h - 170;
  const xmax = P.series.x[P.series.x.length - 1] ?? 1;
  const ymax = P.ticks.y[P.ticks.y.length - 1] ?? 1;
  const X = (x: number) => L + (R - L) * (x / xmax), Y = (y: number) => B - (B - T) * (y / ymax);
  const path = (s: { x: number[]; y: number[] }) => s.x.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(s.y[i]!).toFixed(1)}`).join(" ");
  const d1 = path(P.series), d2 = P.series2 ? path(P.series2) : null;
  const a = at(p, P.drawFrom, 0.5), b = at(p, P.drawTo, Math.max(a + 2, p.beat.frames / p.fps - 1));
  const prog = ease((t - a) / (b - a));
  const ev1 = evolvePath(prog, d1), ev2 = d2 ? evolvePath(prog, d2) : null;
  const headI = Math.min(P.series.x.length - 1, Math.floor(prog * (P.series.x.length - 1)));
  const grid = easeOut(t / 0.6);
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {P.ticks.y.map((v, i) => (
          <g key={i} opacity={grid}>
            <line x1={L} x2={L + (R - L) * grid} y1={Y(v)} y2={Y(v)} stroke={pal.grid} strokeWidth={2} />
            <text x={L - 18} y={Y(v) + 12} textAnchor="end" fontFamily={FONT} fontWeight={500} fontSize={small} fill={pal.muted}>{P.ticks.labels[i]}</text>
          </g>
        ))}
        {P.xticks.x.map((x, i) => <text key={i} x={X(x)} y={B + 52} textAnchor="middle" fontFamily={FONT} fontWeight={500} fontSize={small} fill={pal.muted} opacity={grid}>{P.xticks.labels[i]}</text>)}
        <text x={(L + R) / 2} y={B + 110} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={small} fill={pal.muted} opacity={grid}>{P.xLabel}</text>
        {d2 && ev2 && <path d={d2} fill="none" stroke={pal.accent} strokeWidth={10} strokeLinecap="round" strokeDasharray={ev2.strokeDasharray} strokeDashoffset={ev2.strokeDashoffset} style={{ filter: `drop-shadow(0 0 12px ${pal.accent})` }} />}
        <path d={d1} fill="none" stroke={pal.danger} strokeWidth={12} strokeLinecap="round" strokeDasharray={ev1.strokeDasharray} strokeDashoffset={ev1.strokeDashoffset} style={{ filter: `drop-shadow(0 0 14px ${pal.danger})` }} />
        {prog > 0 && <circle cx={X(P.series.x[headI]!)} cy={Y(P.series.y[headI]!)} r={18 + 4 * Math.sin(t * 8)} fill={pal.danger} />}
        {prog > 0 && d2 && P.series2 && <circle cx={X(P.series2.x[headI]!)} cy={Y(P.series2.y[headI]!)} r={16 + 4 * Math.sin(t * 8 + 1)} fill={pal.accent} />}
        {(P.marks ?? []).map((m, i) => {
          const k = pop(p, at(p, m.at, a + 1 + i));
          const mi = P.series.x.indexOf(m.x);
          const my = mi >= 0 ? Y(P.series.y[mi]!) : B;
          return (
            <g key={i} opacity={clamp(k * 2)}>
              <line x1={X(m.x)} x2={X(m.x)} y1={T} y2={B} stroke={pal.text} strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
              <circle cx={X(m.x)} cy={my} r={14 * k} fill={pal.text} />
            </g>
          );
        })}
      </svg>
      {(P.marks ?? []).map((m, i) => {
        const k = pop(p, at(p, m.at, a + 1 + i));
        return <div key={i} style={{ position: "absolute", left: X(m.x) + 24, top: T + 10 + i * 90, opacity: clamp(k * 2), transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: "left" }}>
          <Chip text={m.text} k={k} bg={pal.text} fg={pal.bg} size={v ? 44 : 36} />
        </div>;
      })}
      <div style={{ position: "absolute", right: 60, top: 60, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end", opacity: grid }}>
        <Chip text={P.label1} k={1} bg={pal.danger} fg="#ffffff" size={v ? 44 : 32} />
        {P.label2 && <Chip text={P.label2} k={1} bg={pal.accent} fg="#1b1b1b" size={v ? 44 : 32} />}
      </div>
    </AbsoluteFill>
  );
};

export const TowersScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const items = (p.beat.params.items as { label: string; text: string; value: number; at?: string; color?: string }[]) ?? [];
  const t = sec(p);
  const max = Math.max(1, ...items.map((i) => i.value));
  const base = h > w ? h - 420 : h - 200, top = 230;   // a Short keeps labels clear of the bottom UI
  const span = w - 300, bw = Math.min(300, span / items.length - 80);
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <Kinetic text={str(p.beat.params.title)} p={p} start={0.1} size={60} color={pal.text} y={70} />
      {items.map((it, i) => {
        const start = at(p, it.at, 0.4 + i * 0.8);
        const k = settle((t - start) / 0.9);
        const hh = Math.max(14, (base - top) * (it.value / max) * Math.min(1.04, k));
        const x = 150 + (span / items.length) * (i + 0.5) - bw / 2;
        const color = it.color === "danger" ? pal.danger : it.color === "good" ? pal.cast[0]! : pal.accent;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: base - hh, width: bw, height: hh, borderRadius: "24px 24px 6px 6px",
              background: `linear-gradient(180deg, ${color}, ${color}aa)`, opacity: t >= start ? 1 : 0, boxShadow: `0 0 40px ${color}55` }} />
            <div style={{ position: "absolute", left: x - 60, top: base - hh - 100, width: bw + 120, textAlign: "center", fontFamily: FONT, fontWeight: 800,
              fontSize: 64, color, opacity: clamp((t - start) / 0.3) }}>{it.value > 0 ? counted(p, it.value, it.text, start, start + 0.9) : it.text}</div>
            <div style={{ position: "absolute", left: x - 60, top: base + 20, width: bw + 120, textAlign: "center", fontFamily: FONT, fontWeight: 700,
              fontSize: h > w ? 46 : 40, color: pal.text, opacity: clamp((t - start) / 0.3) }}>{it.label}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * News: a headline, the published figure (a sourced fact, copied unchanged from the research feed)
 * and, always, where it comes from. The source line is drawn from the timeline, never from params,
 * so a news video cannot show a fact without it.
 */
export const HeadlineScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const v = h > w;
  const t = sec(p);
  const P = p.beat.params as { kicker?: string; title?: string; figure?: string; figureAt?: string; label?: string };
  const fig = pop(p, at(p, P.figureAt, 0.9), 10, 150);
  const x = v ? 70 : 140, width = v ? w - 140 : w * 0.62;
  return (
    <AbsoluteFill>
      <DataSet pal={pal} w={w} h={h} t={t} seed={p.beat.id} />
      <div style={{ position: "absolute", left: x, top: v ? 160 : 110 }}>
        <Chip text={str(P.kicker, "NEWS")} k={pop(p, 0.05)} bg={pal.danger} fg="#ffffff" size={v ? 48 : 40} />
      </div>
      <Kinetic text={str(P.title)} p={p} start={0.25} size={v ? 82 : 76} color={pal.text} x={x} y={v ? 290 : 220} width={width} align="left" />
      <div style={{ position: "absolute", left: x, top: v ? h * 0.36 : h * 0.5, width, fontFamily: FONT, fontWeight: 800,
        fontSize: v ? 170 : 160, color: pal.accent, letterSpacing: -4, opacity: clamp(fig * 2),
        transform: `scale(${0.7 + 0.3 * fig})`, transformOrigin: "left center", textShadow: `0 0 60px ${pal.accent}55` }}>{str(P.figure)}</div>
      <div style={{ position: "absolute", left: x, top: v ? h * 0.36 + 200 : h * 0.5 + 190, width, fontFamily: FONT, fontWeight: 700,
        fontSize: v ? 56 : 48, color: pal.text, opacity: clamp((t - 1.2) / 0.4) }}>{str(P.label)}</div>
      {p.tl.sources && (
        <div style={{ position: "absolute", left: x, top: v ? h * 0.62 : h - 120, fontFamily: FONT, fontWeight: 600,
          fontSize: v ? 44 : 34, color: pal.muted, opacity: clamp((t - 0.6) / 0.4) }}>{p.tl.sources}</div>
      )}
    </AbsoluteFill>
  );
};
