/**
 * A dive beat (README): every beat of a dive video is this component. It draws the whole world the
 * timeline describes (all beats' layers), with the camera at this moment of the video's dive, so a cut
 * between beats never jumps. A video uses it from remotion/src/videos/<id>/Dive.tsx:
 *
 *   import Dive from "../../dive/Dive";
 *   export default Dive;
 */
import React from "react";
import type { SceneProps } from "../scenes/kit";
import { INK, STROKE, SourceLine, Stage, Txt, maxZoomFor } from "../flat/kit";
import { CamCtx, PIECES, ScreenCounter, Strata } from "./pieces";
import { ANCHOR_Y, cameraAt, diveWorld, figFeet, type DiveWorld } from "./world";

/** The depth meter on the left edge: a bar filling to the camera's depth, the depth in ft and in m (m computed here). */
/** The depths the meter may print: the street and every layer whose depth is a sourced figure. A layer placed by
 * `ft` alone has no published depth, so the meter's bar moves past it without a number (QA, 2026-11-21: "4 m" at
 * a raft placed by hand read as a typed figure). */
const sourcedFt = (w: DiveWorld): number[] => [0, ...w.layers.filter((L) => {
  const f = figFeet(L.fig[L.spec.depth ?? "depth"], w.cfg.unit ?? "ft");
  return Number.isFinite(f) && Math.abs(f - L.ft) < 0.5;
}).map((L) => L.ft)];

export const DepthMeter: React.FC<{ w: DiveWorld; ft: number }> = ({ w, ft }) => {
  const x = 34, y0 = 230, y1 = 1360;
  const u = Math.min(1, Math.max(0, ft / w.maxFt));
  const py = y0 + u * (y1 - y0);
  // whole metres, or a half where the depth really sits on one (58.5 m reads as its sign does; 221 ft is 67 m, not 67.5)
  const mx = ft * 0.3048, half = Math.floor(mx) + 0.5;
  const m = Math.abs(mx - half) < 0.1 ? half : Math.round(mx);
  const metric = w.cfg.unit === "m";
  const main = metric ? `${m} m` : `${Math.round(ft)} ft`;
  const sub = metric ? `${Math.round(ft)} ft below` : `${m} m below`;
  const accent = w.look.accent;
  const shown = sourcedFt(w).some((f) => Math.abs(f - ft) < 0.6);
  return (
    <g>
      <rect x={x} y={y0 - 20} width={34} height={y1 - y0 + 40} rx={17} fill="#0f1224" stroke={INK} strokeWidth={STROKE} opacity={0.9} />
      <rect x={x + 8} y={y0} width={18} height={Math.max(0, py - y0)} rx={9} fill={accent} />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={x + 34} x2={x + 52} y1={y0 + f * (y1 - y0)} y2={y0 + f * (y1 - y0)} stroke="#f4f1e8" strokeWidth={4} />)}
      <polygon points={`${x + 44},${py} ${x + 70},${py - 16} ${x + 70},${py + 16}`} fill={accent} stroke={INK} strokeWidth={4} />
      {shown ? <>
        <rect x={x + 74} y={py - 50} width={250} height={100} rx={18} fill="#0f1224" stroke={INK} strokeWidth={STROKE} opacity={0.92} />
        <Txt x={x + 199} y={py - 10} size={54} fill={accent} weight={800}>{main}</Txt>
        <Txt x={x + 199} y={py + 32} size={30} fill="#f4f1e8" weight={600} deco>{sub}</Txt>
      </> : null}
    </g>
  );
};

/** The world at story frame g: strata, then the pieces back to front. */
export const World: React.FC<{ w: DiveWorld; g: number }> = ({ w, g }) => {
  const order = ["water", "surface", "foundation", "shaft", "tunnel", "chamber", "cavern", "deepest"];
  const sorted = [...w.layers].sort((a, b) => order.indexOf(a.spec.kind) - order.indexOf(b.spec.kind));
  return (
    <g>
      <Strata w={w} />
      {sorted.map((L, i) => { const P = PIECES[L.spec.kind]; return P ? <P key={i} L={L} w={w} g={g} /> : null; })}
    </g>
  );
};

const Dive: React.FC<SceneProps> = (p) => {
  const w = diveWorld(p.tl);
  const tempo = p.tl.tempo ?? 1;
  const g = p.beat.from * tempo + p.frame;          // story frames since the video began
  const cam = cameraAt(w, g);
  const z = Math.min(maxZoomFor(p.tl.id), cam.z);
  const shake = w.landings.reduce((s, l) => s + Math.max(0, 1 - Math.abs(g - l) / 5) * 7, 0);
  const cx = p.tl.width / 2;
  return (
    <>
      <Stage p={p} bg={w.look.deep}>
        <g transform={`translate(${cx + Math.sin(g * 2) * shake} ${ANCHOR_Y}) scale(${z}) translate(${-cx} ${-cam.y})`}>
          <CamCtx.Provider value={{ z, camY: cam.y, cx, W: p.tl.width, H: p.tl.height }}>
            <World w={w} g={g} />
          </CamCtx.Provider>
        </g>
        <DepthMeter w={w} ft={cam.ft} />
        <ScreenCounter w={w} g={g} />
        {w.cfg.note ? <Txt x={cx} y={120} size={26} fill="#f4f1e8" deco>{w.cfg.note}</Txt> : null}
      </Stage>
      <SourceLine p={p} />
    </>
  );
};

export default Dive;
