// Fall (3D, night-grid look): the moment of failure, the hero shot (lessons.md 7). `params.shot`:
//  tease    the cold open: a clock card, the joint heating to red, the seam tearing on "tears" (sub-boom),
//           cut to black before the wide shot (the full fall waits for chapter five)
//  tear     inside the box beam, slowed: silence, the seam glowing red under the nut; on "split" (sub-boom)
//           the weld rips, the flange folds open, and on "through" the nut and washer punch through, sparks fall
//  cascade  the upper walkway from the side: the middle connection lets go and the beam drops at that end;
//           the next connections glow red in turn and pop along the walkway
//  drop     the atrium, wide: the upper walkway drops onto the lower, both tilt and fall; dust from the floor
// No people, no impact close-up.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, DisasterStage, Focus, type Shot, type V3 } from "../../three/index";
import { DisasterLookProvider, MissionClock } from "../../disaster/index";
import { Atrium as Room, BeamJoint, Dust, HH, UPPER_Y, UZ, Walkways } from "./world";
import { evs, inside, MonoCaption, MonoLine, Overlay } from "./ui";

type Params = { shot?: string; fig?: { hour?: string; minute?: string } };
const NUT: V3 = [0, -HH - 0.04, UZ];
const d = (a: number, b: number, min = 10) => Math.max(min, b - a);

const FallBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  useCurrentFrame();
  const t = m.t;
  const params = p.beat.params as Params;
  const shot = params.shot ?? "tear";
  const fig = params.fig ?? {};
  const end = Math.max(m.end, 30);

  if (shot === "tease" || shot === "tear") {
    const names = shot === "tease" ? ["about", "evening", "beam", "tears"] : ["welded", "split", "bent", "through"];
    const e = evs(m, names);
    const go = shot === "tease" ? e.tears! : e.split!;
    const thru = shot === "tease" ? e.tears! + 6 : e.through!;
    const stress = Math.min(1, cue(t, 0, Math.max(12, go - 4), (x) => x) * 0.75 + (shot === "tear" ? 0.25 : 0));
    const fold = cue(t, go, 12, Easing.out(Easing.cubic)) * (shot === "tear" ? 0.45 : 0.95) + (shot === "tear" ? cue(t, e.bent!, 12) * 0.5 : 0);
    const drop = cue(t, thru, 26, Easing.in(Easing.quad)) * 1.6;
    const keys = direct({ ...e, end }, [
      { at: 0, move: "orbit", center: [0, -0.2, 0], radius: 2.4, height: 0.2, from: 0.95, to: 0.75, dur: d(0, go), fov: 36 },
      { at: go, move: "push", look: NUT, dir: [1, -0.35, 0.75], to: 1.1, dur: 12 },
      { at: thru, move: "pullback", look: [0, -0.8, UZ], dir: [1, -0.2, 0.75], to: 2.3, dur: d(thru, end) },
    ] as Shot[]);
    const black = shot === "tease" ? Math.min(1, Math.max(0, (t - (e.tears! + 22)) / 6)) : 0;
    const flash = Math.max(0, 1 - Math.abs(t - go) / 3);
    const clockIn = shot === "tease" ? cue(t, e.about!, 10) : 0;
    const hour = Number(fig.hour ?? "0"), minute = Number(fig.minute ?? "0");
    return (
      <DisasterStage look="nightGrid" floor={false} dof={0.9} shadowBox={3} fog={{ color: "#06101a", near: 5, far: 16 }}
        overlay={
          <Overlay text={shot === "tear" ? "3D reconstruction · slowed down" : "3D reconstruction · cutaway"}>
            <MonoCaption t={t} at={2} text="FOURTH-FLOOR WALKWAY · MIDDLE BOX BEAM" />
            {clockIn > 0 && (
              <DisasterLookProvider value="night-grid">
                <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: clockIn * (1 - black) }}>
                  <MissionClock x={1420} y={120} size={420} seconds={(hour + 12) * 3600 + minute * 60} label="local time, about" t={t} />
                </svg>
              </DisasterLookProvider>
            )}
            {shot === "tear" && <MonoLine t={t} at={e.through! + 4} text="THE NUT PULLS THROUGH" x={1180} y={780} size={38} color="#ff3b30" />}
            {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff2dc", opacity: flash * 0.55 }} />}
            {black > 0 && <div style={{ position: "absolute", inset: 0, background: "#000", opacity: black }} />}
          </Overlay>
        }>
        <Camera3D keys={keys} frame={t} drift={0.004} />
        <Focus at={NUT} range={0.7} />
        <pointLight position={[1.5, 1.2, 2]} intensity={5} distance={7} color="#ffe2bf" />
        <pointLight position={[-2, -0.5, -1.5]} intensity={3} distance={6} color="#59c8ff" />
        <group position={[0, t >= go && t < go + 8 ? Math.sin(t * 3) * 0.01 : 0, 0]}>
          <BeamJoint t={t} rods="two" stress={stress} fold={fold} drop={drop} debris={cue(t, go, 70, (x) => x)} />
        </group>
      </DisasterStage>
    );
  }

  // cascade / drop: the walkways in the atrium
  const names = shot === "cascade" ? ["hanger", "others", "failed"] : ["fell", "second", "crashed"];
  const e = evs(m, names);
  const sag = shot === "cascade" ? cue(t, e.hanger!, 10) * 0.6 + cue(t, e.failed!, 20) * 0.4 : 1;
  const fall = shot === "drop" ? cue(t, e.fell!, Math.max(20, e.crashed! - e.fell!), (x) => x) : 0;
  const keys: Shot[] = shot === "cascade"
    ? [{ at: 0, move: "push", look: [0, UPPER_Y - 0.4, 0], dir: [0.15, -0.1, 1], from: 9, to: 7.5, dur: d(0, e.others!), fov: 40 },
       { at: "others", move: "pullback", look: [0, UPPER_Y - 0.6, 0], dir: [0.3, -0.05, 1], to: 11, dur: d(e.others!, end) }]
    : [{ at: 0, move: "hold", pos: [-9.5, 5.8, 12], look: [0, 3, -0.5], fov: 44 },
       { at: "fell", move: "push", look: [0, 2.2, -0.5], dir: [-0.75, 0.32, 0.95], from: 16.4, to: 15, dur: d(e.fell!, end) }];
  const pops = shot === "cascade" ? [-4, 4].map((x, i) => ({ x, at: e.others! + 10 + i * 14 })) : [];
  return (
    <DisasterStage look="nightGrid" floor={false} light={0.32} dof={1.1} shadowBox={11} fog={{ color: "#08111c", near: 16, far: 50 }}
      overlay={
        <Overlay>
          <MonoCaption t={t} at={2} text={shot === "cascade" ? "ONE CONNECTION GONE · THE OTHERS OVERLOAD" : "BOTH WALKWAYS FALL"} color={shot === "drop" ? "#ff3b30" : "#ffd84a"} />
        </Overlay>
      }>
      <Camera3D keys={inside(direct({ ...e, end }, keys))} frame={t} drift={0.01} />
      <Focus at={[0, UPPER_Y - 0.5, 0]} range={8} />
      <Room frame={t} light="evening" dance={shot === "drop" ? 1 - cue(t, e.fell!, 10) : 1} band={shot === "drop" ? 1 - cue(t, e.fell!, 6) : 1} lamps={0.85} />
      <Walkways frame={t} sag={shot === "cascade" ? sag : 0} fall={fall} stress={shot === "cascade" ? 1 : 0} lit={0.6} />
      {pops.map((q) => t >= q.at && t < q.at + 18 ? (
        <pointLight key={q.x} position={[q.x, UPPER_Y - 0.3, 0.55]} intensity={8 * (1 - (t - q.at) / 18)} distance={3} color="#ff3b30" />
      ) : null)}
      {shot === "drop" && t >= e.crashed! && <Dust frame={t} k={cue(t, e.crashed!, 60)} />}
    </DisasterStage>
  );
};

export default FallBeat;
