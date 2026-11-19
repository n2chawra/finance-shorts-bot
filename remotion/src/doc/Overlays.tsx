/**
 * Screen-space overlays that sit over any picture: a lower third (who or where), a chapter card, and the
 * source tag every claim carries ("Source: Form 10-K, Example Holdings Inc. · Apr 2, 2001"; the channel
 * attributes each claim on screen, research/verdict.md).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { LONG, SHORT } from "../design/frame";
import { clamp01, DISPLAY, DOC, fs, MONO, outBack, outCubic, roman, SANS, SERIF, smooth, unit } from "./theme";

/** The small source line. `k` 0..1 fades and slides it in. */
/** Where the bottom-left source tag sits; a callout stacked with it uses the same corner. */
export const sourceTagPlace = (w: number, h: number) => {
  const v = h > w;
  return { left: v ? 60 : 64, bottom: v ? 400 : (v ? SHORT : LONG).bottomSafe + 30 };
};

/** `inline`: no position of its own, for stacking in a parent's column (e.g. under a quote callout). */
export const SourceTag: React.FC<{ text: string; w: number; h: number; k?: number; pos?: "bottom-left" | "top-right"; inline?: boolean }> = ({ text, w, h, k = 1, pos = "bottom-left", inline = false }) => {
  if (k <= 0 || !text) return null;
  const v = h > w;
  const f = v ? SHORT : LONG;
  const size = f.minText;
  const place: React.CSSProperties = inline ? { position: "relative", alignSelf: "flex-start" } : pos === "top-right"
    ? { position: "absolute", right: v ? 150 : 60, top: v ? 200 : 44 }
    : { position: "absolute", ...sourceTagPlace(w, h) };
  return (
    <div style={{ ...place, maxWidth: w * (v ? 0.8 : 0.6), opacity: k, transform: `translateY(${(1 - outCubic(k)) * 12}px)`,
      display: "flex", alignItems: "center", gap: size * 0.45, fontFamily: SANS, fontSize: size, lineHeight: 1.2, color: "rgba(243,239,230,0.92)",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)", background: "rgba(8,10,16,0.62)", padding: `${size * 0.2}px ${size * 0.5}px`, borderRadius: size * 0.25 }}>
      <span style={{ fontWeight: 800, fontSize: size, letterSpacing: size * 0.12, color: DOC.gold, flex: "none" }}>SOURCE</span>
      <span style={{ fontWeight: 500 }}>{text}</span>
    </div>
  );
};

/** A lower third: a gold rule, the name, the role or place under it. In at `inAt`, out at `outAt`. */
export const LowerThird: React.FC<{ name: string; role?: string; t: number; w: number; h: number; inAt?: number; outAt?: number }> = ({
  name, role, t, w, h, inAt = 0, outAt,
}) => {
  const v = h > w;
  const kin = smooth((t - inAt) / 14);
  const kout = outAt === undefined ? 0 : smooth((t - outAt) / 10);
  const k = kin * (1 - kout);
  if (k <= 0.001) return null;
  const big = fs(w, h, v ? 64 : 56), small = fs(w, h, v ? 40 : 32);
  const x = v ? 60 : w * 0.055, top = v ? h * 0.42 : h * 0.66;   // a Short: above the caption band (1110-1350 px)
  const u = unit(w, h);
  return (
    <div style={{ position: "absolute", left: x, top, display: "flex", alignItems: "stretch", gap: 22 * u, opacity: clamp01(k * 1.4) }}>
      <div style={{ width: 8 * u, background: DOC.gold, transformOrigin: "50% 0%", transform: `scaleY(${outCubic(kin)})`, boxShadow: `0 0 ${18 * u}px rgba(232,176,74,0.55)` }} />
      <div style={{ clipPath: `inset(0 ${(1 - outCubic(kin)) * 100}% 0 0)`, background: "linear-gradient(90deg, rgba(8,10,16,0.82), rgba(8,10,16,0.55) 70%, rgba(8,10,16,0))",
        padding: `${14 * u}px ${80 * u}px ${16 * u}px ${18 * u}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: big, lineHeight: 1.05, color: DOC.text, letterSpacing: -0.5 }}>{name}</div>
        {role ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: small, lineHeight: 1.3, color: DOC.muted, marginTop: 6 * u, letterSpacing: 0.5 }}>{role}</div> : null}
      </div>
    </div>
  );
};

/** A chapter card: "CHAPTER II" in gold caps, the title in a big serif rising word by word, a rule
 * drawing under it. Full frame over a dark plate (`plate`: 0 lets the picture under it show). */
export type ChapterStyle = "serif" | "caps" | "tape";

/* In a Short every piece here keeps out of the caption band (about 1110-1350 px of 1920: fx/chunkCaptions). */
export const ChapterCard: React.FC<{ n?: number; title: string; kicker?: string; t: number; end: number; w: number; h: number; on?: number; plate?: number; style?: ChapterStyle }> = ({
  n, title, kicker, t, end, w, h, on = 4, plate = 0.78, style = "serif",
}) => {
  if (style === "caps") return <CapsChapter n={n} title={title} kicker={kicker} t={t} end={end} w={w} h={h} on={on} plate={plate} />;
  if (style === "tape") return <TapeChapter n={n} title={title} kicker={kicker} t={t} end={end} w={w} h={h} on={on} />;
  const v = h > w;
  const u = unit(w, h);
  const words = title.split(" ");
  const rule = outCubic((t - on - 6) / 22);
  const drift = 1 + 0.03 * (t / Math.max(1, end));
  const size = fs(w, h, v ? 120 : 112);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(20,27,40,${plate}) 0%, rgba(5,7,12,${Math.min(1, plate + 0.15)}) 100%)` }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: v ? "flex-start" : "center", justifyContent: v ? "flex-start" : "center", padding: v ? `${h * 0.28}px 70px 0` : 0, transform: `scale(${drift})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, 34), letterSpacing: 12 * u, color: DOC.gold, opacity: smooth((t - on) / 10),
          transform: `translateY(${(1 - smooth((t - on) / 10)) * 14 * u}px)` }}>
          {kicker ?? "CHAPTER"}{n !== undefined ? ` ${roman(n)}` : ""}
        </div>
        <div style={{ height: 6 * u }} />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: DOC.text, textAlign: v ? "left" : "center", maxWidth: w * (v ? 0.86 : 0.8),
          textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
          {words.map((wd, i) => {
            const k = outCubic((t - on - 3 - i * 3) / 14);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: size * 0.24, opacity: k, transform: `translateY(${(1 - k) * size * 0.35}px)`, filter: `blur(${(1 - k) * 6}px)` }}>{wd}</span>
            );
          })}
        </div>
        <div style={{ height: 30 * u }} />
        <div style={{ width: (v ? w * 0.5 : w * 0.22) * rule, height: 3 * u, background: `linear-gradient(90deg, ${DOC.gold}, rgba(232,176,74,0.2))` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type ChapterProps = { n?: number; title: string; kicker?: string; t: number; end: number; w: number; h: number; on: number; plate?: number };

/** "CHAPTER 2:" small in red heavy slanted caps over the title in big white heavy slanted caps, low on
 * the frame, over the picture under it (the Bagholder Association card, style-study w1.md). Anton, slanted. */
const CapsChapter: React.FC<ChapterProps> = ({ n, title, kicker, t, end, w, h, on, plate = 0.35 }) => {
  const v = h > w;
  const u = unit(w, h);
  const k1 = outCubic((t - on) / 10), k2 = outCubic((t - on - 5) / 12);
  const drift = 1 + 0.02 * (t / Math.max(1, end));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${plate * 0.4}) 30%, rgba(0,0,0,${Math.min(1, plate + 0.35)}) 100%)` }} />
      <div style={{ position: "absolute", left: v ? 70 : w * 0.07, right: v ? 150 : w * 0.07, bottom: v ? h * 0.46 : h * 0.14, transform: `scale(${drift})`, transformOrigin: "0% 100%" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: fs(w, h, 48), color: DOC.red, transform: `skewX(-9deg) translateX(${(1 - k1) * -30 * u}px)`, opacity: k1,
          letterSpacing: 1, textShadow: "0 3px 10px rgba(0,0,0,0.5)" }}>{(kicker ?? "CHAPTER").toUpperCase()}{n !== undefined ? ` ${n}:` : ":"}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: fs(w, h, v ? 124 : 140), lineHeight: 1.0, color: "#ffffff", textTransform: "uppercase", letterSpacing: 1,
          transform: `skewX(-9deg) translateY(${(1 - k2) * 30 * u}px)`, opacity: k2, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

/** A label-maker tape on paper: black embossed tape, the words in white typewriter caps
 * (the GroBez-style card, style-study w3.md), punched out letter by letter. */
const TapeChapter: React.FC<ChapterProps> = ({ n, title, kicker, t, end, w, h, on }) => {
  const u = unit(w, h);
  const text = `${n !== undefined ? `${String(n).padStart(2, "0")} · ` : ""}${kicker ? `${kicker} · ` : ""}${title}`.toUpperCase();
  const shown = Math.max(0, Math.min(text.length, Math.floor((t - on) * 0.9)));
  const drift = 1 + 0.03 * (t / Math.max(1, end));
  const size = fs(w, h, 64);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 45% 40%, #efe8d8 0%, #d8cfba 70%, #b8ad94 100%)", display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: h > w ? h * 0.2 : 0 }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(80,60,30,0.07) 1px, transparent 1.5px)", backgroundSize: `${6 * u}px ${6 * u}px` }} />
      <div style={{ transform: `scale(${drift}) rotate(-2deg)`, background: "linear-gradient(180deg, #2a2a2e, #141416 60%, #232327)", padding: `${16 * u}px ${34 * u}px`,
        borderRadius: 6 * u, boxShadow: `0 ${10 * u}px ${24 * u}px rgba(0,0,0,0.35), inset 0 ${2 * u}px 0 rgba(255,255,255,0.08)`, maxWidth: w * 0.86,
        opacity: t >= on ? 1 : 0 }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, color: "#f4f1ea", textShadow: `0 ${1 * u}px 0 rgba(0,0,0,0.9), 0 ${-1 * u}px 0 rgba(255,255,255,0.25)` }}>
          {text.slice(0, shown)}<span style={{ opacity: 0 }}>{text.slice(shown)}</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** A label on footage: one spoken spec or figure in heavy black on a white box, lower left, on its word
 * (the fryer temperature in style-study w1.md). `tone` "red" for a warning tag. Figures from params.fig only. */
export const LabelBox: React.FC<{ text: string; sub?: string; t: number; w: number; h: number; inAt?: number; outAt?: number; tone?: "white" | "red" }> = ({
  text, sub, t, w, h, inAt = 0, outAt, tone = "white",
}) => {
  const v = h > w;
  const u = unit(w, h);
  const k = outBack((t - inAt) / 10) * (outAt === undefined ? 1 : 1 - smooth((t - outAt) / 8));
  if (k <= 0.01) return null;
  const bg = tone === "red" ? DOC.red : "#ffffff", fg = tone === "red" ? "#ffffff" : "#0d0f14";
  return (
    <div style={{ position: "absolute", left: v ? 60 : w * 0.06, top: v ? h * 0.44 : h * 0.68, transform: `scale(${k})`, transformOrigin: "0% 100%",
      background: bg, color: fg, padding: `${10 * u}px ${24 * u}px ${12 * u}px`, boxShadow: `0 ${12 * u}px ${30 * u}px rgba(0,0,0,0.45)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: fs(w, h, 62), lineHeight: 1.05, letterSpacing: -0.5 }}>{text}</div>
      {sub ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, 30), lineHeight: 1.2, opacity: 0.75 }}>{sub}</div> : null}
    </div>
  );
};
