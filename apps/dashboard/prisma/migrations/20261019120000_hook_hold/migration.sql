-- The audience retention curve from YouTube Analytics (refreshed by the stats job like every stored
-- stat) and the hook score taken from it: the share of viewers still watching at 3 s (Shorts) or
-- 30 s (long videos).
ALTER TABLE "Upload" ADD COLUMN "retention" JSONB,
ADD COLUMN "hookHold" DOUBLE PRECISION,
ADD COLUMN "retentionAt" TIMESTAMP(3);
