import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";
const [pr, ...frames] = process.argv.slice(2);
const inputProps = JSON.parse(readFileSync(path.join(pr, "promo.json"), "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "Promo", inputProps });
for (const f of frames) {
  await renderStill({ composition, serveUrl, inputProps, frame: Number(f), output: path.join(pr, `s${f}.jpg`), imageFormat: "jpeg", jpegQuality: 80 });
  console.log("still", f);
}
