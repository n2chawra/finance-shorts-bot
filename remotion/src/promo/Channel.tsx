/** Channel art (owner, 2026-10-31): the YouTube banner (2560×1440, everything that matters inside the
 * 1546×423 safe area every device shows) and the profile picture (800×800, read as a small circle). */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import { POSES } from "../cast/poses";
import { Sikka } from "../cast/Sikka";
import { FONT } from "../design/fonts";
import { CashStack } from "../studio/money";

const W = 2560, H = 1440, SAFE_W = 1546, SAFE_H = 423;
const SX = (W - SAFE_W) / 2, SY = (H - SAFE_H) / 2;

export const ChannelBanner: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #1f3fa8 0%, #0d1846 45%, #070a1c 85%)", overflow: "hidden" }}>
    {/* soft city lights behind, so the wide TV view isn't empty */}
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: 34 }, (_, i) => {
        const x = (i / 34) * W, bh = 160 + ((i * 97) % 260);
        return <rect key={i} x={x} y={H - 300 - bh} width={W / 34 - 10} height={bh + 300} fill="#16225e" opacity={0.7} />;
      })}
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={`l${i}`} cx={(i * 211) % W} cy={160 + ((i * 131) % 520)} r={30 + (i % 4) * 22} fill="#ffd84a" opacity={0.06} />
      ))}
      {/* money stacks rising on the left, the cast on the right: outside the text, inside the desktop strip */}
      <CashStack x={SX + 70} ground={SY + SAFE_H + 20} width={110} full={220} k={1} cur="USD" textShown={false} seed="b1" />
      <CashStack x={SX + 210} ground={SY + SAFE_H + 20} width={110} full={330} k={1} cur="USD" textShown={false} seed="b2" />
      <CashStack x={SX - 120} ground={SY + SAFE_H + 20} width={110} full={140} k={1} cur="USD" textShown={false} seed="b3" />
      <Character id="ban-sharma" look={CAST.sharma!.look} pose={POSES.point} expression="smirk" x={SX + SAFE_W - 90} y={SY + SAFE_H + 30} scale={0.78} shadow={false} />
      <Sikka x={SX + SAFE_W + 120} y={SY + SAFE_H - 150} size={170} expression="happy" armsUp />
    </svg>
    {/* the promise, centred in the safe area */}
    <div style={{ position: "absolute", left: SX + 250, width: SAFE_W - 500, top: SY + 60, textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 86, lineHeight: 1.02, letterSpacing: -2, textTransform: "uppercase", color: "#fff",
        WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,0.45)" }}>
        How the rich <span style={{ color: "#ffd84a" }}>really</span> make money
      </div>
      <div style={{ marginTop: 22, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "#cfe0ff", whiteSpace: "nowrap" }}>
        True stories in 30 seconds · new every day
      </div>
    </div>
    {guides && <div style={{ position: "absolute", left: SX, top: SY, width: SAFE_W, height: SAFE_H, border: "4px dashed #ff4d4d" }} />}
  </AbsoluteFill>
);

/** The profile picture: Sikka, the channel's coin, big on a bold ring, readable as a 98 px circle. */
export const ChannelAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #2f63e0 0%, #0d1846 70%)" }}>
    <svg width={800} height={800} style={{ position: "absolute" }}>
      <circle cx={400} cy={400} r={330} fill="none" stroke="#ffd84a" strokeWidth={26} opacity={0.9} />
      <Sikka x={400} y={360} size={430} expression="happy" armsUp />
    </svg>
  </AbsoluteFill>
);
