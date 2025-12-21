-- CreateEnum
CREATE TYPE "BulletinType" AS ENUM ('MATERNELLE', 'PRIMAIRE');

-- CreateTable
CREATE TABLE "bulletins" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "type" "BulletinType" NOT NULL,
    "data" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "bulletins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bulletins_studentId_academicYear_type_key" ON "bulletins"("studentId", "academicYear", "type");

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
