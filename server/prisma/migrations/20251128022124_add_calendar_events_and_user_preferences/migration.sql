-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('REUNION', 'EXAMEN', 'ACTIVITE', 'FERIE', 'AUTRE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" TEXT DEFAULT 'fr',
ADD COLUMN     "theme" TEXT DEFAULT 'light';

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "type" "EventType" NOT NULL,
    "location" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);
