/**
 * Documentary devices for long videos (owner, 2026-10-26: "engaging dynamic animation; in a long
 * video it matters more", after The Curious Plot's long videos: a framework of 5 doors the story
 * keeps returning to, words that edit themselves, a journey drawn on a map, stat dashboards that
 * count up, case-study cards). Every one takes its content from the script and draws the video's
 * own props (videos/<id>/props.tsx): the verbs are code, the things and words are the story's, so
 * no two videos look alike. Each reveal fires on an event (a spoken word).
 *
 *   framework  the promise as a picture that keeps coming back: the video's things in a row, an arc
 *              or rising steps; the current chapter's one opens up, earlier ones are ticked
 *              { items: [{prop, label}], open: n, layout: row|arc|steps, title?, at?, bg? }
 *   type       words that edit themselves: lines type in on their words, get struck out, replaced
 *              { lines: [{text, at?, size?: huge|big|small, color?, strike?: event, replace?: {text, at}}], kicker?, bg? }
 *   journey    a path drawn across the screen, a stop at a time, the story's thing travelling along it
 *              { stops: [{name, note?, at}], traveller?: prop, bg? }
 *   stats      a dashboard of figures counting up, each on its word
 *              { title?, kicker?, cards: [{label, value: @x.y, text: "{x_y}", at, color?}], bg? }
 *   case       a case-study card: the thing or the person in a circle, a kicker, a big name, one line
 *              { kicker?, name, line?, prop? | who?, at?, lineAt?, side?: left|right, bg? }
 * bg: a colour name (sand, sky, mint, plum, night, coral, cream, slate): one per chapter, so the
 * viewer always knows where they are.
 */
import React from "react";
import { random, spring } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { at, clamp, type SceneProps, sec } from "../scenes/kit";
import { FONT } from "../design/fonts";
import { countUp } from "../fmt/inr";
import { INK, type PropSet, shade } from "./draw";
import { SHARED_PROPS } from "./build";
import { VIDEOS } from "../videos/hooks";

export const DOCU_BG: Record<string, [string, string]> = {
  sand: ["#f7d9a0", "#eab866"], sky: ["#bfe3f2", "#86c3df"], mint: ["#c9eedb", "#8fd3b0"], plum: ["#3b2a6b", "#241845"],
  night: ["#1b2347", "#0f1430"], coral: ["#ffc2a8", "#f2876a"], cream: ["#fbf3e2", "#f0dfbb"], slate: ["#3d4a63", "#262f42"],
};
const ACCENT: Record<string, string> = { gold: "#ffd23f", white: "#ffffff", red: "#e5484d", green: "#2fb37a", ink: INK, blue: "#3d7bf5" };
const dark = (bg: string) => bg === "plum" || bg === "night" || bg === "slate";

const sp = (p: SceneProps, start: number, damping = 13) =>
  sec(p) < start ? 0 : spring({ frame: (sec(p) - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
const propsOf = (p: SceneProps): PropSet => ({ ...SHARED_PROPS, ...(VIDEOS[p.tl.id]?.props ?? {}) });

const Backdrop: React.FC<{ p: SceneProps; bg?: string; rays?: [number, number]; children?: React.ReactNode }> = ({ p, bg = "sand", rays, children }) => {
  const [a, b] = DOCU_BG[bg] ?? DOCU_BG.sand!;
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(circle at 50% 40%, ${a}, ${b})` }}>
      {/* soft drifting shapes so the field is never flat */}
      <svg width={w} height={h} style={{ position: "absolute", opacity: 0.18 }}>
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={(random(`${p.beat.id}c${i}`) * w + t * (8 + i * 5)) % (w + 200) - 100} cy={random(`${p.beat.id}y${i}`) * h}
            r={h * (0.12 + random(`${p.beat.id}r${i}`) * 0.18)} fill={dark(bg) ? "#ffffff" : shade(b, -0.25)} />
        ))}
      </svg>
      {/* slow-turning rays behind the subject (a case's portrait, a dashboard) */}
      {rays && <svg width={w} height={h} style={{ position: "absolute" }}>
        {Array.from({ length: 18 }, (_, i) => {
          const a0 = (i / 18) * Math.PI * 2 + t * 0.08, a1 = a0 + Math.PI / 36, R = Math.max(w, h);
          return <path key={i} d={`M${rays[0]},${rays[1]} L${rays[0] + Math.cos(a0) * R},${rays[1] + Math.sin(a0) * R} L${rays[0] + Math.cos(a1) * R},${rays[1] + Math.sin(a1) * R} Z`}
            fill={dark(bg) ? "#ffffff" : "#ffffff"} opacity={dark(bg) ? 0.06 : 0.28} />;
        })}
      </svg>}
      {/* a horizon in the chapter's colour and a light dot texture: flat fields read as empty */}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs><pattern id={`dots${p.beat.id}`} width={36} height={36} patternUnits="userSpaceOnUse"><circle cx={4} cy={4} r={2.4} fill={dark(bg) ? "#ffffff" : shade(b, -0.35)} opacity={0.22} /></pattern></defs>
        {/* wide diagonal light bands: the field reads as lit space, never as a flat card */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={`band${i}`} x={-w * 0.5 + i * w * 0.24} y={-h * 0.2} width={w * 0.1} height={h * 1.6} fill={dark(bg) ? "#ffffff" : "#ffffff"}
            opacity={dark(bg) ? 0.05 : 0.16} transform={`rotate(24 ${w / 2} ${h / 2})`} />
        ))}
        <rect width={w} height={h} fill={`url(#dots${p.beat.id})`} />
        {/* two layers of horizon: far blocks, then nearer, darker ones */}
        {[0, 1].map((layer) => Array.from({ length: layer ? 11 : 18 }, (_, i) => {
          const n = layer ? 11 : 18;
          const bw = w / n * (0.75 + random(`${p.beat.id}bw${layer}${i}`) * 0.6);
          const bh = h * (layer ? 0.1 + random(`${p.beat.id}bh${layer}${i}`) * 0.16 : 0.16 + random(`${p.beat.id}bh${layer}${i}`) * 0.24);
          return <rect key={`h${layer}-${i}`} x={(w / n) * i} y={h - bh} width={bw} height={bh} rx={8}
            fill={shade(b, dark(bg) ? (layer ? 0.2 : 0.1) : (layer ? -0.3 : -0.16))} opacity={0.85} />;
        }))}
      </svg>
      {children}
    </div>
  );
};

const Kicker: React.FC<{ text: string; k: number; bg?: string; size: number }> = ({ text, k, bg = "sand", size }) => (
  <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: 3, textTransform: "uppercase",
    color: dark(bg) ? INK : "#fff", background: dark(bg) ? "#ffd23f" : INK, padding: `${size * 0.2}px ${size * 0.8}px`, borderRadius: 999,
    opacity: clamp(k * 2), transform: `scale(${0.7 + 0.3 * k})` }}>{text}</span>
);

// ---------------- framework ----------------
interface FwItem { prop?: string; label?: string; at?: string }
export const FrameworkScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as { items?: FwItem[]; open?: number; layout?: string; title?: string; at?: string; bg?: string };
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const props = propsOf(p);
  const items = (P.items ?? []).slice(0, 7);
  const n = Math.max(1, items.length), open = P.open ?? 0;
  const kOpen = sp(p, at(p, P.at, 0.6), 10);
  const layout = P.layout ?? "row";
  const pos = (i: number): [number, number] => {
    const f = n === 1 ? 0.5 : i / (n - 1);
    if (layout === "arc") return [w * (0.17 + 0.66 * f), h * (0.74 - Math.sin(f * Math.PI) * 0.2)];
    if (layout === "steps") return [w * (0.17 + 0.66 * f), h * (0.86 - 0.36 * f)];
    return [w * (0.16 + 0.68 * f), h * (v ? 0.6 : 0.7)];
  };
  // the camera leans toward the opening item
  const [fx, fy] = open ? pos(open - 1) : [w / 2, h / 2];
  const zoom = 1 + 0.06 * kOpen, tx = (w / 2 - fx) * 0.1 * kOpen, ty = (h / 2 - fy) * 0.08 * kOpen;
  const tile = Math.min(w * 0.66 / n, h * 0.3);
  return (
    <Backdrop p={p} bg={P.bg}>
      {P.title && <div style={{ position: "absolute", top: v ? 170 : 50, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900,
        fontSize: v ? 70 : 64, color: dark(P.bg ?? "sand") ? "#fff" : INK, textTransform: "uppercase", opacity: clamp(t / 0.4) }}>{P.title}</div>}
      <svg width={w} height={h} style={{ position: "absolute", transform: `translate(${tx}px, ${ty}px) scale(${zoom})`, transformOrigin: `${fx}px ${fy}px` }}>
        {layout === "steps" && <path d={items.map((_, i) => `${i ? "L" : "M"}${pos(i)[0]},${pos(i)[1]}`).join(" ")} stroke={INK} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.4} />}
        {items.map((it, i) => {
          const [x, y] = pos(i);
          const appear0 = it.at ? sp(p, at(p, it.at, 0), 11) : clamp((t * 3 - i * 0.35));   // on its word, or in sequence
          const appear = Math.max(0.25, appear0);   // a faint outline waits for its word: the whole promise is in the frame from the start
          const isOpen = i + 1 === open, done = i + 1 < open;
          const s = tile * (isOpen ? 0.78 + 0.28 * kOpen : 0.7);
          const P_ = it.prop ? props[it.prop] : undefined;
          return (
            <g key={i} opacity={appear * (open && !isOpen && !done ? 0.45 : 1)} transform={`translate(${x},${y + (1 - appear0) * 20})`}>
              <rect x={-tile * 0.48} y={-tile * 1.02} width={tile * 0.96} height={tile * 1.06} rx={tile * 0.1}
                fill={isOpen ? "#fff" : "rgba(255,255,255,0.55)"} stroke={isOpen ? "#ffd23f" : INK} strokeWidth={isOpen ? 10 : 5} />
              {isOpen && <circle cx={0} cy={-tile * 0.5} r={tile * 0.7} fill="#ffd23f" opacity={0.25 * kOpen} />}
              {P_ && appear0 > 0.05 && <g transform={`translate(0,${-tile * 0.12}) scale(${appear0})`}><P_ s={s * 0.8} t={t} /></g>}
              <circle cx={-tile * 0.36} cy={-tile * 0.9} r={tile * 0.1} fill={done ? "#2fb37a" : isOpen ? "#ffd23f" : INK} />
              <text x={-tile * 0.36} y={-tile * 0.86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={tile * 0.12} fill={done || isOpen ? INK : "#fff"}>
                {done ? "✓" : String(i + 1)}</text>
              {it.label && <text data-probe="skip" x={0} y={tile * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.max(30, tile * 0.13)}
                fill={dark(P.bg ?? "sand") ? "#fff" : INK}>{it.label}</text>}
            </g>
          );
        })}
      </svg>
    </Backdrop>
  );
};

// ---------------- type ----------------
interface TLine { text: string; at?: string; size?: string; color?: string; strike?: string; replace?: { text: string; at?: string } }
export const TypeScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as { lines?: TLine[]; kicker?: string; bg?: string; prop?: string };
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const bg = P.bg ?? "sand";
  const Behind = P.prop ? propsOf(p)[P.prop] : undefined;
  const base = dark(bg) ? "#fff" : INK;
  const sizes: Record<string, number> = { huge: v ? 150 : 140, big: v ? 100 : 92, small: v ? 56 : 48 };
  const typed = (text: string, start: number) => text.slice(0, Math.max(0, Math.floor((t - start) / 0.035)));
  return (
    <Backdrop p={p} bg={bg}>
      {Behind && <svg width={w} height={h} style={{ position: "absolute", opacity: 0.22 }}>
        <g transform={`translate(${w * 0.5},${h * 0.92}) scale(${1 + 0.02 * t})`}><Behind s={h * 0.8} t={t} /></g></svg>}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: v ? 26 : 18, padding: "0 70px" }}>
        {P.kicker && <Kicker text={P.kicker} k={clamp(t / 0.3)} bg={bg} size={v ? 40 : 30} />}
        {(P.lines ?? []).map((l, i) => {
          const start = at(p, l.at, i * 0.6);
          if (t < start) return <div key={i} style={{ height: sizes[l.size ?? "big"] }} />;
          const strikeAt = l.strike ? at(p, l.strike, 999) : 999;
          const ks = clamp((t - strikeAt) / 0.35);
          const rep = l.replace ? at(p, l.replace.at, 999) : 999;
          const fs = sizes[l.size ?? "big"] ?? sizes.big!;
          return (
            <div key={i} style={{ position: "relative", textAlign: "center" }}>
              <span style={{ position: "relative", display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: fs, lineHeight: 1.05,
                textTransform: "uppercase", color: ks > 0 ? shade(base === "#fff" ? "#ffffff" : INK, base === "#fff" ? -0.4 : 0.5) : ACCENT[l.color ?? ""] ?? base,
                opacity: ks > 0 ? 0.55 : 1 }}>
                {typed(l.text, start)}
                {ks > 0 && <span style={{ position: "absolute", left: -10, top: "52%", height: fs * 0.12, width: `calc(${ks * 100}% + 20px)`, background: "#e5484d",
                  borderRadius: 99, transform: "rotate(-3deg)" }} />}
              </span>
              {l.replace && t >= rep && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fs, lineHeight: 1.05, textTransform: "uppercase",
                color: ACCENT[l.color ?? "gold"] ?? "#ffd23f", WebkitTextStroke: dark(bg) ? undefined : `${fs * 0.05}px ${INK}`, paintOrder: "stroke fill" }}>
                {typed(l.replace.text, rep)}</div>}
            </div>
          );
        })}
      </div>
    </Backdrop>
  );
};

// ---------------- journey ----------------
interface Stop { name: string; note?: string; at?: string }
export const JourneyScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as { stops?: Stop[]; traveller?: string; bg?: string; marks?: { at?: string }[] };
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const props = propsOf(p);
  const stops = (P.stops ?? []).slice(0, 6);
  const n = Math.max(2, stops.length);
  // a winding path, seeded by the beat: every journey takes its own road
  const pts = stops.map((_, i) => {
    const f = i / (n - 1);
    return [w * (0.14 + 0.72 * f), h * (0.56 + 0.14 * Math.sin(f * Math.PI * 1.3 + random(`${p.beat.id}j`) * 3))] as [number, number];
  });
  const times = stops.map((s, i) => at(p, s.at, 0.4 + i * 1.2));
  let reached = 0, along = 0;
  for (let i = 0; i < times.length; i++) if (t >= times[i]!) reached = i;
  if (reached < times.length - 1) along = clamp((t - times[reached]!) / Math.max(0.4, times[reached + 1]! - times[reached]!));
  const leg = (i: number) => clamp((t - times[i]!) / Math.max(0.4, (times[i + 1] ?? times[i]! + 1) - times[i]!));
  const Trav = P.traveller ? props[P.traveller] : undefined;
  const a = pts[reached] ?? [w / 2, h / 2], b = pts[Math.min(reached + 1, pts.length - 1)] ?? a;
  const tx = a[0] + (b[0] - a[0]) * along, ty = a[1] + (b[1] - a[1]) * along;
  const bg = P.bg ?? "sky";
  return (
    <Backdrop p={p} bg={bg}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* land: soft seeded hills under the road */}
        <path d={`M0,${h * 0.62} Q${w * 0.25},${h * (0.5 + random(`${p.beat.id}l`) * 0.1)} ${w * 0.5},${h * 0.6} T${w},${h * 0.56} L${w},${h} L0,${h} Z`}
          fill={dark(bg) ? "#2a3463" : "rgba(255,255,255,0.35)"} />
        {pts.slice(0, -1).map((p0, i) => {
          const p1 = pts[i + 1]!, k = leg(i);
          if (t < times[i]!) return null;
          return <line key={i} x1={p0[0]} y1={p0[1]} x2={p0[0] + (p1[0] - p0[0]) * k} y2={p0[1] + (p1[1] - p0[1]) * k}
            stroke="#e5484d" strokeWidth={8} strokeDasharray="18 12" strokeLinecap="round" />;
        })}
        {stops.map((s, i) => {
          const k = sp(p, times[i]!, 9);
          if (k <= 0) return null;
          const [x, y] = pts[i]!;
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${k})`}>
              <path d="M0,0 C-24,-30 -24,-58 0,-62 C24,-58 24,-30 0,0 Z" fill="#e5484d" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={-40} r={9} fill="#fff" />
              <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={v ? 50 : 44} fill={dark(bg) ? "#fff" : INK}>{s.name}</text>
              {s.note && <text x={0} y={v ? 92 : 84} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={v ? 44 : 34} fill={dark(bg) ? "#ffd23f" : shade(INK, 0.25)}>{s.note}</text>}
            </g>
          );
        })}
        {Trav && (() => {
          // a hop on each marked word ("shiny", "car"): the thing reacts to what is said about it
          const hop = Math.max(0, ...(P.marks ?? []).map((m) => { const d = t - at(p, m.at, 999); return d >= 0 && d < 0.5 ? Math.sin((d / 0.5) * Math.PI) : 0; }));
          return <g transform={`translate(${tx},${ty - 8 - hop * h * 0.06}) rotate(${hop * -8})`}><Trav s={h * 0.12} t={t} /></g>;
        })()}
      </svg>
    </Backdrop>
  );
};

// ---------------- stats ----------------
interface Card { label: string; value?: number; text: string; at?: string; color?: string }
export const StatsScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as { title?: string; kicker?: string; cards?: Card[]; bg?: string; prop?: string; at?: string };
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const bg = P.bg ?? "cream";
  const cards = (P.cards ?? []).slice(0, 4);
  const Thing = P.prop ? propsOf(p)[P.prop] : undefined;
  const flash = P.at ? Math.max(0, 1 - Math.abs(t - at(p, P.at, 999)) / 0.4) : 0;   // the title flashes on its word
  return (
    <Backdrop p={p} bg={bg} rays={[w / 2, h * 0.45]}>
      {Thing && <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${v ? w * 0.5 : w * 0.14},${v ? h * 0.97 : h * 0.86}) scale(${0.9 + 0.1 * sp(p, 0, 10)})`}><Thing s={h * (v ? 0.2 : 0.3)} t={t} /></g></svg>}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: v ? 40 : 34 }}>
        {P.kicker && <Kicker text={P.kicker} k={clamp(t / 0.3)} bg={bg} size={v ? 40 : 30} />}
        {P.title && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: v ? 76 : 70, textTransform: "uppercase", textAlign: "center", padding: "0 50px",
          color: P.at && t >= at(p, P.at, 999) ? "#e5484d" : dark(bg) ? "#fff" : INK, transform: `scale(${1 + 0.08 * flash})` }}>{P.title}</div>}
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", gap: v ? 26 : 30 }}>
          {cards.map((c, i) => {
            const start = at(p, c.at, 0.3 + i * 0.7);
            const k = Math.max(0.35, sp(p, start, 11));   // the card waits, empty, for its figure
            const shown = c.value !== undefined && t < start + 1 ? countUp(c.value, clamp((t - start) / 1), c.text, "inr", p.tl.currency) : c.text;
            return (
              <div key={i} style={{ minWidth: v ? w * 0.7 : w * 0.17, background: "#fff", border: `6px solid ${INK}`, borderRadius: 26, padding: v ? "22px 34px" : "18px 30px",
                textAlign: "center", boxShadow: "0 12px 0 rgba(0,0,0,0.25)", opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * k})` }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: v ? 44 : 34, color: shade(INK, 0.25), textTransform: "uppercase", letterSpacing: 2 }}>{c.label}</div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: v ? 104 : 88, color: ACCENT[c.color ?? "blue"] ?? "#3d7bf5", lineHeight: 1.05 }}>{t >= start ? shown : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Backdrop>
  );
};

// ---------------- case ----------------
export const CaseScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as { kicker?: string; name: string; line?: string; prop?: string; who?: string; pose?: string; expression?: string; at?: string; lineAt?: string; side?: string; bg?: string };
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const props = propsOf(p);
  const bg = P.bg ?? "mint";
  const kName = sp(p, at(p, P.at, 0.3), 11), kLine = sp(p, at(p, P.lineAt, 1.2), 12), kPic = sp(p, 0, 12);
  const right = P.side === "right";
  const cx = v ? w * 0.5 : right ? w * 0.72 : w * 0.27, cy = v ? h * 0.36 : h * 0.5, r = v ? w * 0.34 : h * 0.38;
  const Prop = P.prop ? props[P.prop] : undefined;
  const m = P.who ? CAST[P.who] : undefined;
  return (
    <Backdrop p={p} bg={bg} rays={[cx, cy]}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs><clipPath id={`cc${p.beat.id}`}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
        <circle cx={cx} cy={cy} r={r * kPic} fill={dark(bg) ? "#2a3463" : "rgba(255,255,255,0.7)"} stroke={INK} strokeWidth={6} />
        <g clipPath={`url(#cc${p.beat.id})`} transform={`translate(0,${(1 - kPic) * 60})`}>
          {Prop && <g transform={`translate(${cx},${cy + r * 0.55})`}><Prop s={r * 1.1} t={t} /></g>}
          {m && <Character id={`case${p.beat.id}`} look={m.look} pose={POSES[(P.pose ?? "present") as PoseName] ?? POSES.present}
            expression={(P.expression ?? "happy") as Expression} x={cx} y={cy + r * 1.9} scale={r / 260} shadow={false} />}
        </g>
      </svg>
      <div style={{ position: "absolute", left: v ? 60 : right ? 70 : w * 0.52, right: v ? 60 : right ? w * 0.5 : 70, top: v ? h * 0.6 : h * 0.3, textAlign: v ? "center" : "left" }}>
        {P.kicker && <Kicker text={P.kicker} k={kName} bg={bg} size={v ? 38 : 30} />}
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: v ? 120 : 110, lineHeight: 1.05, color: dark(bg) ? "#fff" : INK, textTransform: "uppercase",
          opacity: clamp(kName * 2), transform: `translateX(${(1 - kName) * (right ? -60 : 60)}px)`, marginTop: 14 }}>{P.name}</div>
        {P.line && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: v ? 52 : 46, color: dark(bg) ? "#ffd23f" : shade(INK, 0.2), opacity: clamp(kLine * 2), marginTop: 12 }}>{P.line}</div>}
      </div>
    </Backdrop>
  );
};
