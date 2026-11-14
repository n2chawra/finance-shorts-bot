import assert from "node:assert/strict";
import { test } from "node:test";

import { replaceWhere, replaceableKinds } from "../lib/breakdowns.ts";

test("a breakdown whose query failed keeps its stored rows (wrk-012)", () => {
  assert.deepEqual(replaceableKinds(["traffic", "country", "device"], ["country"]), ["traffic", "device"]);
  assert.deepEqual(replaceableKinds(["traffic"], ["traffic"]), []);
  assert.deepEqual(replaceableKinds(["traffic", "device"], []), ["traffic", "device"]);
});

test("the delete only touches the kinds that were fetched", () => {
  assert.deepEqual(replaceWhere("video:v-1", ["traffic"]), { scope: "video:v-1", kind: { in: ["traffic"] } });
  assert.deepEqual(replaceWhere("channel:all:28", []), { scope: "channel:all:28", kind: { in: [] } });
});
