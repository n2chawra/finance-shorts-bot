import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
const [pr] = process.argv.slice(2);
const inputProps = JSON.parse(readFileSync(path.join(pr, "promo.json"), "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "Promo", inputProps });
let shown = -1;
await renderMedia({ composition, serveUrl, inputProps, codec: "h264", muted: true, outputLocation: path.join(pr, "silent.mp4"),
  imageFormat: "jpeg", jpegQuality: 90, crf: 18, x264Preset: "veryfast", concurrency: os.cpus().length,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 20) / 20; if (p > shown) { shown = p; console.log(`progress ${p.toFixed(2)}`); } } });
console.log("done");
