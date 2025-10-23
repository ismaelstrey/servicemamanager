import { PrismaClient } from '@prisma/client';
import { Comment, CreateCommentData, UpdateCommentData, CommentFilters } from '../types/comment.types';

const prisma = new PrismaClient();

export class CommentRepository {
  async create(data: CreateCommentData): Promise<Comment> {
    const commentData: any = {
      content: data.content,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      isInternal: data.isInternal || false,
      userId: data.userId,
      providerId: data.providerId
    };

    // Set the appropriate foreign key based on resource type
    if (data.resourceType === 'ticket') {
      commentData.ticketId = data.resourceId;
    } else if (data.resourceType === 'service_order') {
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
        }
      }
    });

    return result as Comment;
  }

  async findById(id: number): Promise<Comment | null> {
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
        }
      }
    });

    return result as Comment | null;
  }

  async findMany(filters: CommentFilters & { page?: number; limit?: number }) {
    const {
      resourceType,
      resourceId,
      userId,
      providerId,
      isInternal,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where: any = {};

    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (userId) where.userId = userId;
    if (providerId) where.providerId = providerId;
    if (typeof isInternal === 'boolean') where.isInternal = isInternal;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({ where })
    ]);

    return {
      comments: comments as Comment[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByResource(resourceType: string, resourceId: number, includeInternal: boolean = true) {
    const where: any = {
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
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return result as Comment[];
  }

  async update(id: number, data: UpdateCommentData): Promise<Comment | null> {
    const updateData: any = { ...data };
    
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
        }
      }
    });

    return result as Comment;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.comment.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async countByResource(resourceType: string, resourceId: number): Promise<number> {
    return await prisma.comment.count({
      where: {
        resourceType,
        resourceId
      }
    });
  }

  async findRecentByProvider(providerId: number, limit: number = 10) {
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

    return result as Comment[];
  }

  async validateResourceExists(resourceType: string, resourceId: number, providerId: number): Promise<boolean> {
    if (resourceType === 'ticket') {
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: resourceId,
          providerId
        }
      });
      return !!ticket;
    } else if (resourceType === 'service_order') {
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