-- pgvector for Topic.embedding
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('planned', 'scripted', 'verified', 'rendered', 'qa_passed', 'queued', 'scheduled', 'published', 'failed');

-- CreateEnum
CREATE TYPE "Checker" AS ENUM ('number_check', 'fact_review', 'qa_review');

-- CreateEnum
CREATE TYPE "UploadState" AS ENUM ('pending', 'uploaded', 'scheduled', 'published', 'failed');

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "failReason" TEXT,
    "script" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "durationSec" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "hookStyle" TEXT,
    "cta" TEXT,
    "queuePosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QaCheck" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "checker" "Checker" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" JSONB NOT NULL,

    CONSTRAINT "QaCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "youtubeId" TEXT,
    "publishAt" TIMESTAMP(3) NOT NULL,
    "state" "UploadState" NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoStat" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "subsGained" INTEGER NOT NULL DEFAULT 0,
    "avgViewPct" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "VideoStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "videoId" TEXT,
    "agent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "log" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "routineSessionUrl" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Video_status_queuePosition_idx" ON "Video"("status", "queuePosition");

-- CreateIndex
CREATE UNIQUE INDEX "QaCheck_videoId_checker_key" ON "QaCheck"("videoId", "checker");

-- CreateIndex
CREATE UNIQUE INDEX "Upload_videoId_key" ON "Upload"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoStat_uploadId_day_key" ON "VideoStat"("uploadId", "day");

-- CreateIndex
CREATE INDEX "AgentRun_startedAt_idx" ON "AgentRun"("startedAt");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaCheck" ADD CONSTRAINT "QaCheck_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoStat" ADD CONSTRAINT "VideoStat_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

