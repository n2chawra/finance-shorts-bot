/**
 * The payoff: "A whole career, 40 years of that pay, is $2 million. A couple of briefcases, next to
 * a room." On "career" a paycheck flutters in, on "briefcases" two little briefcases drop onto the
 * floor with the career's figure; on "room" the wall of pallets slides in beside them, dwarfing
 * them, with the billion on its tag. Sharma shrugs between the two.
 *
 * params: { career: "{career_total}", room: "{room_final_long}" }, events: career, pay, couple, briefcases, room
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Briefcase = props.briefcase!, Pallet = props.pallet!, Paycheck = props.paycheck!;

const Tag: React.FC<{ x: number; y: number; label: string; value: string; color: string; k: number }> = ({ x, y, label, value, color, k }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), textAlign: "center",
    background: "#fff", border: `6px solid ${color}`, borderRadius: 22, padding: "8px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#3f4656", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 66, color, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
  </div>
);

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { career?: string; room?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tCareer = at(p, "career", 0.4), tPay = at(p, "pay", 1.4), tCouple = at(p, "couple", 2.6), tCases = at(p, "briefcases", 3.0), tRoom = at(p, "room", 4.2);
  const kPay = sp(tCareer), kCase1 = sp(tCouple, 9), kCase2 = sp(tCases, 9), kRoom = sp(tRoom, 13);
  const Bank = SETS.bank!;
  const ground = h * 0.66;
  const pull = 1.12 - 0.12 * clamp((t - tRoom) / 0.8);
  const wall: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const k = clamp((t - tRoom - (r * 3 + c) * 0.04) * 4);
    if (k > 0) wall.push(<g key={`${r}${c}`} transform={`translate(${w * (0.6 + c * 0.13)},${ground - r * h * 0.085 - (1 - k) * 160})`} opacity={k}><Pallet s={h * 0.09} t={t + c} /></g>);
  }
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${pull})`, transformOrigin: "50% 60%" }}>
        <Bank.back w={w} h={h} t={t} seed={`${p.beat.id}b`} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kPay > 0 && <g transform={`translate(${w * 0.24},${h * 0.36 + (1 - kPay) * -300 + Math.sin(t * 3) * 10}) rotate(${Math.sin(t * 2) * 8})`} opacity={clamp(kPay * 2) * (1 - clamp((t - tCouple) * 2))}><Paycheck s={h * 0.1} t={t} /></g>}
          {kCase1 > 0 && <g transform={`translate(${w * 0.16},${ground - (1 - kCase1) * 400})`}><Briefcase s={h * 0.07} t={t} state="shut" /></g>}
          {kCase2 > 0 && <g transform={`translate(${w * 0.32},${ground - (1 - kCase2) * 400})`}><Briefcase s={h * 0.07} t={t + 1} state="shut" /></g>}
          {wall}
          <Actor p={p} spec={{ who: "sharma", x: 0.46, scale: 1.35, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "briefcases", pose: "shrug", expression: "smirk" }, { at: "room", pose: "pointUp", expression: "proud" }] }} ground={h * 0.9} index={0} />
        </svg>
      </AbsoluteFill>
      {P.career && <Tag x={w * 0.25} y={h * 0.13} label="A career" value={P.career} color="#c92a2a" k={Math.max(kCase1, 0)} />}
      {P.room && <Tag x={w * 0.72} y={h * 0.13} label="The room" value={P.room} color="#1f8f55" k={kRoom} />}
    </AbsoluteFill>
  );
};

export default Payoff;
