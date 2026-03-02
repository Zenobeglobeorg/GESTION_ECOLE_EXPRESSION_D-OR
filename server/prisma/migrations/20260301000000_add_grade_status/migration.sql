-- CreateEnum
CREATE TYPE "GradeStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- AlterTable
ALTER TABLE "grades" ADD COLUMN "status" "GradeStatus" NOT NULL DEFAULT 'PENDING';
