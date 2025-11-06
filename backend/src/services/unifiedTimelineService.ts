import { ChangeHistoryService } from './changeHistoryService';
import { CommentRepository } from '../repositories/commentRepository';

type EntityType = 'ticket' | 'service_order';

interface UnifiedTimelineEntry {
  id: string; // unique composite id: `${source}-${id}`
  source: 'history' | 'comment';
  action: string;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class UnifiedTimelineService {
  private historyService: ChangeHistoryService;
  private commentRepo: CommentRepository;

  constructor() {
    this.historyService = new ChangeHistoryService();
    this.commentRepo = new CommentRepository();
  }

  /**
   * Lista timeline unificada (histórico + comentários públicos) para cliente.
   * Paginação é aplicada após mesclar as fontes, usando page/limit.
   */
  async listForClient(providerId: number, entityType: EntityType, entityId: number, page = 1, limit = 20) {
    // Para garantir paginação correta após merge, buscamos até `limit * page` de cada fonte
    const fetchLimit = Math.max(limit * page, limit);

    const [historyResp, commentsResp] = await Promise.all([
      this.historyService.listByEntity(providerId, entityType, entityId, 1, fetchLimit),
      this.commentRepo.findMany({
        resourceType: entityType,
        resourceId: entityId,
        providerId,
        isInternal: false,
        page: 1,
        limit: fetchLimit
      } as any)
    ]);

    const historyEntries: UnifiedTimelineEntry[] = (historyResp.history || []).map((h) => ({
      id: `history-${h.id}`,
      source: 'history',
      action: h.field === 'status' ? 'status_changed' : (h.field === 'priority' ? 'priority_changed' : 'updated'),
      description: buildHistoryDescription(h.field, h.oldValue, h.newValue, h.metadata),
      createdAt: h.createdAt,
      metadata: {
        field: h.field,
        oldValue: h.oldValue,
        newValue: h.newValue,
        changedById: h.changedById ?? null,
        ...(h.metadata || {})
      }
    }));

    const commentEntries: UnifiedTimelineEntry[] = (commentsResp.comments || []).map((c: any) => ({
      id: `comment-${c.id}`,
      source: 'comment',
      action: 'comment_added',
      description: c.content,
      createdAt: c.createdAt,
      metadata: {
        authorType: c.customerId ? 'customer' : (c.userId ? 'user' : 'unknown'),
        authorId: c.customerId || c.userId || null,
        authorName: c.customer?.name || c.user?.name || undefined,
        isEdited: !!c.isEdited,
        editedAt: c.editedAt || null
      }
    }));

    // Mescla e ordena por createdAt desc
    const merged = [...historyEntries, ...commentEntries].sort((a, b) => (b.createdAt as any) - (a.createdAt as any));

    const total = (historyResp.total || 0) + (commentsResp.total || 0);
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = merged.slice(start, end);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

function buildHistoryDescription(field: string, oldValue?: any, newValue?: any, metadata?: Record<string, any> | null) {
  if (field === 'status') {
    return `Status alterado de "${oldValue ?? 'indefinido'}" para "${newValue}"`;
  }
  if (field === 'priority') {
    return `Prioridade alterada de "${oldValue ?? 'indefinida'}" para "${newValue}"`;
  }
  const title = metadata?.title ? ` (${metadata.title})` : '';
  return `Campo "${field}" atualizado de "${oldValue ?? ''}" para "${newValue ?? ''}"${title}`.trim();
}