// Shared pieces for the Titan promo Short (Instrument Panel look: black glass, phosphor-green lines, amber labels,
// red only for the failure). The flat beats are drawn as screens on the support ship's instrument wall; the 3D
// beats get the same mono chips over them. Portrait frame 1080×1920: everything that must be read stays above
// y = 1340 (captions and YouTube's buttons below) and left of x = 920.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { DisasterLookProvider, HonestyTag, LookBackground, Texture } from "../../disaster/index";

export const RECIPE = "instrument-panel" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const GREEN = "#39ff9a", AMBER = "#ffb000", RED = "#ff3b30", ICE = "#d9ffe8", DIM = "#1b4a34", GLASS = "#04100a";
export const W = 1080, H = 1920;

export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };
export const ramp = (t: number, at: number, len = 12) => sm((t - at) / len);
const typed = (s: string, t: number, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

type Mom = { at: string };
/** Every moment's word as a story frame (fallbacks spaced through the beat when an event is missing). */
export function moments(p: SceneProps, at: (name: string, fallback: number) => number, end: number): Record<string, number> {
  const ms = ((p.beat.params as { moments?: Mom[] }).moments ?? []);
  const out: Record<string, number> = {};
  ms.forEach((x, i) => { out[x.at] = at(x.at, Math.round(((i + 1) / (ms.length + 1)) * end)); });
  return out;
}

/** A figure from params.fig by name ("" when missing). */
export const figOf = (p: SceneProps, name: string): string => ((p.beat.params as { fig?: Record<string, string> }).fig ?? {})[name] ?? "";

/** A mono chip typing on (dark glass, phosphor text). */
export const Chip: React.FC<{ t: number; at: number; text: string; top: number; left?: number; size?: number; color?: string; border?: string }> = ({ t, at, text, top, left = 70, size = 48, color = ICE, border = GREEN }) => {
  const s = typed(text, t, at, 1.8);
  if (!s) return null;
  return (
    <div style={{ position: "absolute", left, top, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.06, color,
      background: "rgba(2,10,6,0.86)", border: `3px solid ${border}`, padding: "6px 18px", borderRadius: 6, whiteSpace: "nowrap" }}>
      {s}<span style={{ opacity: Math.floor(t / 8) % 2 ? 1 : 0 }}>▌</span>
    </div>
  );
};

/** A readout plate: a mono label and a big value. */
export const Readout: React.FC<{ x: number; y: number; label: string; value: string; k: number; color?: string; size?: number }> = ({ x, y, label, value, k, color = AMBER, size = 96 }) => {
  if (k <= 0) return null;
  const o = Math.min(1, k * 2);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, background: "rgba(2,10,6,0.88)",
      border: `3px solid ${color}`, borderRadius: 8, padding: "8px 26px" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3, color: ICE }}>{label}</div>
      <div style={{ fontFamily: ANTON, fontSize: size, color, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
};

/** The sub's text bubble (the message as reported, on screen, never in the voice). */
export const Bubble: React.FC<{ t: number; at: number; who: string; text: string; x: number; y: number; grey?: boolean; tick?: number; dead?: number }> = ({ t, at, who, text, x, y, grey = false, tick = 1e9, dead = 1e9 }) => {
  if (t < at) return null;
  const k = sm((t - at) / 8);
  const col = grey ? "#6f8a7c" : GREEN;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, background: "rgba(2,14,8,0.9)", border: `4px solid ${col}`, borderRadius: 18, padding: "12px 24px", whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: AMBER, letterSpacing: 3 }}>{who}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, color: grey ? "#9fb5a8" : ICE }}>{typed(text, t, at, 2.2)}</div>
      {t >= tick && <div style={{ fontFamily: ANTON, fontSize: 54, color: GREEN, transform: `scale(${1.6 - 0.6 * sm((t - tick) / 6)})`, transformOrigin: "left" }}>✓ ROUTINE</div>}
      {t >= dead && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 48, color: RED }}>NO REPLY <span style={{ opacity: Math.floor(t / 7) % 2 ? 1 : 0 }}>▌</span></div>}
    </div>
  );
};

/** A rubber stamp (HTML) landing with a squash at `at`. */
export const StampHtml: React.FC<{ t: number; at: number; text: string; x: number; y: number; size?: number; color?: string; rot?: number }> = ({ t, at, text, x, y, size = 72, color = RED, rot = -7 }) => {
  if (t < at) return null;
  const k = sm((t - at) / 6);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * k})`, opacity: k, border: `6px solid ${color}`, color,
      fontFamily: ANTON, fontSize: size, padding: "0 20px", letterSpacing: 4, background: "rgba(2,10,6,0.85)", whiteSpace: "nowrap" }}>{text}</div>
  );
};

/** Mono text that types on in SVG. */
export const TypeText: React.FC<{ x: number; y: number; t: number; at: number; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; cps?: number }> = ({ x, y, t, at, text, size = 48, color = ICE, anchor = "start", cps = 1.8 }) => {
  const s = typed(text, t, at, cps);
  if (!s) return null;
  return <text x={x} y={y} fontFamily={MONO} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={size * 0.05}>{s}</text>;
};

/** A small standing or seated person, flat. */
export const Person: React.FC<{ x: number; y: number; s?: number; color?: string; sit?: boolean; arm?: number; lean?: number }> = ({ x, y, s = 1, color = GREEN, sit = false, arm = 0, lean = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean} 0 -40)`}>
    <circle cx={0} cy={-92} r={15} fill={color} />
    <rect x={-15} y={-74} width={30} height={sit ? 38 : 48} rx={10} fill={color} />
    {!sit && <rect x={-13} y={-28} width={10} height={28} rx={4} fill={color} />}
    {!sit && <rect x={3} y={-28} width={10} height={28} rx={4} fill={color} />}
    {sit && <rect x={-13} y={-38} width={40} height={10} rx={4} fill={color} />}
    <rect x={10} y={-70} width={8} height={34} rx={4} fill={color} transform={`rotate(${-arm} 14 -70)`} />
  </g>
);

/** The instrument screen: the look's black glass, a phosphor grid, the camera (zoom ≤ 1.3 about cx, cy), scanlines on top. */
export const Screen: React.FC<{ t: number; zoom?: number; cx?: number; cy?: number; children: React.ReactNode; html?: React.ReactNode; tag?: string; tagSub?: string }> = ({ t, zoom = 1, cx = W / 2, cy = H / 2, children, html, tag = "principle", tagSub }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="ip-grid" width={90} height={90} patternUnits="userSpaceOnUse"><rect x={0} y={0} width={90} height={2} fill="#0f2a1c" /><rect x={0} y={0} width={2} height={90} fill="#0f2a1c" /></pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#ip-grid)" />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>{children}</g>
      </svg>
      {html}
      <Texture t={t} />
      <HonestyTag t={t} tag={tag} at={0} sub={tagSub} />
    </AbsoluteFill>
  </DisasterLookProvider>
);
export default Screen;
