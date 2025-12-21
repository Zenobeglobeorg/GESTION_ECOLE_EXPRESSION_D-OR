/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "comment" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_classId_date_key" ON "attendances"("studentId", "classId", "date");
