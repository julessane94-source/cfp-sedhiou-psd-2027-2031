-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('BROUILLON', 'VALIDE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('RECETTE', 'DEPENSE', 'ENGAGEMENT', 'PAIEMENT');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIF', 'EN_MAINTENANCE', 'HORS_SERVICE', 'REFORME');

-- CreateEnum
CREATE TYPE "InsertionStatus" AS ENUM ('EN_RECHERCHE', 'STAGE', 'EMPLOI', 'AUTO_EMPLOI', 'ENTREPRENEUR', 'SANS_EMPLOI');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('ACADEMIQUE', 'PROFESSIONNEL', 'INSERTION');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('PREVU', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE');

-- CreateEnum
CREATE TYPE "EntrepreneurshipStatus" AS ENUM ('IDEE', 'ETUDE', 'ACCOMPAGNEMENT', 'FINANCEMENT', 'EN_ACTIVITE', 'ABANDONNE');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('BROUILLON', 'PUBLIE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('ANNONCE', 'INFORMATION', 'EVENEMENT', 'NOTE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ESPECES', 'WAVE', 'ORANGE_MONEY', 'VIREMENT_BANCAIRE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAYE', 'PARTIEL', 'IMPAYE');

-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('ENTREE', 'SORTIE');

-- CreateEnum
CREATE TYPE "CashSourceType" AS ENUM ('INSCRIPTION', 'FONDS', 'DEPENSE', 'AUTRE', 'AJUSTEMENT');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('PREVUE', 'EN_COURS', 'REALISEE', 'REPORTEE');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "contractType" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "hireDate" TIMESTAMP(3),
    "serviceId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "level" TEXT,
    "duration" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthDate" TIMESTAMP(3),
    "integrationYear" INTEGER,

    CONSTRAINT "Learner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT,
    "academicYear" TEXT NOT NULL DEFAULT 'NON_RENSEIGNEE',
    "level" TEXT,
    "registrationFee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "trainingCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "scholarshipCoverage" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netPayable" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "allocated" DECIMAL(15,2) NOT NULL,
    "committed" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "spent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialOperation" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "budgetLineId" TEXT,
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "inventoryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "acquisitionDate" TIMESTAMP(3),
    "acquisitionValue" DECIMAL(15,2),
    "location" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIF',
    "categoryId" TEXT,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(15,2),
    "provider" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "status" "DocumentStatus" NOT NULL DEFAULT 'BROUILLON',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PSDAxis" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PSDAxis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PSDObjective" (
    "id" TEXT NOT NULL,
    "axisId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PSDObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PSDAction" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT,
    "axisId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "indicator" TEXT,
    "baseline" TEXT,
    "target2031" TEXT,
    "responsible" TEXT,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "budget" DECIMAL(15,2),
    "status" "ActionStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PSDAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityIncident" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT,
    "description" TEXT NOT NULL,
    "actions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OUVERT',
    "agentId" TEXT,
    "serviceId" TEXT,
    "assetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insertion" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "InsertionStatus" NOT NULL DEFAULT 'EN_RECHERCHE',
    "structure" TEXT,
    "position" TEXT,
    "contractType" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "salary" DECIMAL(15,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainingId" TEXT,

    CONSTRAINT "Insertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "address" TEXT,
    "tutorName" TEXT,
    "tutorPhone" TEXT,
    "type" "StageType" NOT NULL DEFAULT 'PROFESSIONNEL',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'PREVU',
    "conventionNumber" TEXT,
    "evaluation" DECIMAL(5,2),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurshipProject" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "description" TEXT,
    "status" "EntrepreneurshipStatus" NOT NULL DEFAULT 'IDEE',
    "requestedAmount" DECIMAL(15,2),
    "financedAmount" DECIMAL(15,2),
    "structure" TEXT,
    "startDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntrepreneurshipProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL DEFAULT 'ANNONCE',
    "status" "CommunicationStatus" NOT NULL DEFAULT 'BROUILLON',
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerPayment" (
    "id" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAYE',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerReceipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "movementNumber" TEXT NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "sourceType" "CashSourceType" NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod",
    "reference" TEXT,
    "note" TEXT,
    "supportingDocument" TEXT,
    "learnerPaymentId" TEXT,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapActivity" (
    "id" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT,
    "description" TEXT,
    "responsible" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "resources" TEXT,
    "budgetForecast" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "budgetActual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "fundingSource" TEXT,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'PREVUE',
    "results" TEXT,
    "observations" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_matricule_key" ON "Agent"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_key" ON "Agent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Training_code_key" ON "Training"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Learner_matricule_key" ON "Learner"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_learnerId_trainingId_academicYear_key" ON "Enrollment"("learnerId", "trainingId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialOperation_reference_key" ON "FinancialOperation"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_inventoryCode_key" ON "Asset"("inventoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "PSDAxis_code_key" ON "PSDAxis"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityIncident_reference_key" ON "SecurityIncident"("reference");

-- CreateIndex
CREATE INDEX "Insertion_learnerId_idx" ON "Insertion"("learnerId");

-- CreateIndex
CREATE INDEX "Insertion_year_idx" ON "Insertion"("year");

-- CreateIndex
CREATE INDEX "Insertion_status_idx" ON "Insertion"("status");

-- CreateIndex
CREATE INDEX "Stage_learnerId_idx" ON "Stage"("learnerId");

-- CreateIndex
CREATE INDEX "Stage_status_idx" ON "Stage"("status");

-- CreateIndex
CREATE INDEX "Stage_startDate_idx" ON "Stage"("startDate");

-- CreateIndex
CREATE INDEX "EntrepreneurshipProject_learnerId_idx" ON "EntrepreneurshipProject"("learnerId");

-- CreateIndex
CREATE INDEX "EntrepreneurshipProject_status_idx" ON "EntrepreneurshipProject"("status");

-- CreateIndex
CREATE INDEX "EntrepreneurshipProject_sector_idx" ON "EntrepreneurshipProject"("sector");

-- CreateIndex
CREATE INDEX "Communication_status_idx" ON "Communication"("status");

-- CreateIndex
CREATE INDEX "Communication_type_idx" ON "Communication"("type");

-- CreateIndex
CREATE INDEX "Communication_publishedAt_idx" ON "Communication"("publishedAt");

-- CreateIndex
CREATE INDEX "Communication_authorId_idx" ON "Communication"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerPayment_paymentReference_key" ON "LearnerPayment"("paymentReference");

-- CreateIndex
CREATE INDEX "LearnerPayment_learnerId_idx" ON "LearnerPayment"("learnerId");

-- CreateIndex
CREATE INDEX "LearnerPayment_enrollmentId_idx" ON "LearnerPayment"("enrollmentId");

-- CreateIndex
CREATE INDEX "LearnerPayment_registeredById_idx" ON "LearnerPayment"("registeredById");

-- CreateIndex
CREATE INDEX "LearnerPayment_paidAt_idx" ON "LearnerPayment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerReceipt_receiptNumber_key" ON "LearnerReceipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerReceipt_paymentId_key" ON "LearnerReceipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "CashMovement_movementNumber_key" ON "CashMovement"("movementNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CashMovement_learnerPaymentId_key" ON "CashMovement"("learnerPaymentId");

-- CreateIndex
CREATE INDEX "CashMovement_movementDate_idx" ON "CashMovement"("movementDate");

-- CreateIndex
CREATE INDEX "CashMovement_type_idx" ON "CashMovement"("type");

-- CreateIndex
CREATE INDEX "CashMovement_sourceType_idx" ON "CashMovement"("sourceType");

-- CreateIndex
CREATE INDEX "CashMovement_category_idx" ON "CashMovement"("category");

-- CreateIndex
CREATE INDEX "CashMovement_registeredById_idx" ON "CashMovement"("registeredById");

-- CreateIndex
CREATE INDEX "RoadmapActivity_academicYear_idx" ON "RoadmapActivity"("academicYear");

-- CreateIndex
CREATE INDEX "RoadmapActivity_status_idx" ON "RoadmapActivity"("status");

-- CreateIndex
CREATE INDEX "RoadmapActivity_startDate_idx" ON "RoadmapActivity"("startDate");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialOperation" ADD CONSTRAINT "FinancialOperation_budgetLineId_fkey" FOREIGN KEY ("budgetLineId") REFERENCES "BudgetLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialOperation" ADD CONSTRAINT "FinancialOperation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PSDObjective" ADD CONSTRAINT "PSDObjective_axisId_fkey" FOREIGN KEY ("axisId") REFERENCES "PSDAxis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PSDAction" ADD CONSTRAINT "PSDAction_axisId_fkey" FOREIGN KEY ("axisId") REFERENCES "PSDAxis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PSDAction" ADD CONSTRAINT "PSDAction_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "PSDObjective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityIncident" ADD CONSTRAINT "SecurityIncident_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityIncident" ADD CONSTRAINT "SecurityIncident_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityIncident" ADD CONSTRAINT "SecurityIncident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insertion" ADD CONSTRAINT "Insertion_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insertion" ADD CONSTRAINT "Insertion_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrepreneurshipProject" ADD CONSTRAINT "EntrepreneurshipProject_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerPayment" ADD CONSTRAINT "LearnerPayment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerPayment" ADD CONSTRAINT "LearnerPayment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerPayment" ADD CONSTRAINT "LearnerPayment_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerReceipt" ADD CONSTRAINT "LearnerReceipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "LearnerPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_learnerPaymentId_fkey" FOREIGN KEY ("learnerPaymentId") REFERENCES "LearnerPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapActivity" ADD CONSTRAINT "RoadmapActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
