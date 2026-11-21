// Change (2D blueprint): the fabricator's shop drawing slides over the original on "fabricator" (tagged "as
// reported"); the telephone rings on "phone" and a dashed line runs from it to the rod; on "two" the long rod
// is cut at the fourth-floor beam and the halves slide apart; on "shorter" the two offset rods settle, each
// with its own nut; "engineer" types the approver's label; an APPROVED stamp lands on "yes".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { DrawLine, Elev, Phone, ramp, Sheet, Stamp, UB_Y } from "./elev";

const Inner: React.FC<{ t: number; ev: Record<string, number> }> = ({ t, ev }) => {
  const L = useDisasterLook();
  const slide = ramp(t, 0, 12);
  const split = ramp(t, ev.two!, 18) * 0.7 + ramp(t, ev.shorter!, 14) * 0.3;
  const cut = t >= ev.two! && t < ev.two! + 14;
  return (
    <g>
      <g transform={`translate(${(1 - slide) * 900} 0)`} opacity={slide}>
        <rect x={430} y={40} width={1060} height={1000} fill="rgba(255,255,255,0.06)" stroke={L.line} strokeOpacity={0.5} strokeWidth={3} />
        <MonoLabel x={470} y={100} t={t} at={ev.fabricator} text="fabricator's shop drawing" size={48} />
        <g>
          <Elev t={t} cx={960} split={split} />
          {cut && <circle cx={960} cy={UB_Y + 30} r={40 + (t - ev.two!) * 6} fill="none" stroke={L.fail} strokeWidth={6} opacity={1 - (t - ev.two!) / 14} />}
        </g>
      </g>
      <Phone x={250} y={560} t={t} k={ramp(t, ev.phone! - 8, 8)} ring={ev.phone} s={1.3} />
      <DrawLine x1={370} y1={510} x2={900} y2={UB_Y + 30} k={ramp(t, ev.phone! + 6, 16)} color={L.label} w={7} dash="18 12" />
      <MonoLabel x={80} y={740} t={t} at={ev.phone! + 4} text="by phone" size={48} color={L.label} />
      <MonoLabel x={1450} y={330} t={t} at={ev.two} text="two rods" sub="offset" size={48} />
      <MonoLabel x={1450} y={700} t={t} at={ev.engineer} text="engineer" sub="the designer" size={48} color={L.ink} />
      <Stamp x={960} y={300} t={t} at={ev.yes!} text="APPROVED" color={L.fail} size={96} />
    </g>
  );
};

const Change: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ev = { fabricator: m.at("fabricator", 10), phone: m.at("phone", 40), two: m.at("two", 70), shorter: m.at("shorter", 85), engineer: m.at("engineer", 120), yes: m.at("yes", 140) };
  const t = m.t;
  const close = ramp(t, ev.two, 20) * (1 - ramp(t, ev.yes - 10, 20));
  return (
    <Sheet t={t} zoom={1 + 0.02 * (t / Math.max(1, m.end)) + 0 * close} cx={960} cy={540}
      html={<HonestyTag t={t} tag="reported" at={ev.fabricator} />}>
      <Inner t={t} ev={ev} />
    </Sheet>
  );
};

export default Change;
