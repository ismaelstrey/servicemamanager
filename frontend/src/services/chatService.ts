import { ApiService, type ApiResponse, type PaginatedResponse } from './api';

export interface Conversation {
  id: number;
  channelId: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id?: number;
  url: string;
  mimeType: string | null;
  size: number | null;
}

export interface Message {
  id: number;
  conversationId: number;
  participantId: number;
  direction: 'inbound' | 'outbound';
  content: string;
  mimeType: string | null;
  status: string;
  createdAt: string;
  attachments?: Attachment[];
}

export class ChatService {
  static async listConversations(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Conversation>>> {
    return ApiService.get<PaginatedResponse<Conversation>>(`/chat/conversations?page=${page}&limit=${limit}`);
  }

  static async createConversation(title?: string): Promise<ApiResponse<Conversation>> {
    return ApiService.post<Conversation>('/chat/conversations', { title });
  }

  static async listMessages(conversationId: number, page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return ApiService.get<PaginatedResponse<Message>>(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  }

  static async sendMessage(conversationId: number, content: string, mimeType?: string): Promise<ApiResponse<Message>> {
    return ApiService.post<Message>('/chat/messages', { conversationId, content, mimeType });
  }

  static async uploadAttachment(conversationId: number, file: File): Promise<ApiResponse<Message>> {
    const form = new FormData();
    form.append('conversationId', String(conversationId));
    form.append('file', file);
    return ApiService.post<Message>('/chat/messages/attachments', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}