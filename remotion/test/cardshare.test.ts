import { describe, expect, it } from "vitest";
import { SHARED_GROUND, SHARED_PANEL_BOTTOM, sharesCard } from "../src/studio/cardshare";
import { SHORT } from "../src/design/frame";

describe("sharesCard (owner 2026-11-04: no stretch of a Short with words only)", () => {
  it("keeps the things under a person card or a short document in a Short", () => {
    expect(sharesCard([{ do: "person" }, { do: "grow" }], 3, true)).toBe(true);
    expect(sharesCard([{ do: "doc", rows: [1, 2] }], 2, true)).toBe(true);
  });
  it("gives the frame to a long document, several panels, a sum, or a card with no things", () => {
    expect(sharesCard([{ do: "doc", rows: [1, 2, 3, 4] }], 2, true)).toBe(false);
    expect(sharesCard([{ do: "person" }, { do: "bars" }], 2, true)).toBe(false);
    expect(sharesCard([{ do: "person" }, { do: "equation" }], 2, true)).toBe(false);
    expect(sharesCard([{ do: "person" }], 0, true)).toBe(false);
    expect(sharesCard([{ do: "person" }], 2, false)).toBe(false);
  });
  it("puts the panel above the things and the ground clear of the bottom zone", () => {
    expect(SHARED_PANEL_BOTTOM).toBeLessThan(SHARED_GROUND - 0.15);
    expect(SHARED_GROUND * SHORT.height).toBeLessThan(SHORT.height - SHORT.bottomSafe - 200);
  });
});
