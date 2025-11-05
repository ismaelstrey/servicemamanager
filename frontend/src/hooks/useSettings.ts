// Hook para acessar e atualizar configurações do sistema.
// Segue tipagem estrita e comentários em português.

const apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:4002';

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface SettingItem {
  key: string;
  value: string;
  type?: SettingType;
}

async function getSettings(): Promise<SettingItem[]> {
  const res = await fetch(`${apiUrl}/api/settings`);
  if (!res.ok) throw new Error('Falha ao carregar configurações');
  return res.json();
}

async function updateSetting(item: SettingItem): Promise<SettingItem> {
  const res = await fetch(`${apiUrl}/api/settings/${encodeURIComponent(item.key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: item.value, type: item.type }),
  });
  if (!res.ok) throw new Error('Falha ao atualizar configuração');
  return res.json();
}

export function useSettings() {
  return {
    getSettings,
    updateSetting,
  };
}