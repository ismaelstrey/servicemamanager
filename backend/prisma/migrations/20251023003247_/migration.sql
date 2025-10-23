-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('active', 'inactive', 'maintenance');

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "status" "EquipmentStatus" NOT NULL DEFAULT 'active';
