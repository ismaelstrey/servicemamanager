import { Response } from 'express';
import { PasswordVaultService } from '../services/passwordVaultService';
import { AuthenticatedRequest } from '../types/api.types';
import { CreatePasswordVaultData, ListPasswordVaultsQuery, UpdatePasswordVaultData } from '../repositories/passwordVaultRepository';
import { logPasswordVaultAudit } from '../utils/auditLogger';
import { calculatePagination } from '../utils/paginationHelper';

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
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const providerId = parseInt(req.params.providerId);

    try {
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      // Usar helper de paginação otimizada
      const paginationParams = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 50,
        defaultLimit: 10
      });

      const query: ListPasswordVaultsQuery = {
        page: paginationParams.page,
        limit: paginationParams.limit,
        search: (req.query.search as string) || undefined
      };

      const result = await this.service.list(providerId, query, req.user!);

      // Log de auditoria para listagem bem-sucedida
      logPasswordVaultAudit(
        'read',
        req.user!.id.toString(),
        req.user!.email,
        'list',
        providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { query }
      );

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        message: 'Senhas listadas com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar senhas';
      const status = (error as any)?.status || 500;

      // Log de auditoria para listagem falhada
      logPasswordVaultAudit(
        'read',
        req.user!.id.toString(),
        req.user!.email,
        'list',
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
   * Criar entrada de senha
   * POST /api/providers/:providerId/passwords
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const providerId = parseInt(req.params.providerId);

    try {
      if (isNaN(providerId)) {
        res.status(400).json({ success: false, message: 'providerId inválido' });
        return;
      }

      const data: CreatePasswordVaultData = req.body;
      const created = await this.service.create(providerId, data, req.user!);

      // Log de auditoria para criação bem-sucedida
      logPasswordVaultAudit(
        'create',
        req.user!.id.toString(),
        req.user!.email,
        created.id.toString(),
        providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { title: data.label, category: undefined }
      );

      res.status(201).json({ success: true, data: created, message: 'Senha criada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar senha';
      const status = (error as any)?.status || 500;

      // Log de auditoria para criação falhada
      logPasswordVaultAudit(
        'create',
        req.user!.id.toString(),
        req.user!.email,
        'unknown',
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
   * Obter entrada por ID
   * GET /api/passwords/:id
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const id = parseInt(req.params.id);

    try {
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }

      const item = await this.service.getById(id, req.user!);

      // Log de auditoria para leitura bem-sucedida
      logPasswordVaultAudit(
        'read',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
        item.providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { title: item.label }
      );

      // Log adicional de auditoria para descriptografia (quando usuário pode ver segredos)
      if ((item as any).password) {
        logPasswordVaultAudit(
          'decrypt',
          req.user!.id.toString(),
          req.user!.email,
          id.toString(),
          item.providerId.toString(),
          true,
          ipAddress,
          userAgent,
          undefined,
          { title: item.label }
        );
      }

      res.json({ success: true, data: item, message: 'Senha obtida com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter senha';
      const status = (error as any)?.status || 500;

      // Log de auditoria para leitura falhada
      logPasswordVaultAudit(
        'read',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
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
   * Atualizar entrada
   * PUT /api/passwords/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const id = parseInt(req.params.id);

    try {
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }

      const data: UpdatePasswordVaultData = req.body;
      const updated = await this.service.update(id, data, req.user!);

      // Log de auditoria para atualização bem-sucedida
      logPasswordVaultAudit(
        'update',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
        updated.providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { title: updated.label, category: undefined }
      );

      res.json({ success: true, data: updated, message: 'Senha atualizada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar senha';
      const status = (error as any)?.status || 500;

      // Log de auditoria para atualização falhada
      logPasswordVaultAudit(
        'update',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
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
   * Rotacionar senha
   * POST /api/passwords/:id/rotate
   */
  async rotate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const id = parseInt(req.params.id);

    try {
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }

      const options = req.body || {};
      const updated = await this.service.rotate(id, req.user!, options);

      // Log de auditoria para rotação bem-sucedida (usando ação update)
      logPasswordVaultAudit(
        'update',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
        updated.providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { action: 'rotate' }
      );

      res.json({ success: true, data: updated, message: 'Senha rotacionada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao rotacionar senha';
      const status = (error as any)?.status || 500;

      // Log de auditoria para rotação falhada
      logPasswordVaultAudit(
        'update',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
        'unknown',
        false,
        ipAddress,
        userAgent,
        message,
        { action: 'rotate' }
      );

      res.status(status).json({ success: false, message });
    }
  }

  /**
   * Remover entrada
   * DELETE /api/passwords/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const id = parseInt(req.params.id);

    try {
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'id inválido' });
        return;
      }

      // Obter informações antes de deletar para o log
      const item = await this.service.getById(id, req.user!);
      await this.service.delete(id, req.user!);

      // Log de auditoria para exclusão bem-sucedida
      logPasswordVaultAudit(
        'delete',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
        item.providerId.toString(),
        true,
        ipAddress,
        userAgent,
        undefined,
        { title: item.label }
      );

      // Log adicional de auditoria para descriptografia (quando usuário pode ver segredos ao recuperar antes da exclusão)
      if ((item as any).password) {
        logPasswordVaultAudit(
          'decrypt',
          req.user!.id.toString(),
          req.user!.email,
          id.toString(),
          item.providerId.toString(),
          true,
          ipAddress,
          userAgent,
          undefined,
          { title: item.label }
        );
      }

      res.json({ success: true, message: 'Senha removida com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover senha';
      const status = (error as any)?.status || 500;

      // Log de auditoria para exclusão falhada
      logPasswordVaultAudit(
        'delete',
        req.user!.id.toString(),
        req.user!.email,
        id.toString(),
        'unknown',
        false,
        ipAddress,
        userAgent,
        message
      );

      res.status(status).json({ success: false, message });
    }
  }
}