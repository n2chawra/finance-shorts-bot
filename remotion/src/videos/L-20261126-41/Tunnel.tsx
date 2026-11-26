// Tunnel (3D): the airliner's wing section, big and lit, in a wind tunnel of night air with snow streaking past.
// Glowing streamlines flow over and under it (dashes travelling), a lift arrow stands on it, and past the
// stall angle the flow over the top tears into red swirls. The section carries a black de-icing boot on its
// nose, panel lines and, for the ice beats, a rough white crust. Modes (params.mode): flow, stall, slow,
// recover, ice, icefind, pull, startle. A drawing of the principle ("general principle" tag); no figures.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Airfoil, alongLine, Camera3D, cue, DisasterStage, Focus, foilSurface, glow, GlowLine, Rain, rnd, streamlines, type CamKey, type V3 } from "../../three/index";
import { AMBER, ChapterCard, FlatTag, GREEN, ICE, MonoCaption, moments, RED } from "./ui";

type Params = { mode?: string; chapter?: string };
const C = 3; // chord

const Tunnel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "flow";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  // angle (degrees), torn flow 0..1, lift 0..1, ice 0..1, the stall line (degrees)
  let aoa = 4, torn = 0, lift = 0.6, ice = 0, stallLine = 16;
  if (mode === "flow") { lift = 0.2 + 0.6 * cue(t, e("lift"), 16); }
  if (mode === "stall") { aoa = 9 + 9 * cue(t, e("angle"), 24); torn = cue(t, e("breaks"), 20); lift = 0.9 - 0.65 * cue(t, e("collapses"), 14); }
  if (mode === "slow") { aoa = 4 + 9 * cue(t, e("bigger"), 30) + 2 * cue(t, e("edge"), 30); lift = 0.7; }
  if (mode === "recover") { aoa = 18 - 13 * cue(t, e("down"), 24); torn = 1 - cue(t, e("grips"), 24); lift = 0.3 + 0.5 * cue(t, e("grips"), 20); }
  if (mode === "ice") { aoa = 9; ice = cue(t, e("Ice"), 30); stallLine = 16 - 4 * cue(t, e("sooner"), 24); lift = 0.7; }
  if (mode === "icefind") { aoa = 7; ice = 1 - 0.75 * cue(t, e("barely"), 24); lift = 0.75; }
  if (mode === "pull") { aoa = 12 + 8 * cue(t, e("Pulling"), 14); torn = cue(t, e("over"), 14); lift = 0.85 - 0.6 * cue(t, e("over"), 14); }
  if (mode === "startle") { aoa = 15 + Math.sin(t * 0.5) * 2 * cue(t, e("confusion"), 10); torn = 0.6; lift = 0.4; }
  const rad = (aoa * Math.PI) / 180;
  const lines = streamlines([-1.5, -1, -0.6, -0.3, 0.3, 0.6, 1, 1.5, 2.1], { chord: C, aoa: rad, from: -2.4 * C, to: 2.6 * C, n: 90 });
  const flowK = mode === "flow" ? cue(t, e("flows"), 20) : 1;
  // the camera: a slow drift around the section; a push on the word that reveals, a pull for the answer
  const push = mode === "flow" ? cue(t, e("curved"), 20) : mode === "stall" ? cue(t, e("swirls"), 20) : mode === "slow" ? cue(t, e("edge"), 20) : mode === "recover" ? cue(t, e("down"), 20)
    : mode === "ice" ? cue(t, e("Ice"), 20) : mode === "icefind" ? cue(t, e("barely"), 20) : mode === "pull" ? cue(t, e("opposite"), 20) : cue(t, e("automatic"), 20);
  const look: V3 = mode === "ice" || mode === "icefind" ? [-1.1, 0.2, 0] : mode === "stall" || mode === "pull" ? [0.8, 0.6, 0] : [0.2, 0.3, 0];
  const dist = 10.5 - 2.2 * push;
  const yaw = 0.32 - 0.12 * (t / end);
  const keys: CamKey[] = [
    { f: 0, pos: [look[0] + Math.sin(yaw) * dist, look[1] + 1.4, Math.cos(yaw) * dist], look, fov: 40 },
    { f: end + 10, pos: [look[0] + Math.sin(yaw - 0.1) * (dist - 0.4), look[1] + 1.2, Math.cos(yaw - 0.1) * (dist - 0.4)], look, fov: 40 },
  ];
  const liftLen = 3.4 * lift;
  const liftCol = lift < 0.45 ? RED : GREEN;
  const startleShake = mode === "startle" && t >= e("startle") ? Math.sin(t * 4) * 0.12 * (1 - cue(t, e("startle") + 4, 20)) : 0;
  return (
    <DisasterStage look="storm" floor={false} dof={0.6} shadowBox={12} light={0.85} backdrop={{ top: "#2a333c", bottom: "#0d1116" }} fog={{ color: "#161c22", near: 12, far: 40 }} vignette={0.5} bloom={0.8}
      overlay={
        <AbsoluteFill>
          <FlatTag t={t} tag="principle" at={0} />
          {P.chapter && <ChapterCard t={t} text={P.chapter} />}
          {mode === "stall" && t >= e("stall") && <Big t={t} at={e("stall")} text="STALL" color={RED} />}
          {mode === "ice" && t >= e("Ice") && <MonoCaption t={t} at={e("Ice")} text="ICE ON THE LEADING EDGE" top={180} left={1150} size={40} color={ICE} />}
          {mode === "ice" && t >= e("matter") && <Big t={t} at={e("matter")} text="DID IT MATTER?" color={AMBER} />}
          {mode === "icefind" && t >= e("barely") && <MonoCaption t={t} at={e("barely")} text="ICE: MINIMAL EFFECT" top={180} left={1150} size={40} color={ICE} />}
          {mode === "icefind" && t >= e("numbers") && <Big t={t} at={e("numbers")} text="THE DANGER: THE SPEEDS" color={AMBER} />}
          {mode === "recover" && t >= e("trained") && <Card t={t} at={e("trained")} title="STALL WARNING:" lines={["NOSE DOWN", "POWER UP"]} color={GREEN} />}
          {mode === "pull" && <Card t={t} at={0} title={t >= e("opposite") ? "DONE:" : "TRAINED:"} lines={[t >= e("opposite") ? "PULL BACK" : "PUSH FORWARD"]} color={t >= e("opposite") ? RED : GREEN} />}
          {mode === "startle" && <Card t={t} at={e("automatic")} title="SHOULD BE:" lines={["AUTOMATIC"]} color={GREEN} />}
          {mode === "startle" && t >= e("startle") && <MonoCaption t={t} at={e("startle")} text="STARTLE · CONFUSION" top={420} left={1150} size={44} color={AMBER} />}
          {(mode === "slow" || mode === "ice" || mode === "pull" || mode === "startle") && <MonoCaption t={t} at={mode === "slow" ? e("edge") : 0} text="RED LINE: STALL ANGLE" top={mode === "pull" || mode === "startle" ? 820 : 260} left={246} size={34} color={RED} />}
          {mode === "slow" && <MonoCaption t={t} at={e("bleeds")} text="AIRSPEED FALLING" top={180} left={1150} size={40} color={AMBER} />}
          {mode === "flow" && t >= e("lift") && <MonoCaption t={t} at={e("lift")} text="LIFT" top={180} left={1150} size={48} color={GREEN} />}
        </AbsoluteFill>
      }>
      <Camera3D keys={keys} frame={t} drift={0.02} />
      <Focus at={[0, 0, 0]} range={8} />
      <directionalLight position={[4, 9, 7]} intensity={1.6} color="#eef3f8" castShadow />
      <directionalLight position={[-6, 2, -4]} intensity={0.7} color="#ffb070" />
      <ambientLight intensity={0.35} color="#8a99aa" />
      <pointLight position={[0, 4, 4]} intensity={6} distance={18} color="#dfe8f2" />
      {/* the tunnel: a ring of lamps and a floor grid far below, snow racing through */}
      {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[-12 + i * 2.8, 5.5, -6]} material={glow("#fff1d0", 0.6)}><boxGeometry args={[1.2, 0.08, 0.3]} /></mesh>)}
      {Array.from({ length: 22 }, (_, i) => <mesh key={`f${i}`} position={[-14 + i * 1.4, -4, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.05, 30]} /><meshBasicMaterial color="#3a4652" /></mesh>)}
      <Rain frame={t} center={[0, 0.5, 1]} size={[24, 10, 10]} count={600} length={0.16} speed={0.14} wind={[0.9, 0]} color="#f2f6fa" opacity={0.6} seed="tunnel" />
      {/* the wing section with its boot, panel lines and ice */}
      <group position={[0, startleShake, 0]}>
        <Airfoil chord={C} thick={0.14} camber={0.04} span={4} aoa={rad} color="#c9d1d9" />
        <group rotation-z={-rad}>
          <mesh position={[-C / 2 + 0.06, 0.02, 0]}><boxGeometry args={[0.16, 0.34, 4.02]} /><meshStandardMaterial color="#1b1f24" roughness={0.6} /></mesh>
          {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[-C / 2 + 0.5 + i * 0.36, foilSurface(0.15 + i * 0.12, true, 0, { chord: C, thick: 0.14, camber: 0.04 })[1] + 0.006, 0]}><boxGeometry args={[0.012, 0.01, 4.01]} /><meshStandardMaterial color="#5c656e" /></mesh>)}
          {ice > 0.02 && Array.from({ length: 26 }, (_, i) => (
            <mesh key={`ice${i}`} position={[-C / 2 - 0.04 - rnd("ix", i) * 0.12 * ice, -0.12 + rnd("iy", i) * 0.3, -1.9 + (i / 25) * 3.8]} rotation={[rnd("ra", i), rnd("rb", i), rnd("rc", i)]}>
              <boxGeometry args={[0.1 + 0.12 * ice, 0.08 + 0.1 * ice, 0.18]} />
              <meshStandardMaterial color="#eef8ff" emissive="#9fd3ff" emissiveIntensity={0.25} roughness={0.9} transparent opacity={Math.min(1, ice * 1.4)} />
            </mesh>
          ))}
        </group>
        {/* lift */}
        <group position={[0.1, 0.25, 2.05]}>
          <mesh position={[0, liftLen / 2, 0]} material={glow(liftCol, 0.9)}><cylinderGeometry args={[0.07, 0.07, Math.max(0.01, liftLen), 12]} /></mesh>
          <mesh position={[0, liftLen + 0.18, 0]} material={glow(liftCol, 0.9)}><coneGeometry args={[0.2, 0.36, 16]} /></mesh>
        </group>
        {/* the stall angle line */}
        {(mode === "slow" || mode === "ice" || mode === "pull" || mode === "startle") && (
          <mesh position={[Math.cos((stallLine * Math.PI) / 180) * 2.6, Math.sin((stallLine * Math.PI) / 180) * 2.6, 2.05]} rotation-z={(stallLine * Math.PI) / 180} material={glow(RED, 0.9)}><boxGeometry args={[5.2, 0.04, 0.04]} /></mesh>
        )}
        {(mode === "slow" || mode === "pull" || mode === "startle" || mode === "ice") && (
          <mesh position={[Math.cos(rad) * 2.6, Math.sin(rad) * 2.6, 2.05]} rotation-z={rad} material={glow(AMBER, 0.9)}><boxGeometry args={[5.2, 0.03, 0.03]} /></mesh>
        )}
      </group>
      {/* the air */}
      {lines.map((ln, i) => {
        const above = i >= 4;
        const tornHere = above && i <= 6 && torn > 0.05;
        const pts = ln.map(([x, y]) => [x, y + (tornHere && x > -0.3 ? Math.sin(x * 3 + t * 0.4 + i) * 0.25 * torn + 0.5 * torn * Math.min(1, (x + 0.3) / 2) : 0), 2.05] as V3);
        const col = tornHere && torn > 0.3 ? RED : mode === "recover" && t >= e("grips") ? GREEN : ICE;
        return <GlowLine key={i} points={pts} color={col} width={3} k={flowK} dashed dash={0.5} gap={0.35} flow={t * 0.12} opacity={0.85} />;
      })}
      {lines.slice(2, 7).map((ln, i) => {
        const u = ((t * 0.006 + i * 0.21) % 1);
        const q = alongLine(ln, u, 2.05);
        return <mesh key={`p${i}`} position={q} material={glow("#ffffff", 0.9)}><sphereGeometry args={[0.06, 8, 6]} /></mesh>;
      })}
      {torn > 0.05 && Array.from({ length: 6 }, (_, i) => {
        const life = ((t * 0.7 + i * 23) % 60) / 60;
        return (
          <mesh key={`s${i}`} position={[0.2 + life * 4.2, 0.9 + (i % 3) * 0.35 + Math.sin(life * 6 + i) * 0.15, 2.05]} rotation-z={t * 0.12 + i}>
            <torusGeometry args={[0.22 + 0.1 * (i % 2), 0.035, 8, 28, Math.PI * 1.6]} />
            <meshBasicMaterial color={RED} transparent opacity={torn * (1 - life)} toneMapped={false} />
          </mesh>
        );
      })}
    </DisasterStage>
  );
};

const Big: React.FC<{ t: number; at: number; text: string; color: string }> = ({ t, at, text, color }) => {
  const k = Math.min(1, (t - at) / 6);
  return <div style={{ position: "absolute", left: 1150, top: 300, transform: `scale(${1.5 - 0.5 * k}) rotate(-4deg)`, transformOrigin: "left center", opacity: k, border: `6px solid ${color}`, color, background: "rgba(8,12,18,0.88)", fontFamily: "Anton, Poppins, sans-serif", fontSize: 70, padding: "2px 22px", letterSpacing: 3 }}>{text}</div>;
};
const Card: React.FC<{ t: number; at: number; title: string; lines: string[]; color: string }> = ({ t, at, title, lines, color }) => {
  if (t < at) return null;
  const k = Math.min(1, (t - at) / 8);
  return (
    <div style={{ position: "absolute", left: 1150, top: 170, opacity: k, background: "rgba(8,12,18,0.9)", border: `5px solid ${color}`, borderRadius: 10, padding: "14px 26px" }}>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 36, color: "#ffffff" }}>{title}</div>
      {lines.map((l) => <div key={l} style={{ fontFamily: "Anton, Poppins, sans-serif", fontSize: 58, color }}>{l}</div>)}
    </div>
  );
};

export default Tunnel;
