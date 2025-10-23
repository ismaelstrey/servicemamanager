export interface Comment {
  id: number;
  content: string;
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  isInternal: boolean;
  isEdited: boolean;
  editedAt?: Date;
  userId: number;
  providerId: number;
  ticketId?: number;
  serviceOrderId?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: {
    id: number;
    name: string;
    email: string;
  };
  provider?: {
    id: number;
    name: string;
  };
}

export interface CreateCommentData {
  content: string;
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  isInternal?: boolean;
  userId: number;
  providerId: number;
}

export interface UpdateCommentData {
  content?: string;
  isInternal?: boolean;
}

export interface CommentFilters {
  resourceType?: 'ticket' | 'service_order';
  resourceId?: number;
  userId?: number;
  providerId?: number;
  isInternal?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface CommentResponse {
  id: number;
  content: string;
  resourceType: string;
  resourceId: number;
  isInternal: boolean;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  provider: {
    id: number;
    name: string;
  };
}

export interface CommentsListResponse {
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditFields {
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}