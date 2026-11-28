// The 3D beats (Fair, Midway, Gate, Arm, Road, Shed all draw this): params pick the camera (`shot`), the world
// and its light (`phase`: evening, day, morning, dusk, rain, after, closed, cut, road, shed), the ride's motion
// (`swing`), and what happens on which word (stressAt, xrayAt, failAt, cutAt, barsAt, greenAt, scopeAt…).
// Figures come only from params.fig.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, Crowd3D, cue, Debris, DisasterStage, Focus, glow, Label3D, Rain, Rescuers, rnd, Smoke, type CamKey, type V3 } from "../../three/index";
import { ANTON, ChapterCard, figOf, ICE, kitClock, MONO, MonoCaption, moments, Overlay, Readout, RED, StampHtml } from "./ui";
import {
  ARM, Booth, Bulbs, Emergency, FerrisWheel, FireBall, Gate, Gondola, gondolaAt, Grounds, hubAt, k01, LightStrings, Mat, Person3D, rampHex, Rig, sh, Stalls, swingAngle, Tape,
} from "./world";

type Shot = { a: V3; la: V3; b: V3; lb: V3; fov?: number; orbit?: boolean };
const SHOTS: Record<string, Shot> = {
  hook: { a: [26, 8, 28], la: [3, 10.5, 0], b: [20, 7, 22], lb: [3, 10, 0], fov: 46 },
  orbit: { a: [30, 8, 24], la: [0, 10, 0], b: [8, 7, 33], lb: [0, 10, 0], fov: 46, orbit: true },
  inspect: { a: [10, 3.4, 12], la: [2, 2.8, 0], b: [8, 3, 9.5], lb: [2.6, 3, 0], fov: 42 },
  daywide: { a: [32, 9, 34], la: [0, 6, 0], b: [26, 8, 29], lb: [0, 6, 0], fov: 44 },
  trailer: { a: [-2, 3.2, 17], la: [-11, 2, 4], b: [-4, 2.8, 15], lb: [-11, 2, 4], fov: 42 },
  seat: { a: [8.5, 3.8, 3.2], la: [3.7, 2.8, 0], b: [7.4, 3.4, 2.3], lb: [3.7, 2.8, 0], fov: 42 },
  booth: { a: [-4.5, 2.4, 13], la: [-9, 1.3, 7], b: [-5.6, 2, 11], lb: [-9, 1.2, 7.3], fov: 42 },
  panel: { a: [-8, 2.1, 9.6], la: [-9, 1.05, 7.4], b: [-8.5, 1.8, 8.9], lb: [-9, 1.05, 7.4], fov: 40 },
  stickers: { a: [-5, 1.8, 8], la: [-7.8, 1.4, 6], b: [-5.4, 1.7, 5.2], lb: [-7.8, 1.4, 6], fov: 40 },
  crew: { a: [13, 2.6, 11], la: [3, 2.2, 3], b: [11, 2.4, 9], lb: [2, 2.2, 2], fov: 42 },
  side: { a: [0, 8, 40], la: [0, 10, 0], b: [3, 7.5, 36], lb: [0, 10, 0], fov: 46 },
  under: { a: [2.5, 0.8, 9], la: [0, 6, 0], b: [1.5, 0.9, 8], lb: [0, 5, 0], fov: 58 },
  rain: { a: [21, 5, 25], la: [0, 5, 0], b: [15, 4.5, 18], lb: [2, 4, 0], fov: 44 },
  armlight: { a: [7, 3.8, 4.4], la: [2.4, 3.8, 0], b: [6, 3.6, 3.4], lb: [2.4, 3.8, 0], fov: 40 },
  detail: { a: [6, 3.2, 4], la: [2.6, 3.4, 0], b: [4.8, 3.2, 3], lb: [3.4, 3, 0], fov: 42 },
  gate: { a: [9, 4, 60], la: [0, 5, 40], b: [6, 4, 53], lb: [0, 6, 30], fov: 46 },
  gatewide: { a: [0, 5, 68], la: [0, 6, 40], b: [0, 4.5, 60], lb: [0, 6, 38], fov: 46 },
  queue: { a: [17, 2.4, 17], la: [4, 3.5, 6], b: [14, 2.2, 14], lb: [3, 4, 4], fov: 46 },
  dusk: { a: [-30, 5, 40], la: [-10, 7, -10], b: [-24, 5, 34], lb: [-8, 7, -10], fov: 44 },
  far: { a: [-50, 7, 62], la: [0, 6, 0], b: [-46, 6, 58], lb: [0, 5, 0], fov: 40 },
  rescue: { a: [19, 5, 21], la: [0, 2.5, 2], b: [15, 4.2, 17], lb: [0, 2.5, 2], fov: 44 },
  shut: { a: [27, 6, 27], la: [0, 4, 0], b: [22, 8, 22], lb: [0, 5, 0], fov: 44 },
  brokenend: { a: [7.5, 4.8, 4.4], la: [3.6, 3.8, 0], b: [5.6, 4.2, 2.6], lb: [3.6, 3.8, 0], fov: 40 },
  // the workshop (cut)
  cutwide: { a: [5.4, 3.6, 7.8], la: [0, 1.6, 0], b: [4, 3, 6.4], lb: [0.3, 1.6, 0], fov: 42 },
  cutend: { a: [-7, 2.3, 2.8], la: [-3.5, 1.6, 0], b: [-6, 2, 1.8], lb: [-3.6, 1.6, 0], fov: 42 },
  inside: { a: [-3.7, 1.62, 0], la: [4, 1.6, 0], b: [-2.2, 1.62, 0], lb: [4, 1.55, 0], fov: 62 },
  joint: { a: [5.8, 2.5, 3.2], la: [3.5, 1.5, 0], b: [5, 2.1, 2.3], lb: [3.6, 1.5, 0], fov: 40 },
  breakface: { a: [5.8, 1.9, 2.4], la: [3.4, 1.6, 0], b: [5.6, 2.3, -1.9], lb: [3.4, 1.6, 0], fov: 40, orbit: true },
  payoff: { a: [-5.8, 3.4, 5.2], la: [0, 1.6, 0], b: [-3.4, 2.5, 3.9], lb: [1, 1.6, 0], fov: 42 },
  fallen: { a: [23, 7, 25], la: [4, 4, 2], b: [19.5, 6, 21], lb: [4, 4, 2], fov: 44 },
  shed: { a: [7.5, 3.2, 7.5], la: [0, 1.2, 0], b: [4.4, 2.2, 4.4], lb: [0, 1.4, 0], fov: 44 },
};

type Tag = { at: string; fig: string; label: string };
type Lab = { at: string; text: string; sub?: string };
type Params = {
  shot?: string; phase?: string; swing?: string; caption?: string; captionAt?: string; chapter?: string; tag?: Tag; label?: Lab; parts?: Lab[];
  stressAt?: string; redAt?: string; dimAt?: string; xrayAt?: string; xrayOffAt?: string; flashAt?: string; glowAt?: string; stressPulse?: boolean;
  crowd?: boolean; queue?: boolean; ridersK?: boolean; scatterAt?: string; inspector?: boolean | number; crew?: boolean; investigator?: boolean; engineers?: boolean;
  rescue?: boolean; tape?: boolean; broken?: boolean; dustAt?: string; drip?: boolean; truckAt?: string; noticeAt?: string; camFlashAt?: string;
  stickerAt?: string; stickerOn?: boolean; barsAt?: string; greenAt?: string; noBeltAt?: string; booth?: boolean; screen?: boolean; lockAt?: string; stickersAt?: string;
  startPanelAt?: string; sheetAt?: string; listAt?: string[]; plateAt?: string; office?: boolean; raiseAt?: string; spin?: boolean; slowAt?: string; gArrow?: boolean; principle?: boolean; reported?: boolean;
  sunAt?: string; duskAt?: string; lightsAt?: string; seasonsAt?: string; lawAt?: string; signAt?: string; other?: boolean; scopeCrewAt?: string;
  // the workshop
  cutAt?: string; rust?: number; rustAt?: string; water?: boolean; waterAt?: string; failAt?: string; failed?: boolean; wallThin?: boolean; crackAt?: string;
  pulseAt?: string; lightBeam?: boolean; beamAt?: string; mountAt?: string; closeAt?: string; scopeAt?: string; blastAt?: string; scopeScreenAt?: string;
  scopeLight?: boolean; travelAt?: string; doorAt?: string;
  causeTags?: { at: string; text: string; red?: boolean }[]; crossTags?: { at: string; text: string }[];
};

type Sky = { top: string; bottom: string; sun: V3; sunC: string; sunI: number; amb: number; ambC: string; fog: string; lights: number; day: number };
const SKIES: Record<string, Sky> = {
  evening: { top: "#5d86bd", bottom: "#f6c48c", sun: [-40, 14, 12], sunC: "#ffc98f", sunI: 1.45, amb: 0.5, ambC: "#f3dcc4", fog: "#e9c9a6", lights: 0.85, day: 0.8 },
  day: { top: "#5f97d4", bottom: "#dfeaf4", sun: [22, 40, 16], sunC: "#fff4e0", sunI: 1.6, amb: 0.55, ambC: "#d7e3ee", fog: "#d5e1ec", lights: 0.35, day: 1 },
  morning: { top: "#86b3e3", bottom: "#f1ece2", sun: [36, 18, 22], sunC: "#ffe7c4", sunI: 1.35, amb: 0.55, ambC: "#e6e2da", fog: "#e8e6e0", lights: 0.3, day: 1 },
  dusk: { top: "#3b4a7c", bottom: "#f08a5a", sun: [-40, 8, 10], sunC: "#ffad73", sunI: 1.1, amb: 0.42, ambC: "#c9a6b0", fog: "#c98a78", lights: 1, day: 0.5 },
  rain: { top: "#46525f", bottom: "#8f9aa6", sun: [10, 30, 10], sunC: "#cfd8e2", sunI: 0.55, amb: 0.65, ambC: "#b6c2ce", fog: "#7e8994", lights: 0.9, day: 0.4 },
  after: { top: "#4c5d7c", bottom: "#d79a74", sun: [-40, 10, 12], sunC: "#ffb98a", sunI: 1.0, amb: 0.42, ambC: "#d6c0b0", fog: "#c69c86", lights: 0.25, day: 0.7 },
  closed: { top: "#8b98a6", bottom: "#dde2e7", sun: [20, 34, 18], sunC: "#eef2f6", sunI: 1.0, amb: 0.7, ambC: "#dfe4ea", fog: "#d6dbe0", lights: 0, day: 1 },
  road: { top: "#7fb0e2", bottom: "#f3e6d0", sun: [30, 16, 20], sunC: "#ffe2b8", sunI: 1.4, amb: 0.55, ambC: "#e2ddd4", fog: "#e9e2d5", lights: 0, day: 1 },
};

const Scene3D: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (name?: string) => (name ? (ev[name] !== undefined ? ev[name]! : m.at(name, 1e9)) : 1e9);
  const fig = (n?: string) => figOf(p, n);
  const end = Math.max(m.end, 30);
  const phase = P.phase ?? "day";
  const cut = phase === "cut", shed = phase === "shed";
  const raised = P.raiseAt !== undefined && t >= e(P.raiseAt);
  const road = phase === "road" && !raised;
  const fair = !cut && !shed && !road;
  const skyName = raised ? "day" : phase in SKIES ? phase : "day";
  let sky = SKIES[skyName] ?? SKIES.day!;
  if (P.duskAt && t >= e(P.duskAt)) { const k = cue(t, e(P.duskAt), 50); sky = { ...sky, bottom: k > 0.5 ? "#f6c48c" : sky.bottom, sunI: sky.sunI * (1 - 0.2 * k) }; }
  const seasons = P.seasonsAt && t >= e(P.seasonsAt) ? Math.floor((t - e(P.seasonsAt)) / 14) % 2 : 0;
  if (seasons) sky = { ...SKIES.day!, lights: 0.2 };
  const sunMove = P.sunAt ? cue(t, e(P.sunAt), 60) : 0;
  const sunPos: V3 = [sky.sun[0] - 60 * sunMove, sky.sun[1] - 6 * sunMove, sky.sun[2]];
  const lights = P.lightsAt ? sky.lights * (0.35 + 0.65 * cue(t, e(P.lightsAt), 24)) : sky.lights;

  // the ride's motion: frames in the kit's clock so the swing runs on from beat to beat
  const now = K(t);
  const slowK = P.slowAt ? cue(t, e(P.slowAt), 10) : 0;
  const swingF = P.slowAt && t >= e(P.slowAt) ? K(e(P.slowAt)) + (now - K(e(P.slowAt))) * (1 - 0.75 * slowK) : now;
  const stopK = P.swing === "stop" ? 1 : 0;
  const theta = swingAngle(P.swing ?? "parked", swingF + 40, 1 - 0.0 * stopK);
  const spin = P.spin || P.swing === "high" ? swingF * 0.012 : 0;
  // arm 0 (the one that failed)
  const stress = Math.max(P.stressAt ? cue(t, e(P.stressAt), 40, (x) => x) * 0.55 : 0, P.redAt ? cue(t, e(P.redAt), 20) : 0,
    P.stressPulse ? Math.max(0, 1 - Math.abs(theta) * 2.5) * 0.45 : 0, P.flashAt ? Math.max(0, 1 - Math.abs(t - e(P.flashAt) - 6) / 10) * 0.5 : 0);
  const xr = (P.xrayAt ? cue(t, e(P.xrayAt), 14) : 0) * (P.xrayOffAt ? 1 - cue(t, e(P.xrayOffAt), 14) : 1);
  const glowK = P.glowAt ? cue(t, e(P.glowAt), 18) * (phase === "rain" ? 0.4 : 0.95) : 0;
  const bars = P.barsAt ? cue(t, e(P.barsAt), 14) : 1;
  const green = P.greenAt ? cue(t, e(P.greenAt), 40, (x) => x) : (P.swing === "high" ? 1 : 0);
  const raise = P.raiseAt ? 0.3 + 0.7 * cue(t, e(P.raiseAt), 40) : 1;

  // the camera
  const S = SHOTS[P.shot ?? "daywide"] ?? SHOTS.daywide!;
  let keys: CamKey[] = [{ f: 0, pos: S.a, look: S.la, fov: S.fov ?? 42 }, { f: end + 10, pos: S.b, look: S.lb, fov: S.fov ?? 42, orbit: S.orbit }];
  // the script's shot sizes: each size change on its word narrows or widens the lens (held until just before the word)
  const FOVK: Record<string, number> = { wide: 1, medium: 0.78, close: 0.6, extreme: 0.45 };
  const cams = ((p.beat.params as { camera?: { sec?: number; at?: string; size?: string }[] }).camera ?? []);
  if (cams.length > 1) {
    const base = FOVK[cams[0]!.size ?? "wide"] ?? 1;
    const fov0 = S.fov ?? 42;
    const lerpV = (u: number): { pos: V3; look: V3 } => ({ pos: [S.a[0] + (S.b[0] - S.a[0]) * u, S.a[1] + (S.b[1] - S.a[1]) * u, S.a[2] + (S.b[2] - S.a[2]) * u], look: [S.la[0] + (S.lb[0] - S.la[0]) * u, S.la[1] + (S.lb[1] - S.la[1]) * u, S.la[2] + (S.lb[2] - S.la[2]) * u] });
    const ks: CamKey[] = [{ f: 0, ...lerpV(0), fov: fov0 }];
    let cur = fov0;
    for (const c of cams.slice(1)) {
      const f = c.at ? e(c.at) : (c.sec ?? 0) * 30;
      if (f >= 1e8 || f <= 2) continue;
      const nf = fov0 * (FOVK[c.size ?? "wide"] ?? 1) / base;
      if (Math.abs(nf - cur) < 0.5) continue;
      const f0 = Math.max(ks[ks.length - 1]!.f + 2, f - 10);
      ks.push({ f: f0, ...lerpV(f0 / (end + 10)), fov: cur });
      ks.push({ f: f + 14, ...lerpV((f + 14) / (end + 10)), fov: nf });
      cur = nf;
    }
    ks.push({ f: Math.max(ks[ks.length - 1]!.f + 2, end + 10), ...lerpV(1), fov: cur, orbit: S.orbit });
    keys = ks;
  }
  const follow = (fn: (f: number) => { pos: V3; look: V3 }, fov = 46) => {
    keys = Array.from({ length: Math.ceil((end + 12) / 6) + 1 }, (_, i) => {
      const f = i * 6;
      const sf = K(f);
      const th = swingAngle(P.swing ?? "parked", sf + 40);
      const sp = P.spin || P.swing === "high" ? sf * 0.012 : 0;
      void th; void sp;
      return { f, ...fn(f), fov };
    });
  };
  const at = (f: number) => {
    const sf = K(f);
    return { th: swingAngle(P.swing ?? "parked", sf + 40), sp: P.spin || P.swing === "high" ? sf * 0.012 : 0 };
  };
  if (P.shot === "ride") follow((f) => { const { th, sp } = at(f); const g = gondolaAt(0, th, sp); return { pos: [g[0] + 4, g[1] + 2.5, g[2] + 9], look: g }; }, 50);
  if (P.shot === "pov") follow((f) => { const { th, sp } = at(f); const g = gondolaAt(0, th, sp); return { pos: [g[0] + 2.2, g[1] + 1.4, g[2] + 5.2], look: [g[0], g[1] + 0.2, g[2]] }; }, 46);
  if (P.shot === "wheel") follow((f) => { const { th } = at(f); const { hub } = hubAt(th); return { pos: [hub[0] + 5, hub[1] + 1.5, hub[2] + 8.5], look: hub }; }, 46);
  if (P.shot === "jointclose") follow((f) => { const { th, sp } = at(f); const g = gondolaAt(0, th, sp); return { pos: [g[0] + 3.2, g[1] + 2.4, g[2] + 6.5], look: [g[0], g[1] + 0.6, g[2]] }; }, 40);
  if (P.shot === "armclose") follow((f) => { const { th, sp } = at(f); const { hub } = hubAt(th); const g = gondolaAt(0, th, sp); const mid: V3 = [(hub[0] + g[0]) / 2, (hub[1] + g[1]) / 2, (hub[2] + g[2]) / 2]; return { pos: [mid[0] + 2.5, mid[1] + 1.4, mid[2] + 5.5], look: mid }; }, 44);
  let truckX = 0;
  if (road) { truckX = -20 + t * 0.12; keys = [{ f: 0, pos: [truckX - 8, 3.2, 12], look: [truckX, 1.8, 0], fov: 44 }, { f: end + 10, pos: [-20 + (end + 10) * 0.12 - 4, 2.8, 10], look: [-20 + (end + 10) * 0.12, 1.8, 0], fov: 44 }]; }
  if (raised) keys = [{ f: 0, pos: [28, 8, 30], look: [0, 6, 0], fov: 44 }, { f: end + 10, pos: [24, 7.5, 26], look: [0, 6, 0], fov: 44 }];
  if (P.travelAt) { const s = e(P.travelAt); keys = [{ f: 0, pos: S.a, look: S.la, fov: S.fov }, { f: s, pos: [-3.2, 1.62, 0], look: [4, 1.6, 0], fov: S.fov }, { f: end + 10, pos: [1.8, 1.62, 0], look: [4, 1.55, 0], fov: S.fov }]; }
  const failK = P.failAt ? cue(t, e(P.failAt), 22, (x) => x) : P.failed ? 1 : 0;
  const shake = P.failAt && t >= e(P.failAt) ? Math.max(0, 1 - (t - e(P.failAt)) / 16) : 0;
  if (shake > 0) keys = keys.map((k) => ({ ...k, pos: [k.pos[0] + Math.sin(t * 3.1) * 0.08 * shake, k.pos[1] + Math.cos(t * 2.7) * 0.06 * shake, k.pos[2]] as V3 }));
  const focus = cut ? S.lb : S.lb;

  const dim = P.dimAt ? cue(t, e(P.dimAt), 14) * 0.45 : 0;
  const flash = P.camFlashAt ? Math.max(0, 1 - Math.abs(t - e(P.camFlashAt) - 2) / 4) : 0;
  const tagText = P.principle ? "general principle" : P.reported ? "as reported" : undefined;
  const backdrop = cut ? { top: "#22252b", bottom: "#0c0d10" } : shed ? { top: "#2a2d33", bottom: "#121317" } : { top: seasons ? SKIES.rain!.top : sky.top, bottom: seasons ? SKIES.rain!.bottom : sky.bottom };
  const fog = cut ? { color: "#0d0e11", near: 14, far: 40 } : shed ? { color: "#15161a", near: 12, far: 40 } : { color: sky.fog, near: 60, far: 220 };

  return (
    <DisasterStage look="nightGrid" floor={false} dof={0} shadowBox={cut || shed ? 10 : 40} light={cut ? 0.6 : 0.9} backdrop={backdrop} fog={fog} vignette={0.4} bloom={cut ? 0.5 : 0.7}
      overlay={
        <Overlay text={tagText}>
          {P.slowAt && t >= e(P.slowAt) && <MonoCaption t={t} at={e(P.slowAt)} text="TIME PAUSED" top={104} left={150} size={30} color="#ffd27a" />}
          {P.caption === "date" && <MonoCaption t={t} at={P.captionAt ? e(P.captionAt) - 10 : -80} text={`OHIO STATE FAIR · COLUMBUS · ${fig("year")}`} top={104} size={34} />}
          {P.caption === "date" && <MonoCaption t={t} at={P.captionAt ? e(P.captionAt) : 10} text="FIRE BALL · EARLY EVENING" top={164} size={30} color={ICE} />}
          {P.caption === "day" && <MonoCaption t={t} at={e("Fair")} text={`FIRST DAY OF THE FAIR · ${fig("year")}`} top={170} size={34} />}
          {P.tag && <Readout x={1240} y={150} label={P.tag.label} k={cue(t, e(P.tag.at), 12)} value={countText(fig(P.tag.fig), cue(t, e(P.tag.at), 20))} />}
          {P.chapter && <ChapterCard t={t} text={P.chapter} />}
          {P.stickerAt && <StampHtml t={t} at={e(P.stickerAt)} text="PASSED" x={1300} y={240} color="#1f8a3f" />}
          {P.stickerOn && <StampHtml t={t} at={e("sticker") < 1e8 ? e("sticker") : e("pass")} text="PASSED" x={160} y={760} color="#1f8a3f" />}
          {P.noticeAt && <StampHtml t={t} at={e(P.noticeAt)} text="STOP OPERATION" x={1180} y={220} />}
          {P.noBeltAt && t >= e(P.noBeltAt) && <MonoCaption t={t} at={e(P.noBeltAt)} text="NO SEATBELTS" top={190} left={1260} size={40} color="#ffd27a" />}
          {P.screen && <ProgramScreen t={t} lockAt={e(P.lockAt)} />}
          {P.sheetAt && <CheckSheet t={t} at={e(P.sheetAt)} />}
          {P.startPanelAt && <StartPanel t={t} at={e(P.startPanelAt)} startAt={e("start")} />}
          {P.stickersAt && <StickerRow t={t} at={e(P.stickersAt)} more={e("Stickers")} />}
          {P.lawAt && <LawSheet t={t} at={e(P.lawAt)} signAt={e(P.signAt)} />}
          {P.office && <PaperChip t={t} at={e("bought")} title="BILL OF SALE" line="ONE PORTABLE RIDE · FIRE BALL" />}
          {P.scopeScreenAt && <ScopeScreen t={t} at={e(P.scopeScreenAt)} />}
          {P.gArrow && <GArrow t={t} theta={theta} />}
          {P.causeTags && <CauseTags t={t} tags={P.causeTags.map((c) => ({ at: e(c.at), text: c.text, red: c.red }))} />}
          {P.crossTags && <CrossTags t={t} tags={P.crossTags.map((c) => ({ at: e(c.at), text: c.text }))} />}
          {flash > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.7 * flash})` }} />}
          {dim > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />}
          {failK > 0 && failK < 0.4 && <AbsoluteFill style={{ background: `rgba(255,236,210,${0.5 * (0.4 - failK)})` }} />}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.02} />
      <Focus at={focus} range={cut ? 6 : 40} />
      <directionalLight position={cut || shed ? [6, 12, 8] : sunPos} intensity={cut ? 1.2 : shed ? 0.6 : sky.sunI} color={cut ? "#fff1dc" : shed ? "#e6f0ff" : sky.sunC} castShadow />
      <ambientLight intensity={cut ? 0.25 : shed ? 0.4 : sky.amb} color={cut ? "#9fb0c8" : shed ? "#cfdaea" : sky.ambC} />
      {fair && <FairWorld t={t} P={P} K={K} e={e} theta={theta} spin={spin} stress={stress} xr={xr} glowK={glowK} bars={bars} green={green} lights={lights} raise={raise} day={sky.day} />}
      {road && <RoadWorld t={t} truckX={truckX} />}
      {cut && <Workshop t={t} P={P} e={e} failK={failK} />}
      {shed && <ShedWorld t={t} e={e} P={P} />}
    </DisasterStage>
  );
};

// ---------------------------------------------------------------- the fair
type FairProps = { t: number; P: Params; K: (n: number) => number; e: (n?: string) => number; theta: number; spin: number; stress: number; xr: number; glowK: number; bars: number; green: number; lights: number; raise: number; day: number };
const FairWorld: React.FC<FairProps> = ({ t, P, K, e, theta, spin, stress, xr, glowK, bars, green, lights, raise, day }) => {
  const g0 = gondolaAt(0, theta, spin);
  const { hub } = hubAt(theta);
  const armMid: V3 = [(hub[0] + g0[0]) / 2, (hub[1] + g0[1]) / 2, (hub[2] + g0[2]) / 2];
  const scatter = P.scatterAt ? K(e(P.scatterAt)) : undefined;
  const beam = P.inspector && (P.shot === "armlight" || P.shot === "inspect" || P.shot === "detail");
  const insp: V3 = [6.2, 2.0, 2.4];
  const label = (l: Lab, pos: V3, off: V3 = [1.2, 1.6, 0.6]) => (t >= e(l.at) ? <Label3D key={l.text} at={pos} offset={off} text={l.text} sub={l.sub} start={K(e(l.at))} color="#ffffff" px={42} /> : null);
  const partAt: Record<string, V3> = { BOOM: [hub[0] * 0.5, (13.2 + hub[1]) / 2, 0.4], TOWER: [-2.6, 7, 1.5], "WHEEL OF ARMS": [hub[0], hub[1], 0] };
  const listAt: Record<string, V3> = { bolts: [1.2, 3.8, 0.3], welds: [2.4, 4.0, 0.2], bars: [3.7, 3.6, 0.4], controls: [-9, 1.2, 7.4] };
  const listText: Record<string, string> = { bolts: "BOLTS", welds: "WELDS", bars: "BARS", controls: "CONTROLS" };
  const dripY = 3.8 - ((t * 0.08) % 3.6);
  const truckK = P.truckAt ? cue(t, e(P.truckAt), 90, (x) => x * x) : 0;
  const scopeCrew = P.scopeCrewAt ? cue(t, e(P.scopeCrewAt), 20) : 0;
  return (
    <group>
      <Grounds day={day} wet={P.phase === "rain" ? 1 : 0} other={P.other} />
      <FireBall theta={theta} spin={spin} f={t} lights={lights} raise={raise} other={P.other}
        arm0={{ stress, xray: xr, broken: P.broken || (P.failAt !== undefined && t >= e(P.failAt) + 4), glowK, mount: P.mountAt ? cue(t, e(P.mountAt), 12) : 0 }} bars={bars} green={green} riders={P.ridersK && t >= e("riders") - 20} />
      <Stalls x0={-34} n={15} z={-17} lights={lights} seed="row1" f={t} />
      <group position={[-30, 0, 0]} rotation-y={Math.PI / 2}><Stalls x0={-10} n={5} z={0} lights={lights} seed="row2" f={t} /></group>
      <group position={[30, 0, 0]} rotation-y={-Math.PI / 2}><Stalls x0={-10} n={5} z={0} lights={lights} seed="row3" f={t} /></group>
      <LightStrings lights={lights} f={t} />
      <FerrisWheel position={[-36, 0, -40]} f={t} lights={lights} />
      <Gate position={[0, 0, 40]} lights={lights} f={t} />
      <Booth position={[-9, 0, 6]} f={t} startGlow={e("start") < 1e8 ? cue(t, e("start"), 8) : 0} stickers={P.stickersAt ? cue(t, e(P.stickersAt), 50, (x) => x) : 1} screen={P.screen ? 1 : 0} />
      {P.office && <Rig position={[-16, 0, -4]} f={0} />}
      {P.crowd && <Crowd3D count={48} area={[34, 9]} position={[0, 0, 15]} height={1.7} seed="midway" mood={P.shot === "hook" || P.shot === "orbit" ? "lookUp" : "stand"} scatterAt={scatter} from={[0, 0, -6]} scatterDist={5} />}
      {P.crowd && <Crowd3D count={24} area={[40, 6]} position={[0, 0, -10]} height={1.7} seed="stalls" />}
      {(P.queue || P.shot === "queue") && <Crowd3D count={18} area={[9, 1.6]} position={[9, 0, 9]} height={1.7} seed="queue" />}
      {P.inspector && <Person3D position={insp} vest yaw={-0.9} arm={0.9} f={t} />}
      {P.inspector === 2 && <Person3D position={[4.5, 2.0, 3.6]} vest yaw={-0.4} f={t} seed={2} />}
      {beam && t >= (P.xrayAt ? 0 : 0) && <BeamCone from={[insp[0] - 0.3, insp[1] + 1.3, insp[2] - 0.2]} to={P.shot === "detail" && P.listAt ? listAt[(P.listAt.filter((w) => t >= e(w)).at(-1)) ?? "bolts"]! : armMid} />}
      {P.crew && [0, 1, 2].map((i) => <Person3D key={i} position={[5 + i * 1.6, 2.0, 3 - i * 0.8]} color={["#b8321f", "#2f4f7a", "#b8321f"][i]} yaw={-0.6 + i * 0.3} arm={i === 0 ? 0.6 + 0.3 * Math.sin(t * 0.2) : 0} f={t} seed={i} />)}
      {P.investigator && <Person3D position={[6 - 3 * (1 - cue(t, e("investigator"), 40)), 0, 10 - 2 * cue(t, e("investigator"), 40)]} color="#24303e" yaw={-2.6} arm={0.8} f={t} />}
      {P.engineers && [0, 1].map((i) => <Person3D key={i} position={[5.4 + i * 1.3, 2.0, 2.2 + i * 0.6]} color="#3a4a5e" yaw={-1.2} arm={i === 0 ? 0.9 : 0.2} f={t} seed={i + 4} />)}
      {P.rescue && <Rescuers spots={[[4.6, 0, 4.8], [6.4, 0, 3.6], [5.2, 0, 6.6], [7.6, 0, 5.4]]} height={1.75} enterAt={K(0)} enterFrom={-6} lamps />}
      {P.rescue && <Emergency f={t} k={1} away={truckK} />}
      {P.rescue && P.truckAt && (
        <group position={[-6 - 40 * truckK, 0, -9]}>
          <mesh position={[0, 1.2, 0]} {...sh}><boxGeometry args={[9, 0.5, 2.6]} /><Mat color="#3a3f47" metal={0.6} /></mesh>
          <mesh position={[-1, 2.1, 0]} {...sh}><boxGeometry args={[4, 1.4, 2.2]} /><Mat color="#2f4a3a" rough={0.9} metal={0} /></mesh>
          <mesh position={[5.2, 1.9, 0]} {...sh}><boxGeometry args={[2.6, 2.8, 2.5]} /><Mat color="#e6e8eb" rough={0.4} /></mesh>
        </group>
      )}
      {P.failAt && t >= e(P.failAt) && <Debris progress={cue(t, e(P.failAt), 40, (x) => x)} at={g0} count={46} dir={[1, 0.3, 0.4]} speed={3} size={0.08} seconds={1.6} slow={0.5} floor={0.05} color="#7a3a1a" seed="fbw" />}
      {P.tape && <Tape />}
      {P.broken && !P.failAt && (
        <group position={[7.2, 0.62, 4.6]} rotation={[0.25, 0.9, 0.5]}>
          <Gondola bars={0} green={0} />
        </group>
      )}
      {P.dustAt && t >= e(P.dustAt) && <Smoke frame={t - e(P.dustAt)} at={[7, 0.2, 4.5]} height={4} width={4} count={26} life={110} color="#b9a78e" opacity={0.6} wind={[0.4, 0, 0]} />}
      {P.drip && <mesh position={[3.75, dripY, 0]}><sphereGeometry args={[0.05, 8, 6]} /><Mat color="#9fc6e8" rough={0.05} metal={0.2} opacity={0.85} /></mesh>}
      {P.phase === "rain" && <Rain frame={t} center={[6, 6, 8]} size={[40, 14, 30]} count={1400} />}
      {P.label && label(P.label, [0, 13.4, 0], [2.5, 2.2, 1])}
      {P.plateAt && label({ at: P.plateAt, text: "KMG", sub: "THE NETHERLANDS" }, [-3.2, 6, 1.6], [-3.5, 1.5, 1])}
      {P.parts?.map((l) => label(l, partAt[l.text] ?? [0, 6, 0], [2, 1.2, 1]))}
      {P.listAt?.map((w) => label({ at: w, text: listText[w] ?? w.toUpperCase() }, listAt[w] ?? [0, 3, 0], [0.8, 0.9, 1]))}
      {P.scopeCrewAt && <Person3D position={[5.4, 2.0, 1.6]} vest yaw={-1.4} arm={0.8} f={t} />}
      {P.scopeCrewAt && scopeCrew > 0 && <mesh position={[4.6, 3.8, 0.6]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.03, 0.03, 1.8 * scopeCrew, 6]} /><Mat color="#111" /></mesh>}
      {lights > 0.4 && <pointLight position={[0, 9, 4]} intensity={30 * lights} distance={26} color="#ffb070" />}
    </group>
  );
};

/** The inspector's flashlight: a soft cone from the hand to the spot it lights, ending on the paint. */
const BeamCone: React.FC<{ from: V3; to: V3 }> = ({ from, to }) => {
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const L = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(dx, dz), pitch = Math.acos(Math.max(-1, Math.min(1, dy / L)));
  return (
    <group position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]} rotation={[0, yaw, 0]}>
      <mesh rotation={[pitch, 0, 0]}><coneGeometry args={[0.35, L, 24, 1, true]} /><meshBasicMaterial color="#fff2b0" transparent opacity={0.22} depthWrite={false} /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- the highway
const RoadWorld: React.FC<{ t: number; truckX: number }> = ({ t, truckX }) => (
  <group>
    <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[400, 200]} /><Mat color="#6f8a4c" rough={1} metal={0} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow><planeGeometry args={[400, 9]} /><Mat color="#3b3d41" rough={0.9} metal={0} /></mesh>
    {Array.from({ length: 60 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[-150 + i * 6, 0.03, 0]}><planeGeometry args={[3, 0.18]} /><meshBasicMaterial color="#f2f2f2" /></mesh>)}
    {Array.from({ length: 40 }, (_, i) => {
      const x = -120 + i * 7 + rnd("rt", i) * 4, z = (i % 2 ? -1 : 1) * (10 + rnd("rz", i) * 12);
      return (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.2, 0.3, 3, 6]} /><Mat color="#3d2f22" rough={1} metal={0} /></mesh>
          <mesh position={[0, 4, 0]}><sphereGeometry args={[2, 10, 8]} /><Mat color="#3f6b3a" rough={1} metal={0} /></mesh>
        </group>
      );
    })}
    <group position={[8, 0, -6]}>
      <mesh position={[0, 2.5, 0]}><boxGeometry args={[0.2, 5, 0.2]} /><Mat color="#8a9096" metal={0.7} /></mesh>
      <mesh position={[0, 5.2, 0.1]}><boxGeometry args={[4.6, 1.8, 0.1]} /><Mat color="#1d6b3a" rough={0.5} /></mesh>
    </group>
    <Label3D at={[8, 5.4, -5.9]} offset={[0, 0.01, 0.2]} text="NEXT FAIR" color="#ffffff" px={40} />
    <Rig position={[truckX, 0, 0]} f={t} />
  </group>
);

// ---------------------------------------------------------------- the workshop: one sweep arm cut open
const W = 0.1, WT = 0.035;
const RUSTS = ["#5a2a12", "#6e3418", "#43200e", "#7d3d1c"];
const Workshop: React.FC<{ t: number; P: Params; e: (n?: string) => number; failK: number }> = ({ t, P, e, failK }) => {
  const r0 = P.rust ?? 0;
  const rust = P.rustAt ? r0 + (1 - r0) * cue(t, e(P.rustAt), 60) : r0;
  const open = P.cutAt ? cue(t, e(P.cutAt), 26) : 0;
  const xr = (P.xrayAt ? cue(t, e(P.xrayAt), 14) : 0);
  const thin = P.wallThin ? WT : W;
  const water = P.water || (P.waterAt ? t >= e(P.waterAt) : false) ? (P.waterAt ? cue(t, e(P.waterAt), 20) : 1) : 0;
  const stressBase = P.stressAt ? cue(t, e(P.stressAt), 30, (x) => x) : 0;
  const pulse = P.pulseAt && !P.xrayAt && t >= e(P.pulseAt) ? 0.35 + 0.3 * Math.sin((t - e(P.pulseAt)) * 0.25) : 0;
  const glowJ = P.glowAt ? cue(t, e(P.glowAt), 12) : 0;
  const stress = Math.max(stressBase, pulse, glowJ, P.failed ? 0.7 : 0);
  const crack = P.crackAt && t >= e(P.crackAt) ? 0.5 + 0.5 * Math.sin(t * 0.9) : 0;
  const mount = P.mountAt ? cue(t, e(P.mountAt), 12) : 0;
  const cap = P.closeAt ? cue(t, e(P.closeAt), 16) : 0;
  const lift = e("light") < 1e8 ? 0.25 * cue(t, e("light"), 30) : 0;
  const wallO = (k: number) => (k > 0.01 ? Math.max(0.2, 1 - 0.75 * k) : undefined);
  const nearOpacity = Math.max(open, xr);
  const scope = P.scopeAt ? cue(t, e(P.scopeAt), 70, (x) => x) : 0;
  const tipX = -4.6 + 6.5 * scope;
  const blast = P.blastAt && t >= e(P.blastAt) ? Math.min(1, (t - e(P.blastAt)) / 10) * Math.max(0, 1 - (t - e(P.blastAt) - 60) / 20) : 0;
  const pulseRing = P.pulseAt && P.xrayAt && t >= e(P.pulseAt) ? ((t - e(P.pulseAt)) % 30) / 30 : -1;
  const beamOn = P.lightBeam && (!P.beamAt || t >= e(P.beamAt) - 10);
  const sx = P.travelAt ? -3.2 + 5 * cue(t, e(P.travelAt), 80) : -3.4;
  // the joint segment (x 3.4 → 4) is the part that tears off
  const jx = 0.7 * failK, jy = -1.4 * failK * failK, jr = -0.7 * failK;
  const paint = "#c9281c";
  const blobs = Array.from({ length: 160 }, (_, i) => {
    const face = i % 3;
    const x = -3.8 + rnd("rb", i) * 7.6;
    const u = (rnd("rv", i) - 0.5) * 0.76;
    const s = (0.03 + rnd("rs", i) * 0.09) * k01(rust * 1.3 - rnd("rr", i) * 0.5);
    const pos: V3 = face === 0 ? [x, 1.1 + W + 0.005, u] : face === 1 ? [x, 2.1 - W - 0.005, u] : [x, 1.6 + u, -0.5 + W + 0.005];
    return { pos, s, c: RUSTS[i % 4]!, face };
  });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[60, 60]} /><Mat color="#3a3c40" rough={0.85} metal={0.1} /></mesh>
      {[[-7, 6, 3], [7, 6, -2]].map((q, i) => <pointLight key={i} position={q as V3} intensity={60} distance={24} color="#ffe6c4" />)}
      {[-2.6, 2.2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.5, 0]} {...sh}><boxGeometry args={[0.3, 1, 1.4]} /><Mat color="#6b5a3a" rough={0.9} metal={0} /></mesh>
        </group>
      ))}
      {/* crane slings */}
      {[-2, 2].map((x) => <mesh key={x} position={[x, 5.2, 0]}><cylinderGeometry args={[0.02, 0.02, 6, 6]} /><Mat color="#c9c9c9" metal={0.8} /></mesh>)}
      <group position={[0, lift, 0]}>
        {/* main tube, x -4 → 3.4 */}
        <mesh position={[-0.3, 1.1 + W / 2, 0]} {...sh}><boxGeometry args={[7.4, W, 1]} /><Mat color={paint} rough={0.4} metal={0.3} /></mesh>
        <mesh position={[-0.3, 2.1 - W / 2, 0]} {...sh}><boxGeometry args={[7.4, W, 1]} /><Mat color={paint} rough={0.4} metal={0.3} opacity={wallO(xr)} /></mesh>
        <mesh position={[-0.3, 1.6, -0.5 + W / 2]} {...sh}><boxGeometry args={[7.4, 1, W]} /><Mat color={paint} rough={0.4} metal={0.3} /></mesh>
        {nearOpacity < 0.98 && (
          <mesh position={[-0.3, 1.6 + 2.4 * open, 0.5 - W / 2 + 0.8 * open]} {...sh}><boxGeometry args={[7.4, 1, W]} /><Mat color={paint} rough={0.4} metal={0.3} opacity={1 - 0.8 * nearOpacity} /></mesh>
        )}
        {/* the steel's grey cut edge, so the wall's thickness reads */}
        {open > 0.5 && [1.1 + W / 2, 2.1 - W / 2].map((y, i) => <mesh key={i} position={[-0.3, y, 0.501]}><boxGeometry args={[7.4, W * 0.9, 0.004]} /><Mat color="#b7bcc2" metal={0.9} rough={0.25} /></mesh>)}
        {/* rust on the inner faces */}
        {rust > 0.02 && (
          <group>
            <mesh position={[-0.3, 1.1 + W + 0.003, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[7.3, 0.8]} /><Mat color="#6e3418" rough={1} metal={0} opacity={Math.min(0.95, rust)} /></mesh>
            <mesh position={[-0.3, 2.1 - W - 0.003, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[7.3, 0.8]} /><Mat color="#7d3d1c" rough={1} metal={0} opacity={Math.min(0.95, rust)} /></mesh>
            <mesh position={[-0.3, 1.6, -0.5 + W + 0.003]}><planeGeometry args={[7.3, 0.8]} /><Mat color="#743a1a" rough={1} metal={0} opacity={Math.min(0.95, rust)} /></mesh>
            {blobs.map((b, i) => b.s > 0.005 && (
              <mesh key={i} position={b.pos} scale={[b.s * 2.4, b.face === 2 ? b.s * 1.4 : 0.012 + b.s * 0.12, b.face === 2 ? 0.012 + b.s * 0.12 : b.s * 1.8]}><sphereGeometry args={[1, 8, 6]} /><Mat color={b.c} rough={1} metal={0} /></mesh>
            ))}
          </group>
        )}
        {water > 0 && <mesh position={[2.3, 1.1 + W + 0.03, 0]}><boxGeometry args={[2.2, 0.05, 0.78]} /><Mat color="#3f7fb0" rough={0.05} metal={0.3} opacity={0.75 * water} /></mesh>}
        {/* the end cap at -x (closes the tube) */}
        {cap > 0 && <mesh position={[-4 - 0.6 * (1 - cap), 1.6, 0]}><boxGeometry args={[0.08, 1, 1]} /><Mat color={paint} rough={0.4} metal={0.3} /></mesh>}
        {/* the joint segment at the gondola end, which tears off */}
        <group position={[3.4 + jx, jy, 0]} rotation-z={jr}>
          {failK < 1 || !P.failed ? (
            <group>
              <mesh position={[0.3, 1.1 + thin / 2, 0]} {...sh}><boxGeometry args={[0.6, thin, 1]} /><Mat color={stress > 0.05 ? rampHex(stress) : paint} emissive={stress > 0.05 ? rampHex(stress) : undefined} ei={stress} rough={0.4} metal={0.3} /></mesh>
              <mesh position={[0.3, 2.1 - thin / 2, 0]} {...sh}><boxGeometry args={[0.6, thin, 1]} /><Mat color={stress > 0.05 ? rampHex(stress) : paint} emissive={stress > 0.05 ? rampHex(stress) : undefined} ei={stress} rough={0.4} metal={0.3} opacity={wallO(xr)} /></mesh>
              <mesh position={[0.3, 1.6, -0.5 + thin / 2]} {...sh}><boxGeometry args={[0.6, 1, thin]} /><Mat color={stress > 0.05 ? rampHex(stress) : paint} emissive={stress > 0.05 ? rampHex(stress) : undefined} ei={stress} rough={0.4} metal={0.3} /></mesh>
              {nearOpacity < 0.98 && <mesh position={[0.3, 1.6 + 2.4 * open, 0.5 - thin / 2 + 0.8 * open]}><boxGeometry args={[0.6, 1, thin]} /><Mat color={paint} opacity={1 - 0.8 * nearOpacity} /></mesh>}
              {rust > 0.02 && <mesh position={[0.3, 1.1 + thin + 0.003, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.58, 0.85]} /><Mat color="#5e2c14" rough={1} metal={0} opacity={Math.min(0.95, rust)} /></mesh>}
              <mesh position={[0.62, 1.6, 0]} {...sh}><boxGeometry args={[0.06, 1.1, 1.1]} /><Mat color="#8f969e" metal={0.8} rough={0.3} /></mesh>
              <mesh position={[0.8, 0.85, 0]} {...sh}><boxGeometry args={[0.4, 0.9, 0.5]} /><Mat color="#8f969e" metal={0.8} rough={0.3} emissive={mount > 0 ? "#ffb23e" : undefined} ei={mount * 0.8} /></mesh>
            </group>
          ) : null}
        </group>
        {/* the break faces left on the arm (after the failure) */}
        {failK > 0.5 && [[1.1 + thin / 2, [0.02, thin, 1]], [2.1 - thin / 2, [0.02, thin, 1]]].map(([y, s], i) => (
          <mesh key={i} position={[3.4, y as number, 0]}><boxGeometry args={s as V3} /><Mat color="#a3501e" emissive="#ff6a1a" ei={P.failed ? 0.7 + 0.2 * Math.sin(t * 0.2) : 0.9} /></mesh>
        ))}
        {failK > 0.5 && <mesh position={[3.4, 1.6, -0.5 + thin / 2]}><boxGeometry args={[0.02, 1, thin]} /><Mat color="#a3501e" emissive="#ff6a1a" ei={0.8} /></mesh>}
        {crack > 0 && <mesh position={[3.4, 1.6, 0]}><boxGeometry args={[0.03, 1.04, 1.04]} /><Mat color="#ff2a1a" emissive="#ff2a1a" ei={1.5 * crack} opacity={0.9} /></mesh>}
        {P.failAt && failK > 0 && <Debris progress={failK} at={[3.4, 1.6, 0]} count={40} dir={[1, 0.4, 0.3]} speed={2.4} size={0.05} seconds={1.6} slow={0.5} floor={0.02} color="#7a3a1a" seed="fb" />}
        {/* the scope: a black cable fed in from the open end, its lit tip lighting the rust */}
        {scope > 0 && (
          <group>
            <mesh position={[(tipX - 7) / 2, 1.3, 0.1]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.03, 0.03, Math.max(0.01, tipX + 7), 8]} /><Mat color="#101114" rough={0.6} /></mesh>
            <mesh position={[tipX, 1.3, 0.1]} material={glow("#e8f4ff")}><sphereGeometry args={[0.06, 10, 8]} /></mesh>
            <pointLight position={[tipX + 0.2, 1.4, 0.1]} intensity={8} distance={3} color="#e8f4ff" />
          </group>
        )}
        {(P.shot === "inside" || P.scopeLight) && <pointLight position={[sx + 0.4, 1.7, 0]} intensity={P.scopeLight ? 4 : 2.2} distance={4} color={P.scopeLight ? "#fff3c4" : "#ffd9a8"} />}
        {pulseRing >= 0 && <mesh position={[0.4, 1.6, 0.52]}><ringGeometry args={[0.1 + pulseRing * 0.7, 0.16 + pulseRing * 0.7, 40]} /><meshBasicMaterial color="#ff3b30" transparent opacity={1 - pulseRing} /></mesh>}
        {P.stickerOn && <mesh position={[-1.2, 1.6, 0.508]}><circleGeometry args={[0.16, 24]} /><Mat color="#2a9d3f" rough={0.4} metal={0} /></mesh>}
      </group>
      {beamOn && <BeamCone from={[1.6, 4.6, 3.6]} to={[0.4, 1.7, 0.56]} />}
      {blast > 0 && Array.from({ length: 50 }, (_, i) => {
        const u = ((t * 0.05 + rnd("gb", i)) % 1);
        return <mesh key={i} position={[-1.8 + u * 1.4 + rnd("gx", i) * 0.4, 3.4 - u * 1.7, 2.2 - u * 1.6 + rnd("gz", i) * 0.4]}><sphereGeometry args={[0.025, 5, 4]} /><Mat color="#cfc8bb" opacity={0.8 * blast} /></mesh>;
      })}
      {blast > 0 && <mesh position={[-1.9, 3.5, 2.3]} rotation-x={0.8}><cylinderGeometry args={[0.06, 0.09, 0.6, 10]} /><Mat color="#2b2d31" metal={0.6} /></mesh>}
    </group>
  );
};

// ---------------------------------------------------------------- the evidence building
const ShedWorld: React.FC<{ t: number; e: (n?: string) => number; P: Params }> = ({ t, e, P }) => {
  const door = P.doorAt ? cue(t, e(P.doorAt), 40) : 0;
  const on = cue(t, e("gondola") - 10, 12);
  const flick = on * (t < e("gondola") + 10 ? 0.5 + 0.5 * Math.sin(t * 2.2) : 1);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[18, 14]} /><Mat color="#6a6d70" rough={0.9} metal={0.1} /></mesh>
      <mesh position={[0, 3, -6]} receiveShadow><boxGeometry args={[18, 6, 0.2]} /><Mat color="#4a4f56" rough={0.9} metal={0.2} /></mesh>
      <mesh position={[-8, 3, 0]} receiveShadow><boxGeometry args={[0.2, 6, 14]} /><Mat color="#43484f" rough={0.9} metal={0.2} /></mesh>
      {[-5, -2.5].map((z) => <group key={z} position={[-7.3, 0, z]}>{[0.6, 1.6, 2.6].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[1, 0.08, 2]} /><Mat color="#6b6f75" metal={0.6} /></mesh>)}{[0.4, 1.4].map((y, i) => <mesh key={i} position={[0, y + 0.5, 0.3 - i * 0.5]}><boxGeometry args={[0.6, 0.5, 0.6]} /><Mat color="#9a7a4a" rough={0.9} metal={0} /></mesh>)}</group>)}
      {/* the roller door in the back wall */}
      <mesh position={[3, 2.5, -5.88]}><planeGeometry args={[5, 5]} /><Mat color="#1d2024" /></mesh>
      <mesh position={[3, 5 - 2.5 * door, -5.85]}><planeGeometry args={[5, 5 * door + 0.01]} /><Mat color="#a7adb3" metal={0.6} rough={0.4} /></mesh>
      {[-3, 0, 3].map((x) => (
        <group key={x}>
          <mesh position={[x, 5.7, 0]} material={glow("#eef6ff", Math.round((0.15 + 0.85 * flick) * 10) / 10)}><boxGeometry args={[2.2, 0.08, 0.2]} /></mesh>
          <pointLight position={[x, 5.3, 0]} intensity={14 * flick} distance={12} color="#eef6ff" />
        </group>
      ))}
      <mesh position={[0, 0.12, 0]} {...sh}><boxGeometry args={[3, 0.24, 2]} /><Mat color="#8a6a42" rough={0.9} metal={0} /></mesh>
      <group position={[0, 0.85, 0]} rotation-y={0.4}><Gondola bars={0.15} />
        <mesh position={[0, 1.05, -0.62]}><boxGeometry args={[0.56, 0.56, 0.56]} /><Mat color="#6e3418" rough={1} metal={0} emissive="#ff6a1a" ei={0.25 * cue(t, e("break"), 12)} /></mesh>
        {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-0.25 + rnd("gm", i) * 0.5, 0.8 + rnd("gn", i) * 0.5, -0.33]} scale={[0.06, 0.05, 0.01]}><sphereGeometry args={[1, 6, 5]} /><Mat color="#5a2a12" rough={1} metal={0} /></mesh>)}
      </group>
      <mesh position={[1.1, 1.3, 0.75]} rotation-y={0.4}><planeGeometry args={[0.4, 0.25]} /><Mat color="#ffffff" /></mesh>
      {t >= e("evidence") && <Label3D at={[1.1, 1.3, 0.8]} offset={[1, 1, 0.5]} text="EVIDENCE" start={0} color="#ffffff" px={40} />}
      {t >= e("break") && <pointLight position={[0.2, 2.6, 1.2]} intensity={10 * cue(t, e("break"), 12)} distance={5} color="#ffb23e" />}
      <Bulbs from={[-6, 0.05, 4]} to={[6, 0.05, 4]} n={1} on={0} />
    </group>
  );
};

// ---------------------------------------------------------------- overlays
const CauseTags: React.FC<{ t: number; tags: { at: number; text: string; red?: boolean }[] }> = ({ t, tags }) => (
  <div style={{ position: "absolute", left: 1200, top: 170, display: "flex", flexDirection: "column", gap: 22 }}>
    {tags.map((g, i) => {
      if (t < g.at) return null;
      const k = Math.min(1, (t - g.at) / 8);
      return (
        <div key={i} style={{ opacity: k, transform: `translateX(${(1 - k) * 40}px)`, display: "flex", alignItems: "center", gap: 16, background: "rgba(18,14,10,0.86)", border: `4px solid ${g.red ? RED : "#ffd27a"}`, padding: "10px 22px", borderRadius: 8 }}>
          <div style={{ fontFamily: ANTON, fontSize: 52, color: g.red ? RED : "#ffd27a" }}>{["I", "II", "III", "IV"][i]}</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, color: "#ffffff", letterSpacing: 2, whiteSpace: "nowrap" }}>{g.text}</div>
        </div>
      );
    })}
  </div>
);

const CrossTags: React.FC<{ t: number; tags: { at: number; text: string }[] }> = ({ t, tags }) => (
  <div style={{ position: "absolute", left: 1300, top: 190, display: "flex", flexDirection: "column", gap: 24 }}>
    {tags.map((g, i) => {
      if (t < g.at) return null;
      const k = Math.min(1, (t - g.at) / 6), x = Math.min(1, Math.max(0, (t - g.at - 10) / 8));
      return (
        <div key={i} style={{ position: "relative", opacity: k, background: "rgba(18,14,10,0.86)", border: "4px solid #ffd27a", padding: "8px 26px", borderRadius: 8, fontFamily: MONO, fontWeight: 700, fontSize: 44, color: "#ffffff" }}>
          {g.text}
          <div style={{ position: "absolute", left: 10, right: 10, top: "50%", height: 8, background: RED, transform: `scaleX(${x})`, transformOrigin: "left" }} />
        </div>
      );
    })}
  </div>
);

const Panel: React.FC<{ x: number; y: number; w: number; k: number; children: React.ReactNode; dark?: boolean }> = ({ x, y, w, k, children, dark }) =>
  k <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y + (1 - k) * 30, width: w, opacity: k, background: dark ? "rgba(8,14,24,0.92)" : "rgba(250,246,236,0.96)", border: `4px solid ${dark ? "#4fa8ff" : "#1f1b16"}`, borderRadius: 10, padding: "18px 26px", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>{children}</div>
  );

const ProgramScreen: React.FC<{ t: number; lockAt: number }> = ({ t, lockAt }) => {
  const k = Math.min(1, t / 10);
  const rows = ["SPEED", "SWING", "RIDE TIME"];
  return (
    <Panel x={1220} y={160} w={560} k={k} dark>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: "#9fd0ff", letterSpacing: 3 }}>RIDE PROGRAM · AUTO</div>
      {rows.map((r, i) => {
        const locked = t >= lockAt + i * 8;
        return (
          <div key={r} style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontFamily: MONO, fontWeight: 700, fontSize: 38, color: "#ffffff" }}>
            <span>{r}</span><span style={{ color: locked ? "#ffd27a" : "#5c7a99" }}>{locked ? "LOCKED" : "SET"}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 16, height: 14, background: "#16304d", borderRadius: 7 }}><div style={{ width: `${Math.min(100, Math.max(0, (t - lockAt - 20) * 2))}%`, height: 14, background: "#4fa8ff", borderRadius: 7 }} /></div>
    </Panel>
  );
};

const StartPanel: React.FC<{ t: number; at: number; startAt: number }> = ({ t, at, startAt }) => {
  const on = t >= startAt;
  return (
    <Panel x={1300} y={170} w={480} k={Math.min(1, Math.max(0, (t - at) / 10))} dark>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: "#9fd0ff", letterSpacing: 3 }}>OPERATOR PANEL</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 14 }}>
        <div style={{ width: 90, height: 90, borderRadius: 45, background: on ? "#39ff7a" : "#1d4a2c", boxShadow: on ? "0 0 30px #39ff7a" : "none", border: "6px solid #c9ced6" }} />
        <div style={{ fontFamily: ANTON, fontSize: 64, color: on ? "#39ff7a" : "#5c7a99" }}>START</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#ffffff", marginTop: 10 }}>ALL BARS LOCKED</div>
    </Panel>
  );
};

const StickerRow: React.FC<{ t: number; at: number; more: number }> = ({ t, at, more }) => {
  const cols = ["#2a9d3f", "#1f6fd1", "#e9a91c", "#c9281c"];
  const times = [at, more, more + 10, more + 20];
  return (
    <div style={{ position: "absolute", left: 1080, top: 180, display: "flex", gap: 26 }}>
      {cols.map((c, i) => {
        if (t < times[i]!) return null;
        const k = Math.min(1, (t - times[i]!) / 6);
        return (
          <div key={i} style={{ width: 170, height: 170, borderRadius: 85, background: c, border: "6px solid #ffffff", transform: `scale(${1.5 - 0.5 * k}) rotate(${(i % 2 ? 8 : -6)}deg)`, opacity: k, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#ffffff" }}>STATE</div>
            <div style={{ fontFamily: ANTON, fontSize: 34, color: "#ffffff" }}>INSPECTED</div>
          </div>
        );
      })}
    </div>
  );
};

const CheckSheet: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const items = ["RESTRAINTS", "LIGHTS", "CONTROLS", "BOLTS"];
  return (
    <Panel x={1240} y={170} w={520} k={Math.min(1, Math.max(0, (t - at + 6) / 10))}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: "#1f1b16", letterSpacing: 3 }}>DAILY INSPECTION</div>
      {items.map((it, i) => (
        <div key={it} style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: MONO, fontWeight: 700, fontSize: 38, color: "#1f1b16" }}>
          <span>{it}</span><span style={{ color: "#1f8a3f", opacity: t >= at + 8 + i * 9 ? 1 : 0 }}>✓</span>
        </div>
      ))}
    </Panel>
  );
};

const LawSheet: React.FC<{ t: number; at: number; signAt: number }> = ({ t, at, signAt }) => {
  const s = Math.min(1, Math.max(0, (t - signAt) / 24));
  return (
    <Panel x={1180} y={150} w={600} k={Math.min(1, Math.max(0, (t - at) / 10))}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: "#6b5a3a", letterSpacing: 3 }}>STATE OF OHIO</div>
      <div style={{ fontFamily: ANTON, fontSize: 62, color: "#1f1b16", lineHeight: 1.1 }}>NEW RIDE SAFETY LAW</div>
      <svg width={540} height={90} style={{ marginTop: 8 }}>
        <path d="M 10 60 C 60 10, 90 80, 140 40 S 220 20, 260 55 S 360 70, 420 30" fill="none" stroke="#1f3a6b" strokeWidth={5} strokeDasharray={600} strokeDashoffset={600 * (1 - s)} strokeLinecap="round" />
        <line x1={10} y1={80} x2={520} y2={80} stroke="#1f1b16" strokeWidth={2} />
      </svg>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#1f1b16" }}>SIGNED BY THE GOVERNOR</div>
    </Panel>
  );
};

const PaperChip: React.FC<{ t: number; at: number; title: string; line: string }> = ({ t, at, title, line }) => (
  <Panel x={1180} y={180} w={620} k={Math.min(1, Math.max(0, (t - at) / 10))}>
    <div style={{ fontFamily: ANTON, fontSize: 60, color: "#1f1b16" }}>{title}</div>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: "#1f1b16", marginTop: 6 }}>{line}</div>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#6b5a3a", marginTop: 6 }}>FROM THE FIRST OWNER</div>
  </Panel>
);

const ScopeScreen: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = Math.min(1, Math.max(0, (t - at + 4) / 10));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 1220, top: 150, width: 580, opacity: k, background: "#111317", border: "8px solid #2b2e34", borderRadius: 14, padding: 14, boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
      <div style={{ height: 300, borderRadius: 8, background: `radial-gradient(circle at ${50 + 8 * Math.sin(t * 0.05)}% 55%, #e6a060 0%, #8c4a20 30%, #4a2210 62%, #120804 100%)` }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: "#ffd27a", marginTop: 10, letterSpacing: 3 }}>SCOPE · INSIDE THE BEAM</div>
    </div>
  );
};

/** The force a rider feels: one arrow on the seat, long at the bottom of the swing, short at the top. */
const GArrow: React.FC<{ t: number; theta: number }> = ({ t, theta }) => {
  const g = Math.max(0.12, Math.cos(theta) * 1.1 + 0.3 * Math.cos(theta) ** 2);
  const L = 60 + 220 * Math.min(1.4, g) / 1.4;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: Math.min(1, t / 10) }}>
      <g transform="translate(1500 300)">
        <rect x={-40} y={-80} width={320} height={60} rx={8} fill="rgba(18,14,10,0.86)" />
        <text x={120} y={-38} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill="#ffffff">SEAT FORCE</text>
        <line x1={120} y1={10} x2={120} y2={10 + L} stroke="#ffd27a" strokeWidth={22} />
        <path d={`M 80 ${10 + L} L 160 ${10 + L} L 120 ${60 + L} Z`} fill="#ffd27a" />
      </g>
    </svg>
  );
};

export default Scene3D;
