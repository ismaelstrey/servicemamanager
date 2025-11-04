import { ApiService } from './api'
import type { ApiResponse } from './api'

// Serviço de Usuário (admin)
// Responsável por obter/atualizar perfil, preferências e histórico de atividades
// Comentários em português BR conforme padrão do projeto

export interface SimpleNotificationSettings {
  email: boolean
  push: boolean
  desktop: boolean
}

export interface SimplePrivacySettings {
  profileVisibility: 'public' | 'private' | 'team_only'
  showOnlineStatus: boolean
  allowDirectMessages: boolean
  shareActivityStatus: boolean
}

export interface UserActivityItem {
  id: string
  type: 'ticket_created' | 'ticket_updated' | 'service_order_created' | 'service_order_updated' | 'comment_added'
  description: string
  resourceId: number
  resourceType: 'ticket' | 'service_order'
  timestamp: Date | string
  metadata?: Record<string, string | number | boolean>
}

export class UserService {
  // Obtém histórico de atividades do usuário autenticado
  static async getActivities(): Promise<UserActivityItem[]> {
    const res = await ApiService.get<UserActivityItem[]>('/user/activities')
    return res.data
  }

  // Obtém configurações de notificação do usuário
  static async getNotificationSettings(): Promise<SimpleNotificationSettings> {
    const res = await ApiService.get<SimpleNotificationSettings>('/user/settings/notifications')
    return res.data
  }

  // Atualiza configurações de notificação
  static async updateNotificationSettings(data: SimpleNotificationSettings): Promise<ApiResponse<SimpleNotificationSettings>> {
    return await ApiService.put<SimpleNotificationSettings>('/user/settings/notifications', data)
  }

  // Obtém configurações de privacidade do usuário
  static async getPrivacySettings(): Promise<SimplePrivacySettings> {
    const res = await ApiService.get<SimplePrivacySettings>('/user/settings/privacy')
    return res.data
  }

  // Atualiza configurações de privacidade
  static async updatePrivacySettings(data: SimplePrivacySettings): Promise<ApiResponse<SimplePrivacySettings>> {
    return await ApiService.put<SimplePrivacySettings>('/user/settings/privacy', data)
  }

  // Atualiza dados básicos do perfil do usuário
  static async updateProfile(data: { name?: string; phone?: string; document?: string; address?: any; avatar?: string }): Promise<void> {
    await ApiService.put('/user/profile', data)
  }
}

export default UserService