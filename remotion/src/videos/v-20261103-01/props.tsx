/**
 * The things "Why Google pays Apple for one iPhone setting" is about, drawn for this video only:
 * the iPhone with its search box, the search box itself, a compass (the browser), a FREE tag, the ad
 * result people tap, the shop that pays per tap, Google's money vault, Apple's crate of apples, the
 * deal contract, a wall clock, a phone habit loop and a pie of the ad money.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // an iPhone-like phone: a dark slab, a notch, a search box glowing on the screen
  iphone: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.55} s={s} />
      <Box x={-s * 0.27} y={-s * 1.0} w={s * 0.54} h={s * 0.98} fill={PALETTE.dark} s={s} r={0.14} sheen={false} />
      <rect x={-s * 0.23} y={-s * 0.94} width={s * 0.46} height={s * 0.86} rx={s * 0.05} fill="#e9f2ff" />
      <rect x={-s * 0.07} y={-s * 0.93} width={s * 0.14} height={s * 0.035} rx={s * 0.017} fill={INK} />
      <rect x={-s * 0.19} y={-s * 0.78} width={s * 0.38} height={s * 0.09} rx={s * 0.045} fill="#fff" stroke={PALETTE.blue} strokeWidth={line(s) * (1 + 0.4 * Math.abs(Math.sin(t * 3)))} />
      <circle cx={-s * 0.13} cy={-s * 0.735} r={s * 0.022} fill="none" stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.19} y={-s * (0.6 - i * 0.11)} width={s * (0.38 - (i % 2) * 0.1)} height={s * 0.05} rx={s * 0.02} fill={PALETTE.grey} opacity={0.45} />)}
    </g>
  ),
  // the search box, big: a pill with a magnifier; "typing" shows letters and a blinking cursor
  searchbar: ({ s, t, state }) => {
    const typing = state === "typing";
    const n = typing ? Math.min(5, Math.floor(t * 4) % 7) : 0;
    return (
      <g>
        <Shadow w={s * 1.2} s={s} />
        <Box x={-s * 0.62} y={-s * 0.5} w={s * 1.24} h={s * 0.3} fill={PALETTE.white} s={s} r={0.5} sheen={false} />
        <circle cx={-s * 0.45} cy={-s * 0.36} r={s * 0.07} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 1.4} />
        <line x1={-s * 0.4} y1={-s * 0.31} x2={-s * 0.34} y2={-s * 0.25} stroke={PALETTE.blue} strokeWidth={line(s) * 1.6} strokeLinecap="round" />
        {Array.from({ length: n }, (_, i) => <rect key={i} x={-s * 0.28 + i * s * 0.11} y={-s * 0.4} width={s * 0.08} height={s * 0.08} rx={s * 0.02} fill={INK} opacity={0.7} />)}
        {Math.floor(t * 2.5) % 2 === 0 && <rect x={-s * 0.27 + n * s * 0.11} y={-s * 0.44} width={s * 0.02} height={s * 0.16} fill={PALETTE.blue} />}
      </g>
    );
  },
  // a compass: the browser
  compass: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)})`}>
      <Shadow w={s * 0.6} s={s} />
      <Ball cx={0} cy={-s * 0.45} rx={s * 0.42} fill={PALETTE.white} s={s} />
      <circle cx={0} cy={-s * 0.45} r={s * 0.34} fill="#dff1ff" stroke={PALETTE.blue} strokeWidth={line(s)} />
      <g transform={`translate(0,${-s * 0.45}) rotate(${35 + Math.sin(t * 2) * 12})`}>
        <path d={`M0,${-s * 0.3} L${s * 0.06},0 L0,${s * 0.3} L${-s * 0.06},0 Z`} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.6} />
        <path d={`M0,0 L${s * 0.06},0 L0,${s * 0.3} Z`} fill={PALETTE.white} />
      </g>
    </g>
  ),
  // a price tag that says FREE
  freetag: ({ s, t }) => (
    <g transform={`rotate(${-8 + Math.sin(t * 2) * 4})`}>
      <Shadow w={s * 0.7} s={s} />
      <Shape d={`M${-s * 0.45},${-s * 0.75} L${s * 0.25},${-s * 0.75} L${s * 0.5},${-s * 0.45} L${s * 0.25},${-s * 0.15} L${-s * 0.45},${-s * 0.15} Z`} fill={PALETTE.mint} s={s} />
      <circle cx={s * 0.28} cy={-s * 0.45} r={s * 0.05} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.7} />
      <Paint x={-s * 0.1} y={-s * 0.37} text="FREE" size={s * 0.2} />
    </g>
  ),
  // one search result marked AD, with a pointer finger tapping it once "tapped"
  adresult: ({ s, t, state }) => {
    const tap = state === "tapped" ? Math.abs(Math.sin(t * 6)) : 0;
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <Box x={-s * 0.55} y={-s * 0.85} w={s * 1.1} h={s * 0.62} fill={tap ? "#fff7d6" : PALETTE.white} s={s} r={0.08} sheen={false} />
        <rect x={-s * 0.48} y={-s * 0.77} width={s * 0.2} height={s * 0.11} rx={s * 0.03} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Paint x={-s * 0.38} y={-s * 0.69} text="AD" size={s * 0.08} />
        <rect x={-s * 0.22} y={-s * 0.76} width={s * 0.6} height={s * 0.07} rx={s * 0.03} fill={PALETTE.blue} opacity={0.8} />
        {[0, 1].map((i) => <rect key={i} x={-s * 0.48} y={-s * (0.58 - i * 0.12)} width={s * (0.9 - i * 0.25)} height={s * 0.05} rx={s * 0.02} fill={PALETTE.grey} opacity={0.5} />)}
        {state === "tapped" && (
          <g transform={`translate(${s * 0.3},${-s * 0.35 + tap * s * 0.05})`}>
            <Shape d={`M0,0 l${s * 0.06},${-s * 0.18} q${s * 0.04},${-s * 0.05} ${s * 0.08},0 l${-s * 0.02},${s * 0.1} l${s * 0.1},${s * 0.02} q${s * 0.05},${s * 0.03} ${s * 0.02},${s * 0.12} l${-s * 0.06},${s * 0.1} Z`} fill={PALETTE.skin} s={s} />
          </g>
        )}
      </g>
    );
  },
  // a little shop with an awning: the advertiser
  shopfront: ({ s }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.45} y={-s * 0.7} w={s * 0.9} h={s * 0.7} fill={PALETTE.cream} s={s} r={0.04} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-s * 0.5 + i * s * 0.2} y={-s * 0.86} width={s * 0.2} height={s * 0.18} fill={i % 2 ? PALETTE.white : PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.7} />)}
      <rect x={-s * 0.1} y={-s * 0.42} width={s * 0.2} height={s * 0.42} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.7} />
      <rect x={-s * 0.38} y={-s * 0.52} width={s * 0.2} height={s * 0.18} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.7} />
      <rect x={s * 0.18} y={-s * 0.52} width={s * 0.2} height={s * 0.18} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  // Google's money: a four-colour vault door; "open" swings the door and shows gold inside
  gvault: ({ s, t, state }) => {
    const open = state === "open";
    const cols = [PALETTE.blue, PALETTE.red, PALETTE.yellow, PALETTE.green];
    return (
      <g>
        <Shadow w={s * 0.95} s={s} />
        <Box x={-s * 0.45} y={-s * 0.92} w={s * 0.9} h={s * 0.9} fill={PALETTE.grey} s={s} r={0.08} />
        {open && [0, 1, 2].map((i) => <rect key={i} x={-s * 0.3} y={-s * (0.32 + i * 0.13)} width={s * 0.6} height={s * 0.11} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />)}
        <g transform={`translate(${open ? -s * 0.34 : 0},0) scale(${open ? 0.25 : 1},1)`}>
          <circle cx={0} cy={-s * 0.47} r={s * 0.34} fill={shade(PALETTE.grey, 0.3)} stroke={INK} strokeWidth={line(s)} />
          {cols.map((c, i) => (
            <path key={i} d={`M0,${-s * 0.47} L${Math.cos((i * Math.PI) / 2 + t) * s * 0.26},${-s * 0.47 + Math.sin((i * Math.PI) / 2 + t) * s * 0.26} A${s * 0.26},${s * 0.26} 0 0 1 ${Math.cos(((i + 1) * Math.PI) / 2 + t) * s * 0.26},${-s * 0.47 + Math.sin(((i + 1) * Math.PI) / 2 + t) * s * 0.26} Z`} fill={c} stroke={INK} strokeWidth={line(s) * 0.5} />
          ))}
          <circle cx={0} cy={-s * 0.47} r={s * 0.07} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.6} />
        </g>
      </g>
    );
  },
  // a wooden crate of shiny apples; "gold" turns the top apple gold
  applecrate: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      {[-0.26, 0, 0.26].map((x, i) => (
        <g key={x} transform={`translate(${s * x},${-s * 0.5 + Math.sin(t * 2 + i) * s * 0.01})`}>
          <Ball cx={0} cy={0} rx={s * 0.15} ry={s * 0.14} fill={state === "gold" && i === 1 ? PALETTE.gold : PALETTE.red} s={s} />
          <path d={`M0,${-s * 0.13} q${s * 0.02},${-s * 0.08} ${s * 0.06},${-s * 0.1}`} stroke={PALETTE.brown} strokeWidth={line(s)} fill="none" />
          <ellipse cx={s * 0.06} cy={-s * 0.2} rx={s * 0.05} ry={s * 0.025} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.5} />
        </g>
      ))}
      <Box x={-s * 0.5} y={-s * 0.42} w={s * 1.0} h={s * 0.42} fill={PALETTE.tan} s={s} r={0.05} />
      {[0, 1].map((i) => <line key={i} x1={-s * 0.5} x2={s * 0.5} y1={-s * (0.3 - i * 0.14)} y2={-s * (0.3 - i * 0.14)} stroke={shade(PALETTE.tan, -0.35)} strokeWidth={line(s) * 0.7} />)}
    </g>
  ),
  // the deal: a contract with two signature lines; "signed" adds a red seal
  contract: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.02)}) rotate(4)`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.33} y={-s * 0.98} w={s * 0.66} h={s * 0.9} fill={PALETTE.white} s={s} r={0.04} sheen={false} />
      <Paint x={0} y={-s * 0.84} text="DEAL" size={s * 0.12} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.24} y={-s * (0.72 - i * 0.09)} width={s * (0.48 - (i % 2) * 0.14)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.55} />)}
      <line x1={-s * 0.26} x2={-s * 0.04} y1={-s * 0.22} y2={-s * 0.22} stroke={INK} strokeWidth={line(s) * 0.6} />
      <line x1={s * 0.04} x2={s * 0.26} y1={-s * 0.22} y2={-s * 0.22} stroke={INK} strokeWidth={line(s) * 0.6} />
      {state === "signed" && <Ball cx={s * 0.18} cy={-s * 0.32} rx={s * 0.09} fill={PALETTE.red} s={s} />}
    </g>
  ),
  // a wall clock whose minute hand races
  clock: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <Ball cx={0} cy={-s * 0.5} rx={s * 0.42} fill={PALETTE.cream} s={s} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.sin((i * Math.PI) / 6) * s * 0.33} y1={-s * 0.5 - Math.cos((i * Math.PI) / 6) * s * 0.33} x2={Math.sin((i * Math.PI) / 6) * s * 0.38} y2={-s * 0.5 - Math.cos((i * Math.PI) / 6) * s * 0.38} stroke={INK} strokeWidth={line(s) * 0.6} />)}
      <line x1={0} y1={-s * 0.5} x2={Math.sin(t * 4) * s * 0.3} y2={-s * 0.5 - Math.cos(t * 4) * s * 0.3} stroke={PALETTE.red} strokeWidth={line(s) * 1.2} strokeLinecap="round" />
      <line x1={0} y1={-s * 0.5} x2={Math.sin(t * 0.33) * s * 0.2} y2={-s * 0.5 - Math.cos(t * 0.33) * s * 0.2} stroke={INK} strokeWidth={line(s) * 1.4} strokeLinecap="round" />
    </g>
  ),
  // the habit: a thumb scrolling a phone in an endless loop arrow
  habit: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <circle cx={0} cy={-s * 0.5} r={s * 0.44} fill="none" stroke={PALETTE.purple} strokeWidth={s * 0.06} strokeDasharray={`${s * 0.3} ${s * 0.12}`} strokeDashoffset={-t * s * 0.6} />
      <Box x={-s * 0.16} y={-s * 0.8} w={s * 0.32} h={s * 0.56} fill={PALETTE.dark} s={s} r={0.15} sheen={false} />
      <rect x={-s * 0.12} y={-s * 0.75} width={s * 0.24} height={s * 0.46} rx={s * 0.03} fill="#e9f2ff" />
      <rect x={-s * 0.1} y={-s * 0.7 + ((t * 0.5) % 1) * s * 0.3} width={s * 0.2} height={s * 0.05} rx={s * 0.02} fill={PALETTE.blue} />
    </g>
  ),
};

export default props;
