import { describe, expect, it } from "vitest";
import { frameOn, holds, keepHeads, keepInside, shows, union } from "../src/studio/camera";

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

describe("keepHeads", () => {
  const H9 = 1920, W9 = 1080;
  // an actor at spot 0.2 in a Short (ground 1500, scale 1.5): head to feet, and the head with room
  const k = 1.5, x = 0.2 * W9, gy = 1500;
  const actor = { body: [x - 130 * k, gy - 510 * k, x + 130 * k, gy] as [number, number, number, number],
    head: [x - 110 * k, gy - 540 * k, x + 110 * k, gy - 330 * k] as [number, number, number, number] };
  it("zooms a medium shot on a thing out until the actor it catches keeps their head", () => {
    const item: [number, number, number, number] = [430, 1200, 700, 1500];
    const f0 = frameOn("medium", 565, 1350, W9, H9);
    const f = keepHeads(f0, item, [actor], W9, H9);
    expect(f.s).toBeLessThanOrEqual(f0.s);
    expect(holds(f, actor.head, W9, H9)).toBe(true);
    expect(holds(f, item, W9, H9)).toBe(true);
  });
  it("leaves an actor who is wholly out of the shot out", () => {
    const item: [number, number, number, number] = [900, 1300, 1060, 1500];
    const f0 = frameOn("close", 980, 1400, W9, H9);
    expect(shows(f0, actor.body, W9, H9)).toBe(false);
    expect(keepHeads(f0, item, [actor], W9, H9)).toEqual(f0);
  });
  it("holds a whole group on 'all'", () => {
    const u = union([actor.body, [600, 1200, 900, 1500]]);
    const f = keepInside(frameOn("close", (u[0] + u[2]) / 2, (u[1] + u[3]) / 2, W9, H9), u, W9, H9);
    expect(holds(f, u, W9, H9)).toBe(true);
  });
});
