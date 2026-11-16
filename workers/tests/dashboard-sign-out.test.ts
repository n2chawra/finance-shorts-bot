import assert from "node:assert/strict";
import test from "node:test";

import { signOut } from "../../apps/dashboard/src/lib/sign-out.ts";

test("sign out goes to the login page after the session ends", async () => {
  const steps: string[] = [];
  await signOut(async () => { steps.push("delete"); }, () => steps.push("login"));
  assert.deepEqual(steps, ["delete", "login"]);
});

test("sign out still goes to the login page when the request fails, without throwing", async () => {
  let went = false;
  await signOut(() => Promise.reject(new TypeError("Failed to fetch")), () => { went = true; });
  assert.equal(went, true);
});
