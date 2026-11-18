// Procedural surface detail, drawn once per seed on a 2D canvas: circuit-board traces with 45°
// bends, vias and pads; a die floorplan (cores, cache arrays, wiring, colour variation); the studio
// backdrop. Same seed → same texture. No image files.
import * as THREE from "three";
import { rnd } from "./core";

const cache = new Map<string, THREE.CanvasTexture>();

export function canvasTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  cache.set(key, t);
  return t;
}

/** A board top: solder mask, copper traces routed with 45° bends, pads, vias, silkscreen boxes.
 * `kind`: "map" (colour) or "rough" (roughness: copper shinier than the mask). */
export function pcbTexture(seed: string, kind: "map" | "rough" = "map", mask = "#123c2c", size = 1024): THREE.CanvasTexture {
  return canvasTexture(`pcb|${seed}|${kind}|${mask}|${size}`, size, size, (g) => {
    const map = kind === "map";
    g.fillStyle = map ? mask : "#c8c8c8";
    g.fillRect(0, 0, size, size);
    const copper = map ? "#c98a4b" : "#3a3a3a";
    const n = 140;
    g.lineCap = "round";
    g.lineJoin = "round";
    for (let i = 0; i < n; i++) {
      let x = rnd(seed, i * 7) * size, y = rnd(seed, i * 7 + 1) * size;
      g.strokeStyle = copper;
      g.globalAlpha = map ? 0.55 + rnd(seed, i * 7 + 6) * 0.35 : 1;
      g.lineWidth = 2 + Math.floor(rnd(seed, i * 7 + 2) * 3) * 2;
      g.beginPath();
      g.moveTo(x, y);
      const segs = 2 + Math.floor(rnd(seed, i * 7 + 3) * 4);
      for (let k = 0; k < segs; k++) {
        const len = 30 + rnd(seed, i * 31 + k) * 160;
        const dir = Math.floor(rnd(seed, i * 37 + k) * 8) * (Math.PI / 4);
        x += Math.cos(dir) * len; y += Math.sin(dir) * len;
        g.lineTo(x, y);
      }
      g.stroke();
      // a via at the end
      g.globalAlpha = 1;
      g.fillStyle = map ? "#d9a35f" : "#2a2a2a";
      g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = map ? "#0a1a12" : "#ffffff";
      g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
    }
    // pad rows and silkscreen outlines
    for (let i = 0; i < 26; i++) {
      const x = rnd(seed, 900 + i) * size, y = rnd(seed, 950 + i) * size, horiz = rnd(seed, 990 + i) > 0.5;
      const count = 4 + Math.floor(rnd(seed, 1030 + i) * 10);
      g.fillStyle = map ? "#e0b067" : "#202020";
      for (let k = 0; k < count; k++) g.fillRect(x + (horiz ? k * 12 : 0), y + (horiz ? 0 : k * 12), 7, 7);
      if (map) {
        g.strokeStyle = "rgba(235,240,230,0.55)";
        g.lineWidth = 1.5;
        g.strokeRect(x - 8, y - 8, (horiz ? count * 12 : 7) + 14, (horiz ? 7 : count * 12) + 14);
      }
    }
    g.globalAlpha = 1;
  }, kind === "map");
}

/** A die floorplan: core blocks with their own sub-structure, cache arrays (fine regular grids),
 * an interconnect fabric, IO ring, and a slight colour drift across the die (as on a real wafer). */
export function dieTexture(seed: string, cores: [number, number] = [2, 4], size = 1024): THREE.CanvasTexture {
  return canvasTexture(`die|${seed}|${cores.join("x")}|${size}`, size, size, (g) => {
    const grad = g.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#2a2f5e"); grad.addColorStop(0.5, "#24385a"); grad.addColorStop(1, "#3a2c5c");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    // IO ring
    g.fillStyle = "#8a7a4a";
    for (let k = 0; k < 64; k++) {
      const u = (k + 0.5) / 64 * size;
      g.fillRect(u - 4, 6, 8, 18); g.fillRect(u - 4, size - 24, 8, 18);
      g.fillRect(6, u - 4, 18, 8); g.fillRect(size - 24, u - 4, 18, 8);
    }
    const pad = 48, inner = size - pad * 2;
    const [cx, cz] = cores;
    const coreH = inner * 0.62;
    const cw = inner / cx, ch = coreH / cz;
    for (let ix = 0; ix < cx; ix++) for (let iz = 0; iz < cz; iz++) {
      const x0 = pad + ix * cw + 8, y0 = pad + iz * ch + 8, w = cw - 16, h = ch - 16;
      const hue = 235 + (rnd(seed, ix * 10 + iz) - 0.5) * 40;
      g.fillStyle = `hsl(${hue}, 45%, ${30 + rnd(seed, 50 + ix * 10 + iz) * 10}%)`;
      g.fillRect(x0, y0, w, h);
      // sub-blocks inside a core
      for (let b = 0; b < 9; b++) {
        const bx = x0 + rnd(seed, 100 + ix * 97 + iz * 13 + b) * w * 0.7;
        const by = y0 + rnd(seed, 200 + ix * 97 + iz * 13 + b) * h * 0.7;
        g.fillStyle = `hsla(${hue + 20 + b * 7}, 55%, ${38 + b * 3}%, 0.85)`;
        g.fillRect(bx, by, w * (0.12 + rnd(seed, 300 + b) * 0.2), h * (0.12 + rnd(seed, 400 + b) * 0.2));
      }
      // L2 array: a fine grid strip
      g.fillStyle = "rgba(200,190,255,0.22)";
      for (let k = 0; k < w; k += 5) g.fillRect(x0 + k, y0 + h * 0.82, 2, h * 0.15);
    }
    // shared cache: a big regular array
    const cy0 = pad + coreH + 16, cH = inner - coreH - 16;
    g.fillStyle = "#5a4a2a";
    g.fillRect(pad, cy0, inner, cH);
    g.fillStyle = "rgba(255,220,140,0.35)";
    for (let y = cy0 + 4; y < cy0 + cH - 4; y += 6) for (let x = pad + 4; x < pad + inner - 4; x += 6) g.fillRect(x, y, 3, 3);
    // interconnect: thin horizontal/vertical metal lines over everything
    g.strokeStyle = "rgba(180,220,255,0.10)";
    g.lineWidth = 1;
    for (let k = 0; k < 120; k++) {
      const v = rnd(seed, 600 + k) * size;
      g.beginPath();
      if (k % 2) { g.moveTo(pad, v); g.lineTo(size - pad, v); } else { g.moveTo(v, pad); g.lineTo(v, size - pad); }
      g.stroke();
    }
  });
}

/** The studio backdrop as a texture for scene.background: a vertical gradient and a soft glow. */
export function backdropTexture(top: string, bottom: string, glow: string): THREE.CanvasTexture {
  return canvasTexture(`bg|${top}|${bottom}|${glow}`, 256, 512, (g) => {
    const lin = g.createLinearGradient(0, 0, 0, 512);
    lin.addColorStop(0, top); lin.addColorStop(1, bottom);
    g.fillStyle = lin; g.fillRect(0, 0, 256, 512);
    const rad = g.createRadialGradient(128, 290, 10, 128, 290, 260);
    rad.addColorStop(0, glow); rad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rad; g.fillRect(0, 0, 256, 512);
  });
}

/** A fan's blades (seen from the front) as an alpha texture, so a fan is one cheap disc. */
export function fanTexture(blades = 9): THREE.CanvasTexture {
  return canvasTexture(`fan|${blades}`, 512, 512, (g) => {
    g.translate(256, 256);
    g.fillStyle = "#1c1e24";
    for (let i = 0; i < blades; i++) {
      g.save();
      g.rotate((i / blades) * Math.PI * 2);
      g.beginPath();
      g.moveTo(40, -10);
      g.quadraticCurveTo(160, -70, 238, -20);
      g.quadraticCurveTo(170, 30, 50, 22);
      g.closePath();
      g.fill();
      g.restore();
    }
    g.fillStyle = "#2a2d35";
    g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#444a56"; g.lineWidth = 4;
    g.beginPath(); g.arc(0, 0, 50, 0, Math.PI * 2); g.stroke();
  });
}
