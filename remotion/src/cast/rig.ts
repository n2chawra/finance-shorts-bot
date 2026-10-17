/**
 * The skeleton every cast member shares: joints, two-bone IK, a walk cycle and pose blending.
 *
 * Coordinates are the character's own, in pixels at scale 1: feet at y = 0, up is negative, the
 * character faces the viewer. A pose is plain numbers, so poses blend (`mixPose`) and spring into
 * each other, and every frame is still a pure function of time.
 */

export const BODY = {
  headR: 70,          // head radius
  headY: -432,        // head centre
  neckY: -358,
  shoulderY: -332,
  shoulderX: 70,
  hipY: -172,
  hipX: 32,
  upperArm: 88,
  forearm: 82,
  thigh: 90,
  shin: 86,
  height: 502,        // feet to top of head
} as const;

export type Hand = "open" | "fist" | "point" | "hold" | "thumb" | "wave";

/** Where the arms, legs and head are. Angles in radians, screen space (π/2 points down). */
export interface Pose {
  lean: number;            // torso tilt (positive leans right)
  bob: number;             // vertical body offset in px (breathing, bouncing)
  headTilt: number;        // radians
  turn: number;            // -1 (facing left) … 0 (front) … 1 (facing right): the 2.5D head and body turn
  armL: [number, number];  // upper, fore — the character's left arm (viewer's right)
  armR: [number, number];
  handL: Hand;
  handR: Hand;
  legL: [number, number];  // thigh, shin
  legR: [number, number];
}

const DOWN = Math.PI / 2;

export const STAND: Pose = {
  lean: 0, bob: 0, headTilt: 0, turn: 0,
  armL: [DOWN - 0.18, DOWN - 0.06], armR: [DOWN + 0.18, DOWN + 0.06],
  handL: "open", handR: "open",
  legL: [DOWN - 0.07, DOWN - 0.03], legR: [DOWN + 0.07, DOWN + 0.03],
};

export type P = [number, number];
export type Chain = [P, P, P];

export function chain(x: number, y: number, a1: number, l1: number, a2: number, l2: number): Chain {
  const jx = x + Math.cos(a1) * l1, jy = y + Math.sin(a1) * l1;
  return [[x, y], [jx, jy], [jx + Math.cos(a2) * l2, jy + Math.sin(a2) * l2]];
}

/**
 * Two-bone IK: the angles that put the end of the chain at (dx, dy) from its root. `bend` picks
 * which way the elbow or knee folds. Out-of-reach targets are reached towards, not failed.
 */
export function reach(dx: number, dy: number, l1: number, l2: number, bend: 1 | -1 = 1): [number, number] {
  const d0 = Math.hypot(dx, dy);
  if (d0 < 1e-6) return [DOWN, -DOWN];
  const d = Math.min(Math.max(d0, Math.abs(l1 - l2) * 1.001), (l1 + l2) * 0.999);
  const tx = (dx * d) / d0, ty = (dy * d) / d0;
  const cos = Math.min(1, Math.max(-1, (d * d + l1 * l1 - l2 * l2) / (2 * d * l1)));
  const a1 = Math.atan2(ty, tx) - Math.acos(cos) * bend;
  const ex = Math.cos(a1) * l1, ey = Math.sin(a1) * l1;
  return [a1, Math.atan2(ty - ey, tx - ex)];
}

/** Shoulder position for an arm, in character space, with the torso's lean applied. */
export function shoulder(side: "L" | "R", p: Pose): [number, number] {
  const sx = (side === "L" ? 1 : -1) * BODY.shoulderX * (1 - 0.18 * Math.abs(p.turn));
  return [sx + p.lean * 160 + p.turn * 10, BODY.shoulderY + p.bob];
}

/** Angles that put a hand at a point given in character space. */
export function armTo(side: "L" | "R", p: Pose, x: number, y: number): [number, number] {
  const [sx, sy] = shoulder(side, p);
  // elbows bend down and outward, never up past the shoulder
  return reach(x - sx, y - sy, BODY.upperArm, BODY.forearm, side === "L" ? 1 : -1);
}

/** Leg angles for a walk cycle at `phase` (cycles); one stride covers STRIDE px of ground. */
export const STRIDE = 150;
export function walkLegs(phase: number): Pick<Pose, "legL" | "legR" | "bob" | "armL" | "armR"> {
  const leg = (ph: number): [number, number] => {
    const s = Math.sin(ph * Math.PI * 2);
    const thigh = DOWN + 0.42 * s;
    return [thigh, thigh + 0.6 * Math.max(0, Math.sin(ph * Math.PI * 2 + 1.3))];
  };
  const swing = 0.45 * Math.sin(phase * Math.PI * 2);
  return {
    legL: leg(phase), legR: leg(phase + 0.5),
    bob: -Math.abs(Math.sin(phase * Math.PI * 2)) * 9,
    armL: [DOWN - 0.15 - swing, DOWN - 0.15 - swing + 0.35], armR: [DOWN + 0.15 + swing, DOWN + 0.15 + swing - 0.35],
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};
const pair = (a: [number, number], b: [number, number], t: number): [number, number] =>
  [lerpAngle(a[0], b[0], t), lerpAngle(a[1], b[1], t)];

/** Blend two poses; hands switch at the halfway point. */
export function mixPose(a: Pose, b: Pose, t: number): Pose {
  return {
    lean: lerp(a.lean, b.lean, t), bob: lerp(a.bob, b.bob, t), headTilt: lerp(a.headTilt, b.headTilt, t),
    turn: lerp(a.turn, b.turn, t),
    armL: pair(a.armL, b.armL, t), armR: pair(a.armR, b.armR, t),
    legL: pair(a.legL, b.legL, t), legR: pair(a.legR, b.legR, t),
    handL: t < 0.5 ? a.handL : b.handL, handR: t < 0.5 ? a.handR : b.handR,
  };
}

/** Idle life added on top of any pose: breathing, a slight sway, arms never perfectly still. */
export function idle(p: Pose, t: number, seed = 0): Pose {
  const breathe = Math.sin(t * 1.7 + seed) * 2.5;
  const sway = Math.sin(t * 0.6 + seed * 1.3) * 0.012;
  const arm = Math.sin(t * 1.3 + seed) * 0.03;
  return {
    ...p, bob: p.bob + breathe, lean: p.lean + sway, headTilt: p.headTilt + Math.sin(t * 0.8 + seed) * 0.02,
    armL: [p.armL[0] + arm, p.armL[1] + arm], armR: [p.armR[0] - arm, p.armR[1] - arm],
  };
}
