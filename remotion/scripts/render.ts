/**
 * Render a timeline.json (renderer/timeline/build.py) with the Story composition.
 *
 *   tsx scripts/render.ts video  --timeline t.json --out silent.mp4 [--from F --to T] [--bundle dir]
 *   tsx scripts/render.ts stills --timeline t.json --out dir/ (--frames 0,90,300 | --every 5) [--bundle dir] [--probe 1]
 *   tsx scripts/render.ts thumbnail --timeline t.json --out thumbnail.png [--bundle dir]
 *   tsx scripts/render.ts bundle --out dir/
 *
 * Video is silent: Python mixed the audio and muxes it on afterwards (renderer/remotion.py).
 * --from/--to render one chunk so a long video can be rendered in pieces under a command time cap.
 * Prints "progress <0..1>" lines for a monitor, and "done <path>" at the end. With --probe, stills
 * also print "probe {frame, items}" lines: every visible text box (src/fx/probe.tsx).
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findBrowser } from "./browser";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSITION = "Story";

function args(argv: string[]): { mode: string; opts: Record<string, string> } {
  const [mode = "", ...rest] = argv;
  const opts: Record<string, string> = {};
  for (let i = 0; i < rest.length; i += 2) {
    const k = rest[i]!, v = rest[i + 1];
    if (!k.startsWith("--") || v === undefined) throw new Error(`expected --name value pairs, got ${k}`);
    opts[k.slice(2)] = v;
  }
  return { mode, opts };
}

async function serveUrl(dir: string | undefined): Promise<string> {
  if (dir) return path.resolve(dir);
  return bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
}

async function main(): Promise<void> {
  const { mode, opts } = args(process.argv.slice(2));
  const browserExecutable = findBrowser();
  const concurrency = Number(opts.concurrency ?? 4);

  if (mode === "bundle") {
    if (!opts.out) throw new Error("bundle needs --out");
    const out = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public"), outDir: path.resolve(opts.out) });
    console.log(`done ${out}`);
    return;
  }
  if (mode !== "video" && mode !== "stills" && mode !== "thumbnail") throw new Error("mode must be video, stills, thumbnail or bundle");
  if (!opts.timeline || !opts.out) throw new Error(`${mode} needs --timeline and --out`);

  const timeline: unknown = JSON.parse(readFileSync(opts.timeline, "utf8"));
  const inputProps = { timeline, probe: mode === "stills" && opts.probe === "1" };
  const url = await serveUrl(opts.bundle);
  if (mode === "thumbnail") {
    const thumb = await selectComposition({ serveUrl: url, id: "Thumbnail", inputProps, browserExecutable });
    await renderStill({ composition: thumb, serveUrl: url, inputProps, frame: 0, output: path.resolve(opts.out), imageFormat: "png", browserExecutable });
    console.log(`done ${path.resolve(opts.out)}`);
    return;
  }
  const composition = await selectComposition({ serveUrl: url, id: COMPOSITION, inputProps, browserExecutable });

  if (mode === "video") {
    const last = composition.durationInFrames - 1;
    const from = Math.max(0, Number(opts.from ?? 0)), to = Math.min(last, Number(opts.to ?? last));
    let shown = -1;
    await renderMedia({
      composition, serveUrl: url, inputProps, codec: "h264", outputLocation: path.resolve(opts.out),
      muted: true, imageFormat: "jpeg", jpegQuality: 92, crf: 18, pixelFormat: "yuv420p",
      frameRange: [from, to], concurrency, browserExecutable,
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 50) / 50;                     // every 2%
        if (p > shown) { shown = p; console.log(`progress ${p.toFixed(2)}`); }
      },
    });
    console.log(`done ${path.resolve(opts.out)}`);
    return;
  }

  // stills: specific frames, or one every N seconds plus the last frame
  const out = path.resolve(opts.out);
  mkdirSync(out, { recursive: true });
  const n = composition.durationInFrames;
  let frames: number[];
  if (opts.frames) frames = opts.frames.split(",").map(Number);
  else {
    const step = Math.round(Number(opts.every ?? 5) * composition.fps);
    frames = [];
    for (let f = 0; f < n; f += step) frames.push(f);
    frames.push(n - 1);
  }
  const browser = await openBrowser("chrome", { browserExecutable });
  try {
    for (const [i, frame] of frames.entries()) {
      const file = path.join(out, `f${String(frame).padStart(5, "0")}.jpg`);
      await renderStill({
        composition, serveUrl: url, inputProps, frame, output: file, imageFormat: "jpeg", jpegQuality: 85, puppeteerInstance: browser,
        onBrowserLog: (log) => { if (log.text.startsWith("PROBE ")) console.log("probe " + log.text.slice(6)); },
      });
      console.log(`progress ${((i + 1) / frames.length).toFixed(2)}`);
    }
  } finally {
    await browser.close({ silent: true });
  }
  console.log(`done ${out}`);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.stack ?? e.message : String(e));
  process.exit(1);
});
