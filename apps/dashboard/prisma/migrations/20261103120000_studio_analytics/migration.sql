-- Studio-grade analytics (2026-11-03): wider daily metrics, channel day totals, breakdowns (traffic,
-- search terms, countries, age and gender, devices), hourly public-counter snapshots and comments.
-- All of it is YouTube API data: refreshed by the stats jobs and wiped after 30 days without a refresh.
ALTER TABLE "Upload" ADD COLUMN "relRetention" JSONB,
ADD COLUMN "drops" JSONB;

ALTER TABLE "VideoStat" ADD COLUMN "engagedViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "watchMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "avgViewSec" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "shares" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "subsLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "playlistAdds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "impressions" INTEGER,
ADD COLUMN "ctr" DOUBLE PRECISION;

CREATE TABLE "ChannelDay" (
    "day" DATE NOT NULL,
    "format" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "engagedViews" INTEGER NOT NULL DEFAULT 0,
    "watchMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgViewSec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgViewPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "subsGained" INTEGER NOT NULL DEFAULT 0,
    "subsLost" INTEGER NOT NULL DEFAULT 0,
    "playlistAdds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ChannelDay_pkey" PRIMARY KEY ("day","format")
);

CREATE TABLE "Breakdown" (
    "scope" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "views" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "watchMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "share" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extra" JSONB,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Breakdown_pkey" PRIMARY KEY ("scope","kind","key")
);
CREATE INDEX "Breakdown_scope_kind_idx" ON "Breakdown"("scope", "kind");

CREATE TABLE "LiveSnapshot" (
    "uploadId" TEXT NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LiveSnapshot_pkey" PRIMARY KEY ("uploadId","hour")
);
CREATE INDEX "LiveSnapshot_hour_idx" ON "LiveSnapshot"("hour");
ALTER TABLE "LiveSnapshot" ADD CONSTRAINT "LiveSnapshot_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Comment_uploadId_idx" ON "Comment"("uploadId");
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
