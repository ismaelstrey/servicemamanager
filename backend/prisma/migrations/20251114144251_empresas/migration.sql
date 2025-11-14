-- CreateEnum
CREATE TYPE "ProviderServiceType" AS ENUM ('zabbix', 'proxmox', 'grafana', 'erp', 'other');

-- CreateEnum
CREATE TYPE "CredentialVisibility" AS ENUM ('PUBLIC', 'PROVIDER_ONLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "provider_branches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" JSONB,
    "notes" TEXT,
    "providerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProviderServiceType" NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "providerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_service_credentials" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "label" TEXT,
    "username" TEXT NOT NULL,
    "passwordEnc" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "visibility" "CredentialVisibility" NOT NULL DEFAULT 'PROVIDER_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_service_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "providerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_group_members" (
    "groupId" INTEGER NOT NULL,
    "providerUserId" INTEGER NOT NULL,

    CONSTRAINT "provider_group_members_pkey" PRIMARY KEY ("groupId","providerUserId")
);

-- CreateTable
CREATE TABLE "credential_user_access" (
    "credentialId" INTEGER NOT NULL,
    "providerUserId" INTEGER NOT NULL,

    CONSTRAINT "credential_user_access_pkey" PRIMARY KEY ("credentialId","providerUserId")
);

-- CreateTable
CREATE TABLE "credential_group_access" (
    "credentialId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "credential_group_access_pkey" PRIMARY KEY ("credentialId","groupId")
);

-- CreateIndex
CREATE INDEX "provider_branches_providerId_idx" ON "provider_branches"("providerId");

-- CreateIndex
CREATE INDEX "provider_services_providerId_idx" ON "provider_services"("providerId");

-- CreateIndex
CREATE INDEX "provider_service_credentials_serviceId_idx" ON "provider_service_credentials"("serviceId");

-- CreateIndex
CREATE INDEX "provider_groups_providerId_idx" ON "provider_groups"("providerId");

-- AddForeignKey
ALTER TABLE "provider_branches" ADD CONSTRAINT "provider_branches_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_service_credentials" ADD CONSTRAINT "provider_service_credentials_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "provider_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_groups" ADD CONSTRAINT "provider_groups_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_members" ADD CONSTRAINT "provider_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "provider_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_group_members" ADD CONSTRAINT "provider_group_members_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "provider_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_user_access" ADD CONSTRAINT "credential_user_access_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "provider_service_credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_user_access" ADD CONSTRAINT "credential_user_access_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "provider_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_group_access" ADD CONSTRAINT "credential_group_access_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "provider_service_credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_group_access" ADD CONSTRAINT "credential_group_access_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "provider_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
