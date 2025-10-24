"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CommentRepository {
    async create(data) {
        const commentData = {
            content: data.content,
            resourceType: data.resourceType,
            resourceId: data.resourceId,
            isInternal: data.isInternal || false,
            userId: data.userId,
            providerId: data.providerId,
            customerId: data.customerId
        };
        // Set the appropriate foreign key based on resource type
        if (data.resourceType === 'ticket') {
            commentData.ticketId = data.resourceId;
        }
        else if (data.resourceType === 'service_order') {
            commentData.serviceOrderId = data.resourceId;
        }
        const result = await prisma.comment.create({
            data: commentData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return result;
    }
    async findById(id) {
        const result = await prisma.comment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return result;
    }
    async findMany(filters) {
        const { resourceType, resourceId, userId, providerId, isInternal, startDate, endDate, page = 1, limit = 20 } = filters;
        const where = {};
        if (resourceType)
            where.resourceType = resourceType;
        if (resourceId)
            where.resourceId = resourceId;
        if (userId)
            where.userId = userId;
        if (providerId)
            where.providerId = providerId;
        if (filters.customerId)
            where.customerId = filters.customerId;
        if (typeof isInternal === 'boolean')
            where.isInternal = isInternal;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.comment.count({ where })
        ]);
        return {
            comments: comments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findByResource(resourceType, resourceId, includeInternal = true) {
        const where = {
            resourceType,
            resourceId
        };
        if (!includeInternal) {
            where.isInternal = false;
        }
        const result = await prisma.comment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        return result;
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.content) {
            updateData.isEdited = true;
            updateData.editedAt = new Date();
        }
        const result = await prisma.comment.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return result;
    }
    async delete(id) {
        try {
            await prisma.comment.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async countByResource(resourceType, resourceId) {
        return await prisma.comment.count({
            where: {
                resourceType,
                resourceId
            }
        });
    }
    async findRecentByProvider(providerId, limit = 10) {
        const result = await prisma.comment.findMany({
            where: { providerId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return result;
    }
    async validateResourceExists(resourceType, resourceId, providerId) {
        if (resourceType === 'ticket') {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: resourceId,
                    providerId
                }
            });
            return !!ticket;
        }
        else if (resourceType === 'service_order') {
            const serviceOrder = await prisma.serviceOrder.findFirst({
                where: {
                    id: resourceId,
                    providerId
                }
            });
            return !!serviceOrder;
        }
        return false;
    }
}
exports.CommentRepository = CommentRepository;
