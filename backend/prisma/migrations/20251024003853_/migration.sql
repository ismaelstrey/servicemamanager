-- AlterTable
ALTER TABLE "PasswordVault" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastRotatedAt" TIMESTAMP(3),
ADD COLUMN     "rotationIntervalDays" INTEGER;
