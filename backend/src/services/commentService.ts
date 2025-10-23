import { CommentRepository } from '../repositories/commentRepository';
import { CreateCommentData, UpdateCommentData, CommentFilters, Comment } from '../types/comment.types';
import { logAudit } from '../utils/auditLogger';

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async createComment(data: CreateCommentData, userInfo: { id: number; name: string }): Promise<Comment> {
    try {
      // Validate that the resource exists and belongs to the provider
      const resourceExists = await this.commentRepository.validateResourceExists(
        data.resourceType,
        data.resourceId,
        data.providerId
      );

      if (!resourceExists) {
        throw new Error(`${data.resourceType === 'ticket' ? 'Ticket' : 'Ordem de serviço'} não encontrado(a) ou não pertence ao provedor`);
      }

      const comment = await this.commentRepository.create(data);

      // Log audit
      await logAudit({
        action: 'CREATE_COMMENT',
        resource: 'comment',
        resourceId: comment.id.toString(),
        userId: userInfo.id.toString(),
        providerId: data.providerId.toString(),
        metadata: {
          targetResourceType: data.resourceType,
          targetResourceId: data.resourceId,
          isInternal: data.isInternal
        },
        success: true
      });

      return comment;
    } catch (error) {
      // Log failed audit
      await logAudit({
        action: 'CREATE_COMMENT',
        resource: 'comment',
        userId: userInfo.id.toString(),
        providerId: data.providerId.toString(),
        metadata: {
          targetResourceType: data.resourceType,
          targetResourceId: data.resourceId,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        success: false
      });

      throw error;
    }
  }

  async getCommentById(id: number, providerId: number): Promise<Comment | null> {
    const comment = await this.commentRepository.findById(id);
    
    if (!comment || comment.providerId !== providerId) {
      return null;
    }

    return comment;
  }

  async getComments(filters: CommentFilters & { page?: number; limit?: number }, providerId: number) {
    // Ensure the filter is scoped to the provider
    const scopedFilters = { ...filters, providerId };
    return await this.commentRepository.findMany(scopedFilters);
  }

  async getCommentsByResource(
    resourceType: 'ticket' | 'service_order',
    resourceId: number,
    providerId: number,
    includeInternal: boolean = true
  ): Promise<Comment[]> {
    // Validate that the resource exists and belongs to the provider
    const resourceExists = await this.commentRepository.validateResourceExists(
      resourceType,
      resourceId,
      providerId
    );

    if (!resourceExists) {
      throw new Error(`${resourceType === 'ticket' ? 'Ticket' : 'Ordem de serviço'} não encontrado(a) ou não pertence ao provedor`);
    }

    return await this.commentRepository.findByResource(resourceType, resourceId, includeInternal);
  }

  async updateComment(
    id: number,
    data: UpdateCommentData,
    providerId: number,
    userInfo: { id: number; name: string }
  ): Promise<Comment | null> {
    try {
      const existingComment = await this.commentRepository.findById(id);
      
      if (!existingComment || existingComment.providerId !== providerId) {
        throw new Error('Comentário não encontrado ou não pertence ao provedor');
      }

      // Check if user can edit this comment (only the author can edit)
      if (existingComment.userId !== userInfo.id) {
        throw new Error('Apenas o autor do comentário pode editá-lo');
      }

      const updatedComment = await this.commentRepository.update(id, data);

      // Log audit
      await logAudit({
        action: 'UPDATE_COMMENT',
        resource: 'comment',
        resourceId: id.toString(),
        userId: userInfo.id.toString(),
        providerId: providerId.toString(),
        metadata: {
          changes: data,
          targetResourceType: existingComment.resourceType,
          targetResourceId: existingComment.resourceId
        },
        success: true
      });

      return updatedComment;
    } catch (error) {
      // Log failed audit
      await logAudit({
        action: 'UPDATE_COMMENT',
        resource: 'comment',
        resourceId: id.toString(),
        userId: userInfo.id.toString(),
        providerId: providerId.toString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        success: false
      });

      throw error;
    }
  }

  async deleteComment(
    id: number,
    providerId: number,
    userInfo: { id: number; name: string }
  ): Promise<boolean> {
    try {
      const existingComment = await this.commentRepository.findById(id);
      
      if (!existingComment || existingComment.providerId !== providerId) {
        throw new Error('Comentário não encontrado ou não pertence ao provedor');
      }

      // Check if user can delete this comment (only the author can delete)
      if (existingComment.userId !== userInfo.id) {
        throw new Error('Apenas o autor do comentário pode excluí-lo');
      }

      const deleted = await this.commentRepository.delete(id);

      // Log audit
      await logAudit({
        action: 'DELETE_COMMENT',
        resource: 'comment',
        resourceId: id.toString(),
        userId: userInfo.id.toString(),
        providerId: providerId.toString(),
        metadata: {
          targetResourceType: existingComment.resourceType,
          targetResourceId: existingComment.resourceId,
          deletedContent: existingComment.content.substring(0, 100) + '...'
        },
        success: deleted
      });

      return deleted;
    } catch (error) {
      // Log failed audit
      await logAudit({
        action: 'DELETE_COMMENT',
        resource: 'comment',
        resourceId: id.toString(),
        userId: userInfo.id.toString(),
        providerId: providerId.toString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        success: false
      });

      throw error;
    }
  }

  async getCommentCount(resourceType: 'ticket' | 'service_order', resourceId: number): Promise<number> {
    return await this.commentRepository.countByResource(resourceType, resourceId);
  }

  async getRecentComments(providerId: number, limit: number = 10): Promise<Comment[]> {
    return await this.commentRepository.findRecentByProvider(providerId, limit);
  }
}