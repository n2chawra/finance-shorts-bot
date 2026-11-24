// Label3D: a dot on the thing, a leader line that draws out, then a label that writes on letter by
// letter. The label always faces the camera and keeps a fixed size on screen (`px`, the cap height
// in output pixels), so it stays readable however far the camera is. It draws on top of the model.
import { Billboard, Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { FONT } from "../design/fonts";
import { add3, clampShift, cue, glowTexture, lerp3, TECH, useFontReady, type V3 } from "./core";

export type Label3DProps = {
  /** the point on the model */
  at: V3;
  /** where the label sits, relative to `at` */
  offset?: V3;
  text: string;
  /** a smaller second line */
  sub?: string;
  /** frame the line starts drawing (local time) */
  start?: number;
  /** frame it fades out (optional) */
  end?: number;
  color?: string;
  /** text height on screen in output pixels (Shorts: 44+ to pass the layout rule) */
  px?: number;
  align?: "left" | "right" | "center";
};

const PAD = 28, S = 2; // canvas padding and supersampling

function measure(text: string, sub: string | undefined, fontPx: number) {
  const c = document.createElement("canvas").getContext("2d")!;
  c.font = `700 ${fontPx}px ${FONT}`;
  const w1 = c.measureText(text).width;
  c.font = `500 ${fontPx * 0.62}px ${FONT}`;
  const w2 = sub ? c.measureText(sub).width : 0;
  const w = Math.ceil(Math.max(w1, w2) + PAD * 2 + 14 + fontPx * 0.12); // + overhang of the last letter
  const h = Math.ceil(fontPx * 1.25 + (sub ? fontPx * 0.8 : 0) + PAD * 1.5);
  return { w, h };
}

export const Label3D: React.FC<Label3DProps> = ({ at, offset = [0.6, 0.6, 0], text, sub, start = 0, end, color = TECH.cyan, px = 46, align = "left" }) => {
  const frame = useCurrentFrame();
  const r700 = useFontReady(700), r500 = useFontReady(500);
  // measure only once both weights are in, or the plate is sized for a fallback font and clips
  const ready = r700 && r500;
  const fontPx = 64 * S;
  const size = useMemo(() => (ready ? measure(text, sub, fontPx) : { w: 10, h: 10 }), [ready, text, sub, fontPx]);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = size.w; c.height = size.h;
    return c;
  }, [size]);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);

  // line in 8 frames, then the words write on fast (about 2.5 letters a frame, 4–10 frames)
  const pLine = cue(frame, start, 8);
  const pText = cue(frame, start + 5, Math.min(10, Math.max(4, (text.length + (sub?.length ?? 0)) * 0.4)), (t) => t);
  const out = end === undefined ? 0 : cue(frame, end - 8, 8);
  const alpha = (pLine > 0 ? 1 : 0) * (1 - out);
  const shown = Math.round(pText * (text.length + (sub?.length ?? 0)));

  useLayoutEffect(() => {
    if (!ready) return;
    const g = canvas.getContext("2d")!;
    g.clearRect(0, 0, canvas.width, canvas.height);
    const boxW = pText > 0 ? canvas.width * (0.3 + 0.7 * Math.min(1, pText * 2.5)) : 0;
    if (boxW > 0) {
      g.fillStyle = "rgba(8,11,22,0.86)";
      g.beginPath();
      g.roundRect(0, 0, boxW, canvas.height, 22);
      g.fill();
      g.fillStyle = color;
      g.fillRect(0, 14, 10, canvas.height - 28);
    }
    g.textBaseline = "top";
    g.fillStyle = TECH.white;
    g.font = `700 ${fontPx}px ${FONT}`;
    g.fillText(text.slice(0, Math.min(shown, text.length)), PAD + 14, PAD * 0.75);
    if (sub && shown > text.length) {
      g.fillStyle = color;
      g.font = `500 ${fontPx * 0.62}px ${FONT}`;
      g.fillText(sub.slice(0, shown - text.length), PAD + 14, PAD * 0.75 + fontPx * 1.2);
    }
    tex.needsUpdate = true;
  }, [ready, shown, pText, canvas, tex, color, text, sub, fontPx]);

  // keep a fixed size on screen: world height = px / H × visible height at this distance
  const holder = useRef<THREE.Group>(null);
  const plate = useRef<THREE.Mesh>(null);
  const aspect = size.w / size.h;
  const anchorX = align === "left" ? aspect / 2 : align === "right" ? -aspect / 2 : 0;
  const size3 = useThree((s) => s.size);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const g = holder.current;
    if (!g) return;
    g.getWorldPosition(tmp);
    const cam = camera as THREE.PerspectiveCamera;
    // depth along the view axis (not straight-line distance): what perspective divides by
    const dist = Math.max(0.01, -tmp.clone().applyMatrix4(cam.matrixWorldInverse).z);
    const visible = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const parentScale = g.parent ? g.parent.getWorldScale(new THREE.Vector3()).y : 1;
    // the plane is 1 unit tall and holds size.h canvas pixels, drawn with a fontPx font
    g.scale.setScalar((px * size.h * visible) / (fontPx * size3.height * parentScale));
    // keep the whole label inside the frame (and clear of a Short's right-hand buttons and
    // bottom caption zone): measure it on screen and slide it back in
    const m = plate.current;
    if (!m) return;
    const W = size3.width, H = size3.height;
    const hp = (px * size.h) / fontPx, wp = (size.w / size.h) * hp;
    const ndc = tmp.clone().project(cam);
    // a label whose point is off screen (or behind the camera) hides instead of sliding into a corner,
    // where it piled up over the logo on close shots (L-20261124-21, adopt tech-long-3d-labels-corner)
    const onScreen = ndc.z < 1 && Math.abs(ndc.x) <= 1.05 && Math.abs(ndc.y) <= 1.05;
    m.visible = onScreen;
    if (!onScreen) return;
    const cx = (ndc.x * 0.5 + 0.5) * W + anchorX * hp, cy = (-ndc.y * 0.5 + 0.5) * H;
    const [dx, dy] = clampShift(cx, cy, wp, hp, W, H);
    m.position.set(anchorX + dx / hp, -dy / hp, 0);
  });

  const tip = add3(at, lerp3([0, 0, 0], offset, pLine));
  if (alpha <= 0) return null;
  return (
    <group userData={{ noClip: true }}>
      <sprite position={at} scale={[0.12, 0.12, 0.12]} renderOrder={20} userData={{ noClip: true, noFade: true }}>
        <spriteMaterial map={glowTexture()} color={color} transparent opacity={alpha} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <Line points={[at, tip]} color={color} lineWidth={4} transparent opacity={alpha} depthTest={false} renderOrder={20} userData={{ noClip: true, noFade: true }} />
      <group position={add3(at, offset)} ref={holder}>
        <Billboard>
          <mesh ref={plate} position={[anchorX, 0, 0]} renderOrder={21} userData={{ noClip: true, noFade: true }}>
            <planeGeometry args={[aspect, 1]} />
            <meshBasicMaterial map={tex} transparent opacity={alpha * (pText > 0 ? 1 : 0)} depthTest={false} depthWrite={false} toneMapped={false} />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
};
