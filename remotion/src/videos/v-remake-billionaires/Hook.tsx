/**
 * Hook: "Billionaires never sell their stock. So where's their cash?"
 * Sharma stands on a mountain of share certificates at night; on "never" a SELL button is stamped
 * out, on "cash" his wallet flips out empty and a moth flies off it.
 *
 * params: { worth: "{shares_amount}" }, events: never, cash
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Shares = props.shares!, Wallet = props.wallet!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { worth?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tNever = at(p, "never", 0.6), tCash = at(p, "cash", 1.8);
  const kSell = sp(0.1, 14), kX = sp(tNever, 9), kWallet = sp(tCash, 10);
  const ground = h * 0.78;
  // the mountain: rows of certificates, widest at the bottom, rising in quickly
  const rows = 6;
  const pile: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const n = rows - r + 2;
    for (let i = 0; i < n; i++) {
      const appear = clamp(1.3 - (r * 3 + i) * 0.035 + t * 5);   // built by frame 0: the hook frame is the richest
      if (appear <= 0) continue;
      const x = w * 0.5 + (i - (n - 1) / 2) * w * 0.11, y = ground - r * h * 0.055;
      pile.push(<g key={`${r}-${i}`} transform={`translate(${x},${y + (1 - appear) * -80}) scale(${appear})`} opacity={appear}><Shares s={h * 0.1} t={t + i} /></g>);
    }
  }
  const top = ground - rows * h * 0.055;
  const moth = clamp((t - tCash - 0.3) / 1.5);
  const push = 1.02 + 0.05 * t;   // the camera leans in all the way
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        <World kind="night" w={w} h={h} t={t} seed="hook-night" props={props} horizon={[{ prop: "mansion", x: 0.14, size: 0.12 }, { prop: "bank", x: 0.86, size: 0.13 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {pile}
          <Actor p={p} spec={{ who: "sharma", x: 0.5, scale: 1.55, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "cash", pose: "shrug", expression: "smirk" }] }} ground={top} index={0} />
          {/* the wallet, flipped out empty, and a moth leaving it */}
          {kWallet > 0 && <g transform={`translate(${w * 0.76},${h * 0.5}) scale(${kWallet}) rotate(${(1 - kWallet) * 40})`}><Wallet s={h * 0.12} t={t} /></g>}
          {moth > 0 && moth < 1 && (
            <g transform={`translate(${w * 0.76 + moth * w * 0.18},${h * 0.44 - moth * h * 0.18 + Math.sin(moth * 30) * 18})`} opacity={1 - moth * 0.7}>
              <ellipse cx={-14} cy={0} rx={16} ry={10 + Math.abs(Math.sin(t * 30)) * 8} fill="#d8cfc0" stroke="#1d2433" strokeWidth={3} />
              <ellipse cx={14} cy={0} rx={16} ry={10 + Math.abs(Math.sin(t * 30)) * 8} fill="#d8cfc0" stroke="#1d2433" strokeWidth={3} />
              <rect x={-3} y={-12} width={6} height={24} rx={3} fill="#1d2433" />
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {/* the SELL button, stamped out on "never" */}
      <div style={{ position: "absolute", left: w * 0.08, top: h * 0.42, transform: `scale(${kSell}) rotate(-6deg)` }}>
        <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 92, color: "#fff", background: "#2fb37a", padding: "10px 40px", borderRadius: 30,
          border: "8px solid #1d2433", boxShadow: "0 14px 0 #1d2433" }}>
          SELL
          {kX > 0 && <svg width={300} height={180} style={{ position: "absolute", left: -20, top: -20, overflow: "visible" }}>
            <path d="M20,20 L270,150 M270,20 L20,150" stroke="#e5484d" strokeWidth={26} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - clamp(kX))} />
          </svg>}
        </div>
      </div>
      {P.worth && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 112, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{P.worth}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
