import { Response } from 'express'
import { AuthenticatedRequest } from '../types/api.types'
import { BranchService } from '../services/branchService'

export class BranchController {
  private service: BranchService
  constructor() { this.service = new BranchService() }
  async create(req: AuthenticatedRequest, res: Response) { const providerId = Number(req.params.providerId); const created = await this.service.create(providerId, req.body as any); res.status(201).json({ success: true, data: created }) }
  async list(req: AuthenticatedRequest, res: Response) { const providerId = Number(req.params.providerId); const items = await this.service.list(providerId); res.json({ success: true, data: items }) }
  async get(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.getById(id); if (!row) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: row }) }
  async update(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.update(id, req.body as any); res.json({ success: true, data: row }) }
  async delete(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); await this.service.delete(id); res.json({ success: true }) }
}