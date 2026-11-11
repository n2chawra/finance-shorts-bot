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
