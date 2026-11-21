// Fall (3D, night interior): the moment of failure. It opens close inside the upper walkway's middle box beam,
// cut away: the roof rod, its washer and nut under the bottom flange, a clock card with the time of the
// collapse on "Then". On "upper" the camera pushes in on the nut while nut, washer and flange heat grey → amber
// → red; the line ends, the music has already fallen away, and after a silence, on "reveal" (sub-boom), the
// welded seam tears and the nut pulls through the beam. Then the picture cuts wide: the upper walkway drops onto
// the lower one and both fall; on "land" dust rises from the lobby floor and the empty roof rods swing.
// No people, no impact close-up.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, direct, DisasterStage, Focus, Label3D, Smoke } from "../../three/index";
import { DisasterLookProvider, MissionClock } from "../../disaster/index";
import { BeamCutaway } from "./Nut";
import { Atrium, LOWER_Y, Walkways } from "./world";
import { kitClock, MonoCaption, Overlay } from "./ui";

type Params = { fig?: { hour?: string; minute?: string } };

const NUTP: [number, number, number] = [0, -0.47, -0.12];

const Fall: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const ev = { then: m.at("then", 4), upper: m.at("upper", 60), gives: m.at("gives", 80), way: m.at("way", 90), reveal: m.at("reveal", 120), land: m.at("land", 150) };
  const end = Math.max(m.end, ev.land + 30);
  const wideAt = ev.reveal + 16;          // the tear plays close for half a second, then the wide shot
  const wide = t >= wideAt;
  const stress = Math.min(1, cue(t, ev.then + 10, Math.max(12, ev.reveal - ev.then - 14), (x) => x));
  const fold = cue(t, ev.reveal, 10, Easing.out(Easing.cubic)) * 0.95;
  const drop = cue(t, ev.reveal + 2, 22, Easing.in(Easing.quad)) * 1.6;
  const fall = cue(t, wideAt, 26, (x) => x);
  const closeKeys = direct(ev, [
    { at: 0, move: "orbit", center: [0, -0.2, 0], radius: 2.6, height: 0.35, from: 0.95, to: 0.8, dur: Math.max(10, ev.upper), fov: 36 },
    { at: "upper", move: "push", look: NUTP, dir: [1, -0.35, 0.75], to: 1.35, dur: Math.max(10, ev.reveal - ev.upper) },
    { at: "reveal", move: "pullback", look: [0, -0.8, -0.12], dir: [1, -0.2, 0.75], to: 2.2, dur: 16 },
  ]);
  const wideKeys = direct({ ...ev, wide: wideAt }, [
    { at: "wide", move: "cut", pos: [-10.5, 6.2, 12.5], look: [0, 2.6, -0.5], fov: 44 },
    { at: wideAt + 1, move: "push", look: [0, 2.4, -0.5], dir: [-0.78, 0.33, 0.95], from: 17.2, to: 16.0, dur: Math.max(10, end - wideAt - 1) },
  ]);
  const hour = Number(fig.hour ?? "0"), minute = Number(fig.minute ?? "0");
  const clockIn = cue(t, ev.then, 10);
  return (
    <DisasterStage look="nightGrid" floor={wide ? "reflect" : false} dof={1} shadowBox={wide ? 11 : 3} fog={{ color: "#08111c", near: wide ? 18 : 6, far: wide ? 50 : 20 }}
      overlay={
        <Overlay text={wide ? undefined : "3D reconstruction · cutaway"}>
          {!wide && clockIn > 0 && (
            <DisasterLookProvider value="night-grid">
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: clockIn * (t > ev.reveal ? 0 : 1) }}>
                <MissionClock x={1400} y={130 - (1 - clockIn) * 30} size={440} seconds={(hour + 12) * 3600 + minute * 60} label="local time, about" t={t} />
              </svg>
            </DisasterLookProvider>
          )}
          {!wide && <MonoCaption t={t} at={ev.then} text="FOURTH-FLOOR WALKWAY · MIDDLE HANGER" top={110} />}
          {wide && <MonoCaption t={t} at={wideAt + 4} text="BOTH WALKWAYS FALL" color="#ff3b30" />}
        </Overlay>
      }>
      {!wide ? (
        <>
          <Camera3D keys={closeKeys} frame={t} drift={0.004} />
          <Focus at={NUTP} range={0.8} />
          <pointLight position={[1.5, 1.5, 2]} intensity={2.2} distance={8} color="#ffcf9a" />
          <group rotation-y={0.3}>
            <BeamCutaway t={t} stress={stress} fold={fold} drop={drop} debris={cue(t, ev.reveal, 40, (x) => x)} />
          </group>
          {t >= ev.upper && t < ev.reveal && (
            <Label3D at={NUTP} offset={[-0.35, 0.65, 0.5]} text="WASHER AND NUT" sub="the beam rests on it" start={K(ev.upper + 4)} color="#ffd84a" px={44} />
          )}
        </>
      ) : (
        <>
          <Camera3D keys={wideKeys} frame={t} drift={0.012} />
          <Focus at={[0, 2.5, 0]} range={8} />
          <Atrium dance={1} frame={t} dim={0.5 * cue(t, wideAt, 20)} />
          <Walkways frame={t} fall={fall} />
          <group position={[0, 0.1, 0]}>
            <Debris at={[0, 0.2, 0]} count={46} spread={4} dir={[0, 1, 0]} speed={1.6} size={0.08} start={0.6} seconds={2} slow={0.5} gravity={3} floor={0}
              kind="concrete" seed="hyatt-floor" progress={cue(t, wideAt, 50, (x) => x)} />
            {t >= ev.land - 12 && (
              <>
                <Smoke frame={t - ev.land + 30} at={[-3, 0, 0]} height={3} width={3.4} count={16} color="#d9c7a8" opacity={0.4} wind={[0.4, 0, 0.3]} seed="dust-a" />
                <Smoke frame={t - ev.land + 40} at={[3, 0, 0]} height={3} width={3.4} count={16} color="#d9c7a8" opacity={0.4} wind={[-0.3, 0, 0.3]} seed="dust-b" />
              </>
            )}
          </group>
          {t >= ev.land && (
            <Label3D at={[-4, LOWER_Y * 2.6, 0.55]} offset={[-1.2, 1.0, 1.2]} text="ROOF RODS STILL HANGING" start={K(ev.land)} color="#ffd84a" px={44} />
          )}
        </>
      )}
    </DisasterStage>
  );
};

export default Fall;
