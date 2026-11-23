// Hook: "In thick cloud over Calabasas, Kobe Bryant's pilot said he was climbing. What was the helicopter really doing?"
// Frame 0: inside grey cloud beside the white-and-blue Sikorsky, rotor blurring, the date and place caption and the
// reconstruction tag ("cloud"); the cloud thins and the dark ridge shows below ("Calabasas"); push in on the cockpit,
// a loupe opens on the attitude indicator, already tilting amber ("pilot"); CLIMBING? types on ("climbing"); pull
// wide as the helicopter tips into a left bank ("helicopter"); the cloud closes in ("doing").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, Attitude, Cam, Country, DateCaption, HeliAt, InCloud, k01, RED, Shot3D, sm, Tag, Veil } from "./World";

type Params = { fig?: { year?: string } };
export const HELI_Y = 8.2;

/** The hook's picture at frame f (also the loop's last frame): the helicopter in cloud, seen from its right. */
export const hookPose = (f: number) => ({ cam: [3.4 - 0.004 * f, HELI_Y + 0.7, 4.4 - 0.006 * f] as [number, number, number], look: [0.2, HELI_Y, 0] as [number, number, number] });

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const year = (p.beat.params as Params).fig?.year ?? "";
  const pilot = m.at("said", 20), cal = -100, climbing = m.at("climbing", 70), heli = m.at("was", 80), doing = heli + 20;
  const wide = f >= heli;
  const bank = -0.05 - 0.18 * sm((f - heli) / 40) - 0.03 * Math.sin(f * 0.05);
  const pitch = -0.04 * sm((f - heli) / 40);
  const gap = 0 * cal;
  const far = 13 + 24 * gap - 4 * k01((f - doing) / 20);
  const push = sm((f - pilot) / 22);
  const H = hookPose(f);
  const pos: [number, number, number] = wide
    ? [-2.6 + 0.01 * (f - heli), HELI_Y + 2.2, 8.6 - 0.012 * (f - heli)]
    : [H.cam[0] - 1.0 * push, H.cam[1] - 0.25 * push - 1.6 * gap, H.cam[2] - 1.9 * push];
  const look: [number, number, number] = wide ? [0, HELI_Y - 0.3, 0] : [H.look[0] + 0.55 * push, H.look[1] - 2.5 * gap, 0];
  const loupe = k01((f - pilot) / 8) * (wide ? 0 : 1);
  return (
    <Shot3D f={f} fog={{ color: "#7d8690", near: 1.2, far }}
      overlay={
        <>
          <Veil f={f} k={1 - 0.6 * gap} />
          <DateCaption t={f} at={0} line={`JAN ${year} · CALABASAS, CALIFORNIA`} />
          {!wide ? <Tag t={f} at={-30} top={470} text="SIKORSKY HELICOPTER" color="#f2f4f5" size={50} /> : null}
          {loupe > 0 ? <div style={{ opacity: loupe }}><Attitude cx={540} cy={980} r={190 * (0.7 + 0.3 * loupe)} bank={10 + 6 * k01((f - pilot) / 40)} ring={AMBER} id="hook" /></div> : null}
          {!wide && f >= climbing ? <Tag t={f} at={climbing} top={1215} text="PILOT: CLIMBING?" color={AMBER} size={52} /> : null}
          {wide ? <Tag t={f} at={heli} top={1180} text="BANKING LEFT · IN CLOUD" color={RED} size={50} /> : null}
        </>
      }>
      <Cam pos={pos} look={look} fov={wide ? 44 : 40} seed="cal-hook" range={wide ? 10 : 4} />
      <Country />
      <InCloud f={f} y={HELI_Y} />
      <HeliAt f={f} pos={[0.004 * f, HELI_Y, 0]} bank={bank} pitch={pitch} />
    </Shot3D>
  );
};
export default Hook;
