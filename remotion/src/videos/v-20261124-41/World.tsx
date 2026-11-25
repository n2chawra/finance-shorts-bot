// The Tacoma Narrows promo Short's shared world (Archive Rebuild look: overcast November light over grey-green
// water, sepia-cream labels, red only for the failure):
//   - Narrows: the kit's Ocean as the grey water of the Narrows and two forested banks (the kit's Hills, dark green);
//   - Gertie: the kit's SuspensionBridge (solid plate girders, green-grey steel) twisting with the frame;
//   - Shot3D / Flat: the beat wrappers (one stage, the look, the honesty tag) and the overlays every beat shares.
// Structures only; people only small (workers, onlookers), never victims. Figures from params only.
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { Camera3D, direct, DisasterStage, Focus, Hills, Ocean, SuspensionBridge, type SuspensionBridgeProps, type V3 } from "../../three/index";
import { DisasterLookProvider, LookBackground, Texture, HonestyTag as FlatTag } from "../../disaster/index";

export const RECIPE = "archive-rebuild" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const AMBER = "#ffb23e", RED = "#ff3b30", CREAM = "#f0e4c8", TEAL = "#6fb3a8", GREY = "#9aa3ad";

export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };

/** The twist's cycle: about four seconds a roll, as the films of the day show it. */
export const PHASE = (f: number) => (f * 2 * Math.PI) / 120 + 1.2;
export const SPAN = 28, DECK_Y = 1.95, TOWER_H = 4.25;

/** The bridge, posed. */
export const Gertie: React.FC<SuspensionBridgeProps> = (props) => (
  <SuspensionBridge mainSpan={SPAN} sideSpan={11} deckY={DECK_Y} towerH={TOWER_H} width={0.42} segments={48} {...props} />
);

/** The Narrows: grey water and the two wooded banks beyond the anchorages. */
export const Narrows: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <Ocean frame={f} size={120} segments={120} color="#24393b" waves={{ amp: 0.04, length: 2.5, speed: 0.04 }} />
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 44, -0.6, 0]}>
        <Hills size={34} segments={90} bushes={500} seed={`tac${s}`} height={4.2} scale={0.12} ridge={0.4} colors={{ low: "#243326", high: "#3d5038", scrub: "#1b281d" }} />
      </group>
    ))}
  </group>
);

/** One fixed camera pose per frame (each beat computes its own move as a function of the frame). */
export const Cam: React.FC<{ pos: V3; look: V3; fov?: number; focus?: V3; range?: number; seed: string }> = ({ pos, look, fov = 40, focus, range = 8, seed }) => (
  <>
    <Camera3D keys={direct({}, [{ at: 0, move: "hold", pos, look, fov }])} seed={seed} drift={0.01} />
    <Focus at={focus ?? look} range={range} />
  </>
);

/** A 3D beat: the beat's frame frozen into the stage, overcast light, the honesty tag and any overlay. */
export const Shot3D: React.FC<{ f: number; children: React.ReactNode; overlay?: React.ReactNode; tag?: string; fog?: { color?: string; near: number; far: number }; dof?: number }> = ({
  f, children, overlay, tag = "reconstruction", fog, dof = 1,
}) => (
  <Freeze frame={f}>
    <DisasterStage look="storm" dof={dof} shadowBox={30} floor={false} bloom={0.5}
      backdrop={{ top: "#59605f", bottom: "#141a1a", glow: "rgba(255,200,140,0.12)" }}
      fog={fog ?? { color: "#3e4746", near: 16, far: 90 }}
      overlay={<DisasterLookProvider value={RECIPE}><AbsoluteFill style={{ pointerEvents: "none" }}>{overlay}<FlatTag t={f} tag={tag} at={0} /></AbsoluteFill></DisasterLookProvider>}>
      <ambientLight intensity={0.28} color="#b8b4a8" />
      <directionalLight position={[14, 9, 10]} intensity={2.3} color="#ffd9a8" castShadow />
      <directionalLight position={[-12, 6, -10]} intensity={0.7} color="#8fb4d0" />
      <hemisphereLight args={["#9aa2a4", "#1c2420", 0.35]} />
      {children}
    </DisasterStage>
  </Freeze>
);

/** A flat or doc beat in the video's look: the backdrop, the drawing, the grain and an honesty tag. */
export const Flat: React.FC<{ t: number; children: React.ReactNode; tag?: string }> = ({ t, children, tag = "principle" }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      {children}
      <Texture t={t} />
      {tag ? <FlatTag t={t} tag={tag} at={0} /> : null}
    </AbsoluteFill>
  </DisasterLookProvider>
);

/** The dated mono caption (date · place), typing on. */
export const DateCaption: React.FC<{ t: number; at: number; line: string; top?: number }> = ({ t, at, line, top = 330 }) => {
  const n = t < at ? 0 : Math.max(at <= 0 ? line.length : 0, Math.floor((t - at) * 1.8));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", pointerEvents: "none" }}>
      <div style={{ display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 3, color: CREAM,
        background: "rgba(20,22,20,0.76)", padding: "8px 22px", borderLeft: `6px solid ${AMBER}` }}>{line.slice(0, n)}</div>
    </div>
  );
};

/** A mono label in a dark box over a shot, typing on from `at`. */
export const Tag: React.FC<{ t: number; at: number; text: string; top: number; color?: string; size?: number; left?: number }> = ({ t, at, text, top, color = AMBER, size = 52, left }) => {
  if (t < at) return null;
  const n = Math.max(1, Math.floor((t - at) * 1.8));
  return (
    <div style={{ position: "absolute", left: left ?? 0, right: left === undefined ? 0 : undefined, top, textAlign: left === undefined ? "center" : "left", pointerEvents: "none" }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 4, color, background: "rgba(20,22,20,0.8)", padding: "8px 22px" }}>{text.slice(0, n)}</span>
    </div>
  );
};

/** An instrument readout: the figure big in Anton on a dark bezel, its caption under it. */
export const Readout: React.FC<{ value: string; caption: string; top: number; left: number; k?: number; color?: string; w?: number }> = ({ value, caption, top, left, k = 1, color = CREAM, w = 420 }) => (
  <div style={{ position: "absolute", left, top, width: w, textAlign: "center", opacity: k, transform: `scale(${0.85 + 0.15 * k})`, pointerEvents: "none" }}>
    <div style={{ background: "rgba(16,18,16,0.84)", border: `4px solid ${color}`, borderRadius: 18, padding: "8px 14px" }}>
      <div style={{ fontFamily: ANTON, fontSize: 112, lineHeight: 1.05, color }}>{value}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3, color: CREAM }}>{caption}</div>
    </div>
  </div>
);

/** Wind streaks blowing across the frame from the left (screen space), a pure function of the frame. */
export const WindStreaks: React.FC<{ f: number; k?: number; y0?: number; y1?: number; seed?: number }> = ({ f, k = 1, y0 = 600, y1 = 1300, seed = 3 }) => (
  <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.55 * k, pointerEvents: "none" }}>
    {Array.from({ length: 16 }, (_, i) => {
      const r = ((i * 7919 + seed * 104729) % 1000) / 1000;
      const y = y0 + (y1 - y0) * ((i + 0.5) / 16) + 20 * Math.sin(i * 1.7);
      const len = 140 + 160 * r;
      const x = ((f * (18 + 10 * r) + r * 1400) % 1500) - 300;
      return <line key={i} x1={x} y1={y} x2={x + len} y2={y - 6} stroke="#e8eee8" strokeWidth={3 + 2 * r} strokeLinecap="round" />;
    })}
  </svg>
);

export default Gertie;

/** Engineering graph paper behind a flat diagram: a bold grid in the look's ink, one cell every 90 px. */
export const GraphPaper: React.FC<{ color?: string }> = ({ color = "#e6d6b0" }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({ length: 12 }, (_, i) => (
      <line key={`v${i}`} x1={45 + i * 90} y1={0} x2={45 + i * 90} y2={1920} stroke={color} strokeWidth={8} opacity={0.3} />
    ))}
    {Array.from({ length: 22 }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={45 + i * 90} x2={1080} y2={45 + i * 90} stroke={color} strokeWidth={8} opacity={0.3} />
    ))}
  </svg>
);

/** The wind gauge: a round dial on a post with the figure in its window, a needle swinging up to it, a leader
 * line from the dial to the point it belongs to (screen space). */
export const WindGauge: React.FC<{ value: string; k: number; x: number; y: number; to?: [number, number]; t: number }> = ({ value, k, x, y, to, t }) => {
  if (k <= 0) return null;
  const a = -120 + 190 * k + 4 * Math.sin(t * 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: Math.min(1, k * 2) }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {to ? <line x1={x} y1={y + 150} x2={to[0]} y2={to[1]} stroke={CREAM} strokeWidth={5} strokeDasharray="14 10" /> : null}
        <circle cx={x} cy={y} r={150} fill="rgba(16,18,16,0.9)" stroke={AMBER} strokeWidth={10} />
        {Array.from({ length: 11 }, (_, i) => {
          const g = ((-120 + i * 24) * Math.PI) / 180;
          return <line key={i} x1={x + 118 * Math.sin(g)} y1={y - 118 * Math.cos(g)} x2={x + 138 * Math.sin(g)} y2={y - 138 * Math.cos(g)} stroke={i > 7 ? RED : CREAM} strokeWidth={6} />;
        })}
        <line x1={x} y1={y} x2={x + 110 * Math.sin((a * Math.PI) / 180)} y2={y - 110 * Math.cos((a * Math.PI) / 180)} stroke={AMBER} strokeWidth={10} strokeLinecap="round" />
        <circle cx={x} cy={y} r={14} fill={AMBER} />
      </svg>
      <div style={{ position: "absolute", left: x - 110, top: y + 22, width: 220, textAlign: "center" }}>
        <div style={{ fontFamily: ANTON, fontSize: 84, lineHeight: 1, color: CREAM }}>{value}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: AMBER, letterSpacing: 3 }}>MPH</div>
      </div>
    </div>
  );
};
