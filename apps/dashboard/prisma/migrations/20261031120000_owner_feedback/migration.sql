-- The owner decides (2026-10-30): the editor's ranking of ready videos, the owner's pick for the next
-- upload and their own order, a stale ("rejected") status, and feedback on videos and the channel.
ALTER TYPE "VideoStatus" ADD VALUE 'rejected';

ALTER TABLE "Video" ADD COLUMN "editorRank" INTEGER,
ADD COLUMN "editorScore" DOUBLE PRECISION,
ADD COLUMN "editorNote" JSONB,
ADD COLUMN "pickedAt" TIMESTAMP(3),
ADD COLUMN "pickReason" TEXT,
ADD COLUMN "orderLocked" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "videoId" TEXT,
    "kind" TEXT NOT NULL,
    "area" TEXT,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "response" TEXT,
    "addressedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Feedback_status_createdAt_idx" ON "Feedback"("status", "createdAt");
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
