CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AbsenceRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "decisionNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AbsenceRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimetableEntry_weekday_startTime_idx" ON "TimetableEntry"("weekday", "startTime");
CREATE INDEX "TimetableEntry_room_weekday_startTime_idx" ON "TimetableEntry"("room", "weekday", "startTime");
CREATE INDEX "TimetableEntry_userId_weekday_startTime_idx" ON "TimetableEntry"("userId", "weekday", "startTime");
CREATE INDEX "AbsenceRequest_userId_status_createdAt_idx" ON "AbsenceRequest"("userId", "status", "createdAt");
CREATE INDEX "AbsenceRequest_status_startDate_idx" ON "AbsenceRequest"("status", "startDate");

ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AbsenceRequest" ADD CONSTRAINT "AbsenceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AbsenceRequest" ADD CONSTRAINT "AbsenceRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
