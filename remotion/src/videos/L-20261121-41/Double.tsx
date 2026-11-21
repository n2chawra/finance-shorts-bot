// Double (2D force diagram): the load path at the fourth-floor box beam, as built. On "lower" an arrow runs up
// the lower rod from the second-floor walkway into the upper beam; on "upper" the upper walkway's own weight
// arrow joins it; on "nuts" the camera pushes in on the nut under the upper beam and it turns amber; on
// "carried" both arrows merge into one thick red arrow on the nut; on "double" the multiplier stamps beside it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Arrow, HonestyTag, MonoLabel, useDisasterLook } from "../../disaster/index";
import { Elev, LB_Y, ramp, Sheet, Stamp, UB_Y, BEAM_H } from "./elev";

type Params = { fig?: { times?: string } };

const Inner: React.FC<{ t: number; ev: Record<string, number>; times: string }> = ({ t, ev, times }) => {
  const L = useDisasterLook();
  const cx = 960, ux = cx - 34, lx = cx + 34;
  const a1 = ramp(t, ev.lower!, 18), a2 = ramp(t, ev.upper!, 16), merge = ramp(t, ev.carried!, 14);
  const hot = Math.max(0.3 * ramp(t, ev.nuts!, 10), ramp(t, ev.carried!, 14));
  return (
    <g>
      <Elev t={t} cx={cx} split={1} hot={hot} />
      {/* the lower walkway's weight, up the lower rod into the upper beam */}
      <g opacity={1 - 0.6 * merge}>
        <Arrow x1={lx + 60} y1={LB_Y - 40} x2={lx + 60} y2={UB_Y - 50} k={a1} color={L.label} w={8} />
        <MonoLabel x={lx + 90} y={640} t={t} at={ev.lower! + 6} text="lower walkway" sub="hangs from this beam" size={44} />
        <Arrow x1={cx + 330} y1={UB_Y - 150} x2={cx + 330} y2={UB_Y - 30} k={a2} color={L.ok} w={8} />
        <MonoLabel x={cx + 280} y={UB_Y - 170} t={t} at={ev.upper! + 4} text="upper walkway" size={44} color={L.ok} />
      </g>
      {/* both loads land on the one nut under the upper beam */}
      {merge > 0 && (
        <g opacity={merge}>
          <Arrow x1={ux - 150} y1={UB_Y + BEAM_H + 150} x2={ux - 34} y2={UB_Y + BEAM_H + 30} k={merge} color={L.fail} w={18} head={52} />
          <Arrow x1={ux + 260} y1={UB_Y - 40} x2={ux + 40} y2={UB_Y + BEAM_H - 4} k={merge} color={L.fail} w={10} dashed />
          <MonoLabel x={ux - 600} y={UB_Y + BEAM_H + 220} t={t} at={ev.carried! + 4} text="both walkways" sub="on one nut" size={48} color={L.fail} />
        </g>
      )}
      <Stamp x={ux - 300} y={UB_Y - 40} t={t} at={ev.double!} text={`×${times}`} color={L.fail} size={110} rot={-6} />
    </g>
  );
};

const Double: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const times = (p.beat.params as Params).fig?.times ?? "";
  const ev = { lower: m.at("lower", 6), upper: m.at("upper", 40), nuts: m.at("nuts", 80), carried: m.at("carried", 100), double: m.at("double", 120) };
  const t = m.t;
  const close = ramp(t, ev.nuts, 26);
  return (
    <Sheet t={t} zoom={1 + 0.12 * close} cx={960 - 40 * close} cy={540 + 10 * close} html={<HonestyTag t={t} tag="principle" at={0} sub="forces simplified" />}>
      <Inner t={t} ev={ev} times={times} />
    </Sheet>
  );
};

export default Double;
