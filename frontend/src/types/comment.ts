// Tipos de comentários do sistema

export interface Comment {
  id: number;
  content: string;
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  isInternal: boolean;
  isEdited: boolean;
  editedAt?: Date;
  userId?: number;
  customerId?: number;
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
    avatar?: string;
  };
  provider?: {
    id: number;
    name: string;
  };
  customer?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  attachments?: CommentAttachment[];
  reactions?: CommentReaction[];
}

export interface CommentAttachment {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: number;
  uploadedAt: Date;
  isPublic: boolean;
}

export interface CommentReaction {
  id: number;
  type: 'like' | 'dislike' | 'helpful' | 'resolved';
  userId: number;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

export interface CreateCommentData {
  content: string;
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  isInternal?: boolean;
  userId?: number;
  customerId?: number;
  providerId: number;
  attachments?: File[];
}

export interface UpdateCommentData {
  content?: string;
  isInternal?: boolean;
}

export interface CommentFilters {
  resourceType?: 'ticket' | 'service_order';
  resourceId?: number;
  userId?: number;
  customerId?: number;
  providerId?: number;
  isInternal?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  search?: string;
}

// Tipos para thread de comentários
export interface CommentThread {
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
  lastUpdated: Date;
}

// Tipos para estatísticas de comentários
export interface CommentStatistics {
  total: number;
  byResourceType: Record<'ticket' | 'service_order', number>;
  byUser: {
    userId: number;
    userName: string;
    count: number;
  }[];
  internal: number;
  external: number;
  withAttachments: number;
  averagePerResource: number;
  recentActivity: {
    period: string;
    count: number[];
    labels: string[];
  };
}

// Tipos para notificações de comentários
export interface CommentNotification {
  id: string;
  commentId: number;
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  resourceTitle: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
}

// Tipos para menções em comentários
export interface CommentMention {
  id: number;
  commentId: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  position: {
    start: number;
    end: number;
  };
  createdAt: Date;
}

// Tipos para templates de comentários
export interface CommentTemplate {
  id: number;
  name: string;
  content: string;
  category: 'resolution' | 'follow_up' | 'escalation' | 'closure' | 'custom';
  isPublic: boolean;
  providerId: number;
  createdBy: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentTemplateData {
  name: string;
  content: string;
  category: 'resolution' | 'follow_up' | 'escalation' | 'closure' | 'custom';
  isPublic?: boolean;
}

export interface UpdateCommentTemplateData {
  name?: string;
  content?: string;
  category?: 'resolution' | 'follow_up' | 'escalation' | 'closure' | 'custom';
  isPublic?: boolean;
}

// Tipos para editor de comentários
export interface CommentEditorState {
  content: string;
  isInternal: boolean;
  attachments: File[];
  mentions: CommentMention[];
  selectedTemplate?: CommentTemplate;
  isSubmitting: boolean;
  error?: string;
}

export interface CommentEditorProps {
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  placeholder?: string;
  allowInternal?: boolean;
  allowAttachments?: boolean;
  allowMentions?: boolean;
  allowTemplates?: boolean;
  onSubmit: (data: CreateCommentData) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  initialIsInternal?: boolean;
}

// Tipos para lista de comentários
export interface CommentListProps {
  resourceType: 'ticket' | 'service_order';
  resourceId: number;
  showInternal?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowReactions?: boolean;
  maxHeight?: string;
  onCommentUpdate?: (comment: Comment) => void;
  onCommentDelete?: (commentId: number) => void;
}