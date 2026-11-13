-- The Study page (owner, 2026-11-13): YouTube videos the owner links, watched by Gemini and compared with ours.
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT,
    "channel" TEXT,
    "note" TEXT,
    "videoId" TEXT,
    "matchedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "report" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneAt" TIMESTAMP(3),
    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Study_status_createdAt_idx" ON "Study"("status", "createdAt");
ALTER TABLE "Study" ADD CONSTRAINT "Study_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
