import { ChecklistRepository } from '../repositories/checklistRepository'

export class ChecklistService {
  private repo: ChecklistRepository
  constructor() { this.repo = new ChecklistRepository() }

  createTemplate(data: { title: string; description?: string; type?: string; providerId: number; createdById?: number; items: Array<{ title: string; description?: string; required?: boolean; order?: number }> }) {
    return this.repo.createTemplate(data)
  }
  getTemplate(id: number) { return this.repo.getTemplate(id) }
  updateTemplate(id: number, data: { title?: string; description?: string; type?: string; items?: Array<{ title: string; description?: string; required?: boolean; order?: number }> }) { return this.repo.updateTemplate(id, data) }
  deleteTemplate(id: number) { return this.repo.deleteTemplate(id) }

  linkTemplate(data: { checklistTemplateId: number; resourceType: 'TICKET'|'SERVICE_ORDER'; resourceId: number }) { return this.repo.linkTemplate(data) }
  getLink(linkId: number) { return this.repo.getLink(linkId) }
  updateItem(linkId: number, itemId: number, data: { done?: boolean; note?: string }) { return this.repo.updateItem(linkId, itemId, data) }
  deleteLink(linkId: number) { return this.repo.deleteLink(linkId) }
}