-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('SUBJECT', 'EVENT');

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "type" "ScheduleType" NOT NULL DEFAULT 'SUBJECT';
