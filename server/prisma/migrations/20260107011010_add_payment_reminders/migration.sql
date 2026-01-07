-- CreateTable
CREATE TABLE "payment_reminders" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "sentBy" INTEGER,
    "sentVia" TEXT NOT NULL DEFAULT 'notification',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_reminders_paymentId_idx" ON "payment_reminders"("paymentId");

-- CreateIndex
CREATE INDEX "payment_reminders_userId_idx" ON "payment_reminders"("userId");

-- CreateIndex
CREATE INDEX "payment_reminders_createdAt_idx" ON "payment_reminders"("createdAt");

-- AddForeignKey
ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
