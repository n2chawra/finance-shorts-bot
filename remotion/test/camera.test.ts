import { describe, expect, it } from "vitest";
import { frameOn, keepInside } from "../src/studio/camera";

const W = 1920, H = 1080;
const onScreen = (f: { s: number; tx: number; ty: number }, b: [number, number, number, number]) =>
  [b[0] * f.s + f.tx, b[1] * f.s + f.ty, b[2] * f.s + f.tx, b[3] * f.s + f.ty];

describe("keepInside", () => {
  it("keeps a stack's tag whole in a close shot near the top of the frame", () => {
    const tag: [number, number, number, number] = [1300, 300, 1570, 420];
    const f = keepInside(frameOn("close", 1435, 360, W, H), tag, W, H);
    const [x0, y0, x1, y1] = onScreen(f, tag);
    expect(x0).toBeGreaterThanOrEqual(23.9); expect(y0).toBeGreaterThanOrEqual(23.9);
    expect(x1).toBeLessThanOrEqual(W - 23.9); expect(y1).toBeLessThanOrEqual(H - 23.9);
  });
  it("zooms out of a close shot just enough to fit a tall phone", () => {
    const phone: [number, number, number, number] = [1100, 50, 1500, 860];
    const f = keepInside(frameOn("close", 1300, 454, W, H), phone, W, H);
    expect(f.s).toBeLessThan(2.15);
    expect(f.s).toBeGreaterThanOrEqual(1);
    const [, y0, , y1] = onScreen(f, phone);
    expect(y0).toBeGreaterThanOrEqual(23.9); expect(y1).toBeLessThanOrEqual(H - 23.9);
  });
  it("leaves a shot that already holds the box alone", () => {
    const f = frameOn("wide", 960, 540, W, H);
    expect(keepInside(f, [800, 400, 1100, 600], W, H)).toEqual(f);
  });
});
