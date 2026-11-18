// Stage3D: the lit studio every 3D beat stands in. A gradient backdrop (CSS, behind a transparent
// canvas), key/fill/rim lights, soft shadows on an invisible floor, studio reflections made in code
// (Lightformers, no downloaded HDRI), a vignette and an optional depth-of-field look.
import { Environment, Lightformer } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import * as THREE from "three";
import { TECH, type V3 } from "./core";

export type Backdrop = "dark" | "light" | { top: string; bottom: string; glow?: string };

export type Stage3DProps = {
  children: React.ReactNode;
  /** canvas size; defaults to the composition (1080×1920 Short or 1920×1080 long) */
  width?: number;
  height?: number;
  backdrop?: Backdrop;
  /** initial camera; drive it per frame with <Camera3D> */
  camera?: { position?: V3; fov?: number };
  /** light rig strength 0..2 and its key direction */
  light?: number;
  keyFrom?: V3;
  rim?: string;
  /** a floor at y=0 that only catches shadows */
  floor?: boolean | { y?: number; size?: number; opacity?: number };
  /** the half-size of the area that casts shadows (world units) */
  shadowBox?: number;
  /** 0 = sharp; >0 blurs the frame edges (a cheap, deterministic depth-of-field look) */
  dof?: number;
  /** 0..1 dark edges */
  vignette?: number;
};

const BACKDROPS: Record<"dark" | "light", { top: string; bottom: string; glow: string }> = {
  dark: { top: TECH.bgTop, bottom: TECH.bgBottom, glow: "rgba(56,225,255,0.10)" },
  light: { top: "#eef2fb", bottom: "#c9d2e6", glow: "rgba(255,255,255,0.55)" },
};

export const Stage3D: React.FC<Stage3DProps> = ({
  children, width, height, backdrop = "dark", camera, light = 1, keyFrom = [4, 7, 5], rim = TECH.cyan,
  floor = true, shadowBox = 6, dof = 0, vignette = 0.55,
}) => {
  const cfg = useVideoConfig();
  const w = width ?? cfg.width;
  const h = height ?? cfg.height;
  const bd = typeof backdrop === "string" ? BACKDROPS[backdrop] : { glow: "rgba(255,255,255,0.08)", ...backdrop };
  const fl = floor === false ? null : { y: 0, size: 60, opacity: backdrop === "light" ? 0.22 : 0.45, ...(floor === true ? {} : floor) };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${bd.top} 0%, ${bd.bottom} 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at 50% 55%, ${bd.glow} 0%, rgba(0,0,0,0) 70%)` }} />
      <ThreeCanvas
        width={w} height={h} dpr={1} shadows="soft"
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        camera={{ position: camera?.position ?? [0, 2, 8], fov: camera?.fov ?? 35, near: 0.05, far: 400 }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <hemisphereLight args={["#cfe0ff", "#1a1f33", 0.55 * light]} />
        <directionalLight position={keyFrom} intensity={2.4 * light} castShadow
          shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
          shadow-camera-left={-shadowBox} shadow-camera-right={shadowBox}
          shadow-camera-top={shadowBox} shadow-camera-bottom={-shadowBox}
          shadow-camera-near={0.5} shadow-camera-far={40} />
        <directionalLight position={[-6, 3, 4]} intensity={0.7 * light} color="#bcd0ff" />
        <directionalLight position={[0, 4, -8]} intensity={1.8 * light} color={rim} />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
          {/* side panels near-white with a hint of the rim colours, so metals keep their own colour */}
          <Lightformer form="rect" intensity={1.4} color="#e6f6ff" position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.1} color="#f1ebff" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#fff4e0" position={[0, -3, 3]} rotation-x={-Math.PI / 2} scale={[10, 3, 1]} />
          <Lightformer form="ring" intensity={1.5} position={[0, 2, 7]} scale={3} />
        </Environment>
        {fl && (
          <mesh rotation-x={-Math.PI / 2} position={[0, fl.y, 0]} receiveShadow userData={{ noClip: true, noFade: true }}>
            <planeGeometry args={[fl.size, fl.size]} />
            <shadowMaterial transparent opacity={fl.opacity} />
          </mesh>
        )}
        {children}
      </ThreeCanvas>
      {dof > 0 && (
        // depth-of-field look: a blurred copy is not possible on a WebGL canvas through CSS cheaply,
        // so the edges get a radial backdrop blur; the centre (the subject) stays sharp
        <AbsoluteFill style={{
          backdropFilter: `blur(${dof}px)`, WebkitBackdropFilter: `blur(${dof}px)`,
          maskImage: "radial-gradient(ellipse 55% 45% at 50% 50%, transparent 55%, black 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 55% 45% at 50% 50%, transparent 55%, black 100%)",
        }} />
      )}
      {vignette > 0 && (
        <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      )}
    </AbsoluteFill>
  );
};
