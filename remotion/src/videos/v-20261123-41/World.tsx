// The Calabasas helicopter promo Short's shared world (Storm Weather look: grey cloud light, a low cloud deck
// over dry hill country, cold grade):
//   - Sky: the cloud deck over the hills (`CLOUD_Y`), and inside-cloud fog when the camera is in it;
//   - Hills: the kit's Hills (dry grass, chaparral) around a ridge along x;
//   - Heli: the kit's Helicopter (S-76 shape, white with a blue band) at a pose, rotor turning with the frame;
//   - Shot3D / Flat: the beat wrappers (one stage, the look, the honesty tag), and the overlays (caption,
//     tags, readouts) every beat shares.
// Machines and places only; people only as rescuers in the aftermath, never victims. Figures from params only.
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { Camera3D, CloudDeck, direct, DisasterStage, Focus, Helicopter, Hills, type V3 } from "../../three/index";
import { DisasterLookProvider, LookBackground, Texture, HonestyTag as FlatTag } from "../../disaster/index";

export const RECIPE = "storm-weather" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const AMBER = "#ff9d2e", RED = "#ff3b30", CREAM = "#f2f4f5", SKY = "#8fd0ff", GREY = "#9aa3ad";

export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };

export const CLOUD_Y = 6.2;
export const HILLS = { seed: "calabasas", height: 2.6, scale: 0.1, ridge: 1.1 } as const;

/** The helicopter at a pose: position, heading (yaw), bank (roll, + = right wing down) and pitch (+ = nose up). */
export const HeliAt: React.FC<{ f: number; pos: V3; yaw?: number; bank?: number; pitch?: number; lights?: number }> = ({ f, pos, yaw = 0, bank = 0, pitch = 0, lights = 1 }) => (
  <group position={[pos[0], pos[1] + 0.03 * Math.sin(f * 0.07), pos[2]]} rotation-y={yaw}>
    <group rotation-x={bank} rotation-z={pitch}>
      <Helicopter length={2} rotor={f * 0.9} tail={f * 2.1} blur={0.85} lights={lights} />
    </group>
  </group>
);

/** Rolling cloud around the camera when inside it: the deck above and below, the grey fog does the rest. */
export const InCloud: React.FC<{ f: number; y: number }> = ({ f, y }) => (
  <group>
    <CloudDeck frame={f} y={y - 1.2} size={70} cover={0.85} puffs={90} seed="cal-in-lo" wind={[0.05, 0.01]} />
    <CloudDeck frame={f} y={y + 2.4} size={70} cover={0.9} puffs={60} seed="cal-in-hi" wind={[0.04, 0.012]} />
  </group>
);

/** One fixed camera pose per frame (each beat computes its own move as a function of the frame). */
export const Cam: React.FC<{ pos: V3; look: V3; fov?: number; focus?: V3; range?: number; seed: string }> = ({ pos, look, fov = 40, focus, range = 6, seed }) => (
  <>
    <Camera3D keys={direct({}, [{ at: 0, move: "hold", pos, look, fov }])} seed={seed} drift={0.01} />
    <Focus at={focus ?? look} range={range} />
  </>
);

/** A 3D beat: the beat's frame frozen into the stage, the storm look, the honesty tag and any overlay. */
export const Shot3D: React.FC<{ f: number; children: React.ReactNode; overlay?: React.ReactNode; tag?: string; fog?: { color?: string; near: number; far: number }; dof?: number }> = ({
  f, children, overlay, tag = "reconstruction", fog, dof = 1,
}) => (
  <Freeze frame={f}>
    <DisasterStage look="storm" dof={dof} shadowBox={14} floor={false} fog={fog ?? { color: "#4a525b", near: 12, far: 60 }}
      overlay={<DisasterLookProvider value={RECIPE}><AbsoluteFill style={{ pointerEvents: "none" }}>{overlay}<FlatTag t={f} tag={tag} at={0} /></AbsoluteFill></DisasterLookProvider>}>
      <ambientLight intensity={0.55} color="#aab4c0" />
      <directionalLight position={[8, 16, 6]} intensity={1.1} color="#e8eef5" castShadow />
      <directionalLight position={[-10, 4, -8]} intensity={0.35} color="#ffb070" />
      <hemisphereLight args={["#9aa6b4", "#3a3426", 0.5]} />
      {children}
    </DisasterStage>
  </Freeze>
);

/** The hill country with its scrub. */
export const Country: React.FC = () => <Hills size={70} segments={170} bushes={900} {...HILLS} colors={{ low: "#2c3a24", high: "#77704a", scrub: "#26331f" }} />;

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

/** The dated mono caption (place · date), typing on. */
export const DateCaption: React.FC<{ t: number; at: number; line: string; top?: number }> = ({ t, at, line, top = 330 }) => {
  const n = t < at ? 0 : Math.max(at <= 0 ? line.length : 0, Math.floor((t - at) * 1.8));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", pointerEvents: "none" }}>
      <div style={{ display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 3, color: CREAM,
        background: "rgba(14,18,22,0.74)", padding: "8px 22px", borderLeft: `6px solid ${AMBER}` }}>{line.slice(0, n)}</div>
    </div>
  );
};

/** A mono label in a dark box over a shot, typing on from `at`. */
export const Tag: React.FC<{ t: number; at: number; text: string; top: number; color?: string; size?: number; left?: number }> = ({ t, at, text, top, color = AMBER, size = 52, left }) => {
  if (t < at) return null;
  const n = Math.max(1, Math.floor((t - at) * 1.8));
  return (
    <div style={{ position: "absolute", left: left ?? 0, right: left === undefined ? 0 : undefined, top, textAlign: left === undefined ? "center" : "left", pointerEvents: "none" }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 4, color, background: "rgba(14,18,22,0.78)", padding: "8px 22px" }}>{text.slice(0, n)}</span>
    </div>
  );
};

/** An instrument readout: the figure big in Anton on a dark bezel, its unit and caption under it. */
export const Readout: React.FC<{ value: string; caption: string; top: number; left: number; k?: number; color?: string; w?: number }> = ({ value, caption, top, left, k = 1, color = CREAM, w = 400 }) => (
  <div style={{ position: "absolute", left, top, width: w, textAlign: "center", opacity: k, transform: `scale(${0.85 + 0.15 * k})`, pointerEvents: "none" }}>
    <div style={{ background: "rgba(10,13,16,0.82)", border: `4px solid ${color}`, borderRadius: 18, padding: "8px 14px" }}>
      <div style={{ fontFamily: ANTON, fontSize: 118, lineHeight: 1.05, color }}>{value}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3, color: CREAM }}>{caption}</div>
    </div>
  </div>
);

/** The attitude indicator: sky over ground, rotated by the bank (degrees, + = left wing down), the fixed
 * aircraft symbol, in a ring that warms to amber. Drawn in its own svg at (cx, cy) radius r. */
export const Attitude: React.FC<{ cx: number; cy: number; r: number; bank: number; pitch?: number; ring?: string; id: string }> = ({ cx, cy, r, bank, pitch = 0, ring = AMBER, id }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <clipPath id={`ai-${id}`}><circle cx={cx} cy={cy} r={r} /></clipPath>
    <g clipPath={`url(#ai-${id})`}>
      <g transform={`rotate(${bank} ${cx} ${cy}) translate(0 ${pitch * r * 0.02})`}>
        <rect x={cx - r * 2} y={cy - r * 2} width={r * 4} height={r * 2} fill="#3d8fd6" />
        <rect x={cx - r * 2} y={cy} width={r * 4} height={r * 2} fill="#8a5a2b" />
        <line x1={cx - r * 2} y1={cy} x2={cx + r * 2} y2={cy} stroke={CREAM} strokeWidth={6} />
        {[-2, -1, 1, 2].map((i) => <line key={i} x1={cx - r * 0.22} y1={cy + i * r * 0.2} x2={cx + r * 0.22} y2={cy + i * r * 0.2} stroke={CREAM} strokeWidth={4} />)}
      </g>
    </g>
    <path d={`M${cx - r * 0.6},${cy} L${cx - r * 0.18},${cy} L${cx},${cy + r * 0.14} L${cx + r * 0.18},${cy} L${cx + r * 0.6},${cy}`} fill="none" stroke="#ffd84a" strokeWidth={12} strokeLinejoin="round" />
    <circle cx={cx} cy={cy} r={9} fill="#ffd84a" />
    <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#1a1e22" strokeWidth={18} />
    <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={ring} strokeWidth={8} />
  </svg>
);

/** A soft grey veil over a shot (cloud thickness on the screen), seeded noise, a pure function of the frame. */
export const Veil: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => (
  <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.5 * k }}>
    <defs>
      <filter id="cal-veil" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.003 0.008" numOctaves={3} seed={41} />
        <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.66  0 0 0 0 0.7  0 0 0 0.9 -0.15" />
      </filter>
    </defs>
    <rect x={-400 + ((f * 1.4) % 400)} y={0} width={1880} height={1920} filter="url(#cal-veil)" />
  </svg>
);

export default HeliAt;
