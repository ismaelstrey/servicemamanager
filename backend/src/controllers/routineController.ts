import { Response } from 'express'
import { AuthenticatedRequest } from '../types/api.types'
import { RoutineService } from '../services/routineService'

export class RoutineController {
  private service: RoutineService
  constructor() { this.service = new RoutineService() }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const created = await this.service.create(req.body as any)
      res.status(201).json({ success: true, data: created })
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erro ao criar rotina' })
    }
  }

  async list(req: AuthenticatedRequest, res: Response) {
    const { providerId, enabled } = req.query as any
    const items = await this.service.list({ providerId, enabled })
    res.json({ success: true, data: items })
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const row = await this.service.getById(id)
    if (!row) return res.status(404).json({ success: false, message: 'Rotina não encontrada' })
    res.json({ success: true, data: row })
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const updated = await this.service.update(id, req.body as any)
    res.json({ success: true, data: updated })
  }

  async testRun(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const result = await this.service.testRun(id)
    res.json({ success: true, data: result })
  }

  async logs(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id)
    if (!id || id <= 0) return res.status(400).json({ success: false, message: 'ID inválido' })
    const rows = await this.service.logs(id)
    res.json({ success: true, data: rows })
  }
}