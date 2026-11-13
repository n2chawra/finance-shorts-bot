-- Views follow a drop only when two refreshes in a row show it (owner, 2026-11-13: views went up and down).
ALTER TABLE "Upload" ADD COLUMN "liveLowViews" INTEGER;
