import { Request, Response } from 'express';
import { CommentService } from '../services/commentService';
import { 
  createCommentSchema, 
  updateCommentSchema, 
  commentFiltersSchema, 
  commentIdSchema 
} from '../validators/commentValidator';
import { AuthenticatedRequest } from '../types/api.types';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error, value } = createCommentSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const commentData = {
        ...value,
        userId: req.user!.id,
        providerId: (req.user as any).providerId
      };

      const comment = await this.commentService.createComment(commentData, {
        id: req.user!.id,
        name: req.user!.name
      });

      res.status(201).json({
        success: true,
        message: 'Comentário criado com sucesso',
        data: comment
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async getComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error, value } = commentFiltersSchema.validate(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const result = await this.commentService.getComments(value, (req.user as any).providerId);

      res.json({
        success: true,
        message: 'Comentários recuperados com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getCommentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error, value } = commentIdSchema.validate(req.params);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const comment = await this.commentService.getCommentById(value.id, (req.user as any).providerId);

      if (!comment) {
        res.status(404).json({
          success: false,
          message: 'Comentário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Comentário recuperado com sucesso',
        data: comment
      });
    } catch (error) {
      console.error('Erro ao buscar comentário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getCommentsByResource(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { resourceType, resourceId } = req.params;
      const { includeInternal } = req.query;

      if (!['ticket', 'service_order'].includes(resourceType)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de recurso inválido. Use "ticket" ou "service_order"'
        });
        return;
      }

      const resourceIdNum = parseInt(resourceId);
      if (isNaN(resourceIdNum) || resourceIdNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID do recurso inválido'
        });
        return;
      }

      const includeInternalBool = includeInternal === 'true';

      const comments = await this.commentService.getCommentsByResource(
        resourceType as 'ticket' | 'service_order',
        resourceIdNum,
        (req.user as any).providerId,
        includeInternalBool
      );

      res.json({
        success: true,
        message: 'Comentários recuperados com sucesso',
        data: comments
      });
    } catch (error) {
      console.error('Erro ao buscar comentários do recurso:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async updateComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error: paramError, value: paramValue } = commentIdSchema.validate(req.params);
      
      if (paramError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: paramError.details.map(detail => detail.message)
        });
        return;
      }

      const { error: bodyError, value: bodyValue } = updateCommentSchema.validate(req.body);
      
      if (bodyError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: bodyError.details.map(detail => detail.message)
        });
        return;
      }

      const updatedComment = await this.commentService.updateComment(
        paramValue.id,
        bodyValue,
        (req.user as any).providerId,
        {
          id: req.user!.id,
          name: req.user!.name
        }
      );

      if (!updatedComment) {
        res.status(404).json({
          success: false,
          message: 'Comentário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Comentário atualizado com sucesso',
        data: updatedComment
      });
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error, value } = commentIdSchema.validate(req.params);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const deleted = await this.commentService.deleteComment(
        value.id,
        (req.user as any).providerId,
        {
          id: req.user!.id,
          name: req.user!.name
        }
      );

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Comentário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Comentário excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async getCommentCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { resourceType, resourceId } = req.params;

      if (!['ticket', 'service_order'].includes(resourceType)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de recurso inválido. Use "ticket" ou "service_order"'
        });
        return;
      }

      const resourceIdNum = parseInt(resourceId);
      if (isNaN(resourceIdNum) || resourceIdNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID do recurso inválido'
        });
        return;
      }

      const count = await this.commentService.getCommentCount(
        resourceType as 'ticket' | 'service_order',
        resourceIdNum
      );

      res.json({
        success: true,
        message: 'Contagem de comentários recuperada com sucesso',
        data: { count }
      });
    } catch (error) {
      console.error('Erro ao contar comentários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getRecentComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          message: 'Limite deve ser entre 1 e 50'
        });
        return;
      }

      const comments = await this.commentService.getRecentComments((req.user as any).providerId, limit);

      res.json({
        success: true,
        message: 'Comentários recentes recuperados com sucesso',
        data: comments
      });
    } catch (error) {
      console.error('Erro ao buscar comentários recentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}