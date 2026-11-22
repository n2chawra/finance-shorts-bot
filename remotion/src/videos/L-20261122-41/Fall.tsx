// Fall (3D): the moment of failure, the hero shot. Modes (params.mode):
//   hook    — close inside the fourth-floor box beam with the clock; the nut heats amber → red; on "gives" the
//             seam tears and the nut pulls through (sub-boom on "way"), then cut wide as the upper walkway drops;
//   drop    — wide from the terrace: the upper walkway lands on the lower one and both fall; dust; lights die;
//   through — close: silence, the nut glowing red; on "pulled" the flange tears, sparks, the beam drops past;
//   swing   — wide: the upper walkway rotates down onto the lower;   floor — both fall, dust, lights die.
// No people, no impact close-up.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, DisasterStage, Focus, Label3D, Smoke, type CamKey } from "../../three/index";
import { DisasterLookProvider, MissionClock } from "../../disaster/index";
import { BeamCutaway, NUT } from "./cutaway";
import { Atrium, LOWER_Y, Surround, Walkways } from "./world";
import { figOf, kitClock, MonoCaption, moments, Overlay, RECIPE } from "./ui";

type Params = { mode?: string };

const Fall: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "hook";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(m.end, 30);
  // when the close cutaway tears, and when the picture goes wide
  const tear = mode === "hook" ? e("gives") : mode === "through" ? e("pulled") : -1e9;
  const wideAt = mode === "hook" ? e("way") : mode === "through" ? 1e9 : 0;
  const wide = t >= wideAt;
  if (!wide) {
    const stress = Math.min(1, cue(t, mode === "hook" ? e("evening") : 0, Math.max(12, tear - 6), (x) => x) + (mode === "through" ? 0.6 : 0));
    const fold = cue(t, tear, 10, Easing.out(Easing.cubic)) * 0.95;
    const drop = cue(t, tear + 2, 22, Easing.in(Easing.quad)) * 1.6;
    const keys: CamKey[] = [{ f: 0, pos: [2.3, -0.5, 1.9], look: [0, -0.3, -0.12], fov: 36 }, { f: Math.max(10, tear), pos: [1.3, -0.75, 1.05], look: NUT, fov: 34 },
      { f: tear + 20, pos: [2.2, -0.6, 1.8], look: [0, -0.9, -0.12], fov: 38 }];
    const hour = Number(figOf(p, "hour") || "0"), minute = Number(figOf(p, "minute") || "0");
    const clockIn = mode === "hook" ? cue(t, e("evening"), 10) : 0;
    return (
      <DisasterStage look="nightGrid" floor={false} dof={1} shadowBox={3} fog={{ color: "#05080a", near: 8, far: 32 }}
        overlay={
          <Overlay t={t} marks={Object.values(ev)} text="3D reconstruction · cutaway · slowed">
            {clockIn > 0 && (
              <DisasterLookProvider value={RECIPE}>
                <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: clockIn * (t > tear ? 0.4 : 1) }}>
                  <MissionClock x={1400} y={130 - (1 - clockIn) * 30} size={440} seconds={(hour + 12) * 3600 + minute * 60} label="local time, about" t={t} />
                </svg>
              </DisasterLookProvider>
            )}
            <MonoCaption t={t} at={0} text="FOURTH-FLOOR WALKWAY · MIDDLE BOX BEAM" top={110} />
          </Overlay>
        }>
        <Camera3D keys={keys} frame={t} drift={0.004} />
        <Surround dist={5} dim={t > tear ? 0.5 : 0} />
        <Focus at={NUT} range={0.7} />
        <pointLight position={[1.5, 1.5, 2]} intensity={2.2} distance={8} color="#ffcf9a" />
        <group rotation-y={0.3}>
          <BeamCutaway t={t} stress={stress} fold={fold} drop={drop} debris={cue(t, tear, 40, (x) => x)} />
        </group>
        {t >= tear && <Label3D at={NUT} offset={[-0.6, 0.55, 0.4]} text="ROD PULLS THROUGH" start={K(tear)} color="#ff6a5c" px={44} />}
      </DisasterStage>
    );
  }
  // the wide shots
  const fall = mode === "hook" ? cue(t, wideAt, 26, (x) => x) * 1.0
    : mode === "drop" ? 0.45 * cue(t, e("drops") - 10, 14, (x) => x) + 0.55 * cue(t, e("both"), 20, (x) => x)
    : mode === "swing" ? 0.45 * cue(t, e("swung"), 24, (x) => x)
    : 0.45 + 0.55 * cue(t, e("both"), 20, (x) => x);
  const land = mode === "hook" ? wideAt + 26 : mode === "drop" ? e("both") + 20 : mode === "floor" ? e("both") + 20 : 1e9;
  const dark = t >= land ? cue(t, land, 30) : 0;
  const keys: CamKey[] = mode === "swing"
    ? [{ f: 0, pos: [-8.5, 5.2, 9.5], look: [0, 3.6, -0.3], fov: 42 }, { f: end + 10, pos: [-7.5, 4.8, 8.6], look: [0, 3.2, -0.3], fov: 42 }]
    : [{ f: 0, pos: [-10.5, 6.2, 12.5], look: [0, 2.6, -0.5], fov: 44 }, { f: end + 10, pos: [-9.6, 5.8, 11.4], look: [0, 2.2, -0.5], fov: 44 }];
  const f0 = mode === "hook" ? wideAt : 0;
  return (
    <DisasterStage look="nightGrid" floor="reflect" dof={1} shadowBox={11} fog={{ color: "#05080a", near: 18, far: 50 }}
      overlay={<Overlay t={t} marks={Object.values(ev)}>{mode === "hook" && <MonoCaption t={t} at={wideAt + 4} text="BOTH WALKWAYS FALL" color="#ff3b30" />}</Overlay>}>
      <Camera3D keys={keys.map((k) => ({ ...k, f: k.f + f0 }))} frame={t} drift={0.012} />
      <Focus at={[0, 2.5, 0]} range={8} />
      <Atrium dance={1 - dark} frame={t} dim={0.6 * dark} />
      <Walkways frame={t} fall={fall} occ={0.6 * (1 - dark)} />
      <group position={[0, 0.1, 0]}>
        <Debris at={[0, 0.2, 0]} count={46} spread={4} dir={[0, 1, 0]} speed={1.6} size={0.08} start={0.6} seconds={2} slow={0.5} gravity={3} floor={0}
          kind="concrete" seed="hyatt-floor" progress={cue(t, land - 20, 50, (x) => x)} />
        {t >= land - 12 && (
          <>
            <Smoke frame={t - land + 30} at={[-3, 0, 0]} height={3} width={3.4} count={16} color="#d9c7a8" opacity={0.4} wind={[0.4, 0, 0.3]} seed="dust-a" />
            <Smoke frame={t - land + 40} at={[3, 0, 0]} height={3} width={3.4} count={16} color="#d9c7a8" opacity={0.4} wind={[-0.3, 0, 0.3]} seed="dust-b" />
          </>
        )}
      </group>
      {mode === "swing" && t >= e("second") && <Label3D at={[-3, LOWER_Y + 0.6, 0.5]} offset={[-1.2, 1.0, 1.0]} text="FOURTH FLOOR ONTO SECOND" start={K(e("second"))} color="#ff6a5c" px={44} />}
    </DisasterStage>
  );
};

export default Fall;
