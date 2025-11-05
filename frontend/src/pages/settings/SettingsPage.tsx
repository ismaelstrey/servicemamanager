import React from 'react';
import { useSettings } from '../../hooks/useSettings';

// Página de Configurações (/settings)
// Exibe e permite salvar configurações do sistema em seções.
export function SettingsPage(): React.ReactElement {
  const { getSettings } = useSettings();

  const handleLoad = async () => {
    try {
      const settings = await getSettings();
      console.log('Configurações:', settings);
    } catch (err) {
      console.error('Erro ao carregar configurações', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Configurações</h1>
      <p className="text-sm text-gray-600 mb-4">Gerencie preferências, integrações e segurança.</p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleLoad}>
        Carregar configurações
      </button>
    </div>
  );
}

export default SettingsPage;