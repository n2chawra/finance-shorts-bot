import assert from "node:assert/strict";
import test from "node:test";

import { downloadedFile } from "../lib/github.ts";

test("a new file from gh release download is the one taken", () => {
  assert.equal(downloadedFile(new Set(["old.txt"]), ["old.txt", "Why billionaires borrow.mp4"], "video.mp4"), "Why billionaires borrow.mp4");
});

test("a re-download that overwrote the file in place still finds it", () => {
  // before the fix this fell back to "video.mp4", the rename failed and the error said gh was missing
  assert.equal(downloadedFile(new Set(["Title.mp4"]), ["Title.mp4"], "video.mp4"), "Title.mp4");
  assert.equal(downloadedFile(new Set(["thumb.png"]), ["thumb.png"], "thumb.png"), "thumb.png");
});

test("two candidate videos or none: it says it can't tell rather than guessing", () => {
  assert.equal(downloadedFile(new Set(), ["a.mp4", "b.mp4"], "video.mp4"), null);
  assert.equal(downloadedFile(new Set(["a.mp4", "b.mp4"]), ["a.mp4", "b.mp4"], "video.mp4"), null);
  assert.equal(downloadedFile(new Set(), [], "video.mp4"), null);
});
