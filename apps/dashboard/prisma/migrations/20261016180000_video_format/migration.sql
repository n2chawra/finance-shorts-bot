-- Long-form videos: every video says which format it is.
ALTER TABLE "Video" ADD COLUMN "format" TEXT NOT NULL DEFAULT 'short';

DROP INDEX IF EXISTS "Video_status_queuePosition_idx";
CREATE INDEX "Video_status_format_queuePosition_idx" ON "Video"("status", "format", "queuePosition");
