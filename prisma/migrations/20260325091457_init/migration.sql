-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'REVIEWING', 'ANALYSED', 'READY_TO_CONTACT', 'CONTACTED', 'REPLIED', 'CALL_BOOKED', 'WON', 'LOST', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "linkedinProfileUrl" TEXT,
    "role" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "score" INTEGER,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAnalysis" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "homepageTitle" TEXT,
    "homepageDescription" TEXT,
    "homepageSummary" TEXT NOT NULL,
    "observedIssues" JSONB NOT NULL,
    "likelyHypotheses" JSONB NOT NULL,
    "nextChecks" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDraftSet" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "whyThisLead" TEXT NOT NULL,
    "coreProblemAngle" TEXT NOT NULL,
    "valueHook" TEXT NOT NULL,
    "connectionNote" TEXT NOT NULL,
    "followUpOne" TEXT NOT NULL,
    "followUpTwo" TEXT NOT NULL,
    "auditOfferMessage" TEXT NOT NULL,
    "offerPositioning" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageDraftSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadAnalysis_leadId_fetchedAt_idx" ON "LeadAnalysis"("leadId", "fetchedAt" DESC);

-- CreateIndex
CREATE INDEX "MessageDraftSet_leadId_createdAt_idx" ON "MessageDraftSet"("leadId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ActivityEvent_leadId_createdAt_idx" ON "ActivityEvent"("leadId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "LeadAnalysis" ADD CONSTRAINT "LeadAnalysis_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDraftSet" ADD CONSTRAINT "MessageDraftSet_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
