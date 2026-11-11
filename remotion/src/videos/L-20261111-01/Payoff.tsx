/**
 * The payoff: "Now picture the richest fortune. Elon Musk's {fact4} is {rooms_ratio} our room of
 * notes: row after row of rooms, every single one of them packed full."
 * It opens on the one warehouse room from the hook, lit, alone in the middle of a night plain. On
 * "richest" a gold crown chip drops over it; on "Musk" the figure slams in at the top; on "room" the
 * count chip lands; on "row" the camera pulls back and rows of rooms light up one by one behind
 * and beside it; on "packed" the last rows fill in, the first room now small, and a
 * small "our room" arrow points at it. Rohan stands small in the foreground, looking up.
 *
 * params: { figure, rooms, ours }
 * events: richest, musk, room, row, packed
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Room = props.warehouse!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { figure?: string; rooms?: string; ours?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tRich = at(p, "richest", 0.8), tMusk = at(p, "musk", 2.0), tRoom = at(p, "room", 4.0), tDist = at(p, "row", 5.2), tHor = at(p, "packed", 7.4);
  const pull = ease((t - tDist) / 2.2);
  const mt = minText(w, h), box = safeBox(w, h);
  const horizon = h * 0.42, ground = h * 0.86;
  const firstS = h * (0.34 - 0.27 * pull);
  const firstY = ground - (ground - h * 0.66) * pull;
  const rooms: React.ReactNode[] = [];
  if (t > tDist) {
    const rows = 6;
    for (let r = rows - 1; r >= 0; r--) {
      const depth = r / (rows - 1);                       // 0 = near, 1 = horizon
      const y = firstY - (firstY - horizon) * depth;
      const sc = (1 - 0.8 * depth) * firstS;
      const cols = 5 + r * 3;
      for (let c = 0; c < cols; c++) {
        const off = c - (cols - 1) / 2;
        if (r === 0 && off === 0) continue;
        const delay = (r * 0.25 + Math.abs(off) * 0.06) * (tHor - tDist) / 2.2;
        const k = clamp((t - tDist - delay) * 3);
        if (k <= 0) continue;
        const x = w * 0.5 + off * sc * 1.95;
        if (x < -sc || x > w + sc) continue;
        rooms.push(<g key={`${r}-${c}`} transform={`translate(${x},${y}) scale(${k})`} opacity={0.6 + 0.4 * k}><Room s={sc} t={t} k={1} /></g>);
      }
    }
  }
  const kCrown = sp(tRich, 9), kFig = sp(tMusk, 9), kRooms = sp(tRoom, 9), kOurs = sp(tHor + 0.3, 10);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <World kind="night" tint="gold" w={w} h={h} t={t} seed="payoff-district" props={props} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {rooms}
        <g transform={`translate(${w * 0.5},${firstY})`}><Room s={firstS} t={t} k={1} /></g>
        {kOurs > 0 && <g opacity={kOurs}>
          <line x1={w * 0.5} y1={firstY - firstS * 1.1 - h * 0.12} x2={w * 0.5} y2={firstY - firstS * 1.05} stroke="#ffd34d" strokeWidth={10} strokeLinecap="round" />
          <path d={`M${w * 0.5 - 18},${firstY - firstS * 1.05 - 22} L${w * 0.5},${firstY - firstS * 1.05} L${w * 0.5 + 18},${firstY - firstS * 1.05 - 22}`} stroke="#ffd34d" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>}
        <Actor p={p} spec={{ who: "rohan", x: 0.14, scale: 0.9, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "musk", pose: "worried", expression: "shock" },
          { at: "row", pose: "pointUp", expression: "shock", turn: 0.5 }, { at: "packed", pose: "facepalm", expression: "shock" }] }} ground={h * 0.99} index={0} />
      </svg>
      {kCrown > 0 && kFig < 0.5 && (
        <div style={{ position: "absolute", left: w * 0.5, top: firstY - firstS * 1.2 - h * 0.1, transform: `translate(-50%,0) scale(${kCrown})`, fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine("THE RICHEST", 60, w * 0.3, { upper: true })), color: "#1d2433", background: "#ffd34d", border: "6px solid #fff", borderRadius: 20,
          padding: "4px 24px", whiteSpace: "nowrap" }}>THE RICHEST</div>
      )}
      {P.figure && kFig > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: Math.max(box.y0, h * 0.05), transform: `translate(-50%,0) scale(${kFig})`, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine(P.figure, 128, w * 0.55)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{P.figure}</div>
      )}
      {P.rooms && kRooms > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.24, transform: `translate(-50%,0) scale(${kRooms}) rotate(-2deg)`, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine(P.rooms, 60, w * 0.4)), color: "#fff", background: "#c92a2a", border: "6px solid #fff", borderRadius: 20, padding: "4px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>{P.rooms}</div>
      )}
      {P.ours && kOurs > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: firstY - firstS * 1.1 - h * 0.2, transform: `translate(-50%,0) scale(${kOurs})`, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine(P.ours, 46, w * 0.25)), color: "#ffd34d", textShadow: "0 5px 0 rgba(0,0,0,0.6)" }}>{P.ours}</div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
