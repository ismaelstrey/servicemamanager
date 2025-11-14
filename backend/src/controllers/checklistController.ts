import { Response } from 'express'
import { AuthenticatedRequest } from '../types/api.types'
import { ChecklistService } from '../services/checklistService'

export class ChecklistController {
  private service: ChecklistService
  constructor() { this.service = new ChecklistService() }

  async createTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body as any
      const created = await this.service.createTemplate({
        title: data.title,
        description: data.description,
        type: data.type,
        providerId: data.providerId,
        createdById: (req.user as any)?.id,
        items: data.items
      })
      res.status(201).json({ success: true, data: created })
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erro ao criar template' })
    }
  }

  async getTemplate(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const tpl = await this.service.getTemplate(id)
    if (!tpl) return res.status(404).json({ success: false, message: 'Template não encontrado' })
    res.json({ success: true, data: tpl })
  }

  async updateTemplate(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const updated = await this.service.updateTemplate(id, req.body as any)
    res.json({ success: true, data: updated })
  }

  async deleteTemplate(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    await this.service.deleteTemplate(id)
    res.json({ success: true })
  }

  async link(req: AuthenticatedRequest, res: Response) {
    const link = await this.service.linkTemplate(req.body as any)
    res.status(201).json({ success: true, data: link })
  }

  async getLink(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.linkId)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const link = await this.service.getLink(id)
    if (!link) return res.status(404).json({ success: false, message: 'Vínculo não encontrado' })
    res.json({ success: true, data: link })
  }

  async updateItem(req: AuthenticatedRequest, res: Response) {
    const linkId = Number(req.params.linkId)
    const itemId = Number(req.params.itemId)
    if (!linkId || !itemId) return res.status(400).json({ success: false, message: 'Parâmetros inválidos' })
    const item = await this.service.updateItem(linkId, itemId, req.body as any)
    res.json({ success: true, data: item })
  }

  async deleteLink(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.linkId)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    await this.service.deleteLink(id)
    res.json({ success: true })
  }
}