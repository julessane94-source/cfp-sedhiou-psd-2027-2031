CREATE TABLE "TrainerReview" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "sourceFileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'A_CONFIRMER',
    "agentId" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrainerReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrainerReview_normalizedName_key" ON "TrainerReview"("normalizedName");
CREATE UNIQUE INDEX "TrainerReview_agentId_key" ON "TrainerReview"("agentId");
CREATE INDEX "TrainerReview_status_updatedAt_idx" ON "TrainerReview"("status", "updatedAt");

ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
