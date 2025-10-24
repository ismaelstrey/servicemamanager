// Exportações centralizadas de todos os tipos

// Tipos comuns
export * from './common';

// Tipos de autenticação
export * from './auth';

// Tipos de usuário
export * from './user';

// Tipos de ticket
export * from './ticket';

// Tipos de ordem de serviço
export * from './serviceOrder';

// Tipos de comentário
export * from './comment';

// Re-exportações para compatibilidade
export type { ApiResponse, PaginatedResponse, PaginationMeta } from './common';
export type { AuthUser, LoginCredentials, RegisterData } from './auth';
export type { User, UserProfile, UserSettings } from './user';
export type { Ticket, TicketStatus, CreateTicketData } from './ticket';
export type { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority, CreateServiceOrderData } from './serviceOrder';
export type { Comment, CreateCommentData, CommentThread } from './comment';