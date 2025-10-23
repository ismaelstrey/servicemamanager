/*
  Warnings:

  - Changed the type of `type` on the `Equipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('switch', 'olt', 'router', 'server', 'virtualizer', 'other');

-- AlterTable (safe cast from string to enum)
ALTER TABLE "Equipment"
  ALTER COLUMN "type" TYPE "EquipmentType"
  USING CASE
    WHEN LOWER("type") IN ('switch') THEN 'switch'::"EquipmentType"
    WHEN LOWER("type") IN ('olt') THEN 'olt'::"EquipmentType"
    WHEN LOWER("type") IN ('router', 'roteador', 'roteadores') THEN 'router'::"EquipmentType"
    WHEN LOWER("type") IN ('server', 'servidor', 'servidores') THEN 'server'::"EquipmentType"
    WHEN LOWER("type") IN ('virtualizer', 'virtualizador') THEN 'virtualizer'::"EquipmentType"
    ELSE 'other'::"EquipmentType"
  END;
