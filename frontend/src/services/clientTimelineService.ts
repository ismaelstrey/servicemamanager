import { ApiService, type PaginatedResponse } from './api';

export type ClientResourceType = 'SERVICE_ORDER' | 'TICKET';

export interface UnifiedTimelineItem {
  id: string;
  source: 'history' | 'comment';
  action: 'status_changed' | 'priority_changed' | 'updated' | 'comment_added' | string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export class ClientTimelineService {
  static async getTimeline(
    resourceType: ClientResourceType,
    resourceId: string | number,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<UnifiedTimelineItem>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const basePath = resourceType === 'SERVICE_ORDER'
      ? `/client/service-orders/${resourceId}/timeline`
      : `/client/tickets/${resourceId}/timeline`;

    const url = `${basePath}?page=${page}&limit=${limit}`;
    const res = await ApiService.get<PaginatedResponse<UnifiedTimelineItem>>(url);
    return res.data;
  }
}

export default ClientTimelineService;