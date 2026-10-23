/**
 * Custom hook for "why the rich borrow and the poor pay it back": the same day, two loans. The
 * frame splits down a white seam: Rohan in his rented flat on the left with his new car, Priya in
 * the bank hall on the right with her house. A SAME DAY stamp lands first; on "car" the car's
 * price tag drops from what he paid to what it is worth now (red, an arrow down); on "house" the
 * house's tag climbs from its price to what it could be worth (green, an arrow up). Built only
 * from the studio kit (motion-direction skill).
 *
 * params: { stamp, left, right, leftFrom, leftFig, rightFrom, rightFig }, events: same, car, house
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const Car: React.FC<{ x: number; y: number; s: number; sag: number }> = ({ x, y, s, sag }) => (
  <g transform={`translate(${x},${y}) rotate(${sag * 4}) scale(${s})`}>
    <ellipse cx={0} cy={58} rx={190} ry={16} fill="#000" opacity={0.35} />
    <path d="M -180 20 Q -176 -20 -130 -26 L -80 -30 L -40 -82 Q -30 -92 -10 -92 L 80 -92 Q 100 -92 112 -80 L 150 -32 Q 186 -26 188 10 L 188 34 L -180 34 Z"
      fill="#e03131" stroke="#7a1010" strokeWidth={6} />
    <path d="M -28 -76 L 30 -76 L 30 -36 L -62 -36 Z" fill="#a5d8ff" stroke="#7a1010" strokeWidth={4} />
    <path d="M 44 -76 L 104 -76 L 132 -36 L 44 -36 Z" fill="#a5d8ff" stroke="#7a1010" strokeWidth={4} />
    <rect x={160} y={-8} width={26} height={14} rx={5} fill="#ffe066" />
    {[-110, 120].map((cx) => <g key={cx}><circle cx={cx} cy={36} r={34} fill="#1f2937" /><circle cx={cx} cy={36} r={14} fill="#adb5bd" /></g>)}
  </g>
);

const House: React.FC<{ x: number; y: number; s: number; glow: number }> = ({ x, y, s, glow }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={200} ry={16} fill="#000" opacity={0.3} />
    <circle cx={0} cy={-150} r={230} fill="#7cf0b2" opacity={0.18 * glow} />
    <rect x={-150} y={-190} width={300} height={194} fill="#f1e3c8" stroke="#5c3d1e" strokeWidth={6} />
    <path d="M -185 -186 L 0 -320 L 185 -186 Z" fill="#c2410c" stroke="#5c3d1e" strokeWidth={6} />
    <rect x={-30} y={-96} width={60} height={100} fill="#8d5524" stroke="#5c3d1e" strokeWidth={5} />
    {[-100, 60].map((wx) => <rect key={wx} x={wx} y={-160} width={44} height={44} fill={glow > 0.5 ? "#ffe066" : "#a5d8ff"} stroke="#5c3d1e" strokeWidth={5} />)}
    <rect x={88} y={-300} width={34} height={70} fill="#7c2d12" />
  </g>
);

/** A price tag on a string: the old figure crossed out, the new one sliding in with an arrow. */
const Tag: React.FC<{ x: number; y: number; label: string; from: string; to: string; k: number; good: boolean; swing: number; note?: string }> = ({ x, y, label, from, to, k, good, swing, note }) => (
  <div style={{ position: "absolute", left: x - 260, top: y, width: 520, transform: `rotate(${swing}deg)`, transformOrigin: "50% -50px",
    background: "#fff", borderRadius: 26, border: `8px solid ${good ? "#1f8f55" : "#c92a2a"}`, textAlign: "center", padding: "10px 12px 14px",
    fontFamily: FONT, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
    <div style={{ fontWeight: 800, fontSize: 40, color: "#343a40" }}>{label}</div>
    <div style={{ position: "relative", fontWeight: 800, fontSize: 52, color: "#868e96", height: 62 }}>
      {from}
      <div style={{ position: "absolute", left: "18%", right: "18%", top: 30, height: 7, background: good ? "#1f8f55" : "#c92a2a",
        transform: `scaleX(${clamp(k * 2)})`, transformOrigin: "0 50%" }} />
    </div>
    <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: good ? "#1f8f55" : "#e03131", opacity: clamp(k * 2 - 0.4),
      transform: `translateY(${(1 - clamp(k)) * (good ? 40 : -40)}px)` }}>
      {good ? "▲ " : "▼ "}{to}
    </div>
    {note && <div style={{ fontWeight: 700, fontSize: 40, color: "#495057", fontStyle: "italic", opacity: clamp(k * 2 - 0.6) }}>{note}</div>}
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { note?: string; stamp?: string; left?: string; right?: string; leftFrom?: string; leftFig?: string; rightFrom?: string; rightFig?: string };
  const sp = (start: number, damping = 12) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
  const tCar = at(p, "car", 1.6), tHouse = at(p, "house", 3.2);
  const inL = 1, inR = 1, kStamp = sp(0, 10);
  const kCar = sp(tCar, 14), kHouse = sp(tHouse, 14);
  const tagL = 1, tagR = 1;
  // the camera leans toward whichever side is being talked about
  const lean = clamp((t - tHouse) / 0.8) - clamp((t - tCar) / 0.8) * 0.5;
  const seam = 0.5 + 0.015 * Math.sin(t * 1.2);
  const Flat = SETS.flat!, Bank = SETS.bank!;
  const ground = h * 0.93;
  const half = (side: "L" | "R", node: React.ReactNode) => (
    <AbsoluteFill style={{ clipPath: side === "L" ? `polygon(0 0, ${seam * 100 + 3}% 0, ${seam * 100 - 3}% 100%, 0 100%)` : `polygon(${seam * 100 + 3}% 0, 100% 0, 100% 100%, ${seam * 100 - 3}% 100%)`,
      transform: `translateX(${side === "L" ? (inL - 1) * w * 0.6 : (1 - inR) * w * 0.6}px)` }}>{node}</AbsoluteFill>
  );
  const swing = (k: number, s: number) => Math.sin(t * 2 + s) * 2.5 + (k > 0 ? Math.sin(k * 9) * 6 * (1 - clamp(k)) : 0);
  const carSag = clamp(kCar);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", transform: `scale(${1 + 0.008 * t}) translateX(${-lean * 12}px)` }}>
      {half("L", <>
        <AbsoluteFill style={{ transform: `scale(1.25) translateX(${-w * 0.1}px)`, transformOrigin: "50% 60%" }}><Flat.back w={w} h={h} t={t} seed={`${p.beat.id}L`} /></AbsoluteFill>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <Car x={w * 0.33} y={ground - 40} s={1.15 - 0.08 * carSag} sag={carSag} />
          <Actor p={p} spec={{ who: "rohan", x: 0.12, scale: 1.55, turn: 0.3, acting: [{ sec: 0, pose: "celebrate", expression: "laugh" }, { at: "car", pose: "worried", expression: "shock" }] }} ground={ground} index={0} />
        </svg>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(255,90,90,${0.08 + 0.12 * carSag}), rgba(120,0,0,${0.2 + 0.15 * carSag}))` }} />
      </>)}
      {half("R", <>
        <AbsoluteFill style={{ transform: `scale(1.25) translateX(${w * 0.1}px)`, transformOrigin: "50% 60%" }}><Bank.back w={w} h={h} t={t} seed={`${p.beat.id}R`} /></AbsoluteFill>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <House x={w * 0.67} y={ground - 20} s={1 + 0.06 * clamp(kHouse)} glow={clamp(kHouse)} />
          <Actor p={p} spec={{ who: "priya", x: 0.88, scale: 1.55, turn: -0.3, acting: [{ sec: 0, pose: "present", expression: "thinking" }, { at: "house", pose: "celebrate", expression: "happy" }] }} ground={ground} index={1} />
        </svg>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(90,255,170,${0.05 + 0.08 * clamp(kHouse)}), rgba(0,80,40,0.2))` }} />
      </>)}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <line x1={w * (seam + 0.03)} y1={0} x2={w * (seam - 0.03)} y2={h} stroke="#fff" strokeWidth={12}
          strokeDasharray={h * 1.1} strokeDashoffset={h * 1.1 * (1 - clamp(t / 0.5))} />
      </svg>
      <div style={{ opacity: clamp(tagL * 2), transform: `translateY(${(1 - clamp(tagL)) * -60}px)` }}>
        <Tag x={w * 0.3} y={h * 0.22} label={P.left ?? ""} from={P.leftFrom ?? ""} to={P.leftFig ?? ""} k={kCar} good={false} swing={swing(kCar, 0)} />
      </div>
      <div style={{ opacity: clamp(tagR * 2), transform: `translateY(${(1 - clamp(tagR)) * -60}px)` }}>
        <Tag x={w * 0.7} y={h * 0.22} label={P.right ?? ""} from={P.rightFrom ?? ""} to={P.rightFig ?? ""} k={kHouse} good swing={swing(kHouse, 1.3)} note={P.note} />
      </div>
      {/* the stamp: the same day for both */}
      <div style={{ position: "absolute", left: w * 0.5, top: h * 0.06, transform: `translate(-50%,0) scale(${1.25 - 0.25 * clamp(kStamp)}) rotate(-3deg)`, opacity: clamp(kStamp * 3) }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#1b1b1b", background: "#ffd43b", padding: "2px 36px", borderRadius: 22,
          border: "7px solid #fff", boxShadow: "0 12px 0 rgba(0,0,0,0.45)", whiteSpace: "nowrap", textTransform: "uppercase" }}>{P.stamp ?? ""}</div>
      </div>
      {t > tCar && t < tCar + 0.3 && <AbsoluteFill style={{ background: `rgba(255,60,60,${0.25 * (1 - (t - tCar) / 0.3)})` }} />}
      {t > tHouse && t < tHouse + 0.3 && <AbsoluteFill style={{ background: `rgba(120,255,180,${0.2 * (1 - (t - tHouse) / 0.3)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
