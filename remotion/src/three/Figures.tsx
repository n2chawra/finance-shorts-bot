// Figures on things, and the words over the picture.
//
// In 3D: FigLabel3D (a figure counting up on a thing, facing the camera or lying on a surface) and
// Bracket3D (a dimension bracket between two points, its figure in the middle).
// Over the 3D (DOM, pass them to Stage3D `overlay`): LowerThird (the long-video figure caption),
// TopPill (the Shorts figure pill), Tag (honesty tags: "3D RECREATION", "ILLUSTRATION", "NOT TO
// SCALE") and ScaleBadge (the scale while a scale trick runs).
//
// Every figure is a string from the beat's params (`p.beat.params.fig.<name>`, formatted by Python);
// these components never compute or type a number. They only count it up (countText).
import { Billboard, Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { FONT } from "../design/fonts";
import { countText } from "../flat/kit";
import { clampShift, cue, TECH, useFontReady, type V3 } from "./core";

// ---------------------------------------------------------------------- canvas text plates

type Line_ = { text: string; px: number; weight: number; color: string };

function plateSize(lines: Line_[], pad: number): { w: number; h: number } {
  const g = document.createElement("canvas").getContext("2d")!;
  let w = 0, h = pad;
  for (const l of lines) {
    g.font = `${l.weight} ${l.px}px ${FONT}`;
    w = Math.max(w, g.measureText(l.text).width);
    h += l.px * 1.12;
  }
  return { w: Math.ceil(w + pad * 2 + 20), h: Math.ceil(h + pad * 0.8) };
}

function drawPlate(c: HTMLCanvasElement, lines: Line_[], pad: number, bg: string | null, bar: string | null): void {
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, c.width, c.height);
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, c.width, c.height, 26); g.fill(); }
  if (bar) { g.fillStyle = bar; g.fillRect(0, 16, 10, c.height - 32); }
  g.textBaseline = "top";
  let y = pad * 0.7;
  for (const l of lines) {
    g.font = `${l.weight} ${l.px}px ${FONT}`;
    g.fillStyle = l.color;
    g.fillText(l.text, pad + (bar ? 12 : 0), y);
    y += l.px * 1.12;
  }
}

/** A canvas texture holding `lines`; redrawn when the text changes. Sized from the final text so the
 * plate does not resize while a figure counts up. */
function usePlate(lines: Line_[], finalLines: Line_[], pad: number, bg: string | null, bar: string | null) {
  const r800 = useFontReady(800), r600 = useFontReady(600);
  const ready = r800 && r600;
  const key = finalLines.map((l) => `${l.text}|${l.px}|${l.weight}`).join("/");
  const size = useMemo(() => (ready ? plateSize(finalLines, pad) : { w: 8, h: 8 }), [ready, key, pad]);
  const canvas = useMemo(() => { const c = document.createElement("canvas"); c.width = size.w; c.height = size.h; return c; }, [size]);
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }, [canvas]);
  const drawKey = lines.map((l) => `${l.text}|${l.color}`).join("/");
  useLayoutEffect(() => {
    if (!ready) return;
    drawPlate(canvas, lines, pad, bg, bar);
    tex.needsUpdate = true;
  }, [ready, drawKey, canvas, tex, bg, bar, pad]);
  return { tex, aspect: size.w / size.h, h: size.h };
}

// ---------------------------------------------------------------------- FigLabel3D

export type FigLabel3DProps = {
  /** the figure as formatted by Python (from params.fig), e.g. the string for "{transistors}" */
  fig: string;
  /** a small caption line under it (words only) */
  caption?: string;
  at: V3;
  /** frame it lands; it counts up over `count` frames (0 = appears whole) */
  start?: number;
  count?: number;
  end?: number;
  /** "camera": a billboard of fixed screen size (`px` = figure height in output pixels);
   * "up" / "front": painted flat on a surface (top or front face), `height` world units tall */
  face?: "camera" | "up" | "front";
  px?: number;
  height?: number;
  color?: string;
  plate?: boolean;
};

export const FigLabel3D: React.FC<FigLabel3DProps> = ({
  fig, caption, at, start = 0, count = 18, end, face = "camera", px = 120, height = 0.5, color = TECH.amber, plate = true,
}) => {
  const frame = useCurrentFrame();
  const k = count > 0 ? cue(frame, start, count, Easing.out(Easing.cubic)) : frame >= start ? 1 : 0;
  const shown = countText(fig, k);
  const big = 120, small = 46;
  const lines: Line_[] = [{ text: shown, px: big, weight: 800, color }];
  const finalLines: Line_[] = [{ text: fig, px: big, weight: 800, color }];
  if (caption) { lines.push({ text: caption, px: small, weight: 600, color: TECH.white }); finalLines.push({ text: caption, px: small, weight: 600, color: TECH.white }); }
  const { tex, aspect, h: plateH } = usePlate(lines, finalLines, 26, plate ? "rgba(8,11,22,0.78)" : null, null);
  const pop = cue(frame, start, 8, Easing.out(Easing.back(1.6)));
  const out = end === undefined ? 0 : cue(frame, end - 8, 8);
  const alpha = Math.min(1, pop * 1.4) * (1 - out);

  const holder = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Mesh>(null);
  const size3 = useThree((s) => s.size);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const g = holder.current;
    if (!g || face !== "camera") return;
    g.getWorldPosition(tmp);
    const cam = camera as THREE.PerspectiveCamera;
    const depth = Math.max(0.01, -tmp.clone().applyMatrix4(cam.matrixWorldInverse).z);
    const visible = 2 * depth * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const parentScale = g.parent ? g.parent.getWorldScale(new THREE.Vector3()).y : 1;
    const sc = 0.85 + 0.15 * pop;
    g.scale.setScalar(((px * plateH) / big / size3.height) * visible / parentScale * sc);
    // keep the whole plate in frame
    const m = plateRef.current;
    if (!m) return;
    const hp = (px * plateH) / big * sc, wp = aspect * hp;
    const ndc = tmp.clone().project(cam);
    const [dx, dy] = clampShift((ndc.x * 0.5 + 0.5) * size3.width, (-ndc.y * 0.5 + 0.5) * size3.height, wp, hp, size3.width, size3.height);
    m.position.set(dx / hp, -dy / hp, 0);
  });
  if (alpha <= 0) return null;
  const planeEl = (
    <mesh ref={face === "camera" ? plateRef : undefined} renderOrder={face === "camera" ? 22 : 2} userData={{ noClip: true, noFade: true }}>
      <planeGeometry args={[aspect, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={alpha} depthTest={face !== "camera"} depthWrite={false} toneMapped={false}
        polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
  if (face === "camera") return <group ref={holder} position={at}><Billboard>{planeEl}</Billboard></group>;
  const s = (height * plateH) / big;
  return (
    <group position={at} rotation={face === "up" ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} scale={s * (0.85 + 0.15 * pop)}>
      {planeEl}
    </group>
  );
};

// ---------------------------------------------------------------------- Bracket3D

export type Bracket3DProps = {
  from: V3;
  to: V3;
  /** the side the ticks point to (a direction in world space) */
  side?: V3;
  /** its figure, from params.fig (or a word) */
  fig?: string;
  caption?: string;
  start?: number;
  end?: number;
  color?: string;
  px?: number;
};

/** A dimension bracket: two end ticks and a line that draws out from the middle, the figure on it. */
export const Bracket3D: React.FC<Bracket3DProps> = ({ from, to, side = [0, 1, 0], fig, caption, start = 0, end, color = TECH.white, px = 64 }) => {
  const frame = useCurrentFrame();
  const p = cue(frame, start, 14, Easing.out(Easing.cubic));
  const out = end === undefined ? 0 : cue(frame, end - 8, 8);
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const sideV = new THREE.Vector3(...side).normalize().multiplyScalar(a.distanceTo(b) * 0.06);
  const ea = mid.clone().lerp(a, p), eb = mid.clone().lerp(b, p);
  if (p <= 0 || out >= 1) return null;
  const pts = (q: THREE.Vector3): [number, number, number][] => [[q.x, q.y, q.z], [q.x + sideV.x, q.y + sideV.y, q.z + sideV.z]];
  const op = 1 - out;
  return (
    <group userData={{ noClip: true }}>
      <Line points={[[ea.x, ea.y, ea.z], [eb.x, eb.y, eb.z]]} color={color} lineWidth={3} transparent opacity={op} depthTest={false} renderOrder={20} />
      {p > 0.98 && <Line points={pts(a)} color={color} lineWidth={3} transparent opacity={op} depthTest={false} renderOrder={20} />}
      {p > 0.98 && <Line points={pts(b)} color={color} lineWidth={3} transparent opacity={op} depthTest={false} renderOrder={20} />}
      {fig && (
        <FigLabel3D fig={fig} caption={caption} at={[mid.x - sideV.x * 2.5, mid.y - sideV.y * 2.5, mid.z - sideV.z * 2.5]} start={start + 8} count={14} end={end}
          px={px} color={TECH.amber} />
      )}
    </group>
  );
};

// ---------------------------------------------------------------------- DOM overlays

const rise = (frame: number, at: number, dur = 15) =>
  interpolate(frame, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

/** The long-video figure caption: lower left, condensed caps, the figure big, an underline that
 * draws, a grey source line; fades and rises in over 0.5 s, holds, then goes. */
export const LowerThird: React.FC<{ fig: string; label: string; source?: string; at: number; hold?: number; count?: number }> = ({ fig, label, source, at, hold = 180, count = 18 }) => {
  const frame = useCurrentFrame();
  const k = rise(frame, at);
  const out = rise(frame, at + hold, 12);
  const o = k * (1 - out);
  if (o <= 0) return null;
  const shown = countText(fig, count > 0 ? rise(frame, at, count) : 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: "6%", bottom: "11%", opacity: o, transform: `translateY(${(1 - k) * 24}px)`, fontFamily: FONT, color: TECH.white,
        textShadow: "0 2px 12px rgba(0,0,0,0.85)", padding: "14px 22px", borderRadius: 14, background: "linear-gradient(90deg, rgba(5,7,14,0.7), rgba(5,7,14,0))" }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: 0.8 }}>{label}</div>
        <div style={{ fontSize: 88, fontWeight: 800, color: TECH.amber, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>{shown}</div>
        <div style={{ height: 4, width: `${Math.round(rise(frame, at + 6, 16) * 100)}%`, background: TECH.amber, marginTop: 6 }} />
        {source && <div style={{ fontSize: 22, fontWeight: 500, color: "#9aa3b8", marginTop: 10 }}>{source}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** The Shorts figure pill: top centre, below the safe zone's top. */
export const TopPill: React.FC<{ text: string; fig?: string; at: number; hold?: number }> = ({ text, fig, at, hold = 90 }) => {
  const frame = useCurrentFrame();
  const k = rise(frame, at, 10);
  const out = rise(frame, at + hold, 10);
  const o = k * (1 - out);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", alignItems: "center" }}>
      <div style={{ marginTop: 200, opacity: o, transform: `scale(${0.85 + 0.15 * k})`, padding: "18px 38px", borderRadius: 999, background: "rgba(8,11,22,0.82)",
        border: `3px solid ${TECH.amber}`, fontFamily: FONT, fontSize: 52, fontWeight: 700, color: TECH.white, whiteSpace: "nowrap" }}>
        {text}{fig ? <span style={{ color: TECH.amber, marginLeft: 16 }}>{countText(fig, rise(frame, at, 16))}</span> : null}
      </div>
    </AbsoluteFill>
  );
};

export type TagKind = "recreation" | "illustration" | "notToScale";
const TAGS: Record<TagKind, string> = { recreation: "3D RECREATION", illustration: "ILLUSTRATION", notToScale: "NOT TO SCALE" };

/** An honesty tag: small caps, lower left (or top left), a dim pill. */
export const Tag: React.FC<{ kind?: TagKind; text?: string; at?: number; until?: number; corner?: "bottomLeft" | "topLeft" }> = ({ kind = "illustration", text, at = 0, until, corner = "bottomLeft" }) => {
  const frame = useCurrentFrame();
  const o = rise(frame, at, 8) * (until === undefined ? 1 : 1 - rise(frame, until, 8));
  if (o <= 0) return null;
  const pos: React.CSSProperties = corner === "topLeft" ? { left: 48, top: 160 } : { left: 48, bottom: 470 };
  return (
    <div style={{ position: "absolute", ...pos, opacity: o * 0.92, padding: "8px 16px", borderRadius: 8, background: "rgba(8,11,22,0.6)",
      border: "1.5px solid rgba(255,255,255,0.35)", fontFamily: FONT, fontSize: 26, fontWeight: 600, letterSpacing: 3, color: "#dfe5f2" }}>
      {text ?? TAGS[kind]}
    </div>
  );
};

/** The scale while a scale trick runs: a bar and its length (from params.fig), top left. */
export const ScaleBadge: React.FC<{ text: string; at?: number; until?: number; bar?: number }> = ({ text, at = 0, until, bar = 120 }) => {
  const frame = useCurrentFrame();
  const o = rise(frame, at, 8) * (until === undefined ? 1 : 1 - rise(frame, until, 8));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 48, top: 230, opacity: o, fontFamily: FONT, color: TECH.white, display: "flex", alignItems: "center", gap: 16,
      padding: "10px 18px", borderRadius: 10, background: "rgba(8,11,22,0.6)" }}>
      <div style={{ width: bar, height: 10, borderLeft: "3px solid #fff", borderRight: "3px solid #fff", borderBottom: "3px solid #fff" }} />
      <div style={{ fontSize: 34, fontWeight: 700 }}>{text}</div>
    </div>
  );
};
