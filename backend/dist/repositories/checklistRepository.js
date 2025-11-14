"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ChecklistRepository {
    async createTemplate(data) {
        const row = await prisma_1.prisma.checklistTemplate.create({
            data: {
                title: data.title,
                description: data.description ?? null,
                type: data.type ?? 'standard',
                providerId: data.providerId,
                createdById: data.createdById ?? null,
                items: { create: data.items.map(i => ({ title: i.title, description: i.description ?? null, required: !!i.required, order: i.order ?? 0 })) }
            },
            include: { items: true }
        });
        return row;
    }
    async getTemplate(id) {
        return await prisma_1.prisma.checklistTemplate.findUnique({ where: { id }, include: { items: true, links: true } });
    }
    async updateTemplate(id, data) {
        const row = await prisma_1.prisma.checklistTemplate.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                type: data.type
            },
            include: { items: true }
        });
        // Opcional: atualizar itens (simplicidade: substituir todos quando fornecidos)
        if (data.items && data.items.length > 0) {
            await prisma_1.prisma.checklistItemTemplate.deleteMany({ where: { checklistTemplateId: id } });
            await prisma_1.prisma.checklistItemTemplate.createMany({ data: data.items.map(i => ({ checklistTemplateId: id, title: i.title, description: i.description ?? null, required: !!i.required, order: i.order ?? 0 })) });
        }
        return await prisma_1.prisma.checklistTemplate.findUnique({ where: { id }, include: { items: true } });
    }
    async deleteTemplate(id) {
        await prisma_1.prisma.checklistTemplate.delete({ where: { id } });
        return true;
    }
    async linkTemplate(data) {
        const itemTemplates = await prisma_1.prisma.checklistItemTemplate.findMany({ where: { checklistTemplateId: data.checklistTemplateId } });
        const link = await prisma_1.prisma.checklistLink.create({
            data: {
                checklistTemplateId: data.checklistTemplateId,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                ticketId: data.resourceType === 'TICKET' ? data.resourceId : null,
                serviceOrderId: data.resourceType === 'SERVICE_ORDER' ? data.resourceId : null,
                items: { create: itemTemplates.map((it) => ({ itemTemplateId: it.id })) }
            },
            include: { items: true }
        });
        return link;
    }
    async getLink(linkId) {
        return await prisma_1.prisma.checklistLink.findUnique({ where: { id: linkId }, include: { items: true, checklistTemplate: { include: { items: true } } } });
    }
    async updateItem(linkId, itemId, data) {
        return await prisma_1.prisma.checklistInstanceItem.update({ where: { id: itemId }, data: { done: data.done ?? undefined, note: data.note ?? undefined, doneAt: data.done ? new Date() : null } });
    }
    async deleteLink(linkId) {
        await prisma_1.prisma.checklistInstanceItem.deleteMany({ where: { linkId } });
        await prisma_1.prisma.checklistLink.delete({ where: { id: linkId } });
        return true;
    }
}
exports.ChecklistRepository = ChecklistRepository;
