// Shared pieces for this video's beats: the look recipe, the clock helpers, the overlays over the 3D
// (honesty tag, a mono caption typing on, readout plates, the chapter card, a stamp) and the paper sheet
// the flat beats are drawn on (engineer's cross-section: white paper, black ink, blue water, red failure).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { HonestyTag as Tag3D } from "../../three/index";
import { DisasterLookProvider, HonestyTag as DTag, LookBackground, Texture, useDisasterLook } from "../../disaster/index";

export const RECIPE = "cross-section" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const RED = "#e0241b", BLUE = "#1f6fd1", INK = "#111111", PAPER = "#ffffff", AMBER = "#f2a33a", ICE = "#e8f4ff";
export const W = 1920, H = 1080;

export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
export const ramp = (t: number, at: number, len = 12) => sm((t - at) / len);
const typed = (s: string, t: number, at: number, cps = 1.4) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

/** Story frames → the 3D kit's own frames (its tempo-scaled clock). */
export function kitClock(p: SceneProps, now: number): (story: number) => number {
  const tempo = p.tl.tempo || 1;
  const base = now - p.frame / tempo;
  return (story: number) => base + story / tempo;
}

type Mom = { at: string; what?: string };
/** Every moment's word as a story frame (fallbacks spaced through the beat when an event is missing). */
export function moments(p: SceneProps, at: (name: string, fallback: number) => number, end: number): Record<string, number> {
  const ms = ((p.beat.params as { moments?: Mom[] }).moments ?? []);
  const out: Record<string, number> = {};
  ms.forEach((x, i) => { out[x.at] = at(x.at, Math.round(((i + 1) / (ms.length + 1)) * end)); });
  return out;
}

/** A figure from params.fig by name ("" when missing). */
export const figOf = (p: SceneProps, name?: string): string => (name ? ((p.beat.params as { fig?: Record<string, string> }).fig ?? {})[name] ?? "" : "");

/** A mono caption typing on (over the 3D: dark chip, light text). */
export const MonoCaption: React.FC<{ t: number; at: number; text: string; top?: number; left?: number; size?: number; color?: string }> = ({ t, at, text, top = 104, left = 150, size = 34, color = "#ffffff" }) => {
  const s = typed(text, t, at, 1.6);
  if (!s) return null;
  return (
    <div style={{ position: "absolute", left, top, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.1, color,
      background: "rgba(4,12,22,0.82)", padding: "6px 16px", borderRadius: 4, whiteSpace: "nowrap" }}>
      {s}<span style={{ opacity: Math.floor(t / 8) % 2 ? 1 : 0 }}>▌</span>
    </div>
  );
};

/** The overlay over every 3D beat: the honesty tag, then the beat's own chips. */
export const Overlay: React.FC<{ children?: React.ReactNode; text?: string }> = ({ children, text }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Tag3D kind="reconstruction" text={text} at={-20} top={40} left={150} size={32} />
    {children}
  </AbsoluteFill>
);

/** A readout plate: a mono label and a big value (counts up with `k`). */
export const Readout: React.FC<{ x: number; y: number; label: string; value: string; k: number; color?: string; size?: number; dark?: boolean }> = ({ x, y, label, value, k, color = RED, size = 84, dark = true }) => {
  if (k <= 0) return null;
  const o = Math.min(1, k * 2);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, background: dark ? "rgba(4,12,22,0.86)" : "rgba(255,255,255,0.94)",
      border: `3px solid ${color}`, borderRadius: 8, padding: "10px 24px", maxWidth: 760 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: dark ? ICE : INK }}>{label}</div>
      <div style={{ fontFamily: ANTON, fontSize: size, color, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
};

/** A chapter card: the chapter's name types on, top-left under the tag. */
export const ChapterCard: React.FC<{ t: number; text: string; dark?: boolean }> = ({ t, text, dark = true }) => {
  const o = t < 80 ? 1 : Math.max(0, 1 - (t - 80) / 12);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 150, top: 100, opacity: o, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 10, height: 56, background: RED }} />
      <div style={{ fontFamily: ANTON, fontSize: 54, letterSpacing: 3, color: dark ? "#ffffff" : INK, background: dark ? "rgba(4,12,22,0.75)" : "rgba(255,255,255,0.9)", padding: "2px 18px" }}>
        {text.slice(0, Math.max(0, Math.floor(t * 1.2)))}
      </div>
    </div>
  );
};

/** A rubber stamp over the frame (HTML), landing with a squash at `at`. */
export const StampHtml: React.FC<{ t: number; at: number; text: string; x: number; y: number; size?: number; color?: string; rot?: number }> = ({ t, at, text, x, y, size = 64, color = RED, rot = -7 }) => {
  if (t < at) return null;
  const k = sm((t - at) / 6);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * k})`, opacity: k, border: `6px solid ${color}`, color,
      fontFamily: ANTON, fontSize: size, padding: "0 20px", letterSpacing: 4, background: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>{text}</div>
  );
};

/** The paper sheet: the look's background, a faint grid, the camera (zoom ≤ 1.3 about cx, cy), texture on top. */
export const Sheet: React.FC<{ t: number; zoom?: number; cx?: number; cy?: number; children: React.ReactNode; html?: React.ReactNode }> = ({ t, zoom = 1, cx = W / 2, cy = H / 2, children, html }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="tg-grid" width={96} height={96} patternUnits="userSpaceOnUse"><rect x={0} y={0} width={96} height={5} fill="#cddae6" /><rect x={0} y={0} width={5} height={96} fill="#cddae6" /></pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#tg-grid)" />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>{children}</g>
      </svg>
      {html}
      <Texture t={t} />
    </AbsoluteFill>
  </DisasterLookProvider>
);

/** The drafting grid alone (for pieces drawn outside the Sheet). */
export const GridBg: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs><pattern id="tg-grid2" width={96} height={96} patternUnits="userSpaceOnUse"><rect x={0} y={0} width={96} height={5} fill="#cddae6" /><rect x={0} y={0} width={5} height={96} fill="#cddae6" /></pattern></defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#tg-grid2)" />
  </svg>
);

/** A line that draws on (k 0→1). */
export const DrawLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string; w?: number; dash?: string }> = ({ x1, y1, x2, y2, k, color = INK, w = 4, dash }) =>
  k <= 0 ? null : <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * clamp(k)} y2={y1 + (y2 - y1) * clamp(k)} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />;

/** Mono text that types on in SVG. */
export const TypeText: React.FC<{ x: number; y: number; t: number; at: number; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; font?: string; cps?: number; weight?: number }> = ({ x, y, t, at, text, size = 40, color = INK, anchor = "start", font = MONO, cps = 1.6, weight = 700 }) => {
  const s = typed(text, t, at, cps);
  if (!s) return null;
  return <text x={x} y={y} fontFamily={font} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={font === MONO ? size * 0.06 : 0}>{s}</text>;
};

/** A stamp in SVG. */
export const Stamp: React.FC<{ x: number; y: number; t: number; at: number; text: string; color?: string; size?: number; rot?: number }> = ({ x, y, t, at, text, color = RED, size = 64, rot = -8 }) => {
  if (t < at) return null;
  const k = sm((t - at) / 6);
  const w = text.length * size * 0.58 + size * 0.8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1.8 - 0.8 * k})`} opacity={k * 0.95}>
      <rect x={-w / 2} y={-size * 0.78} width={w} height={size * 1.4} rx={10} fill="rgba(255,255,255,0.8)" stroke={color} strokeWidth={7} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily={ANTON} fontSize={size} letterSpacing={size * 0.06} fill={color}>{text}</text>
    </g>
  );
};

/** A small standing person, flat (head, body, legs), for crews and figures on the drawings. */
export const Person: React.FC<{ x: number; y: number; s?: number; color?: string; k?: number; sit?: boolean; arm?: number }> = ({ x, y, s = 1, color = INK, k = 1, sit = false, arm = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
      <circle cx={0} cy={-92} r={15} fill={color} />
      <rect x={-15} y={-74} width={30} height={sit ? 38 : 48} rx={10} fill={color} />
      {!sit && <rect x={-13} y={-28} width={10} height={28} rx={4} fill={color} />}
      {!sit && <rect x={3} y={-28} width={10} height={28} rx={4} fill={color} />}
      {sit && <rect x={-13} y={-38} width={40} height={10} rx={4} fill={color} />}
      <rect x={10} y={-70} width={8} height={34} rx={4} fill={color} transform={`rotate(${-arm} 14 -70)`} />
    </g>
  );
};

/** The disaster look in the flat beats (tokens). */
export const useLook = () => useDisasterLook();
export default Overlay;

/** The kit's honesty tag, moved right of the channel badge in the top-left corner. */
export const FlatTag: React.FC<React.ComponentProps<typeof DTag>> = (props) => (
  <div style={{ position: "absolute", inset: 0, transform: "translateX(96px)", pointerEvents: "none" }}><DTag {...props} /></div>
);
