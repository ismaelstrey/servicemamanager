// Controller para gerenciamento de provedores

import { Request, Response } from 'express';
import { ProviderService } from '../services/providerService';
import { 
  CreateProviderDto, 
  UpdateProviderDto, 
  ListProvidersQuery,
  ProviderListItem,
  Provider,
  CreateProviderResponse,
  UpdateProviderResponse,
  ProviderStats,
  InviteToProviderDto,
  ProviderInvite,
  AuthUser
} from '../types';
import { AuthenticatedRequest } from '../types/api.types';
import { logProviderAudit } from '../utils/auditLogger';
import { calculatePagination } from '../utils/paginationHelper';

export class ProviderController {
  private providerService: ProviderService;

  constructor() {
    this.providerService = new ProviderService();
  }

  /**
   * Criar um novo provedor
   * POST /api/providers
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    try {
      const createData: CreateProviderDto = req.body;
      
      // Validar se o workspace já existe
      const existingProvider = await this.providerService.findByWorkspace(createData.workspace);
      if (existingProvider) {
        res.status(409).json({
          success: false,
          message: 'Workspace já está em uso',
          error: 'WORKSPACE_ALREADY_EXISTS'
        });
        return;
      }

      // Validar se o CNPJ já existe
      const existingCnpj = await this.providerService.findByCnpj(createData.cnpj);
      if (existingCnpj) {
        res.status(409).json({
          success: false,
          message: 'CNPJ já está cadastrado',
          error: 'CNPJ_ALREADY_EXISTS'
        });
        return;
      }

      const result: CreateProviderResponse = await this.providerService.create(createData, req.user?.id || 0);

      // Log de auditoria para criação bem-sucedida
      logProviderAudit(
        'create',
        req.user!.id.toString(),
        req.user!.email,
        result.provider.id.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { name: result.provider.name, workspace: result.provider.workspace }
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Provedor criado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar provedor';
      const status = (error as any)?.status || 500;

      // Log de auditoria para criação falhada
      logProviderAudit(
        'create',
        req.user!.id.toString(),
        req.user!.email,
        'unknown',
        false,
        ipAddress,
        userAgent,
        message
      );

      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Listar provedores com filtros e paginação
   * GET /api/providers
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Usar helper de paginação otimizada
      const paginationParams = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 10
      });

      const query: ListProvidersQuery = {
        page: paginationParams.page,
        limit: paginationParams.limit,
        search: req.query.search as string,
        status: req.query.status as any,
        plan: req.query.plan as any,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await this.providerService.list(query, req.user as AuthUser);

      res.json({
        success: true,
        data: result.providers,
        pagination: result.pagination,
        message: 'Provedores listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar provedores:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obter detalhes de um provedor específico
   * GET /api/providers/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      const provider = await this.providerService.findById(providerId, req.user as AuthUser);

      if (!provider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: provider,
        message: 'Provedor encontrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar provedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obter provedor por workspace
   * GET /api/providers/workspace/:workspace
   */
  async getByWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const workspace = req.params.workspace;
      
      const provider = await this.providerService.findByWorkspace(workspace);

      if (!provider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      // Verificar se o usuário tem acesso a este provedor
      const hasAccess = await this.providerService.userHasAccess(req.user?.id || 0, provider.id);
      if (!hasAccess && req.user?.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
        return;
      }

      res.json({
        success: true,
        data: provider,
        message: 'Provedor encontrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar provedor por workspace:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Atualizar um provedor
   * PUT /api/providers/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      const updateData: UpdateProviderDto = req.body;
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      // Verificar se o provedor existe e se o usuário tem acesso
      const existingProvider = await this.providerService.findById(providerId, req.user as AuthUser);
      if (!existingProvider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      const result: UpdateProviderResponse = await this.providerService.update(
        providerId, 
        updateData, 
        req.user?.id || 0
      );

      res.json({
        success: true,
        data: result,
        message: 'Provedor atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar provedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Excluir um provedor (soft delete)
   * DELETE /api/providers/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const providerId = parseInt(req.params.id);

    try {
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      // Verificar se o provedor existe e se o usuário tem acesso
      const existingProvider = await this.providerService.findById(providerId, req.user as AuthUser);
      if (!existingProvider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      // Verificar se o usuário tem permissão para excluir
      if (req.user?.role !== 'super_admin' && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Permissão insuficiente para excluir provedor'
        });
        return;
      }

      await this.providerService.delete(providerId, req.user?.id || 0);

      // Log de auditoria para exclusão bem-sucedida
      logProviderAudit(
        'delete',
        req.user!.id.toString(),
        req.user!.email,
        providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { name: existingProvider.name, workspace: existingProvider.workspace }
      );

      res.json({
        success: true,
        message: 'Provedor excluído com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir provedor';
      const status = (error as any)?.status || 500;

      // Log de auditoria para exclusão falhada
      logProviderAudit(
        'delete',
        req.user!.id.toString(),
        req.user!.email,
        providerId.toString(),
        false,
        ipAddress,
        userAgent,
        message
      );

      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Ativar/Desativar um provedor
   * PATCH /api/providers/:id/status
   */
  async toggleStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      if (!['active', 'inactive'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status inválido. Use "active" ou "inactive"'
        });
        return;
      }

      // Verificar permissões
      if (req.user?.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem alterar status de provedores'
        });
        return;
      }

      const result = await this.providerService.updateStatus(providerId, status, req.user?.id || 0);

      res.json({
        success: true,
        data: result,
        message: `Provedor ${status === 'active' ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao alterar status do provedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obter estatísticas de um provedor
   * GET /api/providers/:id/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      // Verificar se o provedor existe e se o usuário tem acesso
      const existingProvider = await this.providerService.findById(providerId, req.user as AuthUser);
      if (!existingProvider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      const stats: ProviderStats = await this.providerService.getStats(providerId);

      res.json({
        success: true,
        data: stats,
        message: 'Estatísticas obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do provedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Convidar usuário para o provedor
   * POST /api/providers/:id/invite
   */
  async inviteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      const inviteData: InviteToProviderDto = req.body;
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      // Verificar se o provedor existe e se o usuário tem acesso
      const existingProvider = await this.providerService.findById(providerId, req.user as AuthUser);
      if (!existingProvider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      // Verificar permissões para convidar usuários
      if (!['super_admin', 'admin', 'manager'].includes(req.user?.role || '')) {
        res.status(403).json({
          success: false,
          message: 'Permissão insuficiente para convidar usuários'
        });
        return;
      }

      const invite: ProviderInvite = await this.providerService.inviteUser(
         providerId, 
         inviteData, 
         req.user?.id || 0
       );

      res.status(201).json({
        success: true,
        data: invite,
        message: 'Convite enviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao convidar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Listar usuários do provedor
   * GET /api/providers/:id/users
   */
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      // Verificar se o provedor existe e se o usuário tem acesso
      const existingProvider = await this.providerService.findById(providerId, req.user as AuthUser);
      if (!existingProvider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      const users = await this.providerService.getUsers(providerId);

      res.json({
        success: true,
        data: users,
        message: 'Usuários listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar usuários do provedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Atualizar configurações do provedor
   * PUT /api/providers/:id/settings
   */
  async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      const settings = req.body;
      
      if (isNaN(providerId)) {
        res.status(400).json({
          success: false,
          message: 'ID do provedor inválido'
        });
        return;
      }

      // Verificar se o provedor existe e se o usuário tem acesso
      const existingProvider = await this.providerService.findById(providerId, req.user as AuthUser);
      if (!existingProvider) {
        res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
        return;
      }

      // Verificar permissões para alterar configurações
      if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Permissão insuficiente para alterar configurações'
        });
        return;
      }

      const result = await this.providerService.updateSettings(providerId, settings, req.user.id);

      res.json({
        success: true,
        data: result,
        message: 'Configurações atualizadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações do provedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verificar disponibilidade de workspace
   * GET /api/providers/check-workspace/:workspace
   */
  async checkWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspace = req.params.workspace;
      
      if (!workspace || workspace.length < 3) {
        res.status(400).json({
          success: false,
          message: 'Workspace deve ter pelo menos 3 caracteres'
        });
        return;
      }

      const isAvailable = await this.providerService.isWorkspaceAvailable(workspace);

      res.json({
        success: true,
        data: {
          workspace,
          available: isAvailable
        },
        message: isAvailable ? 'Workspace disponível' : 'Workspace já está em uso'
      });
    } catch (error) {
      console.error('Erro ao verificar workspace:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}