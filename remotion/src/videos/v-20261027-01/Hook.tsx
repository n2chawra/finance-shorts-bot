/**
 * Hook: "This is $100. Now picture $1 billion."
 * One hundred-dollar bill fills the frame in the vault's spotlight with Sharma beside it; on
 * "picture" the camera pulls far back and the bill becomes rows of shrink-wrapped pallets of cash
 * stacked to the vault's ceiling, and the figure on top swaps to the billion.
 *
 * params: { note: "{note_amount}", big: "{room_final_long}" }, events: this, picture
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Hundred = props.hundred!, Pallet = props.pallet!;

const Figure: React.FC<{ text: string; k: number; color: string; top: number }> = ({ text, k, color, top }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${k})`, opacity: clamp(k * 2) }}>
    <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 128, color, WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
      filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))", whiteSpace: "nowrap" }}>{text}</span>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { note?: string; big?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tPic = at(p, "picture", 1.4);
  const pull = ease((t - tPic) / 0.9);                 // 0 → 1 as the camera pulls back
  const zoom = 1.25 - 0.35 * pull + 0.02 * t;
  const Vault = SETS.vault!;
  const ground = h * 0.8;
  // the pallets: rows that appear back to front after "picture", up to the ceiling
  const pallets: React.ReactNode[] = [];
  const rows = 4, cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = clamp((t - tPic - (r * cols + c) * 0.03) * 4);
      if (k <= 0) continue;
      const x = w * (0.14 + c * 0.18), y = ground - r * h * 0.115;
      pallets.push(<g key={`${r}-${c}`} transform={`translate(${x},${y - (1 - k) * 200}) scale(${0.4 + 0.6 * k})`} opacity={k}><Pallet s={h * 0.12} t={t + c} /></g>);
    }
  }
  const noteK = 1 - clamp((t - tPic) * 2.5);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}>
        <Vault.back w={w} h={h} t={t} seed={`${p.beat.id}v`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 45%, rgba(255,230,160,0.28), rgba(0,0,0,0.4) 72%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {pallets}
          {noteK > 0 && <g transform={`translate(${w * 0.58},${h * 0.55}) scale(${0.5 + 0.3 * noteK}) rotate(${-4 + Math.sin(t * 2) * 2})`} opacity={noteK}>
            <Hundred s={h * 0.2} t={t} /></g>}
          <Actor p={p} spec={{ who: "sharma", x: 0.24, scale: 1.3, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "picture", pose: "pointUp", expression: "proud" }] }} ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {P.note && <Figure text={P.note} k={noteK > 0 ? 1 : 0} color="#b8f5c4" top={h * 0.13} />}
      {P.big && <Figure text={P.big} k={sp(tPic + 0.15, 9)} color="#ffd84a" top={h * 0.13} />}
    </AbsoluteFill>
  );
};

export default Hook;
