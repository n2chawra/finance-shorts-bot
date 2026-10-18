/**
 * Channel art for "Paisa Panchayat": the YouTube profile picture (800×800, shown as a small circle)
 * and the banner (2560×1440; only the centre 1546×423 shows on every device, so everything that
 * must be read sits there). Drawn with the same cast as the videos.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST, SIKKA } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { Sikka } from "../cast/Sikka";
import { FONT } from "../design/fonts";

export const AVATAR = { width: 800, height: 800 } as const;
export const BANNER = { width: 2560, height: 1440 } as const;
const SAFE = { x: (2560 - 1546) / 2, y: (1440 - 423) / 2, w: 1546, h: 423 };

const TEAL = "#0d3b3e", TEAL_DEEP = "#071f22", CREAM = "#fff6e3", SAFFRON = "#ff9f1c";

/** Faint rupee signs and rising bars: the texture of the channel, kept quiet behind everything. */
const Texture: React.FC<{ w: number; h: number; step: number; opacity: number }> = ({ w, h, step, opacity }) => (
  <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: Math.ceil(h / step) + 1 }, (_, r) => Array.from({ length: Math.ceil(w / step) + 1 }, (_, c) => (
      <text key={`${r}-${c}`} x={c * step + (r % 2) * step / 2} y={r * step} fontFamily={FONT} fontWeight={800} fontSize={step * 0.42}
        fill={CREAM} opacity={opacity} textAnchor="middle">₹</text>
    )))}
  </svg>
);

export const ChannelAvatar: React.FC = () => {
  const { width: w, height: h } = AVATAR;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${TEAL}, ${TEAL_DEEP} 72%)` }}>
      <Texture w={w} h={h} step={130} opacity={0.05} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <circle cx={w / 2} cy={h * 0.47} r={300} fill={SAFFRON} opacity={0.16} />
        <Sikka x={w / 2} y={h * 0.47} size={430} expression="happy" armsUp />
      </svg>
    </AbsoluteFill>
  );
};

const Member: React.FC<{ id: string; pose: PoseName; expression: Expression; x: number; feet: number; scale: number; turn?: number }> = ({ id, pose, expression, x, feet, scale, turn = 0 }) => (
  <Character id={`art-${id}`} look={CAST[id]!.look} pose={{ ...POSES[pose], turn }} expression={expression} x={x} y={feet} scale={scale} gaze={[turn * 0.6, 0]} shadow={false} />
);

export const ChannelBanner: React.FC = () => {
  const { width: w, height: h } = BANNER;
  const feet = SAFE.y + SAFE.h + 6;     // the cast stands on the safe area's bottom edge
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, ${TEAL} 0%, ${TEAL_DEEP} 75%)`, overflow: "hidden" }}>
      <Texture w={w} h={h} step={150} opacity={0.045} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* the chaupal: a warm glow and the platform the council stands on */}
        <ellipse cx={w / 2} cy={feet} rx={980} ry={70} fill={SAFFRON} opacity={0.12} />
        <rect x={SAFE.x - 120} y={feet - 4} width={SAFE.w + 240} height={10} rx={5} fill={SAFFRON} opacity={0.55} />
        {/* the council at both ends of the safe area, leaving its middle 1,000 px to the name */}
        <Member id="sharma" pose="think" expression="thinking" x={SAFE.x + 80} feet={feet} scale={0.6} turn={0.35} />
        <Member id="priya" pose="stand" expression="smirk" x={SAFE.x + 215} feet={feet} scale={0.58} turn={0.3} />
        <Sikka x={SAFE.x + SAFE.w - 215} y={feet - 105} size={130} expression="happy" armsUp />
        <Member id="rohan" pose="wave" expression="laugh" x={SAFE.x + SAFE.w - 80} feet={feet} scale={0.6} turn={-0.35} />
      </svg>
      <div style={{ position: "absolute", left: SAFE.x + 290, width: SAFE.w - 580, top: SAFE.y + 40, textAlign: "center", fontFamily: FONT, whiteSpace: "nowrap" }}>
        <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1, color: CREAM, letterSpacing: -2, textShadow: "0 8px 0 rgba(0,0,0,0.3)" }}>
          Paisa <span style={{ color: SIKKA.gold }}>Panchayat</span>
        </div>
        <div style={{ marginTop: 22, fontWeight: 600, fontSize: 36, color: CREAM, opacity: 0.92 }}>
          One money question. Real maths. A clear verdict.
        </div>
        <div style={{ marginTop: 26, display: "inline-flex", gap: 14 }}>
          {["Daily Shorts", "Money news", "Deep-dive explainers"].map((t) => (
            <span key={t} style={{ padding: "7px 20px", borderRadius: 999, background: "rgba(255,159,28,0.18)", border: `2px solid ${SAFFRON}`, color: CREAM, fontWeight: 700, fontSize: 26 }}>{t}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
