"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const commentService_1 = require("../services/commentService");
const commentValidator_1 = require("../validators/commentValidator");
class CommentController {
    constructor() {
        this.commentService = new commentService_1.CommentService();
    }
    async createComment(req, res) {
        try {
            const { error, value } = commentValidator_1.createCommentSchema.validate(req.body);
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
                userId: req.user.id,
                providerId: req.user.providerId
            };
            const comment = await this.commentService.createComment(commentData, {
                id: req.user.id,
                name: req.user.name
            });
            res.status(201).json({
                success: true,
                message: 'Comentário criado com sucesso',
                data: comment
            });
        }
        catch (error) {
            console.error('Erro ao criar comentário:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
    async getComments(req, res) {
        try {
            const { error, value } = commentValidator_1.commentFiltersSchema.validate(req.query);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Parâmetros inválidos',
                    errors: error.details.map(detail => detail.message)
                });
                return;
            }
            const result = await this.commentService.getComments(value, req.user.providerId);
            res.json({
                success: true,
                message: 'Comentários recuperados com sucesso',
                data: result
            });
        }
        catch (error) {
            console.error('Erro ao buscar comentários:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    async getCommentById(req, res) {
        try {
            const { error, value } = commentValidator_1.commentIdSchema.validate(req.params);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido',
                    errors: error.details.map(detail => detail.message)
                });
                return;
            }
            const comment = await this.commentService.getCommentById(value.id, req.user.providerId);
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
        }
        catch (error) {
            console.error('Erro ao buscar comentário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    async getCommentsByResource(req, res) {
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
            const comments = await this.commentService.getCommentsByResource(resourceType, resourceIdNum, req.user.providerId, includeInternalBool);
            res.json({
                success: true,
                message: 'Comentários recuperados com sucesso',
                data: comments
            });
        }
        catch (error) {
            console.error('Erro ao buscar comentários do recurso:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
    async updateComment(req, res) {
        try {
            const { error: paramError, value: paramValue } = commentValidator_1.commentIdSchema.validate(req.params);
            if (paramError) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido',
                    errors: paramError.details.map(detail => detail.message)
                });
                return;
            }
            const { error: bodyError, value: bodyValue } = commentValidator_1.updateCommentSchema.validate(req.body);
            if (bodyError) {
                res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: bodyError.details.map(detail => detail.message)
                });
                return;
            }
            const updatedComment = await this.commentService.updateComment(paramValue.id, bodyValue, req.user.providerId, {
                id: req.user.id,
                name: req.user.name
            });
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
        }
        catch (error) {
            console.error('Erro ao atualizar comentário:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
    async deleteComment(req, res) {
        try {
            const { error, value } = commentValidator_1.commentIdSchema.validate(req.params);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'ID inválido',
                    errors: error.details.map(detail => detail.message)
                });
                return;
            }
            const deleted = await this.commentService.deleteComment(value.id, req.user.providerId, {
                id: req.user.id,
                name: req.user.name
            });
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
        }
        catch (error) {
            console.error('Erro ao excluir comentário:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    }
    async getCommentCount(req, res) {
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
            const count = await this.commentService.getCommentCount(resourceType, resourceIdNum);
            res.json({
                success: true,
                message: 'Contagem de comentários recuperada com sucesso',
                data: { count }
            });
        }
        catch (error) {
            console.error('Erro ao contar comentários:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    async getRecentComments(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            if (limit < 1 || limit > 50) {
                res.status(400).json({
                    success: false,
                    message: 'Limite deve ser entre 1 e 50'
                });
                return;
            }
            const comments = await this.commentService.getRecentComments(req.user.providerId, limit);
            res.json({
                success: true,
                message: 'Comentários recentes recuperados com sucesso',
                data: comments
            });
        }
        catch (error) {
            console.error('Erro ao buscar comentários recentes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}
exports.CommentController = CommentController;
