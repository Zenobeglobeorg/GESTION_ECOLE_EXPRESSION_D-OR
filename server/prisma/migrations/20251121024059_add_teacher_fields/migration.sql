-- CreateEnum
CREATE TYPE "TeacherLevel" AS ENUM ('MATERNELLE', 'PRE_PRIMAIRE', 'PRIMAIRE');

-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('PERMANENT', 'CONSULTANT', 'VACATAIRE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "employmentEndDate" TIMESTAMP(3),
ADD COLUMN     "employmentStartDate" TIMESTAMP(3),
ADD COLUMN     "teacherLevel" "TeacherLevel",
ADD COLUMN     "teacherStatus" "TeacherStatus";
