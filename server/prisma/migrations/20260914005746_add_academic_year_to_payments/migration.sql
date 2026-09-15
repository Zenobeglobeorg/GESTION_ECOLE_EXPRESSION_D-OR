-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "academicYearId" INTEGER;

-- CreateIndex
CREATE INDEX "payments_academicYearId_idx" ON "payments"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_studentId_academicYearId_installmentNumber_key" ON "payments"("studentId", "academicYearId", "installmentNumber");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

