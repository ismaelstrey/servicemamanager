import { Response } from 'express';
import { EquipmentService } from '../services/equipmentService';
import { AuthenticatedRequest } from '../types/api.types';
import { CreateEquipmentData, ListEquipmentsQuery, UpdateEquipmentData } from '../repositories/equipmentRepository';
import { calculatePagination } from '../utils/paginationHelper';

export class EquipmentController {
  private equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
  }

  /**
   * Listar equipamentos de um provedor
   * GET /api/providers/:providerId/equipments
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const query: ListEquipmentsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: (req.query.search as string) || undefined,
        type: (req.query.type as string) || undefined,
        status: (req.query.status as string) || undefined
      };

      const result = await this.equipmentService.list(providerId, query, req.user!);

      res.json({
        success: true,
        data: result.equipments,
        pagination: result.pagination,
        message: 'Equipamentos listados com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar equipamentos';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Criar equipamento para um provedor
   * POST /api/providers/:providerId/equipments
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const data: CreateEquipmentData = req.body;
      const equipment = await this.equipmentService.create(providerId, data, req.user!);

      res.status(201).json({
        success: true,
        data: equipment,
        message: 'Equipamento criado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar equipamento';
      const isConflict = typeof message === 'string' && message.includes('Serial já está em uso');
      const status = (error as any)?.status || (isConflict ? 409 : 500);
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Obter equipamento por ID
   * GET /api/equipments/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const equipment = await this.equipmentService.getById(id, req.user!);
      res.json({ success: true, data: equipment, message: 'Equipamento obtido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter equipamento';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Atualizar equipamento por ID
   * PUT /api/equipments/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const data: UpdateEquipmentData = req.body;
      const equipment = await this.equipmentService.update(id, data, req.user!);
      res.json({ success: true, data: equipment, message: 'Equipamento atualizado com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar equipamento';
      const isConflict = typeof message === 'string' && message.includes('Serial já está em uso');
      const status = (error as any)?.status || (isConflict ? 409 : 500);
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Remover equipamento por ID
   * DELETE /api/equipments/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      await this.equipmentService.delete(id, req.user!);
      res.json({ success: true, message: 'Equipamento removido com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover equipamento';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Estatísticas de equipamentos por Provider
   * GET /api/providers/:providerId/equipments/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }
      const stats = await this.equipmentService.getStats(providerId, req.user!);
      res.json({ success: true, data: stats, message: 'Estatísticas obtidas com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Histórico de mudanças do equipamento
   * GET /api/equipments/:id/history
   */
  async history(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }
      const { page, limit } = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 20
      });
      const result = await this.equipmentService.getHistory(id, req.user!, page, limit);
      res.json({
        success: true,
        data: result.history,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        },
        message: 'Histórico obtido com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter histórico do equipamento';
      const status = (error as any)?.status || 500;
      res.status(status).json({ success: false, message });
    }
  }
}