// The flag table (src/flat/flags.tsx, 2026-11-19) names countries as the map does, so `flag: "<name>"` on a
// map fill finds both its outline and its flag.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { feature } from "topojson-client";
import world50 from "world-atlas/countries-50m.json";
import { hasFlag } from "../src/flat/flags";

const keys = [...readFileSync(new URL("../src/flat/flags.tsx", import.meta.url), "utf8").matchAll(/^ {2}(?:"([^"]+)"|([A-Za-z]+)): /gm)].map((m) => m[1] ?? m[2]!);

describe("flags", () => {
  it("has a few dozen flags, each a Natural Earth country name", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topo = world50 as any;
    const names = new Set((feature(topo, topo.objects.countries) as unknown as { features: { properties: { name: string } }[] }).features.map((c) => c.properties.name));
    expect(keys.length).toBeGreaterThan(40);
    for (const k of keys) {
      expect(names.has(k), k).toBe(true);
      expect(hasFlag(k)).toBe(true);
    }
    expect(hasFlag("Atlantis")).toBe(false);
  });
});
