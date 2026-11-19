/**
 * The business documentaries channel's avatar (800×800) and banner (2560×1440, the name and tagline
 * inside YouTube's 1546×423 safe area), in the channel's documentary look: a charcoal backdrop with a
 * paper grain, a page of evidence, ink for the rise, red for the fall, a yellow highlighter, one gold
 * accent. Our own shapes only; no company's logo. Name: "Craze & Crash" (branding/kit.md).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT } from "../design/fonts";

const BG = "#16171a";
const BG_LIGHT = "#2a2b30";
const PAPER = "#f1ead9";
const PAPER_DARK = "#ddd3bb";
const INK = "#1f1b16";
const RED = "#e0483e";
const GOLD = "#e8b04a";
const MARKER = "#ffe14d";
const MUTED = "#9a958a";

/** Shared defs: the paper grain (seeded turbulence, deterministic), the backdrop light, a soft shadow. */
const Defs: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.55" /></feComponentTransfer>
    </filter>
    <filter id="fibres" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves={3} seed={3} />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.35" /></feComponentTransfer>
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx={0} dy={h * 0.012} stdDeviation={Math.min(w, h) * 0.02} floodColor="#000" floodOpacity={0.6} />
    </filter>
    <radialGradient id="light" cx="50%" cy="46%" r="65%">
      <stop offset="0%" stopColor={BG_LIGHT} />
      <stop offset="100%" stopColor={BG} />
    </radialGradient>
  </defs>
);

/** Charcoal with a fine grain and long paper fibres over it. */
const Backdrop: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <g>
    <rect width={w} height={h} fill="url(#light)" />
    <rect width={w} height={h} filter="url(#fibres)" opacity={0.35} style={{ mixBlendMode: "overlay" }} />
    <rect width={w} height={h} filter="url(#grain)" opacity={0.18} style={{ mixBlendMode: "overlay" }} />
  </g>
);

/**
 * The mark: a sheet of paper with a chart drawn on it in pen. The line climbs in ink to a peak the
 * highlighter has marked, then crashes in red off the bottom of the page. `s` is the sheet's side.
 */
const Mark: React.FC<{ cx: number; cy: number; s: number; rot?: number; detail?: boolean }> = ({ cx, cy, s, rot = -4, detail = true }) => {
  const k = s / 520; // drawn at 520, scaled
  const rise = "M -205 150 L -140 95 L -95 118 L -30 20 L 10 45 L 70 -135";
  const fall = "M 70 -135 L 118 -20 L 146 -48 L 190 108";
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${k})`}>
      {/* a second sheet under it, then the page */}
      <rect x={-252} y={-248} width={520} height={520} rx={6} fill={PAPER_DARK} transform="rotate(5)" filter="url(#shadow)" />
      <rect x={-260} y={-260} width={520} height={520} rx={6} fill={PAPER} filter="url(#shadow)" />
      <rect x={-260} y={-260} width={520} height={520} rx={6} filter="url(#fibres)" opacity={0.25} style={{ mixBlendMode: "multiply" }} />
      {detail ? (
        <g>
          {/* a typed header and ruled lines: it reads as a document, not a chart card */}
          <rect x={-205} y={-212} width={170} height={16} rx={3} fill={INK} opacity={0.75} />
          <rect x={-205} y={-184} width={260} height={9} rx={3} fill={INK} opacity={0.28} />
          {[-110, -50, 10, 70, 130].map((y) => <line key={y} x1={-205} x2={205} y1={y} y2={y} stroke={INK} strokeOpacity={0.1} strokeWidth={3} />)}
        </g>
      ) : null}
      {/* the axis */}
      <path d="M -215 -150 L -215 190 L 215 190" stroke={INK} strokeOpacity={0.5} strokeWidth={detail ? 6 : 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* the highlighter swipe across the peak */}
      <path d="M -14 -168 L 6 -184 L 162 -196 L 150 -180 L 168 -172 L 166 -116 L 146 -104 L 4 -96 L 14 -110 L -8 -118 Z" fill={MARKER} opacity={0.88} style={{ mixBlendMode: "multiply" }} />
      <path d={rise} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={fall} stroke={RED} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* the arrowhead the crash ends in */}
      <path d="M 212 186 L 241 113 L 151 139 Z" fill={RED} stroke={RED} strokeWidth={16} strokeLinejoin="round" />
      <circle cx={70} cy={-135} r={22} fill={PAPER} stroke={INK} strokeWidth={12} />
    </g>
  );
};

export const DocAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <Defs w={800} h={800} />
      <Backdrop w={800} h={800} />
      {/* a thin gold ring just inside the circle YouTube crops to */}
      <circle cx={400} cy={400} r={372} fill="none" stroke={GOLD} strokeOpacity={0.55} strokeWidth={6} />
      <Mark cx={400} cy={404} s={470} detail={false} />
    </svg>
  </AbsoluteFill>
);

/** A newspaper-style clipping for the banner's edges (TV and desktop only): grey type, one marked figure. */
const Clipping: React.FC<{ x: number; y: number; w: number; h: number; rot: number; mark?: "red" | "marker" | "none"; seed: number }> = ({ x, y, w, h, rot, mark = "none", seed }) => {
  const lines: React.ReactNode[] = [];
  const n = Math.floor((h - 150) / 34);
  for (let i = 0; i < n; i++) {
    const len = 0.72 + (((i * 37 + seed * 13) % 23) / 23) * 0.24;
    lines.push(<rect key={i} x={30} y={130 + i * 34} width={(w - 60) * len} height={11} rx={3} fill={INK} opacity={0.32} />);
  }
  const my = 130 + Math.min(n - 1, 3 + (seed % 3)) * 34;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect width={w} height={h} fill={PAPER} filter="url(#shadow)" />
      <rect width={w} height={h} filter="url(#fibres)" opacity={0.3} style={{ mixBlendMode: "multiply" }} />
      <rect x={30} y={34} width={w * 0.62} height={26} rx={4} fill={INK} opacity={0.82} />
      <rect x={30} y={74} width={w * 0.44} height={26} rx={4} fill={INK} opacity={0.82} />
      {lines}
      {mark === "marker" ? <rect x={24} y={my - 9} width={(w - 60) * 0.7} height={30} fill={MARKER} opacity={0.85} style={{ mixBlendMode: "multiply" }} /> : null}
      {mark === "red" ? <ellipse cx={w * 0.42} cy={my + 6} rx={w * 0.3} ry={30} fill="none" stroke={RED} strokeWidth={6} transform={`rotate(-3 ${w * 0.42} ${my + 6})`} /> : null}
    </g>
  );
};

export const DocBanner: React.FC = () => {
  // YouTube's safe area: 1546×423, centred → x 507..2053, y 508..931
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        <Defs w={2560} h={1440} />
        <Backdrop w={2560} h={1440} />
        {/* clippings scattered past the safe area's ends, dimmed so the name leads */}
        <g opacity={0.4}>
          <Clipping x={60} y={300} w={340} h={460} rot={-7} mark="marker" seed={1} />
          <Clipping x={170} y={860} w={300} h={420} rot={5} mark="red" seed={2} />
          <Clipping x={2180} y={260} w={330} h={450} rot={6} mark="red" seed={4} />
          <Clipping x={2120} y={850} w={320} h={430} rot={-5} mark="marker" seed={5} />
        </g>
        {/* darken the middle band so the type sits on calm ground */}
        <radialGradient id="calm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BG} stopOpacity={0.92} />
          <stop offset="70%" stopColor={BG} stopOpacity={0.75} />
          <stop offset="100%" stopColor={BG} stopOpacity={0} />
        </radialGradient>
        <ellipse cx={1280} cy={720} rx={1050} ry={330} fill="url(#calm)" />
        {/* the mark and the name, inside the safe area (x 507..2053) */}
        <Mark cx={742} cy={716} s={280} rot={-4} />
      </svg>
      <div style={{ position: "absolute", left: 942, top: 600, width: 1100, fontFamily: FONT, color: "#f3efe6" }}>
        <div style={{ fontWeight: 800, fontSize: 124, lineHeight: 1, letterSpacing: 2 }}>
          CRAZE <span style={{ color: GOLD }}>&amp;</span> CRASH
        </div>
        <div style={{ fontWeight: 600, fontSize: 46, marginTop: 26, whiteSpace: "nowrap" }}>
          The <span style={{ background: MARKER, color: INK, padding: "0 10px", margin: "0 -4px", borderRadius: 3, boxDecorationBreak: "clone" }}>booms</span>,
          the <span style={{ color: RED }}>busts</span> and the business wars
        </div>
        <div style={{ fontWeight: 500, fontSize: 32, marginTop: 14, letterSpacing: 4, color: MUTED }}>BUSINESS DOCUMENTARIES</div>
      </div>
    </AbsoluteFill>
  );
};
