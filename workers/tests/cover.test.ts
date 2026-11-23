import assert from "node:assert/strict";
import { test } from "node:test";
import { coverFile, pickedThumb, syncThumbs } from "../lib/cover.ts";

const thumbs = [
  { file: "thumbnail.png", score: 6, why: "w", picked: false },
  { file: "thumbnail-b.png", score: 8, why: "w", picked: true },
  { file: "thumbnail-c.png", score: 7, why: "w", picked: false },
];

test("the cover is the owner's pick, else Studio's, else thumbnail.png (2026-11-11)", () => {
  assert.equal(pickedThumb({ thumbs }), "thumbnail-b.png");
  assert.equal(pickedThumb({ thumbs, thumbPick: { file: "thumbnail-c.png", at: "x" } }), "thumbnail-c.png");
  assert.equal(pickedThumb({ thumbs, thumbPick: { file: "../../evil.png" } }), "thumbnail-b.png");
  assert.equal(pickedThumb({}), "thumbnail.png");
  assert.equal(pickedThumb(null), "thumbnail.png");
});

test("the picked cover's JPEG goes first, falling back to the main thumbnail", () => {
  const has = (set: string[]) => (f: string) => set.some((n) => f.endsWith(`/${n}`));
  assert.ok(coverFile("/v", { thumbs }, has(["thumbnail-b.jpg", "thumbnail-b.png", "thumbnail.jpg"]))!.endsWith("thumbnail-b.jpg"));
  assert.ok(coverFile("/v", { thumbs }, has(["thumbnail-b.png", "thumbnail.jpg"]))!.endsWith("thumbnail-b.png"));
  assert.ok(coverFile("/v", { thumbs }, has(["thumbnail.jpg"]))!.endsWith("thumbnail.jpg"));
  assert.equal(coverFile("/v", { thumbs }, has([])), null);
});

test("a queued video's thumbnails follow its manifest; the owner's pick stays while its file does", () => {
  assert.equal(syncThumbs({ thumbs }, thumbs), null);
  assert.equal(syncThumbs({ thumbs }, undefined), null);
  const one = [{ file: "thumbnail.png", picked: true }];
  const kept = syncThumbs({ thumbs: one, thumbPick: { file: "thumbnail.png" } }, thumbs)!;
  assert.deepEqual(kept.thumbs, thumbs);
  assert.deepEqual(kept.thumbPick, { file: "thumbnail.png" });
  const dropped = syncThumbs({ thumbs, thumbPick: { file: "thumbnail-c.png" } }, one)!;
  assert.equal(dropped.thumbPick, undefined);
});

test("needsCover: a recent upload without our cover is retried, at most 3 times (2026-11-22)", async () => {
  const { needsCover } = await import("../lib/cover.ts");
  // another channel: the path bug left its covers unset with no mark at all
  assert.equal(needsCover({}, false), true);
  assert.equal(needsCover({ coverTries: 2 }, false), true);
  assert.equal(needsCover({ coverTries: 3 }, false), false);
  assert.equal(needsCover({ coverSetAt: "2026-11-23T00:00:00Z" }, false), false);
  // the default channel: unmarked older uploads did get their cover; only a marked miss is retried
  assert.equal(needsCover({}, true), false);
  assert.equal(needsCover({ coverTries: 1 }, true), true);
  assert.equal(needsCover(null, false), true);
});

test("the publisher reads covers from the video's own channel folder (Disaster Desk, 22 Nov)", async () => {
  const { videoFile } = await import("../lib/channels.ts");
  const path = await import("node:path");
  const { existsSync } = await import("node:fs");
  const root = path.resolve(import.meta.dirname, "../..");
  const dir = path.dirname(videoFile(root, "disasters-and-engineering-failures-expla", "L-20261121-42", "manifest.json"));
  assert.match(dir, /channels\/disasters-and-engineering-failures-expla\/videos\/L-20261121-42$/);
  assert.ok(existsSync(path.join(dir, "thumbnail.png")), "the Hyatt long video's cover is in its folder");
});

test("a channel that can't set covers yet is asked again every 6 hours, without using up tries (23 Nov)", async () => {
  const { needsCover, isPermissionRefusal } = await import("../lib/cover.ts");
  const at = Date.parse("2026-11-23T06:00:00Z");
  const style = { coverRefusedAt: "2026-11-23T06:00:00Z", coverTries: 3 };
  assert.equal(needsCover(style, false, at + 3_600_000), false);
  assert.equal(needsCover(style, false, at + 6 * 3_600_000), true);
  assert.equal(isPermissionRefusal("The authenticated user doesn't have permissions to upload and set custom video thumbnails."), true);
  assert.equal(isPermissionRefusal("Media file too large"), false);
});

test("covers_now retries every miss, refused or out of tries", async () => {
  const { needsCover } = await import("../lib/cover.ts");
  assert.equal(needsCover({ coverTries: 3 }, false, Infinity, true), true);
  assert.equal(needsCover({ coverRefusedAt: "2026-11-23T06:00:00Z" }, false, Infinity, true), true);
  assert.equal(needsCover({ coverSetAt: "x" }, false, Infinity, true), false);
});
