import { Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { AuthenticatedRequest } from '../types/api.types';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Obter dados completos do dashboard
   * GET /api/providers/:providerId/dashboard
   */
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      const dashboard = await this.dashboardService.getDashboard(providerId, req.user);
      
      res.json({
        success: true,
        data: dashboard,
        message: 'Dashboard obtido com sucesso'
      });
    } catch (error) {
      console.error('Erro no DashboardController.getDashboard:', error);
      const status = (error as any)?.status && Number.isInteger((error as any).status) ? (error as any).status : 500;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de equipamentos
   * GET /api/providers/:providerId/stats/equipments
   */
  async getEquipmentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      const stats = await this.dashboardService.getEquipmentStats(providerId, req.user);
      
      res.json({
        success: true,
        data: stats,
        message: 'Estatísticas de equipamentos obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro no DashboardController.getEquipmentStats:', error);
      const status = (error as any)?.status && Number.isInteger((error as any).status) ? (error as any).status : 500;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de tickets
   * GET /api/providers/:providerId/stats/tickets
   */
  async getTicketStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      const stats = await this.dashboardService.getTicketStats(providerId, req.user);
      
      res.json({
        success: true,
        data: stats,
        message: 'Estatísticas de tickets obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro no DashboardController.getTicketStats:', error);
      const status = (error as any)?.status && Number.isInteger((error as any).status) ? (error as any).status : 500;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas do cofre de senhas
   * GET /api/providers/:providerId/stats/passwords
   */
  async getPasswordStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      const stats = await this.dashboardService.getPasswordStats(providerId, req.user);
      
      res.json({
        success: true,
        data: stats,
        message: 'Estatísticas de senhas obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro no DashboardController.getPasswordStats:', error);
      const status = (error as any)?.status && Number.isInteger((error as any).status) ? (error as any).status : 500;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
}