"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const commentRepository_1 = require("../repositories/commentRepository");
const auditLogger_1 = require("../utils/auditLogger");
class CommentService {
    constructor() {
        this.commentRepository = new commentRepository_1.CommentRepository();
    }
    async createComment(data, userInfo) {
        try {
            // Validate that the resource exists and belongs to the provider
            const resourceExists = await this.commentRepository.validateResourceExists(data.resourceType, data.resourceId, data.providerId);
            if (!resourceExists) {
                throw new Error(`${data.resourceType === 'ticket' ? 'Ticket' : 'Ordem de serviço'} não encontrado(a) ou não pertence ao provedor`);
            }
            const comment = await this.commentRepository.create(data);
            // Log audit
            await (0, auditLogger_1.logAudit)({
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
        }
        catch (error) {
            // Log failed audit
            await (0, auditLogger_1.logAudit)({
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
    async getCommentById(id, providerId) {
        const comment = await this.commentRepository.findById(id);
        if (!comment || comment.providerId !== providerId) {
            return null;
        }
        return comment;
    }
    async getComments(filters, providerId) {
        // Ensure the filter is scoped to the provider
        const scopedFilters = { ...filters, providerId };
        return await this.commentRepository.findMany(scopedFilters);
    }
    async getCommentsByResource(resourceType, resourceId, providerId, includeInternal = true) {
        // Validate that the resource exists and belongs to the provider
        const resourceExists = await this.commentRepository.validateResourceExists(resourceType, resourceId, providerId);
        if (!resourceExists) {
            throw new Error(`${resourceType === 'ticket' ? 'Ticket' : 'Ordem de serviço'} não encontrado(a) ou não pertence ao provedor`);
        }
        return await this.commentRepository.findByResource(resourceType, resourceId, includeInternal);
    }
    async updateComment(id, data, providerId, userInfo) {
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
            await (0, auditLogger_1.logAudit)({
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
        }
        catch (error) {
            // Log failed audit
            await (0, auditLogger_1.logAudit)({
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
    async deleteComment(id, providerId, userInfo) {
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
            await (0, auditLogger_1.logAudit)({
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
        }
        catch (error) {
            // Log failed audit
            await (0, auditLogger_1.logAudit)({
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
    async getCommentCount(resourceType, resourceId) {
        return await this.commentRepository.countByResource(resourceType, resourceId);
    }
    async getRecentComments(providerId, limit = 10) {
        return await this.commentRepository.findRecentByProvider(providerId, limit);
    }
}
exports.CommentService = CommentService;
