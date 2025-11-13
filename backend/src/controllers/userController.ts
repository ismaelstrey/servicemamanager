import { Response } from 'express'
import { AuthenticatedRequest } from '../types/api.types'
import UserService from '../services/userService'

export class UserController {
  private service = new UserService()

  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await this.service.list(req.query as any)
      const { items, total, page, limit } = result as any
      const totalPages = Math.max(1, Math.ceil(Number(total) / Number(limit || 1)))
      return res.json({ success: true, data: items, pagination: { total, page, limit, totalPages } })
    } catch (e: any) {
      return res.status(400).json({ success: false, message: 'Falha ao listar usuários' })
    }
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await this.service.getById(Number((req.params as any).id))
      if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' })
      return res.json({ success: true, data: user })
    } catch {
      return res.status(400).json({ success: false, message: 'Falha ao obter usuário' })
    }
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Permissão negada' })
      const created = await this.service.create(req.body)
      return res.status(201).json({ success: true, data: created })
    } catch (e: any) {
      if (e?.message === 'EMAIL_IN_USE') return res.status(409).json({ success: false, message: 'Email já utilizado' })
      return res.status(400).json({ success: false, message: 'Falha ao criar usuário' })
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Permissão negada' })
      const id = Number((req.params as any).id)
      const updated = await this.service.update(id, req.body)
      return res.json({ success: true, data: updated })
    } catch {
      return res.status(400).json({ success: false, message: 'Falha ao atualizar usuário' })
    }
  }

  async disable(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Permissão negada' })
      const id = Number((req.params as any).id)
      const updated = await this.service.disable(id)
      return res.json({ success: true, data: updated })
    } catch {
      return res.status(400).json({ success: false, message: 'Falha ao desativar usuário' })
    }
  }

  async enable(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Permissão negada' })
      const id = Number((req.params as any).id)
      const updated = await this.service.enable(id)
      return res.json({ success: true, data: updated })
    } catch {
      return res.status(400).json({ success: false, message: 'Falha ao reativar usuário' })
    }
  }
}

export default UserController
