// Stage3D: the lit studio every 3D beat stands in. A gradient backdrop drawn in the scene, key / fill
// / rim lights, soft shadows, studio reflections made in code (Lightformers, no downloaded HDRI), a
// shadow-catching, reflective or gridded floor, fog, and the look pass (post.tsx): bloom on emissive
// parts, real depth of field, motion blur from the camera's speed, ACES tone mapping and a vignette.
import { Environment, Grid, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { TECH, type V3 } from "./core";
import { newStageStore, Post, StageStoreProvider } from "./post";
import { backdropTexture } from "./textures";

export type Backdrop = "dark" | "light" | "void" | { top: string; bottom: string; glow?: string };

export type FloorSpec = boolean | "reflect" | { y?: number; size?: number; opacity?: number; reflect?: boolean; grid?: boolean; color?: string };

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
  /** the floor at y=0: true = shadows only, "reflect" = a dark glossy floor that mirrors the scene
   * (blurred), or an object; `grid` adds the faint perspective grid */
  floor?: FloorSpec;
  /** the half-size of the area that casts shadows (world units) */
  shadowBox?: number;
  /** the look pass (default on): bloom strength, depth-of-field bokeh (0 = off; focus with <Focus/>),
   * motion blur strength, vignette darkness */
  post?: boolean;
  bloom?: number;
  dof?: number;
  blur?: number;
  vignette?: number;
  /** fog: colour and the near/far distances (places use it for depth) */
  fog?: { color?: string; near: number; far: number };
  /** DOM drawn over the 3D (tags, lower thirds, top pills: see overlays in Figures.tsx) */
  overlay?: React.ReactNode;
};

const BACKDROPS: Record<"dark" | "light" | "void", { top: string; bottom: string; glow: string }> = {
  dark: { top: TECH.bgTop, bottom: TECH.bgBottom, glow: "rgba(56,225,255,0.10)" },
  void: { top: "#0d1018", bottom: "#05060a", glow: "rgba(120,140,190,0.10)" },
  light: { top: "#eef2fb", bottom: "#c9d2e6", glow: "rgba(255,255,255,0.55)" },
};

const SceneSetup: React.FC<{ bg: THREE.Texture; fog?: Stage3DProps["fog"]; bgColor: string }> = ({ bg, fog, bgColor }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = bg;
    scene.fog = fog ? new THREE.Fog(fog.color ?? bgColor, fog.near, fog.far) : null;
  }, [scene, bg, fog?.color, fog?.near, fog?.far, bgColor]);
  return null;
};

export const Stage3D: React.FC<Stage3DProps> = ({
  children, width, height, backdrop = "dark", camera, light = 1, keyFrom = [4, 7, 5], rim = TECH.cyan,
  floor = true, shadowBox = 6, post = true, bloom = 0.8, dof = 0, blur = 1, vignette = 0.45, fog, overlay,
}) => {
  const cfg = useVideoConfig();
  const stageFrame = useCurrentFrame();
  const w = width ?? cfg.width;
  const h = height ?? cfg.height;
  const bd = typeof backdrop === "string" ? BACKDROPS[backdrop] : { glow: "rgba(255,255,255,0.08)", ...backdrop };
  const fl = floor === false ? null
    : { y: 0, size: 80, opacity: backdrop === "light" ? 0.22 : 0.45, reflect: floor === "reflect", grid: floor === "reflect", color: "#0b0e14",
      ...(typeof floor === "object" ? floor : {}) };
  const bg = useMemo(() => backdropTexture(bd.top, bd.bottom, bd.glow), [bd.top, bd.bottom, bd.glow]);
  const store = useMemo(() => newStageStore(), []);
  return (
    <AbsoluteFill style={{ background: bd.bottom }}>
      <ThreeCanvas
        width={w} height={h} dpr={1} shadows="soft"
        gl={{ antialias: !post, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance", stencil: false }}
        camera={{ position: camera?.position ?? [0, 2, 8], fov: camera?.fov ?? 35, near: 0.05, far: 400 }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <StageStoreProvider store={store} frame={stageFrame}>
          <SceneSetup bg={bg} fog={fog} bgColor={bd.bottom} />
          <hemisphereLight args={["#cfe0ff", "#1a1f33", 0.55 * light]} />
          <directionalLight position={keyFrom} intensity={2.4 * light} castShadow
            shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
            shadow-camera-left={-shadowBox} shadow-camera-right={shadowBox}
            shadow-camera-top={shadowBox} shadow-camera-bottom={-shadowBox}
            shadow-camera-near={0.5} shadow-camera-far={60} />
          <directionalLight position={[-6, 3, 4]} intensity={0.7 * light} color="#bcd0ff" />
          <directionalLight position={[0, 4, -8]} intensity={1.8 * light} color={rim} />
          <directionalLight position={[6, 2.5, -4]} intensity={1.1 * light} color="#ffffff" />
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={2.2} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
            {/* side panels near-white with a hint of the rim colours, so metals keep their own colour */}
            <Lightformer form="rect" intensity={1.4} color="#e6f6ff" position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
            <Lightformer form="rect" intensity={1.1} color="#f1ebff" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
            <Lightformer form="rect" intensity={0.6} color="#fff4e0" position={[0, -3, 3]} rotation-x={-Math.PI / 2} scale={[10, 3, 1]} />
            <Lightformer form="ring" intensity={1.5} position={[0, 2, 7]} scale={3} />
          </Environment>
          {fl && !fl.reflect && (
            <mesh rotation-x={-Math.PI / 2} position={[0, fl.y, 0]} receiveShadow userData={{ noClip: true, noFade: true }}>
              <planeGeometry args={[fl.size, fl.size]} />
              <shadowMaterial transparent opacity={fl.opacity} />
            </mesh>
          )}
          {fl && fl.reflect && (
            <mesh rotation-x={-Math.PI / 2} position={[0, fl.y, 0]} receiveShadow userData={{ noClip: true, noFade: true }}>
              <planeGeometry args={[fl.size, fl.size]} />
              <MeshReflectorMaterial resolution={512} blur={[400, 120]} mixBlur={1} mixStrength={0.9} mixContrast={1.1}
                roughness={0.75} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.3} color={fl.color} metalness={0.6} mirror={0.6} />
            </mesh>
          )}
          {fl && fl.grid && (
            <Grid position={[0, fl.y + 0.003, 0]} args={[fl.size, fl.size]} cellSize={0.5} cellThickness={0.6} cellColor="#1b2740"
              sectionSize={2.5} sectionThickness={1} sectionColor="#2a3c62" fadeDistance={28} fadeStrength={1.6} followCamera={false} infiniteGrid
              userData={{ noClip: true, noFade: true }} />
          )}
          {children}
          {post && <Post store={store} bloom={bloom} dof={dof} blur={blur} vignette={vignette} />}
        </StageStoreProvider>
      </ThreeCanvas>
      {!post && vignette > 0 && (
        <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      )}
      {overlay}
    </AbsoluteFill>
  );
};
