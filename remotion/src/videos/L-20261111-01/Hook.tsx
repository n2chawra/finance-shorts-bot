/**
 * Hook: "This is {note_amount}. Now picture {room_final_long}: one warehouse room packed with
 * {notes_years} of these notes. Sounds huge? That room is the smallest way to see a billion."
 * The Short's hook picture at 16:9: one hundred-dollar note fills the vault's spotlight with Sharma
 * beside it (the same prop and the same cast member as v-20261027-01). On "picture" the camera pulls
 * back and the note becomes rows of shrink-wrapped pallets stacked to the ceiling, the figure on top
 * swapping to the billion; on "notes" the count chip drops in; on "huge" Sharma shrugs; on "smallest"
 * the pallets shrink into one small warehouse in the middle of a dark plain and a gold question chip
 * lands over it.
 *
 * params: { note, big, count, question }
 * events: this, picture, notes, huge, smallest
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { SETS } from "../../studio/sets";
import props from "./props";

const Hundred = props.hundred!, Pallet = props.pallet!, Room = props.warehouse!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { note?: string; big?: string; count?: string; question?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tPic = at(p, "picture", 1.4), tNotes = at(p, "notes", 4.0), tSmall = at(p, "smallest", 7.5);
  const pull = ease((t - tPic) / 0.9);
  const shrink = ease((t - tSmall) / 1.1);
  const zoom = (1.22 - 0.3 * pull + 0.015 * t) * (1 - 0.0 * shrink);
  const Vault = SETS.vault!;
  const ground = h * 0.82;
  const box = safeBox(w, h), mt = minText(w, h);
  const pallets: React.ReactNode[] = [];
  const rows = 4, cols = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = clamp((t - tPic - (r * cols + c) * 0.025) * 4);
      if (k <= 0) continue;
      const x = w * (0.3 + c * 0.1), y = ground - r * h * 0.12;
      const sx = w * 0.62 + (x - w * 0.62) * (1 - 0.85 * shrink), sy = h * 0.62 + (y - h * 0.62) * (1 - 0.85 * shrink);
      pallets.push(<g key={`${r}-${c}`} transform={`translate(${sx},${sy - (1 - k) * 200}) scale(${(0.4 + 0.6 * k) * (1 - 0.85 * shrink)})`} opacity={k * (1 - shrink)}><Pallet s={h * 0.13} t={t + c} /></g>);
    }
  }
  const noteK = 1 - clamp((t - tPic) * 2.5);
  const kRoom = clamp((t - tSmall - 0.5) * 2);
  const kCount = sp(tNotes, 10), kQ = sp(tSmall + 0.9, 9);
  const fig = (text: string, k: number, color: string) => (
    <div style={{ position: "absolute", left: w * 0.6, top: Math.max(box.y0, h * 0.06), transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), whiteSpace: "nowrap",
      fontFamily: FONT, fontWeight: 900, fontSize: Math.max(mt, fitLine(text, 130, w * 0.6)), color, WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
      filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{text}</div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}>
        <Vault.back w={w} h={h} t={t} seed={`${p.beat.id}v`} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 60% 45%, rgba(255,230,160,${0.3 - 0.2 * shrink}), rgba(0,0,0,${0.4 + 0.45 * shrink}) 72%)` }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {pallets}
          {kRoom > 0 && <g transform={`translate(${w * 0.62},${h * 0.72}) scale(${kRoom})`}><Room s={h * 0.3} t={t} k={1} /></g>}
          {noteK > 0 && <g transform={`translate(${w * 0.62},${h * 0.62}) scale(${0.9 + 0.5 * noteK}) rotate(${-4 + Math.sin(t * 2) * 2})`} opacity={noteK}>
            <Hundred s={h * 0.24} t={t} /></g>}
          <Actor p={p} spec={{ who: "sharma", x: 0.17, scale: 1.25, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "picture", pose: "pointUp", expression: "proud" },
            { at: "huge", pose: "shrug", expression: "smirk" }, { at: "smallest", pose: "point", expression: "thinking", turn: 0.4 }] }} ground={h * 0.92} index={0} />
        </svg>
      </AbsoluteFill>
      {P.note && noteK > 0 && fig(P.note, 1, "#b8f5c4")}
      {P.big && t >= tPic && fig(P.big, sp(tPic + 0.15, 9) * (1 - 0.3 * shrink), "#ffd84a")}
      {P.count && kCount > 0 && (
        <div style={{ position: "absolute", left: w * 0.6, top: h * 0.27, transform: `translate(-50%,0) scale(${kCount}) rotate(-2deg)`, opacity: 1 - shrink, whiteSpace: "nowrap",
          fontFamily: FONT, fontWeight: 900, fontSize: Math.max(mt, fitLine(P.count, 64, w * 0.4)), color: "#fff", background: "#1f8f55", border: "6px solid #fff",
          borderRadius: 20, padding: "4px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>{P.count}</div>
      )}
      {P.question && kQ > 0 && (
        <div style={{ position: "absolute", left: w * 0.62, top: h * 0.3, transform: `translate(-50%,0) scale(${kQ}) rotate(-3deg)`, whiteSpace: "nowrap",
          fontFamily: FONT, fontWeight: 900, fontSize: Math.max(mt, fitLine(P.question, 72, w * 0.45, { upper: true })), color: "#1d2433", background: "#ffd34d",
          border: "6px solid #fff", borderRadius: 20, padding: "4px 28px", textTransform: "uppercase", boxShadow: "0 10px 0 rgba(0,0,0,0.4)" }}>{P.question}</div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
