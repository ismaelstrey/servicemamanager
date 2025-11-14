-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_tags" (
    "ticketId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "ticket_tags_pkey" PRIMARY KEY ("ticketId","tagId")
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER,
    "uploadedBy" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "providerId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_item_templates" (
    "id" SERIAL NOT NULL,
    "checklistTemplateId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "checklist_item_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_links" (
    "id" SERIAL NOT NULL,
    "checklistTemplateId" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" INTEGER,
    "serviceOrderId" INTEGER,

    CONSTRAINT "checklist_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "itemTemplateId" INTEGER NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routines" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "providerId" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL DEFAULT 'ALL_CUSTOMERS',
    "targetIds" JSONB,
    "daysOfWeek" JSONB NOT NULL,
    "time" TEXT NOT NULL,
    "timezone" TEXT,
    "createFor" TEXT NOT NULL DEFAULT 'TICKET',
    "templateId" INTEGER,
    "defaultCategory" TEXT,
    "defaultPriority" TEXT,
    "defaultSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_logs" (
    "id" SERIAL NOT NULL,
    "routineId" INTEGER NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "ticket_tags_tagId_idx" ON "ticket_tags"("tagId");

-- CreateIndex
CREATE INDEX "ticket_attachments_ticketId_idx" ON "ticket_attachments"("ticketId");

-- CreateIndex
CREATE INDEX "checklist_links_resourceType_resourceId_idx" ON "checklist_links"("resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "ticket_tags" ADD CONSTRAINT "ticket_tags_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_tags" ADD CONSTRAINT "ticket_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_item_templates" ADD CONSTRAINT "checklist_item_templates_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_links" ADD CONSTRAINT "checklist_links_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_links" ADD CONSTRAINT "checklist_links_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_links" ADD CONSTRAINT "checklist_links_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "service_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "checklist_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_itemTemplateId_fkey" FOREIGN KEY ("itemTemplateId") REFERENCES "checklist_item_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_logs" ADD CONSTRAINT "routine_logs_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
