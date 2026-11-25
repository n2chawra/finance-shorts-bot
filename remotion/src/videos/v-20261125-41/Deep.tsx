// Deep (3D, the Titan world in the Instrument Panel look's night grade): every 3D beat of the promo, by
// params.mode:
//   hook   — Titan sinking through black water, lamps on; the last message rises as a bubble, ticks ROUTINE, two
//            weights fall away on "dropped", then the camera pulls wide and NO REPLY blinks ("silent");
//   hull   — beside Titan, the fairing cuts away to the black carbon cylinder, its wall thickness, the domes;
//   fail   — silence, time slowed: the hull red, the wall buckles and the hull collapses in a flash (no words);
//   after  — far out in the dark: the debris settling, the seconds readout, the greyed message, five lit figures
//            (one for each person aboard) going out one by one; nobody is drawn;
//   loop   — dawn on the surface, Titan on its platform by the support ship; it sinks, and we are back on the
//            first frame (the hook's opening pose).
// Figures only from params.fig.
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, DisasterStage, Focus, glow, Label3D, Ocean, type CamKey, type V3 } from "../../three/index";
import { HonestyTag } from "../../disaster/index";
import { Implosion, M, Platform, Ship, Snow, Titan } from "./world";
import { AMBER, Bubble, Chip, figOf, GREEN, moments, Readout, RED, sm, StampHtml } from "./ui";

type Params = { mode?: string };
const DEEPBG = { top: "#06243a", bottom: "#000306" };
const DAWN = { top: "#6f8296", bottom: "#c9b9a4" };

/** The hook's opening pose (the loop ends on it). */
export const HOOK_A: { pos: V3; look: V3 } = { pos: [6.2, 0.8, 11.5], look: [0.4, -0.6, 0] };

/** Two steel drop weights under the sub's rails: they fall away from `at` (frames since the word, ≥ 0). */
const Weights: React.FC<{ since: number }> = ({ since }) => (
  <group>
    {[-0.9, 0.6].map((x, i) => {
      const s = Math.max(0, since - i * 5);
      const y = -1.25 - 0.0026 * s * s;
      const rz = s * 0.02 * (i ? 1 : -1);
      return (
        <group key={i} position={[x, y, 0]} rotation={[0, 0, rz]}>
          <mesh material={M.grey()} castShadow><boxGeometry args={[0.55, 0.32, 0.9]} /></mesh>
          {s > 0 && Array.from({ length: 8 }, (_, j) => (
            <mesh key={j} position={[(j % 3) * 0.12 - 0.12, 0.3 + j * 0.25 + s * 0.01, ((j * 7) % 3) * 0.1 - 0.1]} material={glow("#d6f0ff", Math.max(0, 0.6 - j * 0.06))}>
              <sphereGeometry args={[0.05 + (j % 3) * 0.02, 8, 6]} />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

/** A sound ring leaving the sub (its acoustic link pinging); stops at `stopAt`. */
const Pings: React.FC<{ t: number; stopAt: number }> = ({ t, stopAt }) => (
  <group>
    {[0, 1].map((i) => {
      const start = Math.floor((t - i * 22) / 44) * 44 + i * 22;
      if (start > stopAt) return null;
      const k = (t - start) / 44;
      if (k < 0 || k > 1) return null;
      return (
        <mesh key={i} rotation-y={Math.PI / 2}>
          <torusGeometry args={[1.0 + k * 2.2, 0.02 + 0.03 * (1 - k), 8, 64]} />
          <meshBasicMaterial color="#39ff9a" transparent opacity={Math.max(0, 0.7 - k * 0.7)} />
        </mesh>
      );
    })}
  </group>
);

/** Small lit figures, one per person aboard, going out one by one from `outAt` (no people drawn, only lights). */
const Lamps: React.FC<{ n: number; t: number; at: number; outAt: number }> = ({ n, t, at, outAt }) => {
  if (t < at || n <= 0) return null;
  const k = sm((t - at) / 10);
  const gap = 120, w = n * gap;
  return (
    <svg width={w + 40} height={200} style={{ position: "absolute", left: 540 - w / 2 - 20, top: 980, opacity: k }}>
      {Array.from({ length: n }, (_, i) => {
        const off = t >= outAt + i * 7;
        const c = off ? "#26332c" : "#ffe7a8";
        return (
          <g key={i} transform={`translate(${40 + i * gap} 20) scale(1.3)`} style={{ filter: off ? "none" : "drop-shadow(0 0 10px #ffcf6a)" }}>
            <circle cx={20} cy={18} r={15} fill={c} />
            <path d="M 2 120 L 4 52 Q 20 36 36 52 L 38 120 Z" fill={c} />
          </g>
        );
      })}
    </svg>
  );
};

const Deep: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "hook";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const f = (n: string) => figOf(p, n);
  const end = Math.max(30, m.end);
  const ease = (x: number) => x;

  // ---- the world's state for this beat
  const surface = mode === "loop" && t < e("last") - 3;
  const sinkLoop = mode === "loop" ? cue(t, e("titan"), 50, (x) => x * x) : 0;
  const stress = mode === "fail" ? 0.45 + 0.55 * cue(t, 0, Math.max(1, e("give")), (x) => x) : 0;
  const crush = mode === "fail" ? cue(t, e("give"), 6, ease) : 0;
  const boom = mode === "fail" ? cue(t, e("give"), 70, ease) : 0;
  const gone = mode === "after" || (mode === "fail" && crush >= 0.98);
  const cut = mode === "hull" ? cue(t, e("carbon"), 22) : mode === "fail" ? 1 : 0; // fairing fully cut away in the failure shot
  const domeGlow = mode === "hull" ? cue(t, e("thick") + 12, 10) : 0;
  const lights = mode === "fail" ? (crush > 0 ? 0 : 1) : 1;
  const pitch = -0.08;

  // ---- the camera (one pose per word; size changes on the words the params name)
  let keys: CamKey[];
  if (mode === "hook") {
    const d = e("routine"), s = e("silent");
    keys = [
      { f: 0, pos: HOOK_A.pos, look: HOOK_A.look, fov: 44 },
      { f: d, pos: [5.4, 0.6, 9.8], look: [0.3, -0.7, 0], fov: 44 },
      { f: d + 16, pos: [3.4, -0.8, 6.2], look: [0, -1.4, 0], fov: 44 },
      { f: s, pos: [3.2, -0.9, 5.9], look: [0, -1.6, 0], fov: 44 },
      { f: s + 20, pos: [9, 1.6, 17], look: [0, -1.2, 0], fov: 44 },
      { f: end + 10, pos: [9.6, 1.9, 18.5], look: [0, -1.2, 0], fov: 44 },
    ];
  } else if (mode === "hull") {
    const tu = e("carbon"), ti = e("thick");
    keys = [
      { f: 0, pos: [-3, 2.2, 12], look: [0, 0, 0], fov: 42 },
      { f: tu, pos: [-1.5, 1.8, 11], look: [0, 0, 0], fov: 42 },
      { f: tu + 18, pos: [-0.6, 0.9, 6.2], look: [-0.2, 0, 0], fov: 42, orbit: true },
      { f: ti, pos: [0.6, 0.8, 6.0], look: [0, 0, 0], fov: 42 },
      { f: ti + 18, pos: [3.5, 1.4, 10], look: [0.6, 0, 0], fov: 42, orbit: true },
      { f: end + 10, pos: [4.6, 1.6, 9.6], look: [0.6, 0, 0], fov: 42 },
    ];
  } else if (mode === "fail") {
    const w = e("wide");
    keys = [
      { f: 0, pos: [2.6, 0.9, 4.8], look: [0, 0, 0], fov: 42 },
      { f: w, pos: [2.3, 0.8, 4.3], look: [0, 0, 0], fov: 42 },
      { f: w + 10, pos: [5, 1.6, 10], look: [0, 1, 0], fov: 44, cut: true },
      { f: end + 10, pos: [5.4, 1.8, 10.8], look: [0, 1.5, 0], fov: 44 },
    ];
  } else if (mode === "after") {
    const im = e("imploded"), pe = e("aboard");
    keys = [
      { f: 0, pos: [8, 2, 15], look: [0, 1, 0], fov: 44 },
      { f: im, pos: [7.4, 1.8, 13.5], look: [0, 1, 0], fov: 44 },
      { f: im + 20, pos: [5.4, 1.2, 10], look: [0, 0.5, 0], fov: 44 },
      { f: pe, pos: [5.2, 1.1, 9.6], look: [0, 0.4, 0], fov: 44 },
      { f: pe + 18, pos: [3.6, 0.6, 6.5], look: [0, 0, 0], fov: 44 },
      { f: end + 10, pos: [3.2, 0.4, 5.8], look: [0, 0, 0], fov: 44 },
    ];
  } else {
    const fu = e("titan"), st = e("last") - 3;
    keys = [
      { f: 0, pos: [18, 6.5, 24], look: [-3, 1, -4], fov: 44 },
      { f: fu, pos: [15, 5, 20], look: [-2, 0.6, -3], fov: 44 },
      { f: fu + 18, pos: [9, 3, 12.5], look: [0, 0, 0], fov: 44 },
      { f: st, pos: [8.5, 2.6, 12], look: [0, -0.5, 0], fov: 44 },
      { f: st + 1, pos: [7.4, 1.2, 13], look: [0.4, -0.6, 0], fov: 44, cut: true },
      { f: end + 10, pos: HOOK_A.pos, look: HOOK_A.look, fov: 44 },
    ];
  }
  const lookAt = keys[keys.length - 1]!.look;

  // ---- the overlay
  const flash = mode === "fail" && t >= e("give") ? Math.max(0, 1 - (t - e("give")) / 8) : 0;
  const silentK = mode === "hook" ? cue(t, e("silent"), 14) : 0;
  const tag = mode === "fail" ? "paused" : "reconstruction";
  const n = Math.max(0, Math.min(9, parseInt(f("people").replace(/[^\d]/g, ""), 10) || 0));
  const overlay = (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {mode === "hook" && (
        <>
          <Chip t={t} at={-60} text={`JUNE ${f("day")}, ${f("year")} · NORTH ATLANTIC`} top={300} size={46} />
          <Chip t={t} at={-40} text="TITAN · BOUND FOR THE TITANIC" top={385} size={46} color={AMBER} border={AMBER} />
          <Readout x={70} y={480} label="DEPTH · METRES" value={countText(f("depth"), cue(t, e("message"), 20))} k={cue(t, e("message") - 6, 8)} />
          <Bubble t={t} at={e("message")} who="SUB ›" text="DROPPED TWO WTS" x={70} y={1000} tick={e("routine")} dead={e("silent")} />
          {silentK > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.25 * silentK})` }} />}
        </>
      )}
      {mode === "hull" && (
        <>
          <Readout x={70} y={300} label="CARBON WALL · INCHES" value={countText(f("thick"), cue(t, e("thick"), 16))} k={cue(t, e("thick") - 4, 8)} />
        </>
      )}
      {mode === "after" && (
        <>
          <Readout x={70} y={300} label="SECONDS LATER" value={countText(f("secs"), cue(t, e("seconds"), 24))} k={cue(t, e("seconds") - 4, 8)} color={RED} />
          <Bubble t={t} at={e("message")} who="LAST MESSAGE" text="DROPPED TWO WTS" x={70} y={560} grey />
          <Lamps n={n} t={t} at={e("aboard")} outAt={e("died")} />
          {t >= e("died") && <div style={{ position: "absolute", inset: 0, background: `rgba(0,4,10,${0.35 * cue(t, e("died"), 30)})` }} />}
        </>
      )}
      {mode === "loop" && surface && (
        <>
          <Chip t={t} at={e("company")} text="THE COMPANY" top={330} size={52} color={AMBER} border={AMBER} />
          <Chip t={t} at={e("rules")} text="OR THE RULES?" top={430} size={52} color={AMBER} border={AMBER} />
          <Chip t={t} at={e("channel")} text="FULL STORY ON THE CHANNEL" top={530} size={46} />
        </>
      )}
      {mode === "loop" && !surface && (
        <>
          <Chip t={t} at={e("last")} text="TITAN · BOUND FOR THE TITANIC" top={385} size={46} color={AMBER} border={AMBER} />
        </>
      )}
      {mode === "fail" && t >= e("give") && <StampHtml t={t} at={e("give") + 8} text="HULL GIVES WAY" x={110} y={360} size={76} />}
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 48%, rgba(232,246,255,0.8) 0%, rgba(232,246,255,0) 45%)", opacity: flash }} />}
      <HonestyTag t={t} tag={tag} at={0} />
    </AbsoluteFill>
  );

  const deepWorld = !surface;
  const subY = mode === "loop" && surface ? 1.3 - 6 * sinkLoop : 0;
  return (
    <Freeze frame={t}>
      <DisasterStage look="nightGrid" floor={false} dof={1} shadowBox={30} bloom={0.6} vignette={deepWorld ? 0.55 : 0.3}
        light={surface ? 0.9 : 0.6} backdrop={surface ? DAWN : DEEPBG}
        fog={surface ? { color: "#9aa7b2", near: 40, far: 160 } : { color: "#021019", near: 9, far: 42 }}
        overlay={overlay}>
        <Camera3D keys={keys} frame={t} drift={0.015} />
        <Focus at={lookAt} range={surface ? 30 : 8} />
        {surface ? (
          <>
            <directionalLight position={[-20, 8, 10]} intensity={1.6} color="#ffd2a0" castShadow />
            <ambientLight intensity={0.5} color="#c9d0da" />
            <Ocean frame={t} size={240} segments={160} color="#2d4f66" waves={{ amp: 0.2, length: 4, speed: 0.05 }} />
            <Ship position={[-34, 0.2, -80]} frame={t} scale={1.5} />
            <group rotation={[Math.sin(t * 0.06) * 0.03, 0, Math.sin(t * 0.045) * 0.02]}>
              <Platform y={-0.1 - 4 * sinkLoop} />
              <Titan position={[0.2, subY, 0]} frame={t} lights={0.3 + 0.7 * sinkLoop} />
            </group>
          </>
        ) : (
          <>
            {/* key light from above-front (the surface far above), a cold rim from behind, low ambient */}
            <directionalLight position={[8, 20, 14]} intensity={0.9} color="#8fc2ff" castShadow />
            <directionalLight position={[-10, 4, -12]} intensity={0.8} color="#3a8fbf" />
            <ambientLight intensity={0.22} color="#2a5a7a" />
            {!gone && (
              <group rotation={[0, 0, pitch]}>
                <Titan position={[0, 0, 0]} frame={t} stress={stress} crush={crush} cut={cut} lights={lights} ring={mode === "fail" ? 0.7 + 0.3 * Math.sin(t * 0.8) : 0} />
                {(mode === "hook" || (mode === "loop" && !surface)) && <Weights since={mode === "hook" ? Math.max(0, t - e("routine")) : 0} />}
                {mode === "hook" && <Pings t={t} stopAt={e("silent")} />}
                {mode === "fail" && <pointLight position={[1.5, 1.6, 2.6]} intensity={3} distance={8} color="#9fc8ff" />}
                {domeGlow > 0 && <pointLight position={[2.6, 0.6, 1.4]} intensity={6 * domeGlow} distance={4} color="#e6eef5" />}
                {domeGlow > 0 && <pointLight position={[-2.6, 0.6, 1.4]} intensity={6 * domeGlow} distance={4} color="#e6eef5" />}
              </group>
            )}
            {mode === "hook" && t >= e("titan") - 2 && t < e("routine") && <Label3D at={[0, 1.1, 0]} offset={[-1.4, 1.6, 0.4]} text="TITAN" sub="OceanGate submersible" start={Math.max(0, e("titan"))} color={GREEN} px={48} />}
            {mode === "hull" && t >= e("carbon") && <Label3D at={[-0.4, 0.84, 0.3]} offset={[-1.2, 1.7, 0.4]} text="CARBON FIBRE" sub="the pressure hull" start={e("carbon")} color={AMBER} px={48} />}
            {mode === "hull" && t >= e("thick") + 16 && <Label3D at={[2.1, -0.3, 0.4]} offset={[0.2, -1.6, 0.6]} text="TITANIUM DOMES" start={e("thick") + 16} color={GREEN} px={48} />}
            {mode === "fail" && <Implosion k={boom} frame={t} />}
            {mode === "after" && <Implosion k={0.4 + 0.6 * cue(t, 0, end * 1.6, ease)} frame={t} />}
            <Snow frame={t} sink={mode === "fail" ? t * 0.01 : t * 0.03} count={mode === "after" ? 320 : 420} />
          </>
        )}
        {mode === "fail" && crush <= 0 && <mesh position={[0, 0, 0.9]}><sphereGeometry args={[0.06 + 0.02 * Math.sin(t), 8, 6]} /><meshBasicMaterial color={RED} /></mesh>}
      </DisasterStage>
    </Freeze>
  );
};

export default Deep;
