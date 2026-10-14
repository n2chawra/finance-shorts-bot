-- Current YouTube counters, refreshed by the dashboard (views, likes, comments update within minutes on YouTube).
ALTER TABLE "Upload" ADD COLUMN "liveViews" INTEGER,
ADD COLUMN "liveLikes" INTEGER,
ADD COLUMN "liveComments" INTEGER,
ADD COLUMN "liveAt" TIMESTAMP(3);
