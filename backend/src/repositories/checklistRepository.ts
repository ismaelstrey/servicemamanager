import { prisma } from '../lib/prisma'

export class ChecklistRepository {
  async createTemplate(data: { title: string; description?: string; type?: string; providerId: number; createdById?: number; items: Array<{ title: string; description?: string; required?: boolean; order?: number }> }) {
    const row = await prisma.checklistTemplate.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? 'standard',
        providerId: data.providerId,
        createdById: data.createdById ?? null,
        items: { create: data.items.map(i => ({ title: i.title, description: i.description ?? null, required: !!i.required, order: i.order ?? 0 })) }
      },
      include: { items: true }
    })
    return row
  }

  async getTemplate(id: number) {
    return await prisma.checklistTemplate.findUnique({ where: { id }, include: { items: true, links: true } })
  }

  async updateTemplate(id: number, data: { title?: string; description?: string; type?: string; items?: Array<{ title: string; description?: string; required?: boolean; order?: number }> }) {
    const row = await prisma.checklistTemplate.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type
      },
      include: { items: true }
    })
    // Opcional: atualizar itens (simplicidade: substituir todos quando fornecidos)
    if (data.items && data.items.length > 0) {
      await prisma.checklistItemTemplate.deleteMany({ where: { checklistTemplateId: id } })
      await prisma.checklistItemTemplate.createMany({ data: data.items.map(i => ({ checklistTemplateId: id, title: i.title, description: i.description ?? null, required: !!i.required, order: i.order ?? 0 })) })
    }
    return await prisma.checklistTemplate.findUnique({ where: { id }, include: { items: true } })
  }

  async deleteTemplate(id: number) {
    await prisma.checklistTemplate.delete({ where: { id } })
    return true
  }

  async linkTemplate(data: { checklistTemplateId: number; resourceType: 'TICKET'|'SERVICE_ORDER'; resourceId: number }) {
    const itemTemplates = await prisma.checklistItemTemplate.findMany({ where: { checklistTemplateId: data.checklistTemplateId } })
    const link = await prisma.checklistLink.create({
      data: {
        checklistTemplateId: data.checklistTemplateId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ticketId: data.resourceType === 'TICKET' ? data.resourceId : null,
        serviceOrderId: data.resourceType === 'SERVICE_ORDER' ? data.resourceId : null,
        items: { create: itemTemplates.map((it: any) => ({ itemTemplateId: it.id })) }
      },
      include: { items: true }
    })
    return link
  }

  async getLink(linkId: number) {
    return await prisma.checklistLink.findUnique({ where: { id: linkId }, include: { items: true, checklistTemplate: { include: { items: true } } } })
  }

  async updateItem(linkId: number, itemId: number, data: { done?: boolean; note?: string }) {
    return await prisma.checklistInstanceItem.update({ where: { id: itemId }, data: { done: data.done ?? undefined, note: data.note ?? undefined, doneAt: data.done ? new Date() : null } })
  }

  async deleteLink(linkId: number) {
    await prisma.checklistInstanceItem.deleteMany({ where: { linkId } })
    await prisma.checklistLink.delete({ where: { id: linkId } })
    return true
  }
}
