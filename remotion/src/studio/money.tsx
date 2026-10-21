/**
 * Money as a thing, never a label (owner, 2026-10-21): a salary is a stack of notes, an EMI is
 * notes flying out of a phone, savings are a tower growing. Every figure on these objects is a
 * string Python computed; amounts only decide sizes (a stack's height is proportional to its share).
 */
import React from "react";
import { random } from "remotion";
import { FONT } from "../design/fonts";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const back = (x: number) => { const c = clamp(x), s = 1.6; return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2); };

export type Cur = "INR" | "USD" | "GBP" | "EUR";
const NOTE: Record<Cur, { body: string; band: string; ink: string; sign: string }> = {
  INR: { body: "#b9c79d", band: "#e9e2c3", ink: "#56704a", sign: "₹" },
  USD: { body: "#9dc79f", band: "#efe9c8", ink: "#3c6b44", sign: "$" },
  GBP: { body: "#c7a59d", band: "#efe2c8", ink: "#7a4a3c", sign: "£" },
  EUR: { body: "#9db7c7", band: "#e2e9ef", ink: "#3c5a6b", sign: "€" },
};

/** One banknote, drawn at (0,0) centred, `nw` wide. */
export const Note: React.FC<{ cur: Cur; nw: number; rot?: number; x?: number; y?: number; opacity?: number }> = ({ cur, nw, rot = 0, x = 0, y = 0, opacity = 1 }) => {
  const c = NOTE[cur], nh = nw * 0.48;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity}>
      <rect x={-nw / 2} y={-nh / 2} width={nw} height={nh} rx={nw * 0.04} fill={c.body} stroke={c.ink} strokeWidth={nw * 0.02} />
      <circle cx={nw * 0.18} cy={0} r={nh * 0.3} fill={c.band} />
      <text x={nw * 0.18} y={nh * 0.13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={nh * 0.42} fill={c.ink}>{c.sign}</text>
      <rect x={-nw * 0.42} y={-nh * 0.3} width={nw * 0.34} height={nh * 0.12} rx={nh * 0.06} fill={c.ink} opacity={0.35} />
      <rect x={-nw * 0.42} y={nh * 0.12} width={nw * 0.24} height={nh * 0.1} rx={nh * 0.05} fill={c.ink} opacity={0.25} />
    </g>
  );
};

/** A stack of bundled notes, `k` 0..1 of its full height, growing bundle by bundle with a settle,
 * and a tag on top showing Python's figure once it is reached. */
export const CashStack: React.FC<{
  x: number; ground: number; width: number; full: number; k: number; cur: Cur; label?: string; text?: string;
  textShown: boolean; tone?: "good" | "bad" | "plain"; seed: string;
}> = ({ x, ground, width, full, k, cur, label, text, textShown, tone = "plain", seed }) => {
  const c = NOTE[cur];
  const bundle = Math.max(18, width * 0.16);
  const n = Math.max(1, Math.round(full / bundle));
  const shown = k * n;
  const tagY = ground - Math.max(1, shown) * bundle - 40;
  const tagColor = tone === "good" ? "#1f9d61" : tone === "bad" ? "#e03131" : "#2b2f3a";
  return (
    <g>
      <ellipse cx={x} cy={ground + 6} rx={width * 0.62} ry={width * 0.08} fill="#000" opacity={0.28} />
      {Array.from({ length: Math.ceil(shown) }, (_, i) => {
        const f = clamp(shown - i);              // the newest bundle drops in
        const drop = (1 - back(f)) * -120;
        const jitter = (random(`${seed}${i}`) - 0.5) * width * 0.06;
        const y = ground - (i + 1) * bundle + drop;
        return (
          <g key={i} opacity={clamp(f * 3)}>
            <rect x={x - width / 2 + jitter} y={y} width={width} height={bundle - 3} rx={4} fill={c.body} stroke={c.ink} strokeWidth={2.5} />
            <rect x={x - width * 0.09 + jitter} y={y} width={width * 0.18} height={bundle - 3} fill={c.band} />
            <rect x={x - width / 2 + jitter} y={y + bundle * 0.35} width={width} height={2} fill={c.ink} opacity={0.3} />
          </g>
        );
      })}
      {k > 0 && (label || (text && textShown)) && (
        <g transform={`translate(${x},${tagY})`}>
          {label && <text y={text && textShown ? -78 : -10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={width * 0.2} fill="#fff"
            stroke="#000" strokeWidth={width * 0.04} paintOrder="stroke" style={{ textTransform: "uppercase" }}>{label}</text>}
          {text && textShown && <>
            <rect x={-width * 0.75} y={-62} width={width * 1.5} height={78} rx={18} fill={tagColor} stroke="#fff" strokeWidth={5} />
            <text y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={width * 0.3} fill="#fff">{text}</text>
          </>}
        </g>
      )}
    </g>
  );
};

/** Notes flying from one place to another along an arc, one after another, spinning. */
export const MoneyFlow: React.FC<{
  from: [number, number]; to: [number, number]; t: number; start: number; dur: number; n?: number; cur: Cur; nw?: number; lift?: number; seed: string;
}> = ({ from, to, t, start, dur, n = 9, cur, nw = 120, lift = 260, seed }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const s = start + (i / n) * dur * 0.6;
    const f = (t - s) / (dur * 0.5);
    if (f <= 0 || f >= 1) return null;
    const e = easeOut(f) * 0.6 + f * 0.4;
    const x = from[0] + (to[0] - from[0]) * e, y = from[1] + (to[1] - from[1]) * e - Math.sin(Math.PI * e) * lift * (0.8 + random(`${seed}l${i}`) * 0.4);
    const rot = (random(`${seed}r${i}`) - 0.5) * 60 + f * 360 * (random(`${seed}d${i}`) > 0.5 ? 1 : -1);
    return <Note key={i} cur={cur} nw={nw} x={x} y={y} rot={rot} opacity={clamp((1 - f) * 4)} />;
  })}</g>
);

/** A phone held up to the camera: a bank or shopping app with a title, a big figure that counts,
 * line items arriving one by one, and notifications sliding in from the top. */
export const PhoneApp: React.FC<{
  x: number; y: number; pw: number; t: number; title: string; figure?: string; figureShown: boolean; figureColor?: string;
  lines?: { label: string; value?: string; at: number; bad?: boolean }[]; toasts?: { text: string; at: number }[]; tilt?: number;
}> = ({ x, y, pw, t, title, figure, figureShown, figureColor = "#e03131", lines = [], toasts = [], tilt = -4 }) => {
  const ph = pw * 2.05;
  const fs = pw * 0.125;   // readable at medium framing (Shorts text >= 44 px on screen)
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt + Math.sin(t * 1.1) * 0.8})`}>
      <rect x={-pw / 2 - 16} y={-ph / 2 - 16} width={pw + 32} height={ph + 32} rx={pw * 0.13} fill="#0f1118" />
      <rect x={-pw / 2} y={-ph / 2} width={pw} height={ph} rx={pw * 0.1} fill="#f6f7fb" />
      <rect x={-pw / 2} y={-ph / 2} width={pw} height={ph * 0.16} rx={pw * 0.1} fill="#3156d3" />
      <rect x={-pw / 2} y={-ph / 2 + ph * 0.08} width={pw} height={ph * 0.08} fill="#3156d3" />
      <text x={0} y={-ph / 2 + ph * 0.11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs * 0.95} fill="#fff">{title}</text>
      {figure && figureShown && (
        <text x={0} y={-ph / 2 + ph * 0.31} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(fs * 2, (pw * 0.9) / Math.max(3, figure.length * 0.6))} fill={figureColor}>{figure}</text>
      )}
      {/* the rest of the app: earlier transactions, greyed, so the screen is never a blank slab */}
      {Array.from({ length: 6 }, (_, i) => {
        const ly = -ph / 2 + ph * (0.44 + lines.length * 0.15 + i * 0.1);
        if (ly > ph / 2 - ph * 0.08) return null;
        return <g key={`h${i}`} opacity={0.55}>
          <circle cx={-pw * 0.34} cy={ly - fs * 0.25} r={fs * 0.55} fill="#dfe3ee" />
          <rect x={-pw * 0.25} y={ly - fs * 0.6} width={pw * (0.32 + (i % 3) * 0.06)} height={fs * 0.42} rx={fs * 0.2} fill="#dfe3ee" />
          <rect x={-pw * 0.25} y={ly + fs * 0.05} width={pw * 0.18} height={fs * 0.32} rx={fs * 0.16} fill="#eceff5" />
          <rect x={pw * 0.22} y={ly - fs * 0.6} width={pw * 0.15} height={fs * 0.42} rx={fs * 0.2} fill={i % 2 ? "#f2c9c9" : "#cfe8d9"} />
        </g>;
      })}
      <rect x={-pw / 2} y={ph / 2 - ph * 0.09} width={pw} height={ph * 0.09} rx={pw * 0.1} fill="#ffffff" />
      {[-0.3, -0.1, 0.1, 0.3].map((f) => <circle key={f} cx={pw * f} cy={ph / 2 - ph * 0.045} r={fs * 0.45} fill={f === -0.3 ? "#3156d3" : "#c9cfdc"} />)}
      {lines.map((l, i) => {
        const k = easeOut((t - l.at) / 0.35);
        if (k <= 0) return null;
        const ly = -ph / 2 + ph * (0.44 + i * 0.15);
        return (
          <g key={i} opacity={k} transform={`translate(${(1 - k) * pw * 0.4},0)`}>
            <rect x={-pw * 0.44} y={ly - fs * 0.95} width={pw * 0.88} height={fs * 1.7} rx={fs * 0.4} fill="#ffffff" stroke="#e3e6ef" strokeWidth={3} />
            <text x={-pw * 0.39} y={ly + fs * 0.15} fontFamily={FONT} fontWeight={700} fontSize={fs * 0.72} fill="#3f4656">{l.label}</text>
            {l.value && <text x={pw * 0.4} y={ly + fs * 0.15} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={Math.min(fs * 0.85, (pw * 0.4) / Math.max(2, l.value.length * 0.58))} fill={l.bad ? "#e03131" : "#1f9d61"}>{l.value}</text>}
          </g>
        );
      })}
      {toasts.map((n, i) => {
        const k = easeOut((t - n.at) / 0.3) - easeOut((t - n.at - 1.8) / 0.3);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(0,${-ph / 2 - pw * 0.05 + k * pw * 0.22 + i * 4})`} opacity={clamp(k * 1.5)}>
            <rect x={-pw * 0.47} y={-fs * 1.4} width={pw * 0.94} height={fs * 2.6} rx={fs * 0.8} fill="#1d2130" />
            <circle cx={-pw * 0.38} cy={-fs * 0.1} r={fs * 0.6} fill="#e03131" />
            <text x={-pw * 0.3} y={fs * 0.25} fontFamily={FONT} fontWeight={700} fontSize={fs * 0.95} fill="#fff">{n.text}</text>
          </g>
        );
      })}
      <rect x={-pw * 0.14} y={-ph / 2 + 10} width={pw * 0.28} height={14} rx={7} fill="#0f1118" />
    </g>
  );
};
