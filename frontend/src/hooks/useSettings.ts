// Hook para acessar e atualizar configurações do sistema.
// Segue tipagem estrita e comentários em português.
import { ApiService } from '../services/api';

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface SettingItem {
  key: string;
  value: string;
  type?: SettingType;
}

async function getSettings(): Promise<SettingItem[]> {
  const res = await ApiService.get<SettingItem[]>('/settings');
  return res.data;
}

async function updateSetting(item: SettingItem): Promise<SettingItem> {
  const res = await ApiService.put<SettingItem>(`/settings/${encodeURIComponent(item.key)}`,
    { value: item.value, type: item.type }
  );
  return res.data;
}

export function useSettings() {
  return {
    getSettings,
    updateSetting,
  };
}