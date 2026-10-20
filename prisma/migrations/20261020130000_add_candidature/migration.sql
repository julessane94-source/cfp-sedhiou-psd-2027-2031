CREATE TABLE "Candidature" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3),
  "address" TEXT,
  "trainingId" TEXT,
  "trainingName" TEXT NOT NULL,
  "motivation" TEXT,
  "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Candidature_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Candidature_reference_key" ON "Candidature"("reference");
CREATE INDEX "Candidature_status_createdAt_idx" ON "Candidature"("status", "createdAt");
CREATE INDEX "Candidature_email_idx" ON "Candidature"("email");
