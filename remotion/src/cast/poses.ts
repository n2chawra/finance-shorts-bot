/**
 * Named poses, built from the rig. Hands that touch something (chin, hip, a chart) are placed with
 * IK, so the pose stays right whatever the character's proportions.
 */
import { armTo, BODY, type Pose, STAND } from "./rig";

const DOWN = Math.PI / 2;
const headChin: [number, number] = [0, BODY.headY + BODY.headR * 0.95];

function withArms(p: Pose, l?: [number, number], r?: [number, number]): Pose {
  return { ...p, armL: l ? armTo("L", p, l[0], l[1]) : p.armL, armR: r ? armTo("R", p, r[0], r[1]) : p.armR };
}

export const POSES = {
  stand: STAND,
  wave: { ...withArms(STAND, [150, -470]), handL: "wave" },
  point: { ...withArms({ ...STAND, turn: 0.35 }, [230, -360]), handL: "point" },
  pointUp: { ...withArms(STAND, [120, -560]), handL: "point" },
  // hand under the chin from below, forearm up the chest, so the arm never crosses the face
  think: { ...withArms({ ...STAND, headTilt: -0.08 }, [headChin[0] + 14, headChin[1] + 26], [40, -262]), handL: "fist", handR: "open" },
  // elbows by the sides, forearms out, palms up at chest height: "what can you do?"
  shrug: { ...STAND, headTilt: 0.12, bob: -3, armL: [DOWN - 0.5, -0.32], armR: [DOWN + 0.5, Math.PI + 0.32], handL: "open", handR: "open" },
  celebrate: { ...STAND, bob: -6, armL: [-1.1, -1.35], armR: [Math.PI + 1.1, Math.PI + 1.35], handL: "fist", handR: "fist" },
  facepalm: { ...withArms({ ...STAND, headTilt: 0.18, lean: 0.03 }, [10, BODY.headY + 10]), handL: "open" },
  hips: { ...STAND, armL: [DOWN - 1.1, DOWN + 1.0], armR: [DOWN + 1.1, DOWN - 1.0], handL: "fist", handR: "fist" },
  phone: { ...withArms({ ...STAND, headTilt: 0.12 }, [40, -300], [-10, -290]), handL: "hold", handR: "hold" },
  // one open hand out towards what is being shown (scenes put the content to the actor's left)
  present: { ...withArms({ ...STAND, headTilt: -0.05 }, undefined, [-270, -350]), handR: "open" },
  thumbsUp: { ...withArms(STAND, [120, -330]), handL: "thumb" },
  worried: { ...withArms({ ...STAND, headTilt: 0.06 }, [30, -260], [-30, -262]), handL: "fist", handR: "fist" },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;
