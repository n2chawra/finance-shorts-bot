import { describe, expect, it } from "vitest";
import { MAX_ZOOM, maxZoomFor } from "../src/flat/camera";

// Owner, 2026-11-16 (v-20261116-01, GTA): "Camera kinda looks zoom in. Zoom out a little bit so that all
// things comes in picture." New videos stop the flat camera at MAX_ZOOM; published ones re-render as they were.
describe("the flat camera's zoom ceiling", () => {
  it("applies to Shorts and long videos made from 17 Nov 2026", () => {
    expect(maxZoomFor("v-20261117-01")).toBe(MAX_ZOOM);
    expect(maxZoomFor("L-20261120-01")).toBe(MAX_ZOOM);
    expect(MAX_ZOOM).toBeLessThanOrEqual(1.35);
  });
  it("leaves published videos and the reference unchanged", () => {
    expect(maxZoomFor("v-20261116-01")).toBe(Infinity);
    expect(maxZoomFor("v-directed-netflix")).toBe(Infinity);
  });
});
