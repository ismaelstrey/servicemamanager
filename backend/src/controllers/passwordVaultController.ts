import { Response } from 'express';
import { PasswordVaultService } from '../services/passwordVaultService';
import { AuthenticatedRequest } from '../types/api.types';
import { CreatePasswordVaultData, ListPasswordVaultsQuery, UpdatePasswordVaultData } from '../repositories/passwordVaultRepository';

export class PasswordVaultController {
  private service: PasswordVaultService;

  constructor() {
    this.service = new PasswordVaultService();
  }

  /**
   * Listar senhas de um provedor
   * GET /api/providers/:providerId/passwords
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const query: ListPasswordVaultsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || undefined
      };

      const result = await this.service.list(providerId, query, req.user!);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        message: 'Senhas listadas com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar senhas';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Criar entrada de senha
   * POST /api/providers/:providerId/passwords
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const data: CreatePasswordVaultData = req.body;
      const created = await this.service.create(providerId, data, req.user!);

      res.status(201).json({ success: true, data: created, message: 'Senha criada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar senha';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Obter entrada por ID
   * GET /api/passwords/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const item = await this.service.getById(id, req.user!);
      res.json({ success: true, data: item, message: 'Senha obtida com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter senha';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Atualizar entrada
   * PUT /api/passwords/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const data: UpdatePasswordVaultData = req.body;
      const updated = await this.service.update(id, data, req.user!);
      res.json({ success: true, data: updated, message: 'Senha atualizada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar senha';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Remover entrada
   * DELETE /api/passwords/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      await this.service.delete(id, req.user!);
      res.json({ success: true, message: 'Senha removida com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover senha';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }
}