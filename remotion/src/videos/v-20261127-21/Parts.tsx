// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// A subsea internet cable on the seabed (with light pulses running in it and a cut end), a garden hose of
// the same width, the cable's cutaway (generic protective rings round a bundle of glass fibres: an
// illustration, no layer named), one fibre as a glass tunnel with light bouncing down it, a globe with
// glowing cable routes, an anchor and a trawl net, marine snow. No figures here.
// Units: the cable runs along x, across is z, y is up; the seabed is y=0.
import React, { useMemo } from "react";
import { Easing } from "remotion";
import { canvasTexture, cue, glow, GlowLine, mat, rnd, TECH, type V3 } from "../../three/index";
import { countries } from "../../flat/map";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
/** quantise an animated value so materials stay cached */
export const q = (x: number, n = 10) => Math.round(x * n) / n;

export const AMBER = "#ffb340";
export const CYAN = TECH.cyan;
export const HOSE_GREEN = "#2f9e44";
export const SEA_TOP = "#0b3552";
export const SEA_BOTTOM = "#02101c";

// ------------------------------------------------------------------ dimensions
export const R = 0.25; // the cable's radius (and the hose's)
export const CABLE_END = 2.6; // where the hook's cable is cut (x)

/** The hook's opening framing (the loop beat ends on it) */
export const HOOK_LOOK: V3 = [0.6, R, 0];
export const HOOK_DIR: V3 = [0.55, 0.42, 1];
export const HOOK_FROM = 4.6;

// ------------------------------------------------------------------ seabed and water
/** Dark sand with seeded rocks and ripples, `size` across. */
export const Seabed: React.FC<Group & { size?: number; tint?: string; seed?: string }> = ({ size = 60, tint = "#0f1c24", seed = "bed", ...g }) => {
  const rocks = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const x = (rnd(seed, i) - 0.5) * size * 0.8;
    const z = (rnd(seed, i + 100) - 0.5) * size * 0.8;
    const s = 0.08 + rnd(seed, i + 200) * 0.35;
    return { x, z: Math.abs(z) < 0.8 ? z + Math.sign(z || 1) * 1.2 : z, s, r: rnd(seed, i + 300) * 3 };
  }), [seed, size]);
  return (
    <group {...g}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={mat("blackPlastic", tint, { roughness: 0.95 })}>
        <planeGeometry args={[size, size]} />
      </mesh>
      {/* sand ripples */}
      {Array.from({ length: 26 }, (_, i) => (
        <mesh key={i} position={[(i - 13) * 1.1, 0.004, -2 - (i % 3) * 3]} rotation-x={-Math.PI / 2} material={mat("clay", "#223540", { roughness: 1 })}>
          <planeGeometry args={[0.12, 14]} />
        </mesh>
      ))}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.s * 0.35, r.z]} rotation={[r.r, r.r * 2, 0]} scale={[1, 0.6, 0.9]} castShadow material={mat("clay", "#2c363c")}>
          <dodecahedronGeometry args={[r.s, 0]} />
        </mesh>
      ))}
    </group>
  );
};

/** Marine snow: small pale flecks drifting down and sideways (a function of the frame). */
export const Snow: React.FC<{ f: number; n?: number; box?: V3; center?: V3; speed?: number; seed?: string }> = ({ f, n = 140, box = [14, 7, 10], center = [0, 3, 0], speed = 0.008, seed = "snow" }) => {
  const flecks = Array.from({ length: n }, (_, i) => {
    const x0 = rnd(seed, i), y0 = rnd(seed, i + n), z0 = rnd(seed, i + 2 * n);
    const y = ((y0 - f * speed * (0.6 + rnd(seed, i + 3 * n))) % 1 + 1) % 1;
    return [center[0] + (x0 - 0.5) * box[0] + Math.sin(f * 0.02 + i) * 0.08, center[1] + (y - 0.5) * box[1], center[2] + (z0 - 0.5) * box[2]] as V3;
  });
  const m = glow("#cfe6f2", 0.55);
  return (
    <group>
      {flecks.map((pos, i) => (
        <mesh key={i} position={pos} material={m}><boxGeometry args={[0.03, 0.03, 0.03]} /></mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ the cable
/** A cable lying along x from x0 to x1 (centre at y=R). `pulse` 0..1 lights the light pulses running in it
 * (seen through a thin seam on top), `speed` how fast they run, `cut` draws a glowing cut face at x1,
 * `breakAt` a broken cable: the pulses stop past it and the two ends part. */
export const Cable: React.FC<Group & { x0?: number; x1?: number; f: number; pulse?: number; speed?: number; cut?: number; breakAt?: number; gap?: number; dark?: number }> = ({
  x0 = -30, x1 = CABLE_END, f, pulse = 1, speed = 0.12, cut = 0, breakAt, gap = 0, dark = 0, ...g
}) => {
  const segs: [number, number][] = breakAt === undefined ? [[x0, x1]] : [[x0, breakAt - gap / 2], [breakAt + gap / 2, x1]];
  const n = Math.floor((x1 - x0) / 0.9);
  return (
    <group {...g}>
      {segs.map(([a, b], i) => (
        <group key={i}>
          <mesh position={[(a + b) / 2, R, 0]} rotation-z={Math.PI / 2} castShadow material={mat("glossy", "#111318", { roughness: 0.35 })}>
            <cylinderGeometry args={[R, R, Math.max(0.01, b - a), 40, 1]} />
          </mesh>
          {/* the seam where the light shows */}
          <mesh position={[(a + b) / 2, R * 2 - 0.004, 0]} material={mat("glossy", "#0c2430")}>
            <boxGeometry args={[Math.max(0.01, b - a), 0.012, 0.05]} />
          </mesh>
        </group>
      ))}
      {pulse > 0.02 && Array.from({ length: n }, (_, i) => {
        const x = x0 + ((((i * 0.9 + f * speed) % (x1 - x0)) + (x1 - x0)) % (x1 - x0));
        if (breakAt !== undefined && x > breakAt - gap / 2 - 0.1) return null;
        return (
          <mesh key={i} position={[x, R * 2 + 0.004, 0]} material={glow(CYAN, q(Math.min(1, pulse) * (1 - dark)))}>
            <boxGeometry args={[0.34, 0.016, 0.055]} />
          </mesh>
        );
      })}
      {cut > 0.01 && (
        <group position={[x1 + 0.002, R, 0]} rotation-y={Math.PI / 2}>
          <mesh material={mat("clay", "#2b2f36")}><circleGeometry args={[R, 40]} /></mesh>
          <mesh position={[0, 0, 0.003]} material={mat("brushed", "#9aa3ad")}><ringGeometry args={[R * 0.52, R * 0.72, 40]} /></mesh>
          <mesh position={[0, 0, 0.006]} material={glow(CYAN, q(cut))}><circleGeometry args={[R * 0.22, 32]} /></mesh>
        </group>
      )}
      {cut > 0.3 && <pointLight position={[x1 + 0.4, R, 0]} intensity={4 * cut} color={CYAN} distance={3} />}
    </group>
  );
};

/** A green garden hose of the cable's width, along x from x0 to x1, a brass coupling at x1. */
export const Hose: React.FC<Group & { x0?: number; x1?: number }> = ({ x0 = -8, x1 = 2.2, ...g }) => (
  <group {...g}>
    <mesh position={[(x0 + x1) / 2, R, 0]} rotation-z={Math.PI / 2} castShadow material={mat("glossy", HOSE_GREEN, { roughness: 0.4 })}>
      <cylinderGeometry args={[R, R, x1 - x0, 36, 1]} />
    </mesh>
    {/* ribs */}
    {Array.from({ length: Math.floor((x1 - x0) / 0.5) }, (_, i) => (
      <mesh key={i} position={[x0 + 0.25 + i * 0.5, R, 0]} rotation-z={Math.PI / 2} material={mat("glossy", "#27863a", { roughness: 0.5 })}>
        <cylinderGeometry args={[R * 1.02, R * 1.02, 0.04, 36, 1]} />
      </mesh>
    ))}
    <mesh position={[x1 + 0.12, R, 0]} rotation-z={Math.PI / 2} material={mat("gold", "#c9a44a")} castShadow>
      <cylinderGeometry args={[R * 1.12, R * 1.12, 0.24, 6, 1]} />
    </mesh>
  </group>
);

/** A width bracket in front of a round thing at x: two ticks and a bar, drawing out over `k`. */
export const WidthBracket: React.FC<{ x: number; k: number; z?: number; color?: string }> = ({ x, k, z = R + 0.12, color = TECH.white }) => {
  if (k <= 0.01) return null;
  const m = glow(color, 0.9);
  return (
    <group position={[x, R, z]} scale={[1, k, 1]}>
      <mesh material={m}><boxGeometry args={[0.02, R * 2, 0.02]} /></mesh>
      <mesh position={[0, R, 0]} material={m}><boxGeometry args={[0.14, 0.02, 0.02]} /></mesh>
      <mesh position={[0, -R, 0]} material={m}><boxGeometry args={[0.14, 0.02, 0.02]} /></mesh>
    </group>
  );
};

// ------------------------------------------------------------------ the cutaway
/** The cable's end, cut open as a stepped cutaway along x (each ring stops shorter than the one inside it,
 * so all of them show). `open` 0..1 peels it back (the rings slide apart), `lit` 0..1 per ring lights them
 * from the outside in, `fibres` 0..1 lights the fibre bundle, `pull` 0..1 slides one fibre forward. */
export const RINGS = [
  { r: R, len: 0, color: "#121419", preset: "glossy" as const },
  { r: R * 0.82, len: 0.5, color: "#3c4450", preset: "clay" as const },
  { r: R * 0.66, len: 0.95, color: "#9aa3ad", preset: "brushed" as const },
  { r: R * 0.48, len: 1.35, color: "#c98a4b", preset: "copper" as const },
  { r: R * 0.3, len: 1.7, color: "#d9e3ea", preset: "clay" as const },
];
export const FIBRE_R = 0.016;
export const FIBRES: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  if (i === 0) return [0, 0];
  const a = (i / 7) * Math.PI * 2;
  return [Math.cos(a) * 0.045, Math.sin(a) * 0.045];
});
export const BUNDLE_X = 2.05; // where the fibres stick out to
export const PULL_X = 0.9; // how far one fibre slides forward

export const CableCut: React.FC<Group & { open?: number; lit?: number[]; fibres?: number; pull?: number; f?: number }> = ({ open = 1, lit = [], fibres = 0, pull = 0, f = 0, ...g }) => (
  <group {...g}>
    {/* the jacket behind the cut */}
    <mesh position={[-6, R, 0]} rotation-z={Math.PI / 2} castShadow material={mat("glossy", "#111318", { roughness: 0.35 })}>
      <cylinderGeometry args={[R, R, 12, 40, 1]} />
    </mesh>
    {RINGS.map((ring, i) => {
      if (i === 0) return null;
      const len = ring.len * open;
      const l = lit[i] ?? 0;
      return (
        <group key={i}>
          <mesh position={[len / 2, R, 0]} rotation-z={Math.PI / 2} castShadow
            material={l > 0.05 ? mat(ring.preset, ring.color, { emissive: TECH.amber, emissiveIntensity: q(0.5 * l) }) : mat(ring.preset, ring.color)}>
            <cylinderGeometry args={[ring.r, ring.r, Math.max(0.01, len), 40, 1]} />
          </mesh>
          <mesh position={[len + 0.002, R, 0]} rotation-y={Math.PI / 2} material={mat(ring.preset, ring.color)}>
            <circleGeometry args={[ring.r, 40]} />
          </mesh>
        </group>
      );
    })}
    {/* the steel wires of the third ring, drawn as strands on its surface */}
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const len = RINGS[2]!.len * open;
      return (
        <mesh key={i} position={[len / 2, R + Math.sin(a) * RINGS[2]!.r, Math.cos(a) * RINGS[2]!.r]} rotation-z={Math.PI / 2} material={mat("brushed", "#c7ccd6")}>
          <cylinderGeometry args={[0.012, 0.012, Math.max(0.01, len), 8, 1]} />
        </mesh>
      );
    })}
    {/* the glass fibres */}
    {FIBRES.map(([y, z], i) => {
      const len = BUNDLE_X * open + (i === 0 ? pull * PULL_X : 0);
      const bright = q(0.25 + 0.75 * fibres + 0.15 * Math.sin(f * 0.2 + i));
      return (
        <group key={i}>
          <mesh position={[len / 2, R + y, z]} rotation-z={Math.PI / 2} material={mat("glass", "#bfe8ff", { opacity: 0.55 })}>
            <cylinderGeometry args={[FIBRE_R, FIBRE_R, Math.max(0.01, len), 12, 1]} />
          </mesh>
          <mesh position={[len / 2, R + y, z]} rotation-z={Math.PI / 2} material={glow(CYAN, Math.max(0.05, Math.min(1, bright)) * (fibres > 0.02 ? 1 : 0.2))}>
            <cylinderGeometry args={[FIBRE_R * 0.4, FIBRE_R * 0.4, Math.max(0.01, len), 8, 1]} />
          </mesh>
          <mesh position={[len + 0.003, R + y, z]} material={glow("#e8fbff", Math.max(0.1, Math.min(1, bright)))}>
            <sphereGeometry args={[FIBRE_R * 0.9, 12, 8]} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** A strand of human hair, along x from x0 to x1, at the fibre's height (its tip slightly curled). */
export const Hair: React.FC<Group & { x0?: number; x1?: number }> = ({ x0 = -1, x1 = 1, ...g }) => (
  <group {...g}>
    <mesh position={[(x0 + x1) / 2, 0, 0]} rotation-z={Math.PI / 2} material={mat("glossy", "#5a3a22", { roughness: 0.45 })}>
      <cylinderGeometry args={[FIBRE_R * 0.95, FIBRE_R * 0.95, x1 - x0, 12, 1]} />
    </mesh>
  </group>
);

// ------------------------------------------------------------------ inside a fibre
export const TUBE_R = 1;
/** The zigzag the light takes down the fibre: bouncing between the walls, period `p` along x. */
export function zig(x: number, p = 3.2): number {
  const u = ((x / p) % 1 + 1) % 1;
  return (u < 0.5 ? -1 + 4 * u : 3 - 4 * u) * TUBE_R * 0.82;
}
/** One fibre as a glass tunnel along x (radius TUBE_R), rings of light along its walls, and the light's
 * zigzag lit up to `head` (x of the pulse's front), with a train of flashes behind it. */
export const FibreTunnel: React.FC<{ f: number; head: number; len?: number; flashes?: number; wall?: number }> = ({ f, head, len = 60, flashes = 1, wall = 0 }) => {
  const x0 = -10;
  const pts = useMemo(() => {
    const out: V3[] = [];
    for (let x = x0; x <= head; x += 0.2) out.push([x, zig(x), 0]);
    out.push([head, zig(head), 0]);
    return out;
  }, [head]);
  return (
    <group>
      <mesh position={[len / 2 + x0, 0, 0]} rotation-z={Math.PI / 2} material={mat("glass", "#2a6f99", { opacity: 0.22, side: 2 })}>
        <cylinderGeometry args={[TUBE_R, TUBE_R, len, 48, 1, true]} />
      </mesh>
      {/* the cladding around the core, a darker shell */}
      <mesh position={[len / 2 + x0, 0, 0]} rotation-z={Math.PI / 2} material={mat("glass", "#0a1a28", { opacity: 0.6, side: 1 })}>
        <cylinderGeometry args={[TUBE_R * 1.35, TUBE_R * 1.35, len, 48, 1, true]} />
      </mesh>
      {/* the walls: two bright edges the light bounces between */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[len / 2 + x0, s * TUBE_R, 0]} material={glow("#7fd0ff", q(0.45 + 0.5 * wall))}>
          <boxGeometry args={[len, 0.035, 0.035]} />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(len / 1.6) }, (_, i) => (
        <mesh key={i} position={[x0 + i * 1.6, 0, 0]} rotation-y={Math.PI / 2} material={glow("#5fb8ff", q(0.5 + 0.5 * wall * (Math.abs(x0 + i * 1.6 - head) < 2 ? 1 : 0.3)))}>
          <ringGeometry args={[TUBE_R * 0.985, TUBE_R, 48]} />
        </mesh>
      ))}
      {pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1]!;
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const l = Math.hypot(dx, dy);
        const back = head - b[0];
        const on = flashes > 0.5 ? (Math.floor((back + f * 0.0) / 1.2) % 2 === 0 ? 1 : 0.25) : 1;
        const fade = Math.max(0, 1 - back / 14);
        if (fade <= 0.02) return null;
        return (
          <mesh key={i} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation-z={Math.atan2(dy, dx)} material={glow(CYAN, q(fade * on))}>
            <boxGeometry args={[l + 0.01, 0.05, 0.05]} />
          </mesh>
        );
      })}
      <mesh position={[head, zig(head), 0]} material={glow("#ffffff", 1)}>
        <sphereGeometry args={[0.12, 16, 12]} />
      </mesh>
      <pointLight position={[head, zig(head), 0]} intensity={8} color={CYAN} distance={4} />
    </group>
  );
};

// ------------------------------------------------------------------ the globe
/** lat/lon (degrees) → a point on a sphere of radius r (lon 0 faces +z, north is +y). */
export function ll(lat: number, lon: number, r = 1): V3 {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)];
}

function worldTexture(night: boolean) {
  return canvasTexture(`v2721-world-${night ? "n" : "d"}`, 2048, 1024, (g) => {
    g.fillStyle = night ? "#06182b" : "#0d3a5c";
    g.fillRect(0, 0, 2048, 1024);
    g.fillStyle = night ? "#1f3a4a" : "#3d6b57";
    g.strokeStyle = night ? "#2e5468" : "#5a8a6e";
    g.lineWidth = 1.5;
    const X = (lon: number) => ((lon + 180) / 360) * 2048;
    const Y = (lat: number) => ((90 - lat) / 180) * 1024;
    for (const c of countries("110m")) {
      const geom = c.geometry;
      const polys: number[][][][] = geom.type === "Polygon" ? [geom.coordinates as number[][][]] : geom.type === "MultiPolygon" ? (geom.coordinates as number[][][][]) : [];
      for (const poly of polys) {
        g.beginPath();
        for (const ring of poly) {
          ring.forEach((pt, i) => {
            const x = X(pt[0]!), y = Y(pt[1]!);
            if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
          });
          g.closePath();
        }
        g.fill("evenodd");
        g.stroke();
      }
    }
  });
}

/** The Earth: dark oceans, muted land (from the map kit's outlines), a faint atmosphere rim. Its texture is
 * equirectangular, so the sphere is turned to put lon 0 on +z (matching `ll`). */
export const Globe: React.FC<Group & { night?: boolean }> = ({ night = false, ...g }) => {
  const tex = useMemo(() => worldTexture(night), [night]);
  return (
    <group {...g}>
      <mesh rotation-y={-Math.PI / 2}>
        <sphereGeometry args={[1, 96, 64]} />
        <meshStandardMaterial map={tex} roughness={0.85} metalness={0} />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshBasicMaterial color="#3fa9ff" transparent opacity={0.08} side={1} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** A cable route over the globe through lat/lon points (great-circle steps between them), drawn on from its
 * start over `k` 0..1, `color`, `dash` for a planned cable. */
export type Route = [number, number][];
const unit = (v: V3, r: number): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [(v[0] / l) * r, (v[1] / l) * r, (v[2] / l) * r];
};
function routePoints(route: Route, r = 1.006): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < route.length - 1; i++) {
    const a = ll(route[i]![0], route[i]![1], 1), b = ll(route[i + 1]![0], route[i + 1]![1], 1);
    const n = 24;
    for (let s = 0; s < n; s++) {
      const u = s / n;
      out.push(unit([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u], r));
    }
  }
  const last = route[route.length - 1]!;
  out.push(ll(last[0], last[1], r));
  return out;
}
export function routeAt(route: Route, u: number, r = 1.012): V3 {
  const pts = routePoints(route, r);
  const i = Math.min(pts.length - 1, Math.max(0, Math.round(u * (pts.length - 1))));
  return pts[i]!;
}

export const CableRoute: React.FC<{ route: Route; k?: number; color?: string; dash?: boolean; width?: number; opacity?: number }> = ({ route, k = 1, color = CYAN, dash = false, width = 4, opacity = 1 }) => {
  const pts = useMemo(() => routePoints(route), [route]);
  if (k <= 0.01) return null;
  return <GlowLine points={pts} k={k} color={color} width={width} opacity={opacity} dashed={dash} dash={0.03} gap={0.025} />;
};

/** A landing point: a small glowing dot on the coast. */
export const Landing: React.FC<{ lat: number; lon: number; k?: number; color?: string }> = ({ lat, lon, k = 1, color = AMBER }) =>
  k > 0.02 ? (
    <mesh position={ll(lat, lon, 1.01)} scale={k} material={glow(color, 1)}>
      <sphereGeometry args={[0.016, 10, 8]} />
    </mesh>
  ) : null;

// a few real-shaped routes (illustrative paths between real coasts, not exact cable tracks)
export const ROUTES: { name: string; route: Route }[] = [
  { name: "atlantic1", route: [[40.7, -73.5], [45, -45], [49, -15], [50.3, -4.5]] },
  { name: "atlantic2", route: [[36.8, -75.9], [40, -45], [44, -20], [46.6, -1.9]] },
  { name: "atlantic3", route: [[-3.7, -38.5], [10, -28], [30, -20], [38.7, -9.5]] },
  { name: "pacific1", route: [[34, -120.6], [30, -150], [30, 170], [35, 139.9]] },
  { name: "pacific2", route: [[45.5, -124], [48, -160], [43, 160], [35.5, 140.5]] },
  { name: "pacific3", route: [[21.3, -158], [0, -170], [-20, 175], [-33.9, 151.3]] },
  { name: "africa", route: [[38.7, -9.5], [20, -20], [5, -10], [-10, 5], [-33.9, 18.4]] },
  { name: "asia", route: [[31.2, 32.3], [12.5, 45], [10, 65], [6, 80], [1.3, 103.8]] },
  { name: "india", route: [[25.1, 56.4], [18.9, 72.8]] },
  { name: "eastafrica", route: [[12.5, 45], [-4, 40], [-25, 36], [-33.9, 25.6]] },
];
export const PLANNED: Route[] = [
  [[-33.9, 18.4], [-40, 60], [-35, 100], [-31.9, 115.8]],
  [[60, 5], [70, 40], [72, 120], [65, 175]],
  [[-23, -43], [-30, -10], [-33.9, 18.4]],
];

// ------------------------------------------------------------------ the danger
/** A ship's anchor (stock-less, two flukes), shank along +y, the crown at the origin, a few chain links up. */
export const Anchor: React.FC<Group & { links?: number; dark?: boolean }> = ({ links = 10, dark = false, ...g }) => {
  const m = dark ? mat("glossy", "#23272d", { roughness: 0.55 }) : mat("clay", "#4a5058");
  return (
    <group {...g}>
      <mesh position={[0, 0.9, 0]} material={m} castShadow><boxGeometry args={[0.22, 1.8, 0.16]} /></mesh>
      <mesh position={[0, 0.1, 0]} material={m} castShadow><boxGeometry args={[1.1, 0.24, 0.3]} /></mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.55, 0.15, 0]} rotation-z={s * 0.6}>
          <mesh position={[0, 0.35, 0]} material={m} castShadow><boxGeometry args={[0.2, 0.75, 0.42]} /></mesh>
          <mesh position={[0, 0.78, 0]} rotation-z={s * 0.5} material={m} castShadow><coneGeometry args={[0.2, 0.3, 4]} /></mesh>
        </group>
      ))}
      <mesh position={[0, 1.88, 0]} rotation-y={Math.PI / 2} material={m}><torusGeometry args={[0.14, 0.04, 8, 16]} /></mesh>
      {Array.from({ length: links }, (_, i) => (
        <mesh key={i} position={[0, 2.1 + i * 0.22, 0]} rotation-y={i % 2 ? Math.PI / 2 : 0} material={m}>
          <torusGeometry args={[0.09, 0.03, 6, 12]} />
        </mesh>
      ))}
    </group>
  );
};

/** A trawl net dragged along the seabed toward +x: two otter boards on the sand, a mesh mouth between them. */
export const Trawl: React.FC<Group> = (g) => {
  const board = mat("brushed", "#7a4a2a", { roughness: 0.7 });
  const lines: V3[][] = [];
  for (let i = 0; i <= 8; i++) {
    const z = -1.6 + (i / 8) * 3.2;
    lines.push([[0, 0.05, z], [-2, 0.5, z * 0.6], [-4, 0.6, z * 0.25]]);
  }
  for (let j = 0; j <= 6; j++) {
    const x = -(j / 6) * 4, w = 1.6 * (1 - 0.75 * (j / 6)), y = 0.05 + 0.55 * (j / 6);
    lines.push([[x, 0.05 + y * 0.2, -w], [x, y + 0.3 * Math.sin((j / 6) * Math.PI), 0], [x, 0.05 + y * 0.2, w]]);
  }
  return (
    <group {...g}>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.2, 0.35, s * 1.8]} rotation-y={s * 0.3} material={board} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.08]} />
        </mesh>
      ))}
      {lines.map((pts, i) => <GlowLine key={i} points={pts} color="#d8c9a0" width={2} opacity={0.8} />)}
      <mesh position={[0.05, 0.05, 0]} rotation-x={Math.PI / 2} material={mat("brushed", "#8b8f96")}>
        <cylinderGeometry args={[0.03, 0.03, 3.4, 8, 1]} />
      </mesh>
    </group>
  );
};

export default Cable;
