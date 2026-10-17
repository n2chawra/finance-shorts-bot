import React from "react";
import { AbsoluteFill, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import props from "./props.json";

// Poppins, the same font files our Python engine uses
for (const [w, f] of [["400", "Regular"], ["500", "Medium"], ["600", "SemiBold"], ["700", "Bold"], ["800", "ExtraBold"], ["900", "Black"]]) {
  loadFont({ family: "Poppins", url: staticFile(`Poppins-${f}.ttf`), weight: w });
}

const P = props.palette;
const [A_, B_] = props.people;
const TXT = props.txt as Record<string, string>;
const W = 1080;
const TEMPO = props.tempo;

// story timeline, identical to two_friends_race so the same soundtrack lines up
const S_HOOK = 0, S_A = 5, S_B = 14, S_Q = 23, S_CHART = 31, S_RES = 44;

// ---------------- maths helpers ----------------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t: number, s: number, d = 0.3) => clamp((t - s) / d);
const smooth = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const mixHex = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// a spring keyed off story seconds
const useSpring = () => {
  const { fps } = useVideoConfig();
  return (t: number, start: number, damping = 13, stiffness = 140) =>
    t < start ? 0 : spring({ frame: ((t - start) / TEMPO) * fps, fps, config: { damping, stiffness, mass: 0.9 } });
};

const font = (size: number, weight = 700, color: string = P.text): React.CSSProperties => ({
  fontFamily: "Poppins", fontWeight: weight, fontSize: size, color, lineHeight: 1.1,
  textShadow: "0 8px 28px rgba(0,0,0,0.35)", letterSpacing: -0.5, whiteSpace: "nowrap",
});

// ---------------- text ----------------
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 50, right: 50, top: y, transform: "translateY(-50%)", textAlign: "center", ...style }}>
    {children}
  </div>
);

/** Words spring in one after another, then hold perfectly still. */
const Words: React.FC<{ text: string; t: number; start: number; y: number; size: number; color?: string; weight?: number; stagger?: number }> =
  ({ text, t, start, y, size, color = P.text, weight = 700, stagger = 0.06 }) => {
    const sp = useSpring();
    return (
      <Center y={y}>
        {text.split(" ").map((w, i) => {
          const k = sp(t, start + i * stagger, 12, 170);
          return (
            <span key={i} style={{
              ...font(size, weight, color), display: "inline-block", marginRight: size * 0.26,
              opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 60}px) scale(${0.7 + 0.3 * k})`,
              filter: `blur(${(1 - clamp(k * 1.4)) * 10}px)`,
            }}>{w}</span>
          );
        })}
      </Center>
    );
  };

const Pill: React.FC<{ text: string; y: number; size: number; fg: string; bg: string; k: number; glow?: string }> =
  ({ text, y, size, fg, bg, k, glow }) => (
    <Center y={y}>
      <span style={{
        ...font(size, 700, fg), textShadow: "none", display: "inline-block", padding: `${size * 0.32}px ${size * 0.7}px`,
        borderRadius: 999, background: bg, opacity: clamp(k * 2), transform: `scale(${0.6 + 0.4 * k})`,
        boxShadow: `0 14px 40px rgba(0,0,0,0.35)${glow ? `, 0 0 40px ${glow}` : ""}`,
      }}>{text}</span>
    </Center>
  );

// ---------------- background ----------------
const Background: React.FC<{ T: number }> = ({ T }) => {
  const blobs = [
    { c: A_.color, x: 200 + Math.sin(T * 0.35) * 120, y: 520 + Math.cos(T * 0.27) * 160, r: 520 },
    { c: B_.color, x: 900 + Math.cos(T * 0.31) * 120, y: 1350 + Math.sin(T * 0.22) * 180, r: 560 },
    { c: A_.color, x: 540 + Math.sin(T * 0.19) * 200, y: 980 + Math.cos(T * 0.4) * 120, r: 380 },
  ];
  const dots = Array.from({ length: 34 }, (_, i) => {
    const sx = (i * 397) % 1080, sp = 18 + (i * 13) % 30, ph = (i * 71) % 1920;
    return { x: sx + Math.sin(T * 0.6 + i) * 18, y: (1920 - ((T * sp + ph) % 2000)), r: 2 + (i % 3), a: 0.15 + (i % 5) * 0.06 };
  });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${P.bg} 0%, ${P.bg_bottom} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          {blobs.map((b, i) => (
            <radialGradient key={i} id={`blob${i}`}>
              <stop offset="0%" stopColor={b.c} stopOpacity={0.16} />
              <stop offset="100%" stopColor={b.c} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>
        {blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={`url(#blob${i})`} />)}
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={P.text} opacity={d.a} />)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------- characters ----------------
type PersonP = typeof A_;
export const Person: React.FC<{ p: PersonP; x: number; y: number; s: number; t: number; mood?: string; jump?: number; opacity?: number; wave?: boolean }> =
  ({ p, x, y, s, t, mood = "happy", jump = 0, opacity = 1, wave = false }) => {
    const bob = Math.sin(t * 4) * 5 - jump;
    const blink = (t * 1.3 + x * 0.001) % 3 < 0.1;
    const armA = Math.sin(t * 3) * 8 + (wave ? -120 + Math.sin(t * 9) * 25 : 0);
    const id = p.tag + Math.round(x);
    const n = parseInt(p.color.slice(1), 16);
    const dark = `rgb(${Math.round(((n >> 16) & 255) * 0.5)},${Math.round(((n >> 8) & 255) * 0.5)},${Math.round((n & 255) * 0.5)})`;
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity, overflow: "visible" }}>
        <defs>
          <linearGradient id={`body${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
            <stop offset="40%" stopColor={p.color} />
            <stop offset="100%" stopColor={p.color} stopOpacity={0.75} />
          </linearGradient>
          <radialGradient id={`skin${id}`} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
            <stop offset="35%" stopColor={p.skin} />
            <stop offset="100%" stopColor={p.skin} />
          </radialGradient>
          <filter id={`soft${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        {/* ground shadow shrinks as he jumps */}
        <ellipse cx={x} cy={y + 8} rx={(110 - jump * 0.6) * s} ry={18 * s} fill="#000" opacity={0.28} />
        <g transform={`translate(${x},${y + bob}) scale(${s})`} filter={`url(#soft${id})`}>
          {/* legs */}
          <rect x={-48} y={-70} width={34} height={78} rx={17} fill={dark} opacity={0.85} />
          <rect x={14} y={-70} width={34} height={78} rx={17} fill={dark} opacity={0.85} />
          {/* arms */}
          <g transform={`rotate(${-12 - armA * 0.3}, -82, -190)`}>
            <rect x={-104} y={-200} width={30} height={130} rx={15} fill={p.color} />
            <circle cx={-89} cy={-74} r={19} fill={p.skin} />
          </g>
          <g transform={`rotate(${12 + armA}, 82, -190)`}>
            <rect x={74} y={-200} width={30} height={130} rx={15} fill={p.color} />
            <circle cx={89} cy={-74} r={19} fill={p.skin} />
          </g>
          {/* body */}
          <rect x={-85} y={-230} width={170} height={175} rx={62} fill={`url(#body${id})`} />
          <text x={0} y={-130} textAnchor="middle" style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 30 }} fill="rgba(255,255,255,0.55)">₹</text>
          {/* head */}
          <g transform="translate(0,-300)">
            {p.hair === "bun" && <circle cx={0} cy={-80} r={34} fill={dark} />}
            <circle cx={0} cy={0} r={80} fill={`url(#skin${id})`} />
            {p.hair === "cap" ? (
              <>
                <path d="M-82,-8 A82,82 0 0 1 82,-8 Z" fill={dark} />
                <rect x={10} y={-16} width={98} height={18} rx={9} fill={dark} />
              </>
            ) : (
              <path d="M-80,-2 C-78,-70 78,-70 80,-2 C50,-36 -50,-36 -80,-2 Z" fill={dark} />
            )}
            {/* eyes */}
            {blink ? (
              <>
                <rect x={-38} y={14} width={22} height={5} rx={2.5} fill="#1d1d2b" />
                <rect x={16} y={14} width={22} height={5} rx={2.5} fill="#1d1d2b" />
              </>
            ) : mood === "wow" ? (
              <>
                <ellipse cx={-27} cy={14} rx={12} ry={15} fill="#1d1d2b" />
                <ellipse cx={27} cy={14} rx={12} ry={15} fill="#1d1d2b" />
              </>
            ) : (
              <>
                <ellipse cx={-27} cy={14} rx={9} ry={11} fill="#1d1d2b" />
                <ellipse cx={27} cy={14} rx={9} ry={11} fill="#1d1d2b" />
                <circle cx={-24} cy={10} r={3} fill="#fff" />
                <circle cx={30} cy={10} r={3} fill="#fff" />
              </>
            )}
            <ellipse cx={-48} cy={38} rx={13} ry={8} fill="#ff7b8a" opacity={0.35} />
            <ellipse cx={48} cy={38} rx={13} ry={8} fill="#ff7b8a" opacity={0.35} />
            {mood === "wow" ? <ellipse cx={0} cy={48} rx={13} ry={16} fill="#7a2f3a" />
              : mood === "sad" ? <path d="M-22,58 Q0,40 22,58" stroke="#7a2f3a" strokeWidth={6} fill="none" strokeLinecap="round" />
              : <path d="M-26,36 Q0,62 26,36" stroke="#7a2f3a" strokeWidth={6} fill="none" strokeLinecap="round" />}
          </g>
        </g>
      </svg>
    );
  };

// ---------------- props ----------------
const Coin: React.FC<{ x: number; y: number; r: number; spin: number; opacity?: number }> = ({ x, y, r, spin, opacity = 1 }) => {
  const sx = Math.max(0.15, Math.abs(Math.cos(spin)));
  return (
    <g transform={`translate(${x},${y}) scale(${sx},1)`} opacity={opacity}>
      <circle r={r} fill="url(#coinGrad)" stroke="#b8860b" strokeWidth={3} />
      <circle r={r * 0.74} fill="none" stroke="#fff3b0" strokeOpacity={0.6} strokeWidth={2.5} />
      <text y={r * 0.36} textAnchor="middle" style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: r * 1.05 }} fill="#9a6b00">₹</text>
    </g>
  );
};

const Jar: React.FC<{ x: number; bottom: number; w: number; h: number; frac: number; color: string; t: number }> = ({ x, bottom, w, h, frac, color, t }) => {
  const top = bottom - h, L = x - w / 2, R = x + w / 2;
  const level = bottom - 14 - (h - 40) * frac;
  const wave = Array.from({ length: 31 }, (_, i) => {
    const px = L + (w * i) / 30;
    return `${px},${level + Math.sin(i * 0.55 + t * 5) * 7 * Math.min(1, frac * 6)}`;
  });
  const bubbles = Array.from({ length: 7 }, (_, i) => {
    const ph = (t * (0.5 + (i % 3) * 0.2) + i / 7) % 1;
    return { x: L + 30 + ((i * 53) % (w - 60)), y: bottom - 20 - ph * (bottom - 20 - level), r: 4 + (i % 3) * 2, a: frac > 0.03 ? 0.5 * (1 - ph) : 0 };
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <clipPath id="jarClip"><rect x={L + 8} y={top + 30} width={w - 16} height={h - 38} rx={40} /></clipPath>
        <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.16} />
          <stop offset="30%" stopColor="#fff" stopOpacity={0.04} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <ellipse cx={x} cy={bottom + 10} rx={w * 0.55} ry={22} fill="#000" opacity={0.3} />
      <rect x={L} y={top + 22} width={w} height={h - 22} rx={48} fill="url(#glass)" stroke="rgba(255,255,255,0.45)" strokeWidth={5} />
      <g clipPath="url(#jarClip)">
        <polygon points={`${L},${bottom} ${wave.join(" ")} ${R},${bottom}`} fill="url(#liquid)" />
        {bubbles.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#fff" opacity={b.a} />)}
      </g>
      <rect x={L + 26} y={top + 60} width={16} height={h - 140} rx={8} fill="#fff" opacity={0.22} />
      <rect x={x - w * 0.36} y={top} width={w * 0.72} height={34} rx={14} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
    </svg>
  );
};

// ---------------- scenes (t = story seconds into the scene) ----------------
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const sp = useSpring();
  const slideA = sp(t, 1.4, 14, 120), slideB = sp(t, 1.45, 14, 120);
  const vs = sp(t, 2.1, 9, 200);
  const [left, right] = TXT.hook_title.split(" vs ");
  const title = sp(t, 0, 11, 160);
  return (
    <>
      <Center y={330}>
        <span style={{ ...font(84, 800, A_.color), display: "inline-block", transform: `translateX(${(1 - title) * -300}px)`, opacity: clamp(title * 2) }}>{left}</span>
        <span style={{ ...font(56, 700, P.muted), margin: "0 22px" }}>vs</span>
        <span style={{ ...font(84, 800, B_.color), display: "inline-block", transform: `translateX(${(1 - title) * 300}px)`, opacity: clamp(title * 2) }}>{right}</span>
      </Center>
      <Words text={TXT.hook_sub} t={t} start={0.8} y={460} size={94} color={P.accent} weight={900} />
      <Person p={A_} x={W / 2 - 220 - (1 - slideA) * 650} y={1300} s={1.3} t={t} />
      <Person p={B_} x={W / 2 + 220 + (1 - slideB) * 650} y={1300} s={1.3} t={t + 1} />
      {[A_, B_].map((p, i) => (
        <div key={i} style={{ position: "absolute", left: (i ? W / 2 + 220 + (1 - slideB) * 650 : W / 2 - 220 - (1 - slideA) * 650) - 150, width: 300, top: 1345, textAlign: "center" }}>
          <span style={{ ...font(44, 800, P.bg), textShadow: "none", background: p.color, borderRadius: 999, padding: "6px 26px", boxShadow: "0 10px 26px rgba(0,0,0,0.35)" }}>{p.tag}</span>
        </div>
      ))}
      {vs > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 + t * 0.8, r0 = 110 * vs, r1 = (150 + 40 * Math.sin(t * 6 + i)) * vs;
            return <line key={i} x1={540 + Math.cos(a) * r0} y1={1050 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={1050 + Math.sin(a) * r1} stroke={P.accent} strokeWidth={8} strokeLinecap="round" opacity={0.8} />;
          })}
          <circle cx={540} cy={1050} r={92 * vs} fill={P.danger} style={{ filter: `drop-shadow(0 0 30px ${P.danger})` }} />
          <text x={540} y={1050 + 26 * vs} textAnchor="middle" style={{ fontFamily: "Poppins", fontWeight: 900, fontSize: 74 * vs }} fill="#fff">VS</text>
        </svg>
      )}
      <Words text={TXT.hook_tease} t={t} start={2.8} y={1620} size={52} color={P.muted} weight={500} stagger={0.04} />
    </>
  );
};

const COIN_T0 = 1.2, COIN_DUR = 6, COIN_SPEED = 1.4, NOTE_AT = 7.4;
const Coins: React.FC<{ t: number; i: 0 | 1 }> = ({ t, i }) => {
  const sp = useSpring();
  const p = props.people[i];
  const key = i === 0 ? "a" : "b";
  const prog = smooth(ramp(t, COIN_T0, COIN_DUR));
  const done = Math.floor((p.stop - p.start) * prog + 1e-9);
  const jump = Math.abs(Math.sin(t * 6)) * 16 * (prog > 0 && prog < 1 ? 1 : 0);
  const note = sp(t, NOTE_AT, 9, 220);
  const stops = p.stop < props.endAge;
  const shake = stops && note > 0 ? Math.sin(t * 60) * 10 * Math.exp(-(t - NOTE_AT) * 5) : 0;
  const invested = sp(t, COIN_T0, 14, 140);
  return (
    <>
      <Words text={TXT[key + "_intro"]} t={t} start={0.15} y={300} size={74} />
      <Words text={TXT[key + "_amount"]} t={t} start={0.7} y={410} size={96} color={p.color} weight={800} />
      <Center y={560} style={{ opacity: clamp(invested * 2), transform: `translateY(-50%) scale(${0.8 + 0.2 * invested})` }}>
        <span style={font(64, 700)}>Invested: </span>
        <span style={{ ...font(64, 800, P.accent) }}>{props.investedByYearText[done]}</span>
      </Center>
      <Jar x={720} bottom={1500} w={300} h={420} frac={prog * 0.9} color={p.color} t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="coinGrad" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#fff7c2" />
            <stop offset="45%" stopColor="#ffd34d" />
            <stop offset="100%" stopColor="#e0a800" />
          </radialGradient>
        </defs>
        {t > COIN_T0 && t < COIN_T0 + COIN_DUR && [0, 1, 2].map((n) => {
          const ph = (t * COIN_SPEED + n / 3) % 1;
          const y = 700 + Math.pow(ph, 1.6) * 700;
          if (y > 1460) return null;
          return (
            <g key={n}>
              {[0.06, 0.12].map((d, k) => (
                <Coin key={k} x={720 + (n - 1) * 55} y={y - d * 700 * 1.6 * Math.pow(ph, 0.6)} r={36} spin={(t - d) * 9 + n} opacity={0.18 - k * 0.07} />
              ))}
              <Coin x={720 + (n - 1) * 55} y={y} r={38} spin={t * 9 + n} />
            </g>
          );
        })}
      </svg>
      <Person p={p} x={300} y={1450} s={1.15} t={t} jump={jump} />
      <Center y={1535}><span style={font(54, 800, p.color)}>{p.tag}</span></Center>
      <Pill text={`Age ${p.start + done}`} y={1630} size={60} fg={P.bg} bg={P.text} k={sp(t, 0.3)} />
      {note > 0 && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
          <Pill text={TXT[key + "_note"]} y={1735} size={stops ? 54 : 50} fg={stops ? P.text : P.bg}
            bg={stops ? P.danger : A_.color} k={note} glow={stops ? mixHex(P.danger, 0.6) : undefined} />
        </div>
      )}
    </>
  );
};

const Question: React.FC<{ t: number }> = ({ t }) => {
  const sp = useSpring();
  return (
    <>
      <Words text={TXT.question_setup} t={t} start={0.15} y={380} size={78} />
      {props.people.map((p, i) => {
        const k = sp(t, 0.8 + i * 0.5, 12, 150);
        const x = W / 2 + (i === 0 ? -230 : 230);
        return (
          <div key={i} style={{
            position: "absolute", left: x - 200, top: 650, width: 400, height: 420, borderRadius: 40, overflow: "hidden",
            background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 140}px) rotate(${(1 - k) * (i ? 8 : -8)}deg)`,
          }}>
            <div style={{ height: 84, background: `linear-gradient(135deg, ${p.color}, ${mixHex(p.color, 0.6)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ ...font(50, 800, P.bg), textShadow: "none" }}>{p.tag}</span>
            </div>
            <div style={{ textAlign: "center", paddingTop: 26 }}>
              <div style={font(42, 500, P.muted)}>invests for</div>
              <div style={{ ...font(64, 800), marginTop: 4 }}>{p.stop - p.start} years</div>
              <div style={{ ...font(42, 500, P.muted), marginTop: 22 }}>Total put in</div>
              <div style={{ ...font(64, 800, p.color), marginTop: 4 }}>{props.investedText[i]}</div>
            </div>
          </div>
        );
      })}
      <Words text={TXT.question} t={t} start={2.4} y={1260} size={82} color={P.accent} weight={900} />
      <Pill text={TXT.question_cta} y={1430} size={46} fg={P.bg} bg={P.text} k={sp(t, 3.4)} />
      {[0, 1, 2].map((i) => {
        const t0 = 5 + i;
        if (t < t0 || t >= t0 + 1) return null;
        const lt = t - t0, k = sp(t, t0, 8, 260), fade = 1 - ramp(lt, 0.75, 0.25);
        const n = 3 - i, col = n === 1 ? P.danger : P.text;
        return (
          <svg key={i} width={1080} height={1920} style={{ position: "absolute", opacity: fade }}>
            <circle cx={540} cy={1640} r={130} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={14} />
            <circle cx={540} cy={1640} r={130} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 130} strokeDashoffset={2 * Math.PI * 130 * (1 - lt)} transform="rotate(-90 540 1640)" />
            <text x={540} y={1640 + 70 * k} textAnchor="middle" style={{ fontFamily: "Poppins", fontWeight: 900, fontSize: 200 * k }} fill={col}>{n}</text>
          </svg>
        );
      })}
    </>
  );
};

const Chart: React.FC<{ t: number }> = ({ t }) => {
  const L = 180, R = 980, T = 520, B = 1420;
  const ymax = props.ticks[props.ticks.length - 1];
  const a = ramp(t, 0.2, 0.5);
  const n = Math.floor(smooth(ramp(t, 0.8, 10)) * (props.months / 3));
  const pts = (S: number[]) => S.slice(0, n + 1).map((v, m) => [L + ((R - L) * m * 3) / props.months, B - ((B - T) * v) / ymax]);
  const span = props.endAge - props.origin;
  const doneYear = Math.floor((n * 3) / 12);
  return (
    <>
      <Words text={TXT.chart_title} t={t} start={0.15} y={290} size={74} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          {props.people.map((p, i) => (
            <linearGradient key={i} id={`area${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={p.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {props.ticks.map((v, i) => {
          const y = B - ((B - T) * v) / ymax;
          return (
            <g key={i} opacity={a}>
              <line x1={L} x2={L + (R - L) * easeOut(ramp(t, 0.2 + i * 0.05, 0.6))} y1={y} y2={y} stroke={P.grid} strokeWidth={2} />
              <text x={L - 16} y={y + 14} textAnchor="end" style={{ fontFamily: "Poppins", fontWeight: 500, fontSize: 40 }} fill={P.muted}>{props.tickText[i]}</text>
            </g>
          );
        })}
        {[props.origin, A_.stop, B_.stop].map((ag, i) => (
          <text key={i} opacity={a} x={L + ((R - L) * (ag - props.origin)) / span} y={B + 60} textAnchor="middle" style={{ fontFamily: "Poppins", fontWeight: 500, fontSize: 40 }} fill={P.muted}>{ag}</text>
        ))}
        {[1, 0].map((i) => {
          const pp = pts(props.series[i]);
          if (pp.length < 2) return null;
          const d = pp.map((q, k) => `${k ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
          const [hx, hy] = pp[pp.length - 1];
          const col = props.people[i].color;
          return (
            <g key={i}>
              <path d={`${d} L${hx},${B} L${L},${B} Z`} fill={`url(#area${i})`} />
              <path d={d} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${col})` }} />
              <circle cx={hx} cy={hy} r={18 + 4 * Math.sin(t * 10)} fill={col} style={{ filter: `drop-shadow(0 0 20px ${col})` }} />
              <circle cx={hx} cy={hy} r={8} fill="#fff" />
            </g>
          );
        })}
      </svg>
      <Pill text={`Age ${props.origin + doneYear}`} y={1630} size={56} fg={P.bg} bg={P.text} k={a} />
      <Center y={1740} style={{ opacity: a }}>
        <span style={{ ...font(50, 700, A_.color), marginRight: 50 }}>{A_.name} {props.yearlyText[0][doneYear]}</span>
        <span style={font(50, 700, B_.color)}>{B_.name} {props.yearlyText[1][doneYear]}</span>
      </Center>
    </>
  );
};

// ---------------- the video ----------------
const SCENES: [number, number, (t: number) => React.ReactNode][] = [
  [S_HOOK, S_A, (t) => <Hook t={t} />],
  [S_A, S_B, (t) => <Coins t={t} i={0} />],
  [S_B, S_Q, (t) => <Coins t={t} i={1} />],
  [S_Q, S_CHART, (t) => <Question t={t} />],
  [S_CHART, S_RES, (t) => <Chart t={t} />],
];

export const Short: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = (frame / fps) * TEMPO;
  // camera: slow push-in per scene, punch on each cut, shake on the opening impact
  const cur = SCENES.find(([s, e]) => T >= s && T < e) ?? SCENES[SCENES.length - 1];
  const lt = T - cur[0];
  const punch = 0.035 * Math.exp(-lt * 6);
  const zoom = 1 + 0.025 * clamp(lt / 9) + punch + (T < 0.6 ? 0.07 * Math.exp(-T * 9) : 0);
  const shake = T < 0.8 ? 22 * Math.exp(-T * 10) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background T={T} />
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${Math.sin(T * 90) * shake}px, ${Math.cos(T * 77) * shake}px)` }}>
        {SCENES.map(([s, e, render], i) => {
          if (T < s - 0.01 || T >= e) return null;
          const t = T - s;
          const A = Math.min(i === 0 ? 1 : ramp(t, 0, 0.25), clamp((e - T) / 0.25));
          return (
            <AbsoluteFill key={i} style={{ opacity: A, filter: A < 1 ? `blur(${(1 - A) * 12}px)` : undefined, transform: `translateY(${(1 - A) * 30}px)` }}>
              {render(t)}
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: `${(T / 60) * 100}%`, background: P.accent, boxShadow: `0 0 20px ${P.accent}` }} />
    </AbsoluteFill>
  );
};
