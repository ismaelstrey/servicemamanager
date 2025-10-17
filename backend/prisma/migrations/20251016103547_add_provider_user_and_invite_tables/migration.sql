-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "provider_users" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_invites" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT[],
    "token" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "providerId" INTEGER NOT NULL,
    "invitedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zabbix_servers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "version" TEXT,
    "apiToken" TEXT,
    "username" TEXT,
    "password" TEXT,
    "webhookToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "providerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zabbix_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zabbix_configs" (
    "id" SERIAL NOT NULL,
    "enabledTriggers" BOOLEAN NOT NULL DEFAULT true,
    "enabledHosts" BOOLEAN NOT NULL DEFAULT true,
    "enabledItems" BOOLEAN NOT NULL DEFAULT false,
    "severityMapping" JSONB NOT NULL,
    "minSeverity" INTEGER NOT NULL DEFAULT 2,
    "allowedHostGroups" TEXT[],
    "blockedHostGroups" TEXT[],
    "allowedTriggerTags" TEXT[],
    "blockedTriggerTags" TEXT[],
    "autoCreateTickets" BOOLEAN NOT NULL DEFAULT true,
    "defaultPriority" TEXT NOT NULL DEFAULT 'medium',
    "ticketPrefix" TEXT NOT NULL DEFAULT '[ZABBIX]',
    "ticketTemplate" TEXT,
    "zabbixServerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zabbix_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zabbix_events" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "triggerName" TEXT,
    "triggerTags" TEXT[],
    "hostName" TEXT,
    "hostGroups" TEXT[],
    "itemName" TEXT,
    "eventValue" TEXT,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "acknowledgeStatus" TEXT NOT NULL DEFAULT 'unacknowledged',
    "webhookPayload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "ticketCreated" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "zabbixServerId" INTEGER NOT NULL,
    "ticketId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zabbix_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_users_userId_providerId_key" ON "provider_users"("userId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_invites_token_key" ON "provider_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "zabbix_servers_webhookToken_key" ON "zabbix_servers"("webhookToken");

-- CreateIndex
CREATE UNIQUE INDEX "zabbix_servers_providerId_name_key" ON "zabbix_servers"("providerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "zabbix_configs_zabbixServerId_key" ON "zabbix_configs"("zabbixServerId");

-- CreateIndex
CREATE INDEX "zabbix_events_zabbixServerId_processed_idx" ON "zabbix_events"("zabbixServerId", "processed");

-- CreateIndex
CREATE INDEX "zabbix_events_zabbixServerId_eventTime_idx" ON "zabbix_events"("zabbixServerId", "eventTime");

-- CreateIndex
CREATE UNIQUE INDEX "zabbix_events_zabbixServerId_eventId_key" ON "zabbix_events"("zabbixServerId", "eventId");

-- AddForeignKey
ALTER TABLE "provider_users" ADD CONSTRAINT "provider_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_users" ADD CONSTRAINT "provider_users_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zabbix_servers" ADD CONSTRAINT "zabbix_servers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zabbix_configs" ADD CONSTRAINT "zabbix_configs_zabbixServerId_fkey" FOREIGN KEY ("zabbixServerId") REFERENCES "zabbix_servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zabbix_events" ADD CONSTRAINT "zabbix_events_zabbixServerId_fkey" FOREIGN KEY ("zabbixServerId") REFERENCES "zabbix_servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zabbix_events" ADD CONSTRAINT "zabbix_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
