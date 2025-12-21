-- CreateEnum
CREATE TYPE "ReplacementReason" AS ENUM ('MALADIE', 'FORMATION', 'CONGES', 'PERSONNEL', 'AUTRE');

-- CreateEnum
CREATE TYPE "ReplacementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "replacements" (
    "id" SERIAL NOT NULL,
    "absentTeacherId" INTEGER NOT NULL,
    "replacementTeacherId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" "ReplacementReason" NOT NULL,
    "status" "ReplacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "replacements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "replacements" ADD CONSTRAINT "replacements_absentTeacherId_fkey" FOREIGN KEY ("absentTeacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replacements" ADD CONSTRAINT "replacements_replacementTeacherId_fkey" FOREIGN KEY ("replacementTeacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
